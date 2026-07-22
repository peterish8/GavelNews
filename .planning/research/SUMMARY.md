# Project Research Summary

**Project:** Gavel News Web
**Domain:** Next.js + Supabase content-reading web app -- auth-gated exam-prep current-affairs product with an SEO-driven, email-list-building funnel (CLAT PG, India)
**Researched:** 2026-07-22
**Confidence:** HIGH

## Executive Summary

Gavel News Web is a content-reading site with a light layer of authenticated user state (favorites, mark-complete, settings), built on Next.js App Router + Supabase (Postgres, Auth, RLS) -- a well-documented, thoroughly-conventional stack for exactly this kind of product. Experts build this shape of app as a Server-Component-first site (public content server-rendered for SEO and Core Web Vitals on low-end Android) with a small number of Client Component "islands" for interactivity, mutations routed through Server Actions, and Postgres Row Level Security as the actual authorization boundary rather than app-layer checks. Research across stack, features, architecture, and pitfalls is consistent and mutually reinforcing: the already-settled v1 scope in PROJECT.md is correctly minimal (no quizzes, no gamification, no ORM, no client state library, no Supabase service-role key in this repo), and the recommended technical approach (`@supabase/ssr`, route groups splitting `(public)` from `(app)`, Postgres full-text search instead of a search service, no monorepo) requires no scope changes -- it's an execution plan for what's already decided.

The single most important structural risk surfaced by this research -- flagged independently by both PITFALLS.md and cross-referenced against ARCHITECTURE.md and PROJECT.md itself -- is that **"reading requires an account" and "public story pages need SEO for organic growth" are in direct tension and PROJECT.md has not yet resolved how**. If story bodies are fully hidden behind auth, Googlebot never sees indexable content and the organic-growth half of the funnel (the whole reason SEO work was scoped in) is dead on arrival; if everything is public, the "account is the product" list-building mechanic collapses. The research's recommendation -- server-render headline/summary/why-it-matters publicly, gate only the deeper interactive layer and/or full body behind login -- is a genuine product decision, not an implementation detail, and needs to be made explicitly before the reading-flow and RLS-policy-for-`published_stories` phase is planned, not discovered after launch when organic traffic comes in flat.

The second cluster of risk is standard-but-easy-to-get-wrong Supabase/Next.js mechanics: RLS disabled by default on migration-created tables (a documented, common real-world failure -- CVE-2025-48757 found 10%+ of a sampled cohort of fast-shipped Supabase apps exposed data this way), `getSession()` vs `getUser()` confusion on the server, middleware/proxy cookie-forwarding bugs, and keeping the Supabase service-role key entirely out of this repo (it belongs only to the sibling `gavel-news` engine repo). All of these are well-documented, have concrete prevention checklists, and should be treated as hard phase-completion gates (not backlog items) in whichever phase first touches schema, auth, or env configuration. A third, lower-drama but real risk is India's DPDP Act: this product's actual purpose (build an email list to later market a separate, unbuilt product, Gavelogy) requires consent language that honestly discloses that future use -- a Privacy Policy/Terms/consent checkbox is a launch-blocking deliverable, not a post-launch add-on, given the signup flow ships the moment auth does.

## Key Findings

### Recommended Stack

Next.js 16.2.x (App Router) + React 19.2.x + TypeScript 5.9.x (stable line -- not the 7.x pre-release dist-tag) + Tailwind CSS 4.x (CSS-first config) + Supabase (Postgres/Auth/RLS) via `@supabase/supabase-js` 2.110.x and `@supabase/ssr` 0.12.x is the verified current stack for this exact shape of app, cross-checked against official docs and live npm registry versions. Supporting choices are all deliberately minimal: `zod` for Server Action/form validation, `next-themes` for the theme toggle, selectively-adopted `shadcn/ui` components (not the full library) for accessible interactive primitives, and Postgres full-text search instead of a dedicated search service -- appropriate for a launch-scale corpus of a few thousand rows. No ORM, no client state library, no full component-library adoption.

