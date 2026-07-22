# Feature Research

**Domain:** Free daily-reading / exam-prep content product (CLAT PG current affairs), list-building funnel
**Researched:** 2026-07-22
**Confidence:** MEDIUM (habit-loop and onboarding-friction findings are HIGH — corroborated across Duolingo's own engineering blog, Auth0/Appcues/Apple platform guidance, and multiple independent case studies; India-specific exam-prep competitor detail is thinner, MEDIUM-LOW, based mostly on app store listings and secondary write-ups rather than primary usage data)

## Context: the one structural tension worth naming up front

Every "reduce signup friction" pattern in this research (Auth0, Appcues, Vmobify's onboarding playbook) converges on **defer registration until after the user has felt value** — let people browse first, ask for an account only when they hit a save/sync moment. Gavel News Web's PROJECT.md has already and deliberately decided the opposite: reading requires an account from the first story, because the account *is* the product's real deliverable (the email list for Gavelogy). This isn't a mistake to fix — it's a already-settled, correct tradeoff given the actual business goal — but it means **all the "reduce friction" energy has to be spent on the signup step itself and the one onboarding question**, not on deferring the wall. Every table-stakes item below is filtered through that reality: the wall stays, so everything touching it must be as close to zero-cost as physically possible.

## Feature Landscape

### Table Stakes (Users Expect These)

Features already in v1 Active scope that the research confirms are non-negotiable — skipping or under-building any of these breaks the read-and-return loop or collapses signup conversion.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Google one-tap + email sign-in (no password field as primary path) | Social/native sign-in is the lowest-friction auth pattern measured across sources — social login lifts signup conversion up to ~20% over email+password forms; every typed character at the account step is a chance to abandon | LOW | Already the v1 plan. Use Google as primary, email as fallback — prefer magic-link/OTP-style email over a typed password if Supabase Auth supports it cheaply, since password fields are the highest-friction fallback option in the hierarchy (native > social > passwordless email > password) |
| Single-question onboarding, nothing else bolted on | Each additional pre-value screen typically drops completion 10-15%; a forced-registration-plus-profile-form pattern is the single most expensive onboarding mistake found across sources, and this product already can't defer the account itself, so every other field must be cut | LOW | Already the v1 plan (attempt year only). Resist any temptation to add a second question (e.g., "which exam / which category") at this stage — that's exactly the compounding drop-off the research warns about. Infer/default what you can instead of asking |
| Immediate, populated first screen after signup (today's feed, not an empty state) | A blank "get started" screen at the highest-intent moment in a session is a dead end; new users should land on pre-populated, real content, not a tutorial or an empty dashboard | LOW | The daily feed is naturally populated content, which is the right shape here — just make sure day-one signups never see a placeholder/loading skeleton for longer than necessary, especially on low-end Android |
| Fast cold start / lightweight first load on low-end Android | Sub-cliff loss happens before onboarding even begins on entry-level devices; a slow first render costs users the app never gets credit for losing | MEDIUM | Already a v1 constraint (mobile-first, low-end Android). Treat this as literally the first onboarding step, not a separate performance task — instrument time-to-first-content, not just time-to-first-paint |
| Scannable daily feed with reading time shown | Reading-time estimates (Medium, Morning Brew) set an expectation of low effort, which is exactly what a daily habit needs — "3 min" reads as "I can do this before class" | LOW | Already in v1 scope (headline/summary/category/date/reading time) |
| Favorite / save for later | Baseline utility expectation for any content library people intend to revisit — CLAT PG readers will want to re-find specific stories before mocks | LOW | Already in v1 scope |
| Mark story complete | Gives the reader a sense of progress through a session even without a formal streak — this is quietly the seed of habit-loop data (see Differentiators) | LOW | Already in v1 scope; store per-user per-story completion even if no UI surfaces aggregate streak data yet — cheap to capture now, expensive to backfill later |
| Basic title/keyword search | Table stakes for any content archive beyond a handful of items; users expect to find "that story about X" without scrolling | LOW-MEDIUM | Already in v1 scope |
| Exam-relevance + category filters | Minimum viable way to make a firehose of daily news feel curated for CLAT PG specifically, without building full faceted search | LOW-MEDIUM | Already in v1 scope |
| Settings: exam year, theme, sign out | Expected baseline account controls — their absence reads as unfinished, not minimal | LOW | Already in v1 scope |
| SEO metadata + OG tags on public story pages | This product's growth loop is organic reach → signup, not paid acquisition; every story that can't be shared/indexed is a lost acquisition channel | LOW | Already in v1 scope — treat as load-bearing for the funnel, not a nice-to-have |
| Accessible, mobile-first baseline (semantic HTML, contrast, keyboard nav) | Non-negotiable floor for a public reading product; also directly supports low-end-device performance | LOW-MEDIUM | Already in v1 scope |

### Differentiators (Competitive Advantage, Achievable in v1 Scope)

These aren't new features to add — they're places where the *already-decided* v1 scope, built with care, beats the norm in this specific niche (Indian competitive-exam current-affairs products: GKToday, Testbook, Adda247, EduRev-style apps, generic Inshorts-style news apps).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| One honest "why this matters" explanation + PYQ connection, instead of raw news dump | Most CLAT current-affairs competitors (GKToday, generic GK apps) present undifferentiated news summaries or bare MCQs; explaining *why a CLAT PG aspirant specifically should care*, tied to a past question pattern, is editorial judgment competitors mostly skip in favor of volume | Already in v1 scope | This is arguably the actual product differentiator — worth protecting scope-creep pressure to dilute it into generic "top 10 news today" content |
| Deliberately narrow, single-purpose UX (no quizzes/ads/mock-test upsells cluttering the reading surface) | Indian exam-prep apps in this space are typically crammed with quizzes, notifications, mock-test paywalls, and ads competing for attention; a calm, single-purpose daily read is a real point of difference and directly serves "genuinely good enough to return to" | Already in v1 scope (by virtue of what's deferred) | The Out of Scope list isn't just "less work" — it's the product's actual competitive shape. Every deferred item (quizzes, ads, notifications) is scope that competitors use and that this product is explicitly better for skipping at launch |
| Shareable individual story pages (OG tags + copyable/shareable link) | Morning Brew's referral program was built on individual story pages being independently shareable and indexable — referred visitors convert far better than cold landing-page traffic in that model; this product's SEO/OG requirement already sets up the same mechanic | LOW addition on top of already-planned SEO/OG work | Not new scope — just make sure the story detail page has an obvious, low-friction share affordance (native share sheet / copy link) since the OG tags already planned only pay off if sharing is easy |
| Lightweight, low-key progress signal from existing favorite/mark-complete data (e.g., "X stories read this week") | Inshorts' "Daily Ritual" feature shows that a *subtle*, non-gamey visual tracker built from data you're already collecting (reading activity) reinforces identity-level habit ("I'm someone who reads daily") without needing a formal streak/gamification system | LOW if added — mark-complete data is already being captured per v1 scope | Not a v1 requirement and shouldn't become one without a deliberate decision — flagging because the data dependency (per-user per-story completion) is already being built for other reasons, so this is cheap to layer on later. If it ships, keep it understated (a small counter, not badges/confetti) — see Anti-Features on over-gamification |
| Curated single daily edition instead of an infinite/algorithmic feed | Duolingo and Morning Brew both succeed by bounding the daily unit of consumption (one lesson, one digest) rather than an endless scroll — a fixed, finishable "today's edition" gives users a clear stopping point, which paradoxically drives more consistent return visits than infinite feeds | Already the implied shape of v1 (daily feed keyed to date/edition) | Worth protecting explicitly during implementation — don't let the feed UI drift toward an infinite-scroll pattern; a visible "you're caught up" end state is doing real habit-loop work |

### Anti-Features (Commonly Requested, Often Problematic)

These reinforce why the already-deferred list should stay deferred — included so the reasoning is on record for roadmap/requirements discussions, not to reopen the scope decision.

| Feature | Why Requested | Why Problematic (for v1 specifically) | Alternative |
|---------|---------------|------------------------------------|-------------|
| Quizzes / mastery questions | Real, valuable, and standard in this competitor category (Testbook, Adda247, GKToday all ship quizzes) | Large parallel build competing for engineering time with the actual thing being validated first (does the daily reading + signup loop work at all); also needs quiz-authoring pipeline the engine repo doesn't produce yet | Ship reading-only v1, prove daily return behavior, then add quizzes once there's usage data showing where they'd add the most value |
| Push notifications / email digests | Obvious lever for daily-return habit (this is literally how Duolingo and most exam apps drive DAU) | Requires a notification/permission-prompt system this v1 explicitly has no infrastructure for, and — per the onboarding research — poorly-timed permission prompts (asked at launch instead of after value) actively *lower* opt-in and burn a one-shot OS dialog; also the product's real acquisition asset is the *email address itself* for Gavelogy, not habitual push, so premature notification investment optimizes the wrong channel | Rely on the daily-edition habit loop (visible "new edition available," bounded content unit) to drive organic daily return without notification infrastructure; revisit once retention data justifies the build |
| Heavier gamification (badges, streak freezes, leaderboards, confetti) | Duolingo's streak system is the most-cited habit-loop mechanic in this research and is tempting to copy wholesale | Overt gamification aimed explicitly at "engagement" (rather than emerging naturally from data already collected) risks feeling like manipulation on a product whose stated purpose is trust-building for a future paid product — one of the sources reviewed explicitly warns that gamification "meant to drive engagement" is increasingly perceived as driving churn/distrust when it feels forced; Inshorts' more successful version is deliberately subtle, not game-like | If any progress signal ships, keep it Inshorts-style: quiet, factual, built from already-collected mark-complete data, no points/badges/leaderboards |
| Ads | Obvious monetization lever many free content products reach for immediately | No traffic yet to sell against; premature ad infrastructure adds complexity and, more importantly, undermines the trust this product needs to build before handing its list to a future paid product (Gavelogy) — ads on a "free resource" positioning read as bait-and-switch to an audience being cultivated for later monetization elsewhere | Revisit only after Gavelogy's own monetization model is defined — ad infrastructure on this site was never the intended revenue path |
| UG/PG split relevance or numeric confidence scores | Feels more "complete"/rigorous, and is standard in some competitor products that show multiple relevance tags | Adds cognitive load to the daily read (the exact thing Duolingo/Morning Brew avoid — bounded, low-effort daily units); also the source engine doesn't produce split UG/PG content yet, so this would be frontend scope racing ahead of backend capability | One honest plain-English "why this matters" line, already in v1 scope, does the same job with less friction and no fabricated precision |
| Faceted search (by case/provision/institution/person) | Power users (and the original 20-page spec) want deep filtering | At launch, the content library is a handful of daily editions — faceted search over a small corpus is solving a problem that doesn't exist yet, and adds real filter-state/UI complexity for near-zero value until the archive is large | Basic title/keyword search + exam/category filters (already in v1 scope) cover the actual near-term corpus size; add facets only once archive depth makes them useful |
| Account export/delete self-service | Reasonable long-term hygiene feature | Not launch-blocking for a free product with no paid data or complex account state yet; building it now is effort spent on an edge case with near-zero v1 users hitting it | Handle via manual/support request initially; build self-service once account volume justifies it |
| Multiple social login providers (Facebook, Apple, etc.) beyond Google + email | Feels "complete" to offer every common provider | Research is explicit that a wall of sign-in buttons creates its own choice-overload friction at exactly the moment friction must be lowest; CLAT PG aspirants in India are overwhelmingly Google-account users already | Google + email is sufficient and already the v1 decision — don't add more providers without evidence Google+email is actually losing signups |

## Feature Dependencies

```
Google/email auth (Supabase Auth)
    └──requires──> RLS policies distinguishing public story reads from user-owned data
                       └──enables──> Favorite / mark-complete (per-user, per-story state)
                                         └──enables (future, not v1)──> Lightweight progress/streak signal
                                         └──enables (future, not v1)──> Full analytics dashboard (deferred)

Google/email auth
    └──requires──> One-question onboarding (attempt year)
                       └──gates──> Daily feed access (first authenticated screen)

Daily feed (headline/summary/category/date/reading time)
    └──requires──> Exam-relevance + category tagging at content-production time (engine repo, out of this repo's control)
    └──enhances via──> Filters (exam relevance, category)

Story detail page (what happened/background/key points/sources/why-it-matters/PYQ)
    └──requires──> Engine's current editorial.py schema fields (already matches v1 scope; richer fields like UG/PG split or structured PYQ data are NOT yet produced upstream)
    └──enhances via──> SEO/OG metadata ──enables──> Shareable story links (differentiator) ──feeds──> Organic signup growth (the actual funnel)

Chronological archive
    └──requires──> published_stories with reliable date/edition structure (engine-side dependency)

Title/keyword search
    └──requires──> Basic text index on story title/keywords (Postgres full-text or simple ILIKE, not a search service — v1 scope is explicitly "basic")

Mark-complete data (collected from day one)
    └──conflicts with nothing, but──> is the prerequisite data source for any future streak/analytics/revision feature (all currently deferred) — worth capturing cleanly now even without surfacing it, since retrofitting historical completion data later is not possible
```

### Dependency Notes

- **Auth requires RLS design before any user-data feature ships:** favorites, mark-complete, and settings all depend on Supabase RLS correctly scoping "public read of published stories" vs "private read/write of my own data." This has to be right in the schema before favorite/mark-complete/settings can be built — it's foundational, not incremental.
- **Feed and filters depend on engine-side tagging, not just this repo:** exam-relevance and category values have to already exist on `published_stories` rows for filters to be meaningful. If the engine repo's current output doesn't reliably populate these fields, filters will silently degrade to no-ops — worth verifying the engine's actual field coverage before committing filter UI to a phase.
- **Shareability differentiator is nearly free if sequenced right:** since SEO/OG metadata is already required v1 scope, adding a share affordance on the story detail page is marginal work layered on top of work already planned — but only if it's sequenced *after* the story detail page and OG tags exist, not as a separate late addition.
- **Mark-complete data capture should not wait for a UI that surfaces it:** the underlying per-user-per-story completion event is cheap to log now and is the only path to any future habit-loop feature (streak signal, revision queue, analytics) working with historical data. Capturing it cleanly in v1 — even with zero UI beyond the "mark complete" toggle already in scope — avoids a data gap later.
- **Quizzes conflict with "ship reading first" sequencing:** quizzes were correctly deferred not because they're low-value but because they require an authoring pipeline this milestone's engine repo doesn't yet produce, and because validating the reading+signup loop first is the actual point of v1. Building quiz UI before that pipeline exists would be scope racing ahead of upstream capability, same failure mode as UG/PG split.

## MVP Definition

### Launch With (v1) — already the settled scope, restated with rationale

- [x] Google/email auth — lowest-friction entry point available given the unavoidable signup wall
- [x] One-question onboarding (attempt year) — the only question worth the friction cost
- [x] Daily feed (headline/summary/category/date/reading time) — the bounded, finishable daily unit that drives return visits
- [x] Exam + category filters — minimum curation without building faceted search
- [x] Story detail (what happened/background/key points/sources/why-it-matters/PYQ) — the actual differentiator vs. generic current-affairs content
- [x] Favorite + mark-complete — baseline utility and the seed data for any future habit-loop feature
- [x] Chronological archive — expected baseline for a content library
- [x] Basic title/keyword search — expected baseline utility
- [x] Settings (exam year, theme, sign out) — expected baseline account controls
- [x] Mobile-first, low-end Android, accessibility — non-negotiable given the actual device profile of the audience
- [x] RLS on all user data — non-negotiable given real user data (favorites, progress) exists from day one
- [x] SEO/OG on public story pages — load-bearing for the organic-growth half of the funnel

### Add After Validation (v1.x)

- [ ] Shareable story link / share affordance on story detail — add once story detail + OG tags are live; trigger is simply "OG metadata exists," not a separate validation gate
- [ ] Lightweight progress signal from mark-complete data (e.g., "3 stories read this week") — trigger: once there's enough real usage data to know whether a subtle signal is worth the UI real estate; don't build speculatively
- [ ] Refined filter set if engine-side tagging proves richer than expected — trigger: engine repo actually producing reliable category/relevance data beyond current fields

### Future Consideration (v2+, already correctly deferred)

- [ ] Quizzes / mastery questions — defer until reading+signup loop is validated and engine repo produces quiz-authoring output
- [ ] UG/PG split relevance — defer until engine repo produces split content and there's evidence single-explanation isn't sufficient
- [ ] Push notifications / email digests — defer until retention data shows the bounded-daily-edition loop alone isn't driving enough return visits
- [ ] Weak-topic tracking, revision queue, study planner, full analytics — all depend on mark-complete/quiz data accumulating first; premature before that exists
- [ ] Faceted search — defer until archive size actually makes basic filters insufficient
- [ ] Ads — defer indefinitely unless the business model for this specific site changes (unlikely, given its real purpose is list-building for Gavelogy, not standalone monetization)
- [ ] Account export/delete self-service — defer until account volume/regulatory pressure justifies it

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Google/email auth | HIGH | LOW | P1 |
| One-question onboarding | HIGH | LOW | P1 |
| Daily feed | HIGH | LOW-MEDIUM | P1 |
| Story detail w/ why-it-matters + PYQ | HIGH | MEDIUM | P1 |
| Favorite + mark-complete | MEDIUM-HIGH | LOW | P1 |
| Filters (exam/category) | MEDIUM | LOW-MEDIUM | P1 |
| Archive | MEDIUM | LOW | P1 |
| Search | MEDIUM | LOW-MEDIUM | P1 |
| Settings | LOW-MEDIUM | LOW | P1 |
| SEO/OG metadata | MEDIUM (long-term HIGH via funnel) | LOW | P1 |
| Shareable link affordance | MEDIUM | LOW | P2 |
| Lightweight progress signal | LOW-MEDIUM | LOW (data already captured) | P2 |
| Quizzes | HIGH (long-term) | HIGH | P3 |
| UG/PG split | MEDIUM | MEDIUM-HIGH | P3 |
| Notifications | HIGH (long-term retention) | MEDIUM-HIGH | P3 |
| Faceted search | LOW (at launch corpus size) | MEDIUM | P3 |
| Ads | LOW (actively negative for trust) | MEDIUM | Not planned |

**Priority key:**
- P1: Must have for launch (= already-settled v1 scope)
- P2: Should have, add when possible (near-zero-cost extensions of already-planned work)
- P3: Nice to have, future consideration (correctly deferred)

## Competitor Feature Analysis

| Dimension | GKToday / generic GK apps | Testbook / Adda247-style exam apps | Inshorts | Morning Brew | Gavel News Web (this product) |
|-----------|---------------------------|-------------------------------------|----------|---------------|-------------------------------|
| Content unit | Undifferentiated daily news list, often long-form | News + quizzes + mock tests bundled | 60-word bite-sized summaries, algorithmic/endless feed | One bounded daily email digest | One bounded daily edition, CLAT-PG-specific relevance framing |
| Signup model | Often free/open browsing, account optional | Account often required for quizzes/mocks, freemium paywalls | Free, account optional | Email-first, no app account needed to read (web archive is open) | Account required to read anything (deliberate list-building tradeoff) |
| Relevance framing | Generic, exam-agnostic | Exam-specific but usually via quiz correctness, not narrative explanation | None (general news) | None (general business news) | One plain-English "why this matters" + PYQ connection — the actual differentiator |
| Habit mechanic | None distinctive | Streaks/badges around quiz completion in some apps | Subtle "Daily Ritual" reading-consistency tracker | Referral program + bounded daily digest | Bounded daily edition + mark-complete (streak-adjacent data captured, not surfaced in v1) |
| Monetization surface visible to user | Ads common | Ads + paid mock-test tiers common | Ads common | None visible to reader (B2B ad sales, not reader-facing) | None in v1 (deliberately deferred) — closer to Morning Brew's clean-reader-experience model |
| Our approach | Differentiate on curation + explanation quality, not volume | Differentiate on being narrow/uncluttered — no quiz/mock upsell competing for attention at launch | Borrow the *subtle* progress-signal idea, not the endless-feed model | Borrow the bounded-digest shape and the shareable-story-page growth mechanic | — |

## Sources

- [Duolingo — The habit-building research behind your streak](https://blog.duolingo.com/how-duolingo-streak-builds-habit/) — MEDIUM-HIGH (official Duolingo engineering blog)
- [Digia — Duolingo's Habit-Forming Reminders: A UX Breakdown](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture) — MEDIUM (secondary analysis, corroborates official source)
- [Vmobify — App Onboarding Best Practices: Reduce Drop-Off & First-Week Churn](https://vmobify.com/blog/app-onboarding-best-practices) — MEDIUM-HIGH (agency analysis citing UXCam, Amplitude, Appcues, Apple App Store Review Guidelines §5.1.1 as primary sources; India-specific device/data guidance directly relevant to this product's stated low-end-Android constraint)
- [Auth0 — How to Use Social Login to Drive Your App's Growth](https://auth0.com/blog/how-to-use-social-login-to-drive-your-apps-growth/) — MEDIUM (vendor blog, conversion-lift figures are directionally consistent with other sources)
- [SuperTokens — Simplify User Access & Lift Conversions With Social Login](https://supertokens.com/blog/social-login) — MEDIUM (vendor blog, corroborates Auth0)
- [LinkedIn — Retention Kickoff by Inshorts: Turning News into a Daily Habit](https://www.linkedin.com/pulse/retention-kickoff-inshorts-turning-news-daily-habit-choudhary-lrafc) — LOW-MEDIUM (single-author analysis of a real shipped feature, not primary Inshorts documentation, but the described mechanic is independently observable in the app)
- [Medium (Tyler Denk, beehiiv co-founder) — How Morning Brew's referral program built an audience of 1.5 million subscribers](https://medium.com/the-mission/how-morning-brews-referral-program-built-an-audience-of-1-5-million-subscribers-3315482c1aa5) — HIGH (first-party account from Morning Brew's actual growth lead)
- [LinkedIn — Morning Brew's 40%+ conversion rate landing page pattern](https://www.linkedin.com/posts/mannyreyesm_this-newsletter-landing-page-pioneered-the-activity-7384300714342301696-R7sU) — LOW (secondary, unverified specific number, treat as directional)
- App store listings for CLAT/current-affairs exam-prep apps (Testbook, EduRev Daily Current Affairs) — LOW (marketing copy, not independently verified feature audits)
- Project context: `C:\Users\nithy\Desktop\.website-production\gavel-news-web\.planning\PROJECT.md` — HIGH (authoritative source for already-settled v1 scope)

---
*Feature research for: free daily-reading exam-prep content product (CLAT PG current affairs, list-building funnel)*
*Researched: 2026-07-22*
