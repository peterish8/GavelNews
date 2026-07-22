# Pitfalls Research

**Domain:** Next.js (App Router) + Supabase Auth/Postgres/RLS content site, solo/small team, email-list-building funnel, India-based (CLAT PG exam prep)
**Researched:** 2026-07-22
**Confidence:** HIGH (RLS/auth mechanics — verified against Supabase official docs and 2025-2026 incident writeups) / MEDIUM (DPDP Act specifics — verified against multiple legal-compliance sources, not primary statute text) / HIGH (SEO-vs-gated-content conflict — directly derivable from this project's own stated requirements)

## Critical Pitfalls

### Pitfall 1: RLS is off by default on any table you create outside the dashboard — and one forgotten table exposes everything

**What goes wrong:**
Supabase Postgres tables created via SQL migrations (the normal workflow for a real project, as opposed to clicking through the dashboard) do **not** have Row Level Security enabled by default. Any table without RLS enabled is fully readable and writable by anyone holding the public `anon` key — which is, by design, embedded in your client-side JS bundle and trivially visible in devtools. This is not a theoretical risk: CVE-2025-48757 (disclosed May 2025) found that **10.3% of a sample of 1,645 "AI-builder + Supabase" apps** (Lovable-generated, but the pattern generalizes to any fast-shipped Supabase app) had at least one publicly readable table due to this exact mistake — 303 endpoints across 170 projects.

**Why it happens:**
Solo/small teams migrate schema with SQL scripts or ORM migrations, not the dashboard UI (which now auto-enables RLS on dashboard-created tables as of late 2025). `CREATE TABLE` in a migration file has no RLS by default. Enabling RLS is a separate statement (`ALTER TABLE x ENABLE ROW LEVEL SECURITY;`) that's easy to forget, especially on tables added later in a sprint (e.g., a `favorites` or `reading_progress` table bolted on after the initial schema).

**How to avoid:**
- Enable RLS in the *same migration* that creates the table — never as a follow-up step.
- Add a CI/pre-deploy check that runs `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;` against staging and fails the build if any row-owning table appears in the result.
- Treat "table exists but RLS not yet written" as an invalid intermediate state — don't merge a migration that creates a table without also adding at least a deny-by-default policy set in the same PR.
- For this project specifically: `published_stories` (public-read is intentional) is fine with a permissive `SELECT` policy for `anon`/`authenticated`, but `favorites`, `reading_progress`, and any `profiles`/`user_settings` table must never ship without owner-only policies from the very first migration that creates them.

**Warning signs:**
- Any table listed in `pg_tables` with `rowsecurity = false`.
- Supabase dashboard sends a "RLS disabled in public" security advisory email — treat this as a P0, not a backlog item.
- You can `curl` a table's REST endpoint with just the anon key and get rows back that should require auth.

**Phase to address:**
Must be handled in the initial Supabase schema/RLS setup phase, as a hard acceptance criterion ("every table has RLS enabled and policies reviewed before merge"), not fixed after the fact. This is the single highest-severity item in this research — it should gate the phase, not just be a checklist nice-to-have.

---

### Pitfall 2: Overly permissive or incorrectly-scoped policies (the `USING (true)` trap, and missing `WITH CHECK`)

**What goes wrong:**
Two related mistakes: (a) writing a `SELECT`/`UPDATE`/`DELETE` policy with `USING (true)` "to make it work" while debugging, then shipping it — this makes a policy exist (so the dashboard no longer warns "RLS disabled") while providing zero actual protection; (b) writing an `INSERT` policy with only a `USING` clause and no `WITH CHECK` clause, which for INSERT does nothing — `USING` filters visibility of existing rows, `WITH CHECK` validates the *new* row being written. Without `WITH CHECK`, a user can insert a row claiming to belong to a different `user_id` than their own.

**Why it happens:**
`USING (true)` is the fastest way to unblock local development ("why isn't my query returning anything") and gets left in because it "works." The `USING` vs `WITH CHECK` distinction is non-obvious and not caught by manual testing as yourself (your own inserts look correct even with a missing `WITH CHECK`, because you're not the one crafting a malicious payload).

**How to avoid:**
- Every `INSERT`/`UPDATE` policy on a user-owned table (favorites, reading_progress, profiles) must have an explicit `WITH CHECK (auth.uid() = user_id)` clause, not just `USING`.
- Never leave `USING (true)` in a merged migration for a table containing per-user data. Grep migrations for `USING (true)` and `USING (True)` before every deploy as a lint step.
- Write and run a policy test suite (Supabase supports `pgTAP` or simple SQL scripts run with `SET ROLE authenticated; SET request.jwt.claim.sub = '<uuid>'`) that asserts: user A cannot read/write user B's favorites or reading_progress rows.

**Warning signs:**
- Grep for `using (true)` or `using ( true )` anywhere in `/supabase/migrations`.
- Any `INSERT` policy definition that has a `USING` clause but no `WITH CHECK`.
- No automated policy tests exist in the repo at all — if the only verification is "I tried it in the app and it worked," that's a warning sign itself, since happy-path testing as the legitimate owner never exercises the cross-user attack case.

**Phase to address:**
Same schema/RLS setup phase as Pitfall 1. Policy tests (even minimal ones) should be a phase completion gate, not deferred.

---

### Pitfall 3: RLS locks out legitimate access (the flip side) — overly restrictive policies that break the app for real users

**What goes wrong:**
In the effort to avoid Pitfalls 1–2, teams overcorrect: a policy checks `auth.uid() = user_id` correctly, but the app queries with a stale/anonymous client (e.g., a Server Component renders before the session cookie is available, or a `service_role`-free public page tries to join against a protected table), and the query silently returns zero rows instead of erroring. This manifests as "my own data doesn't show up" bugs that are easy to misdiagnose as application bugs rather than policy/session mismatches, and are the single most common Supabase support complaint (see r/Supabase "getting really frustrated with RLS" threads and repeated GitHub discussion reports of "RLS violation despite permissive policy").
Another common lockout: forgetting a `SELECT` policy entirely on a table that only has `INSERT`/`UPDATE` policies — the row writes successfully but the user can never read it back, so features like "mark story complete" appear to silently fail.

**Why it happens:**
RLS failures return **empty results, not errors**, by default (a `SELECT` that matches no policy just returns 0 rows) — this is deliberately non-obvious for security reasons (don't reveal whether a row exists), but it makes debugging painful for legitimate developers too. Teams also frequently forget that Postgres requires a policy for *each* operation type independently — having an `UPDATE` policy does not grant `SELECT` access.

**How to avoid:**
- For every user-owned table, write all four policies deliberately (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) rather than assuming one implies another — even if some are identical in condition.
- Use `supabase.auth.getUser()` (not `getSession()`) in Server Components/Route Handlers before any RLS-protected query, so you can positively confirm there is a real, revalidated user before blaming RLS for empty results (see Pitfall 4).
- During development, temporarily query as the `postgres` role to distinguish "no policy matches" (RLS problem) from "no data exists" (app/data problem) — don't guess.
- Log/alert on unexpectedly-empty results for authenticated-user-scoped queries in production so a lockout is caught within hours, not discovered via a support email.

**Warning signs:**
- Users report "my favorites disappeared" or "I can't see my saved stories" despite the UI showing success toasts on write.
- A table has policies for only some CRUD operations, not all four.
- Local testing only ever uses one test account, so a genuine cross-account or session-timing edge case never surfaces before production.

**Phase to address:**
Schema/RLS setup phase for policy design; auth/session integration phase for the `getUser()` vs `getSession()` discipline that prevents false-positive lockout diagnoses.

---

### Pitfall 4: Using `getSession()` instead of `getUser()` on the server — trusting a spoofable cookie value

**What goes wrong:**
`supabase.auth.getSession()` reads the JWT directly out of the cookie/storage without revalidating it against Supabase's Auth server. On the server (Server Components, Route Handlers, Middleware), the cookie is attacker-controllable input — a malicious client can send a crafted or expired cookie, and code that trusts `getSession()`'s returned user object for authorization decisions can be tricked. Supabase's own docs now warn explicitly: "The server gets the user session from the cookies, which can be spoofed by anyone." `getUser()` makes a network round-trip to Supabase Auth to verify the token signature and validity server-side, and is the only safe choice for any server-side authorization decision.

**Why it happens:**
`getSession()` is faster (no network call) and is what most tutorials and copy-pasted starter code use, because it "just works" in the common non-adversarial case. The distinction is not obvious to teams shipping fast, and the failure mode is silent — it doesn't break during normal testing, only under active exploitation.

**How to avoid:**
- Use `getUser()` (never `getSession()`) in middleware, Server Components, and Route Handlers whenever the result gates access to protected content, protected routes, or protected mutations.
- `getSession()` is acceptable only for non-security-critical UI purposes (e.g., "is anyone logged in at all, to decide whether to show a login button") where a false positive has no security consequence.
- Encode this as a lint rule or code-review checklist item, since it won't be caught by functional testing.

**Warning signs:**
- Any `await supabase.auth.getSession()` call in `middleware.ts`, a Server Component, or a Route Handler that is then used to decide what data to return or render.
- No `getUser()` call anywhere in the codebase at all.

**Phase to address:**
Auth/session integration phase — this is a foundational pattern that needs to be correct from the first protected route, not retrofitted once dozens of call sites exist.

---

### Pitfall 5: Session goes out of sync between middleware, Server Components, and the browser — premature logouts or stale auth state

**What goes wrong:**
`@supabase/ssr`'s cookie-refresh contract is easy to implement incorrectly: the middleware must both read the incoming request's cookies *and* write refreshed cookies onto the outgoing response using `getAll()`/`setAll()`, in the correct order, and any subsequent `NextResponse` created in the middleware chain (e.g., for i18n, redirects, or other middleware composed together) must copy those cookies forward rather than starting from a fresh, cookie-less response. Get this wrong and users experience random, hard-to-reproduce logouts, or the client and server disagree about whether a session exists (documented repeatedly in Supabase's GitHub discussions and Stack Overflow as of 2025–2026, including on Next.js 16).

**Why it happens:**
The official example is written assuming middleware does *nothing but* auth. The moment a team adds any other middleware logic (locale routing, feature flags, redirect rules — all common in a fast-shipped MVP), the cookie-forwarding contract is easy to break because `NextResponse.cookies` doesn't expose a `setAll()` method matching what naive refactors expect.

**How to avoid:**
- Keep the Supabase session-refresh middleware logic isolated and composed *last* in any middleware chain, always returning the `supabaseResponse` object (or explicitly copying its cookies onto whatever response is ultimately returned) — never discard it.
- Don't add unrelated logic (redirects, locale detection, etc.) inside the same middleware function as the Supabase client without explicitly threading the response object through, per Supabase's documented pattern.
- Add a manual test: log in, navigate across at least 3 pages including one that redirects, refresh, and confirm the session survives — do this after any middleware change, not just after auth changes.

**Warning signs:**
- Users randomly appear logged out despite recently logging in.
- Client-side `onAuthStateChange` and server-rendered `getUser()` disagree about auth state on the same page load.
- Middleware file contains more than just session refresh logic without explicit cookie-forwarding code.

**Phase to address:**
Auth/session integration phase. If other middleware (locale, redirects) is planned, design the composition pattern up front rather than discovering the conflict later.

---

### Pitfall 6: Service role key ends up in client-side code or a client-importable module

**What goes wrong:**
The `service_role` key bypasses RLS entirely — it is the equivalent of direct database superuser access via the REST API. Teams under time pressure use it "temporarily" server-side to sidestep a policy that isn't working yet (see Pitfall 3), and either forget to remove it, or — more dangerously — import a server-only module (e.g., an "admin client" helper) from a file that is also imported by client components, causing Next.js to bundle it (and the key, if it's inlined or falls back to a `NEXT_PUBLIC_`-prefixed env var) into the browser JS.

**Why it happens:**
Next.js's bundler does not always make it obvious when a "server" module gets pulled into a client bundle transitively — a single stray import chain is enough. Naming an env var `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (copy-paste from the anon key's naming pattern) will silently expose it, since `NEXT_PUBLIC_` vars are inlined at build time into client bundles by design.
Since this project's sync mechanism (`gavel-news` engine writing to `published_stories`) already uses a service-role-equivalent path from a separate repo, there's a real temptation to reuse a service-role client inside this Next.js app "for convenience" (e.g., an admin-only route) rather than keeping it fully out of the web app's dependency graph.

**How to avoid:**
- Never prefix the service role key with `NEXT_PUBLIC_`. Store it only as `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- Add `import 'server-only'` at the top of any module that constructs a service-role client, so Next.js throws a build error if it's ever imported from client code.
- Prefer not needing a service-role client in this Next.js app at all — this project's own architecture already keeps privileged writes in the separate `gavel-news` engine repo; the web app should only ever need `anon` (public reads) and per-user `authenticated` (RLS-scoped) clients.
- If an admin capability is ever needed in this repo, put it behind a Route Handler that runs server-side only, never behind a client-invoked function.

**Warning signs:**
- Any occurrence of `SERVICE_ROLE` in a file also imported by a `'use client'` component.
- `grep -r NEXT_PUBLIC_.*SERVICE` returning any results.
- Browser devtools → Network tab shows a request to Supabase's REST API carrying an `Authorization` header with a JWT whose payload decodes to `"role":"service_role"`.

**Phase to address:**
Supabase project setup / env var configuration, at the very start — establish the convention before any code that touches Supabase is written.

---

### Pitfall 7: Requiring login to read content directly conflicts with this project's own stated SEO/organic-growth goal

**What goes wrong:**
This project's requirements state both "Reading requires a free account" and "Public story pages are set up for basic SEO... since organic reach grows the list this product exists to build." These two requirements are in direct tension: if story content is only renderable after authentication, Googlebot (which does not authenticate) sees a login wall or empty/redirected page, not the article — so the page cannot rank for the very search terms that would drive organic signups. This is a common and expensive mistake for gated content sites generally (paywalled news sites, "sign up to read" blogs): they build SEO metadata (OG tags, structured data) on pages whose actual content is inaccessible to crawlers, so the metadata work produces social-share previews but no organic search traffic — the highest-leverage growth channel for a list-building funnel is neutralized by the auth requirement.

**Why it happens:**
"SEO" gets treated as a checklist of `<meta>` tags rather than a question of "can an unauthenticated crawler actually see the content." Nobody notices until organic traffic numbers come in flat, weeks or months after launch — by which point re-architecting content access is a bigger job than designing for it up front.

**How to avoid:**
- Decide explicitly, before building the reading flow, what an unauthenticated visitor and Googlebot can see: a strong recommendation (used successfully by most subscription/gated content sites — news sites with metered paywalls, Substack, etc.) is to server-render the **full headline, category, date, summary/"what happened," and why-it-matters** for every story publicly (no auth check on the read path for `published_stories`), and gate only the deeper interactive/personalized layer (favorites, completion tracking, PYQ cross-links, or the full detailed body if the team wants a stronger conversion nudge) behind login.
- If the product decision is genuinely "100% of story body text is login-gated, no exceptions," then explicitly drop or rescope the SEO requirement rather than shipping OG tags on pages with no real content for search engines to index — don't let both requirements stand unreconciled into the roadmap.
- Structured data (`Article` / `NewsArticle` JSON-LD) should only be added to pages whose primary content is actually crawlable; adding it to a page whose body renders "please sign in to continue" is actively misleading to search engines and can trigger manual-action penalties for cloaking-adjacent patterns if the served HTML differs meaningfully between crawler and logged-out user vs. what a logged-in user sees.
- Use `robots.ts` / `<meta name="robots">` correctly: don't `noindex` public marketing/story pages, but do `noindex` account-only pages (settings, favorites) that have no SEO value and would otherwise dilute crawl budget.

**Warning signs:**
- View-source (not devtools-rendered DOM, actual HTTP response HTML) on a story URL while logged out shows a login prompt or empty state instead of the story's summary/headline text.
- Google Search Console (once set up) shows pages "crawled but not indexed" or "discovered, currently not indexed" at a high rate for story URLs.
- OG image/title tags are present and correct, but the actual `<body>` content an anonymous fetch sees doesn't match — a mismatch signals the SEO work is cosmetic only.

**Phase to address:**
This must be resolved as an explicit product/architecture decision in the same phase that designs the reading flow and RLS policy for `published_stories` — not left ambiguous and discovered late. It directly determines the RLS policy shape (does `anon` get `SELECT` on `published_stories` or not) and the page architecture (Server Component rendering path for logged-out vs logged-in users). Recommend flagging this as a roadmap-level decision point, not an implementation detail.

---

### Pitfall 8: Collecting emails without DPDP Act-compliant consent, then using them for a different (future, unrelated) product

**What goes wrong:**
India's Digital Personal Data Protection Act, 2023 (DPDP Act) requires that consent be **free, specific, informed, unconditional, and unambiguous**, given through clear affirmative action (no pre-ticked boxes, no bundled/blanket consent), and tied to a **specified purpose** communicated via a notice at the time of collection. This project's actual business model — collect emails under the stated purpose "free CLAT PG current affairs account," with the real intent of using that list later to launch a separate, not-yet-built product (Gavelogy) — is exactly the pattern the "specific purpose" requirement is designed to prevent. If the signup flow's notice/consent only describes "create an account to read stories" and the list is later used to market an unrelated product, that reuse is very likely purpose-limited data processing without valid consent for the new purpose under DPDP.
This is also the single most common mistake in "waitlist"-style list-building products generally (not India-specific): treating "user signed up for product A" as blanket permission to email them about product B, or to add them to a general marketing list without a distinct, disclosed opt-in for that.

**Why it happens:**
Under time pressure, teams write a generic "By signing up you agree to our Terms and Privacy Policy" checkbox (or worse, no checkbox — implicit consent from clicking "Sign up") and move on, treating privacy copy as boilerplate rather than something that has to actually describe what's really going to happen with the data. The gap between "why we're building this" (list-building for Gavelogy, per this project's own Strategic Context) and "what the user is told" (a current-affairs reading app) is precisely the gap regulators and users both object to.

**How to avoid:**
- Write the privacy notice and consent language to honestly disclose that the email may be used to notify the user about related future products/offerings from the same team (or scope Gavelogy marketing under a distinct, separately revocable consent captured at signup or later) — "informed" consent means the disclosed purpose has to match the actual purpose.
- Do not bundle "consent to receive product marketing" with "consent required to create an account" as a single non-optional checkbox — DPDP's "unconditional" requirement means access to the core service (reading stories) generally should not be conditioned on agreeing to unrelated marketing use, or at minimum this coupling is a real legal risk worth a deliberate, documented decision rather than an accident.
- Provide an accessible way to withdraw consent / opt out of future marketing communications (a real unsubscribe, not just account deletion) — DPDP grants a right to withdraw consent as easily as it was given.
- Publish a Privacy Policy and Terms of Service before any signup flow goes live, not as a post-launch add-on — the "Active" requirements list does not currently call this out explicitly and it should be added.
- Because CLAT is an India-specific exam, the vast majority of data principals will be located in India, squarely triggering DPDP applicability regardless of where the company is incorporated.

**Warning signs:**
- No Privacy Policy or Terms of Service page exists at launch, or the signup form has no visible consent language/checkbox at all.
- The privacy notice describes only "read current-affairs content," with no mention of any other future use of the email address.
- No unsubscribe/consent-withdrawal mechanism exists anywhere in the product.
- Signup requires agreeing to marketing communications as a single non-separable checkbox alongside Terms acceptance.

**Phase to address:**
Must be handled in the same phase that builds the signup/onboarding flow — legal copy and consent UI are not a "later" concern for a product whose core mechanic is capturing emails for future use. Recommend a lightweight compliance pass (privacy policy, terms, consent checkbox wording review) as an explicit phase deliverable, not an afterthought bolted onto auth UI.

---

### Pitfall 9: Treating "user typed an email and clicked submit" as a validated, deliverable address

**What goes wrong:**
Single opt-in signup flows (type email, get instant access, no confirmation click required) accumulate typos, disposable addresses, and outright fake addresses. For a product whose entire value is the email list itself (this project's real purpose), a list full of bounced/invalid addresses directly undermines the goal — when Gavelogy eventually sends its launch campaign, high bounce rates damage sender reputation for that campaign before it even starts, and inflate "list size" vanity metrics with addresses that were never going to convert.

**Why it happens:**
Requiring email confirmation (double opt-in / "click the link we sent you") adds friction, and this project has explicitly prioritized minimizing signup friction ("Single-question onboarding... friction directly reduces list size" is already a stated Key Decision). Google OAuth sign-in naturally sidesteps this problem (Google-verified emails are already confirmed), but the email/password signup path does not, unless deliberately built with confirmation.

**How to avoid:**
- Supabase Auth's built-in email confirmation flow (`Confirm email` setting) is a reasonable middle ground: it doesn't require a second full page of friction, just a single click from an email the user is checking anyway, and Supabase's own free tier still sends these — verify the confirmation-required setting is deliberately chosen (on or off) rather than left at whatever the project defaults to.
- Favor Google OAuth as the visually primary/default option (already in scope) since it sidesteps the whole verified-email problem with zero added user friction.
- If shipping unconfirmed email/password signup for speed, explicitly accept the tradeoff (some fraction of the list will be low-quality) rather than assuming the list is fully clean later — don't let this become a silent surprise discovered only when Gavelogy's launch campaign has a high bounce rate.

**Warning signs:**
- No email confirmation step exists in the Supabase Auth configuration, and this wasn't a deliberate choice.
- No visibility/monitoring into what fraction of signups are Google OAuth vs. unconfirmed email/password.

**Phase to address:**
Auth/onboarding phase — decide and configure Supabase's email confirmation setting explicitly as part of building the signup flow, not left at a default nobody checked.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `USING (true)` policy left in to unblock local dev | Unblocks feature work same-day | Silent full data exposure on that table in production | Never — replace before merge, not after |
| Using `getSession()` everywhere instead of `getUser()` | Slightly faster, matches most tutorials | Server-side authorization decisions trust spoofable input | Acceptable only for non-authorization UI ("show login button or not") |
| No automated RLS policy tests, manual click-testing only | Ships faster with 1-person team | Cross-user data leaks/lockouts undetected until a user reports them | Only very early pre-launch; add minimal pgTAP/SQL tests before opening signups publicly |
| No Privacy Policy/Terms at launch, add "later" | Ships signup flow faster | DPDP non-compliance from day one of data collection; retroactive consent is not valid consent | Never for a product whose core purpose is email collection |
| Single opt-in email signup, no confirmation | Removes one click of friction | Dirty list, wasted future marketing spend, deliverability damage | Acceptable if Google OAuth is the primary/default path and email/password is secondary |
| Full story body always public (no login gate at all) to maximize SEO | Best possible organic reach | Undermines "reading requires account" requirement/funnel mechanic entirely | Only if the product decision explicitly redefines the funnel (e.g., gate only favorites/progress, not reading) |
| Full story body always login-gated (no public content) to protect the funnel | Simplest RLS/access model | Kills organic SEO growth, the stated primary growth channel | Only if SEO requirement is explicitly descoped in the roadmap |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| Supabase Auth + Next.js Middleware | Composing other middleware (locale, redirects) without forwarding the Supabase-refreshed cookies, causing random logouts | Keep Supabase session-refresh isolated and last in the chain; always propagate its response's cookies forward |
| Supabase Auth + Google OAuth | Redirect URL configured for `localhost` only, breaks in production; or Supabase Auth "Site URL" / "Redirect URLs" allowlist not updated per environment | Explicitly configure Site URL and Redirect URLs for local, preview/staging, and production in Supabase Auth settings before first OAuth test in each environment |
| Supabase REST/PostgREST + RLS | Assuming `service_role` mentioned inside a policy's `USING` clause has any effect | `service_role` always bypasses RLS entirely regardless of policy content — policies are irrelevant to it; don't write policies "for" service_role |
| Supabase `published_stories` sync (from separate `gavel-news` engine repo) | Web app RLS policies designed without confirming exactly which Postgres role the sync script writes as, causing sync failures indistinguishable from app bugs | Confirm and document which role/key `supabase_sync.py` uses (should be `service_role`, bypassing RLS) before writing `published_stories` policies for the web app's `anon`/`authenticated` roles |
| Next.js Metadata API + dynamic story routes | Using `generateMetadata` for pages that could use static `export const metadata`, or omitting `metadataBase`, causing broken/relative OG image URLs in social previews | Set `metadataBase` once in the root layout; use `generateMetadata` only for genuinely dynamic per-story data (title, description, OG image from story content) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| RLS policies calling `auth.uid()` (or other functions) without wrapping in `(select auth.uid())` | Query planner re-evaluates the function per-row instead of once, causing full sequential scans | Always write policy conditions as `(select auth.uid()) = user_id`, not `auth.uid() = user_id` — Supabase's documented optimization | Noticeable once story/favorites tables reach thousands of rows; a launch-scale MVP may not feel it immediately, but the query pattern should be correct from day one since it costs nothing extra |
| Missing index on RLS-filtered columns (e.g., `user_id` on `favorites`/`reading_progress`) | Slow reads on "my favorites" as data grows, even with correct policies | Add a btree index on any column referenced in a `USING`/`WITH CHECK` clause (e.g., `user_id`) at table-creation time | Becomes visible once total row count crosses roughly tens of thousands, sooner if joins are involved |
| Fetching full story bodies client-side for a feed view that only needs headline/summary | Slower feed page loads, higher Supabase egress on a free/low tier | Select only the columns the feed view needs; fetch full body only on the story detail page | Immediate on any feed with more than a handful of stories — worth avoiding from the first feed implementation |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Public `anon` role granted more than `SELECT` on `published_stories` (e.g., leftover `INSERT`/`UPDATE`/`DELETE` grants from scaffolding) | Anyone with the anon key could modify or delete published content | Explicitly `GRANT SELECT ONLY` to `anon` on `published_stories`; audit `GRANT` statements, not just RLS policies — RLS restricts rows, `GRANT` restricts operations, both matter |
| Trusting client-submitted `user_id` values on insert (e.g., a hidden form field) instead of deriving it server-side from the authenticated session | A malicious client could write data under another user's id if `WITH CHECK` isn't enforcing `auth.uid()` | Always set `user_id` from `auth.uid()` server-side (or enforce via `WITH CHECK`), never trust a client-submitted value even if a policy also exists |
| Verbose Postgres error messages surfaced directly to the client on RLS violations | Could leak schema/table structure to an attacker probing the API | Catch and generalize Supabase/Postgres errors before returning them to the client in Route Handlers |
| No rate limiting on signup/auth endpoints | Email enumeration or automated fake-signup flooding of the list-building funnel this product exists for | Rely on Supabase Auth's built-in rate limits and consider basic bot protection (e.g., a lightweight CAPTCHA or honeypot field) on the signup form given the list itself is the product's core asset |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Login wall shown before any content preview | Visitor bounces before ever seeing whether the content is worth signing up for, directly undermining "genuinely useful content" core value | Show enough of the story (headline, summary, why-it-matters) publicly to demonstrate value before asking for signup — consistent with resolving Pitfall 7 |
| Single onboarding question (attempt year) presented as a blocking full-page form | Adds perceived friction disproportionate to a one-field question | Keep it inline/lightweight (e.g., a single-select shown once, skippable-but-nudged) rather than a separate onboarding "wizard" page |
| Silent RLS-driven empty states (e.g., favorites tab shows nothing, no error) | User can't tell if they have no favorites yet or if something broke | Distinguish "empty because no data" from "empty because of an error" in the UI — don't let a swallowed RLS/query error look identical to a genuinely empty list |
| Mobile-first requirement stated but auth screens (esp. OAuth redirect flow) not tested on low-end Android/slow networks | OAuth redirect round-trips can feel broken on slow connections without loading states | Add explicit loading/pending states around the OAuth redirect handoff, test on throttled network conditions given the stated low-end Android target |

## "Looks Done But Isn't" Checklist

- [ ] **RLS on every table:** Often missing on tables added after the initial schema (e.g., `favorites`, `reading_progress` added in a later phase) — verify with `SELECT tablename FROM pg_tables WHERE schemaname='public' AND NOT rowsecurity;` before every deploy, not just once at setup.
- [ ] **INSERT/UPDATE policies:** Often missing `WITH CHECK`, only have `USING` — verify by attempting to insert a row with a spoofed `user_id` as a non-owner test account and confirming it's rejected.
- [ ] **Server-side auth checks:** Often use `getSession()` where `getUser()` is required — grep the codebase for `getSession(` in any server-context file and confirm none of them gate access decisions.
- [ ] **Public SEO metadata:** Often present as `<meta>` tags while the actual page body is inaccessible to an unauthenticated fetch — verify with an incognito/logged-out `curl`/view-source of a live story URL, not just checking the metadata object in code.
- [ ] **Privacy Policy / Terms / consent checkbox:** Often deferred as "not core functionality" — verify these exist and are linked from the signup flow itself before the signup flow is considered launch-ready, not just before "full launch."
- [ ] **OAuth redirect URLs per environment:** Often only configured for one environment (usually local) — verify Google sign-in actually works end-to-end in the deployed preview/production environment, not just locally.
- [ ] **Service role key isolation:** Often assumed safe because "it's only used server-side" without verifying the import graph — verify by searching the client bundle output (`.next/static`) for any substring of the service role key, or confirm `import 'server-only'` guards exist.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|-----------------|
| RLS disabled/misconfigured discovered post-launch | MEDIUM | Enable RLS and correct policies immediately (causes brief app downtime for affected queries if policies aren't pre-written); audit access logs if available to assess whether data was actually accessed by unauthorized parties during the exposure window; if genuine user PII was exposed, this may trigger DPDP breach-notification obligations — treat as a compliance event, not just a bug fix |
| Service role key leaked in a shipped client bundle | HIGH | Rotate the key immediately in Supabase dashboard (invalidates the old one instantly), audit for any unauthorized writes/reads made with the old key during the exposure window, then fix the import/env-var issue before re-deploying |
| Gated content discovered to be un-indexed by Google post-launch | MEDIUM | Restructure the read path so summaries/headlines render server-side without an auth check (Pitfall 7's fix), then resubmit affected URLs via Search Console — expect a multi-week delay before organic traffic recovers, since this is a re-crawl/re-index cycle, not instant |
| Email list collected without adequate consent language discovered pre-Gavelogy-launch | LOW–MEDIUM | Update the Privacy Policy/consent language going forward for new signups; for the existing list, the safer path is a re-permission campaign (send a clear, distinct opt-in request for the new/actual purpose) rather than assuming the old signup consent covers it |
| Middleware cookie-sync bug causing random logouts discovered post-launch | LOW | Fix the middleware cookie-forwarding logic per Supabase's documented pattern; no data-integrity impact, just a UX regression — no user communication needed beyond normal bug-fix release notes |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| RLS disabled on a table (#1) | Supabase schema/RLS setup phase | `pg_tables` query returns zero public rows with `rowsecurity=false`; CI check enforced |
| Overly permissive/missing WITH CHECK policies (#2) | Supabase schema/RLS setup phase | Automated policy tests (pgTAP or SQL scripts) simulating cross-user access attempts, run in CI |
| RLS lockout of legitimate users (#3) | Schema/RLS setup phase + auth/session integration phase | Manual QA pass logging in as two distinct test accounts, confirming each sees only their own data and none is unexpectedly empty |
| `getSession()` vs `getUser()` misuse (#4) | Auth/session integration phase | Code review checklist item; grep-based CI lint rejecting `getSession()` in server-context authorization paths |
| Middleware cookie sync (#5) | Auth/session integration phase | Manual multi-page navigation + refresh test after every middleware change |
| Service role key exposure (#6) | Supabase project setup / env var configuration (earliest phase) | `server-only` import guard present; bundle-output grep for key substring in CI or pre-deploy check |
| SEO vs. login-wall conflict (#7) | Reading flow / content architecture design phase (must precede or coincide with RLS policy design for `published_stories`) | Logged-out `curl`/view-source of a live story page shows real headline/summary content, not a login prompt |
| DPDP consent/purpose-limitation gap (#8) | Signup/onboarding flow phase | Privacy Policy and Terms published and linked from signup UI; consent language explicitly reviewed against actual data use before signup flow ships |
| Unverified/dirty email signups (#9) | Auth/onboarding phase | Supabase Auth email-confirmation setting deliberately configured (on or off) with rationale documented, not left at default |

## Sources

- [Supabase: Row Level Security official docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence, official
- [Supabase: RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — HIGH confidence, official
- [Supabase: Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — HIGH confidence, official
- [Supabase: Why is my service role key client getting RLS errors](https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z) — HIGH confidence, official
- [CVE-2025-48757 statement, Matt Palmer](https://mattpalmer.io/posts/statement-on-CVE-2025-48757/) — MEDIUM-HIGH confidence, disclosed security research, cross-referenced by multiple secondary sources
- [vibeappscanner.com — Supabase RLS common mistakes](https://vibeappscanner.com/supabase-row-level-security) — MEDIUM confidence, secondary source summarizing CVE-2025-48757
- [modernpentest.com — 10 Common Supabase Security Misconfigurations](https://modernpentest.com/blog/supabase-security-misconfigurations) — MEDIUM confidence
- [supaexplorer.com — Supabase Security Retro 2025](https://supaexplorer.com/dev-notes/supabase-security-2025-whats-new-and-how-to-stay-secure.html) — MEDIUM confidence (notes dashboard-created tables now auto-enable RLS; migration-created tables still require explicit enablement)
- [GitHub supabase/auth#965 — Service key RLS override discussion](https://github.com/supabase/auth/issues/965) — HIGH confidence, official repo issue thread
- [GitHub orgs/supabase/discussions/34842 — Next.js middleware cookie forwarding](https://github.com/orgs/supabase/discussions/34842) — MEDIUM-HIGH confidence, official org discussion with community-verified workaround
- [iloveblogs.blog — 10 Common Mistakes Building with Next.js and Supabase](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes) — MEDIUM confidence, secondary but consistent with official docs
- [DPO India — Consent Management Under India's DPDP Act](https://www.dpo-india.com/Blogs/consent-management-india-dpdp-act/) — MEDIUM confidence, specialist compliance consultancy, cross-referenced with other DPDP sources
- [secureprivacy.ai — India DPDPA Privacy Policy Requirements Compliance Guide](https://secureprivacy.ai/blog/india-dpdpa-privacy-policy-requirements-compliance-guide) — MEDIUM confidence
- [digitalmarketacademy.in — Email Marketing Compliance India 2025](https://digitalmarketacademy.in/digital-marketing-blogs/email-marketing-compliance-india-2025/) — MEDIUM confidence
- [consent.in — DPDP Act explained](https://www.consent.in/blog/dpdp-act) — MEDIUM confidence
- Double opt-in / list quality: [waitlister.me docs](https://waitlister.me/docs/double-opt-in), [monday.com — double opt-in 2026](https://monday.com/blog/monday-campaigns/double-opt-in/), [Twilio — double opt-in](https://www.twilio.com/en-us/blog/insights/double-opt-in-email) — MEDIUM confidence, consistent across multiple independent sources
- Next.js SEO / metadata: [digitalapplied.com — Next.js 15 SEO Guide](https://www.digitalapplied.com/blog/nextjs-seo-guide), [focusreactive.com — Next.js App Router SEO Guide](https://focusreactive.com/next-js-app-router-seo-overview/) — MEDIUM confidence
- Gated-content-vs-SEO conflict: derived directly from this project's own `.planning/PROJECT.md` stated requirements (HIGH confidence — internal contradiction identified by direct analysis, not an external claim)

---
*Pitfalls research for: Next.js + Supabase Auth/RLS content site with email-list-building funnel (India/CLAT PG)*
*Researched: 2026-07-22*