**Core technologies:**
- Next.js 16 (App Router) -- SSR/SSG for SEO-critical public pages, Server Actions for auth-gated mutations without a separate API layer
- React 19 -- `useOptimistic`/`useActionState` are the right primitives for favorite/mark-complete interactions, no extra state library needed
- Supabase (Postgres + Auth + RLS) via `@supabase/ssr` -- the only currently-supported SSR auth pattern; `@supabase/auth-helpers-nextjs` is officially deprecated
- Tailwind CSS 4 (CSS-first `@theme` config) -- current major, do not scaffold a v3-style `tailwind.config.js`
- Postgres full-text search (`tsvector` + GIN index) -- sufficient for the stated corpus size, zero new infrastructure vs. Algolia/Meilisearch/Typesense

**Watch items (MEDIUM confidence, verify at implementation time):** Next.js 16 renamed `middleware.ts`/`middleware()` to `proxy.ts`/`proxy()` -- every Supabase SSR tutorial still shows the old name; and Supabase is rolling out new `sb_publishable_...`/`sb_secret_...` key formats replacing legacy `anon`/`service_role` -- confirm current defaults in the dashboard at project-creation time.

### Expected Features

The already-settled v1 scope in PROJECT.md matches table-stakes expectations for this product category almost exactly -- research found no missing must-haves and confirmed the deferred items (quizzes, notifications, gamification, ads, faceted search) are correctly deferred, not under-scoped. The one structural tension the feature research surfaces (echoed in Pitfalls) is that PROJECT.md has deliberately kept the "read requires signup" wall -- the correct tradeoff given the actual list-building business goal -- which means all "reduce friction" effort must concentrate on making the signup step and the single onboarding question as close to zero-cost as possible, since deferring the wall itself (the usual friction-reduction pattern) isn't an option here.

**Must have (table stakes) -- all already in v1 scope:**
- Google one-tap + email sign-in, no password field as the primary path
- Single-question onboarding (attempt year only) -- every additional field compounds drop-off
- Scannable daily feed with reading time, favorite/save, mark-complete, chronological archive, basic title/keyword search
- Exam-relevance + category filters, settings (exam year/theme/sign-out)
- SEO metadata + OG tags on public story pages (load-bearing for the funnel, not a nice-to-have)

**Should have (differentiators, already achievable within v1 scope, no new work required):**
- The one honest "why this matters" + PYQ connection (vs. competitors' raw news dumps or quiz-first framing) is the actual product differentiator -- protect it from scope dilution
- A deliberately narrow, single-purpose UX with no quiz/ad/mock-test clutter, matching Morning Brew/Inshorts-style bounded daily consumption rather than infinite scroll
- Shareable individual story pages -- nearly free once SEO/OG work exists, just needs a share affordance

**Defer (v2+, correctly out of scope):** Quizzes, push notifications/email digests, heavier gamification (badges/streaks/leaderboards), ads, UG/PG split relevance, faceted search, account export/delete self-service -- all depend on either data volume, an authoring pipeline the engine repo doesn't yet produce, or retention evidence that doesn't exist yet.

### Architecture Approach

Server Components fetch and render all content by default (public feed/story/archive/search, and authenticated dashboard/settings data); Client Components are isolated "islands" that handle only interactivity (favorite button, theme toggle, filter chips) and call Server Actions for mutations -- no client-side data-fetching library needed. Route groups `(public)` and `(app)` give each half of the app its own layout, auth posture, and indexing metadata natively, with no custom routing logic. Authorization is enforced in three layers that each guard a different failure mode: `middleware`/`proxy.ts` (fast UX redirect, not a security boundary -- cookie-derived sessions are spoofable), the `(app)` layout's server-side `getUser()` check (defense-in-depth), and Postgres RLS on every table (the actual, structural boundary). The only contract between this repo and the sibling `gavel-news` engine repo is the `published_stories` table schema itself -- no code or API integration in either direction, and this repo must never hold a service-role key.

**Major components:**
1. `app/(public)/*` route group -- server-rendered, indexable feed/story/archive/search pages reading `published_stories` via the anon key, `generateMetadata` per page
2. `app/(app)/*` route group -- authenticated dashboard/settings, session-verified server-side, `noindex` metadata
3. `lib/supabase/server.ts` + `client.ts` -- separate server/browser Supabase client factories, never merged, to prevent accidental cross-context imports
4. `app/actions/*` -- Server Actions for all writes (favorites, mark-complete, profile updates), each re-verifying `auth.getUser()` and calling `revalidatePath`/`revalidateTag`
5. RLS policies on `published_stories` (public read of `published=true` only, no anon/authenticated writes), `profiles`/`favourites`/`reading_progress` (owner-only, `(select auth.uid()) = user_id`)

Suggested build order (from ARCHITECTURE.md, decoupled from the engine repo's own timeline since no Supabase project exists yet for either): Supabase schema + RLS with seed data -> auth flow -> public content pages -> authenticated user-state features -> SEO layer -> real engine integration (last, since it's the only step with cross-repo schema-drift risk).

### Critical Pitfalls

1. **RLS disabled by default on migration-created tables** -- a documented, common real-world failure (CVE-2025-48757: 10%+ of a sampled fast-shipped Supabase app cohort exposed data this way). Enable RLS in the *same migration* that creates every table (`favourites`, `reading_progress`, `profiles` especially); add a CI check against `pg_tables`/`rowsecurity`.
2. **`USING (true)` policies and missing `WITH CHECK` on INSERT** -- makes a policy exist without providing protection, or lets a user insert rows claiming another user's `user_id`. Every user-owned table needs explicit `WITH CHECK (auth.uid() = user_id)`, tested with a cross-user policy test suite, not just happy-path manual QA.
3. **`getSession()` used server-side instead of `getUser()`** -- trusts a spoofable cookie for authorization decisions. Use `getUser()` in middleware/Server Components/Route Handlers for any access-gating decision; `getSession()` only for non-security UI (e.g., "show login button or not").
4. **SEO vs. login-wall conflict is unresolved in PROJECT.md itself** -- "reading requires an account" and "public pages need SEO for organic growth" cannot both be true if the full story body is auth-gated with no exceptions. Must be resolved as an explicit product decision (recommended: server-render headline/summary/why-it-matters publicly, gate the deeper layer) in the same phase that designs the reading flow and `published_stories` RLS policy.
5. **DPDP Act consent gap** -- this product's real purpose (list-building for a future, unrelated product, Gavelogy) requires honest, specific, unbundled consent language at signup, plus a published Privacy Policy/Terms and a real opt-out mechanism, before the signup flow goes live -- not a post-launch add-on.

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Supabase Foundation (schema, RLS, seed data)
**Rationale:** Everything else depends on a correctly-designed schema and RLS from day one; this has zero dependency on the sibling engine repo ever running (per ARCHITECTURE.md's build-order recommendation) and is the single highest-severity pitfall category if skipped or rushed.
**Delivers:** Supabase project created, minimal 4-table schema (`published_stories`, `profiles`, `favourites`, `reading_progress`) with RLS enabled and owner-only policies applied in the same migration that creates each table, hand-seeded rows mirroring the engine's known field shape, `SUPABASE_SERVICE_ROLE_KEY` convention established (server-only, never `NEXT_PUBLIC_`, this repo doesn't actually need it).
**Addresses:** RLS on all user data (Active requirement); foundation for favorites/mark-complete/settings.
**Avoids:** Pitfall 1 (RLS disabled by default), Pitfall 2 (`USING (true)`/missing `WITH CHECK`), Pitfall 6 (service-role key exposure).

### Phase 2: Reading-Flow & SEO Architecture Decision
**Rationale:** This is a product decision, not an implementation detail, and it determines the RLS policy shape for `published_stories` and the page architecture for both logged-in and logged-out visitors -- it must be resolved before public content pages are built, not discovered after launch via flat organic traffic.
**Delivers:** An explicit, documented decision on what an unauthenticated visitor/Googlebot can see (recommended: headline/summary/category/date/why-it-matters public, deeper interactive layer gated), reflected in the `published_stories` `anon` SELECT policy and the `(public)` route group's rendering approach.
**Addresses:** SEO/OG requirement and the "reading requires account" requirement simultaneously -- resolves the tension between them.
**Avoids:** Pitfall 7 (SEO vs. login-wall conflict) -- the highest-leverage, easiest-to-defer-and-regret pitfall in this research.

### Phase 3: Auth & Onboarding
**Rationale:** Depends on Phase 1's schema and Phase 2's decision about what's gated; auth patterns (middleware/proxy, `getUser()` discipline) need to be correct from the first protected route, not retrofitted.
**Delivers:** Google + email sign-in via `@supabase/ssr`, `profiles`-row-on-signup trigger, single-question onboarding (attempt year), `(app)` layout auth gate, session-refresh middleware/proxy, Privacy Policy/Terms/consent checkbox, deliberate email-confirmation setting.
**Addresses:** Google/email sign-up, one-question onboarding, settings-page sign-out (Active requirements).
**Avoids:** Pitfall 3 (RLS lockout of legitimate users), Pitfall 4 (`getSession()` vs `getUser()`), Pitfall 5 (middleware cookie sync), Pitfall 8 (DPDP consent gap), Pitfall 9 (unverified email signups).

### Phase 4: Public Content Pages (feed, story detail, archive, search)
**Rationale:** Works identically against Phase 1's seed data or later real synced data -- no code changes needed when the engine repo starts writing for real; this is where Phase 2's decision gets implemented as actual page architecture.
**Delivers:** Server-Component-rendered feed, story detail (what happened/background/key points/sources/why-it-matters/PYQ), chronological archive, basic title/keyword search (Postgres FTS), exam-relevance + category filters.
**Uses:** Next.js Server Components, Postgres full-text search, time-based `revalidate` (Pattern 3 from ARCHITECTURE.md) -- no webhook plumbing to the engine repo needed at this scale.
**Implements:** `app/(public)/*` route group, Server Component fetch pattern.

### Phase 5: Authenticated User-State Features
**Rationale:** Depends on both Phase 3 (auth exists) and Phase 4 (content exists -- you need a story to favorite); Server Actions + RLS-backed writes are the correct pattern established in Phase 1.
**Delivers:** Favorite/unfavorite, mark-complete, settings (exam year, theme, sign out), all via Server Actions with `revalidatePath`/`revalidateTag`.
**Addresses:** Favorite/mark-complete, settings page (Active requirements).
**Avoids:** Pitfall 3 (silent RLS-driven empty states -- distinguish "no data" from "error" in the UI).

### Phase 6: SEO Layer, Performance & Launch Readiness
**Rationale:** Layered on top of Phase 4 once page structure/URLs are stable -- building earlier risks churn as routes shift; also the natural point to verify the mobile-first/low-end-Android/accessibility requirements that cut across every prior phase.
**Delivers:** `generateMetadata`/OG per story, `sitemap.ts`, `robots.ts` excluding `(app)/*`, mobile-first/low-end-Android performance pass, accessibility baseline (semantic HTML, contrast, keyboard nav), the "Looks Done But Isn't" checklist from PITFALLS.md run end-to-end before opening signups publicly.
**Addresses:** SEO/OG requirement, mobile-first/accessibility requirement (Active requirements).
**Avoids:** Pitfall 7's verification step (logged-out `curl`/view-source check), general launch-readiness gaps.

### Phase Ordering Rationale

- **Schema/RLS first, always:** Every subsequent phase either reads or writes through RLS; getting the policy shapes wrong is expensive to retrofit and is this research's single highest-severity risk category (Pitfalls 1, 2, 6).
- **The SEO/login-wall decision is deliberately pulled forward into its own phase, ahead of content pages:** It's tempting to treat this as a detail discovered while building the feed, but PITFALLS.md and PROJECT.md both flag it as an unresolved contradiction in the current requirements -- making it its own decision point prevents it from being accidentally decided by default (e.g., by whichever RLS policy gets written first without discussion).
- **Auth before content pages, content pages before user-state features:** Matches the dependency graph in FEATURES.md and ARCHITECTURE.md's build-order recommendation -- user-state features need both a signed-in user and a story to act on.
- **SEO/launch-readiness last:** Metadata and sitemap work is cheap to add once URLs are stable, and bundling the full "Looks Done But Isn't" verification checklist into a dedicated final phase turns a scattered set of easy-to-forget checks (service-role key isolation, OAuth redirect URLs per environment, `getSession()` grep) into an explicit gate before public launch.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Reading-Flow & SEO Architecture Decision):** This is a genuine open product decision, not a documented pattern -- the roadmapper/planner should treat it as a decision point requiring explicit sign-off, and `/gsd:plan-phase --research-phase` may be worth running to survey how comparable gated-content sites (metered paywalls, Substack) structure the public/gated split in more detail.
- **Phase 3 (Auth & Onboarding):** The Next.js 16 `middleware.ts`->`proxy.ts` rename is MEDIUM confidence and actively in flux in the docs ecosystem -- verify against the exact pinned Next.js version before wiring session refresh; worth a quick research pass at implementation time rather than trusting any single tutorial.
- **Phase 1 (Supabase Foundation):** The new `sb_publishable_`/`sb_secret_` key format rollout is MEDIUM confidence (active rollout) -- confirm current dashboard default at project-creation time.

Phases with standard patterns (skip research-phase):
- **Phase 4 (Public Content Pages):** Server Component fetch + Postgres FTS + time-based revalidation are all HIGH-confidence, officially-documented patterns with concrete code examples already captured in ARCHITECTURE.md.
- **Phase 5 (Authenticated User-State Features):** Server Actions + RLS-backed mutation pattern is HIGH-confidence and fully worked out in ARCHITECTURE.md's Pattern 1/2 examples.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core versions verified against official docs and live npm registry (2026-07-22). MEDIUM on two fast-moving specifics: Next.js 16 middleware->proxy rename, new Supabase key format -- both flagged for verification at implementation time. |
| Features | MEDIUM | Habit-loop and onboarding-friction findings are HIGH (corroborated across Duolingo's own engineering blog, Auth0/Appcues/Apple guidance, multiple case studies). India-specific exam-prep competitor detail is thinner -- LOW-MEDIUM, based mostly on app store listings rather than primary usage data. |
| Architecture | HIGH | Next.js Server/Client Component model, `@supabase/ssr` pattern, and RLS structure all sourced from official docs. MEDIUM on the specific on-demand-vs-time-based revalidation tradeoff recommendation (synthesized, not a documented "best practice" for this exact two-repo setup) and on the middleware/proxy naming question (same MEDIUM flag as Stack). |
| Pitfalls | HIGH | RLS/auth mechanics verified against Supabase official docs and 2025-2026 incident writeups (CVE-2025-48757). MEDIUM on DPDP Act specifics (verified against multiple legal-compliance secondary sources, not primary statute text -- recommend a real legal review before launch, not just this research). HIGH on the SEO-vs-gated-content conflict, since it's directly derived from PROJECT.md's own stated requirements, not an external claim. |

**Overall confidence:** HIGH

### Gaps to Address

- **SEO vs. login-wall conflict is unresolved in PROJECT.md:** the single most consequential gap -- needs an explicit decision (recommended in this research: public headline/summary/why-it-matters, gated deeper layer) before Phase 2 of the roadmap is planned in detail. Flag this for the requirements-definition step, not just the roadmap.
- **Next.js 16 middleware->proxy naming:** confirm against the exact Next.js version pinned in `package.json` at the time auth/session code is written (Phase 3) -- don't trust tutorial code as-is.
- **Supabase key format (legacy `anon`/`service_role` vs new `sb_publishable_`/`sb_secret_`):** confirm the current dashboard default at Supabase project-creation time (Phase 1).
- **Engine repo's actual field coverage for exam-relevance/category tagging:** FEATURES.md flags that filter UI will silently degrade to no-ops if `published_stories` rows don't reliably populate these fields -- verify the engine's real output shape before committing filter UI to a phase (Phase 4), ideally by reading the engine repo's `editorial.py`/`supabase_sync.py` contract directly rather than assuming field names.
- **CLAT PG vs. UG audience scope:** PROJECT.md itself flags this as not fully confirmed -- treated as PG-primary for v1, revisit if it affects onboarding/content-filter design.
- **DPDP Act compliance is MEDIUM-confidence, secondary-source research:** treat the consent/privacy-policy guidance in PITFALLS.md as a starting point, not a substitute for actual legal review before the signup flow (which captures PII from primarily India-based users) goes live.

## Sources

### Primary (HIGH confidence)
- `nextjs.org/docs/app/guides/upgrading/version-16`, `nextjs.org/docs/messages/middleware-to-proxy`, `nextjs.org/docs/app/getting-started/css`, `nextjs.org/docs/app/getting-started/server-and-client-components`, `nextjs.org/docs/app/api-reference/file-conventions/metadata/robots`, `nextjs.org/docs/app/guides/incremental-static-regeneration` -- Next.js 16 conventions, Server/Client Component model, metadata/robots, ISR
- `tailwindcss.com/docs/guides/nextjs` -- Tailwind v4 CSS-first config
- `supabase.com/docs/guides/auth/server-side/creating-a-client`, `.../migrating-to-ssr-from-auth-helpers`, `.../getting-started/api-keys`, `.../database/postgres/row-level-security`, `.../database/full-text-search`, `.../troubleshooting/rls-performance-and-best-practices-Z5Jjwv`, `.../troubleshooting/why-is-my-service-role-key-client-getting-rls-errors...`, `.../getting-started/tutorials/with-nextjs` -- Supabase SSR client pattern, RLS structure and performance, auth-helpers deprecation, new API key rollout
- `docs.expo.dev/guides/using-supabase`, `supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth` -- shared-backend pattern for future Expo app
- `vercel.com/docs/plans/hobby` -- Hobby tier limits sufficient for pre-launch traffic
- npm registry (`npm view <pkg> version`, checked live 2026-07-22) -- exact current package versions
- CVE-2025-48757 (Matt Palmer disclosure) -- RLS-disabled-by-default real-world impact data
- GitHub `supabase/auth#965`, `orgs/supabase/discussions/34842` -- service-role/RLS interaction, middleware cookie forwarding
- Project context: `.planning/PROJECT.md` -- authoritative source for v1 scope and the SEO/login-wall internal contradiction

### Secondary (MEDIUM confidence)
- Duolingo engineering blog, Digia/Vmobify onboarding-friction analyses, Auth0/SuperTokens social-login conversion data -- habit-loop and signup-friction findings
- DPO India, secureprivacy.ai, digitalmarketacademy.in, consent.in -- DPDP Act consent/purpose-limitation requirements (legal-compliance secondary sources, not primary statute)
- vibeappscanner.com, modernpentest.com, supaexplorer.com, iloveblogs.blog -- Supabase security-misconfiguration patterns corroborating CVE-2025-48757
- dev.to (Supabase RLS beginner guide), Medium (Next.js route groups) -- architecture pattern sanity-checks

### Tertiary (LOW confidence)
- App store listings for Testbook/EduRev Daily Current Affairs -- competitor feature claims, marketing copy not independently verified
- LinkedIn posts on Inshorts' "Daily Ritual" feature and Morning Brew's landing-page conversion rate -- single-author/unverified secondary claims, used only directionally
- Reddit r/nextjs discussion on ISR vs on-demand revalidation -- community discussion, not authoritative, used only to confirm time-based revalidation is a reasonable default

---
*Research completed: 2026-07-22*
*Ready for roadmap: yes*
