# Gavel News Web

## What This Is

A free current-affairs reading website for CLAT PG aspirants. It reads published stories from Supabase (synced there by a separate engine repo, `gavel-news`, where an admin + Claude Code produce daily current-affairs pieces). Story pages are publicly readable in teaser form (headline, summary, what happened, background) for SEO and shareability; the deeper value (why it matters, key points, PYQ connection, favorite/mark-complete) requires a free account (Google or email).

## Core Value

A CLAT PG aspirant can sign up in under a minute and immediately get genuinely useful daily current-affairs content — the product only works as intended if it's good enough that people keep coming back on its own merits, not because they feel tricked into signing up.

## Strategic Context (why this exists)

This site's stated purpose to users is "free CLAT PG current affairs." Its actual business purpose is list-building: every signup captures an engaged CLAT PG aspirant's email. That list is the intended launch audience for **Gavelogy** — a separate, not-yet-built product/website — so that when Gavelogy ships, there's already a warm audience to convert instantly rather than starting from zero.

This means two things pull in the same direction, not opposite ones: the reading experience has to be genuinely good (or the funnel fails), and account creation has to be as close to zero-friction as possible (or people bounce before they're captured). Both matter equally.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up with Google or email
- [ ] On first login, user answers exactly one onboarding question: which year they're studying / attempt year
- [ ] User can view today's current-affairs edition as a feed (headline, summary, category, date, reading time)
- [ ] User can filter the feed by exam relevance and a small set of categories
- [ ] Anyone (signed in or not) can open a story and read a public teaser: headline, summary, what happened, background, sources
- [ ] Signed-in users additionally see: key points, one plain-English "why this matters" explanation, and its connection to past CLAT questions (PYQ) where one exists
- [ ] User can favorite a story and mark it complete (requires sign-in)
- [ ] User can browse a basic chronological archive of past editions
- [ ] User can search stories by title/keyword
- [ ] User can update their exam year, toggle theme, and sign out from a settings page
- [ ] Site is mobile-first, usable on low-end Android devices, and meets baseline accessibility (semantic HTML, contrast, keyboard nav)
- [ ] All user data (favorites, reading progress, profile) is protected by Supabase Row Level Security — public visitors can only read published story content
- [ ] Public story pages are set up for basic SEO (metadata, OG tags) since organic reach grows the list this product exists to build
- [ ] Signup flow includes a real Privacy Policy / Terms page and honest consent copy — this product's stated purpose (reading) and actual purpose (list-building for a separate, undisclosed future product) diverge, which India's DPDP Act 2023 treats as a specific-purpose consent question, not a formality

### Out of Scope

- Advertisements — no traffic yet; premature infrastructure for a problem that doesn't exist yet
- Three separate numeric relevance scores (UG/PG/confidence) per story — replaced by one honest "why this matters" explanation; consistent with the source engine's founding decision to reject scoring formulas for editorial judgment
- Five-question mastery quiz — real and valuable, but a large parallel build; ship the reading experience first, add once it's proven people read daily
- UG vs PG split perspectives — start with one relevance explanation; the source engine doesn't even produce split UG/PG content yet
- Weak-topic tracking, revision queue, study planner, full analytics dashboard — all depend on quiz data that doesn't exist yet
- Faceted search (by case/provision/institution/person), notifications/email digests, account export/delete self-service — real backlog items, not launch-blocking
- The full ~20-table Supabase schema and ~20-page sitemap from the original spec — over-normalized for a product with zero validated usage patterns; add tables/pages as real usage demands them

## Context

- **Sibling repo**: `gavel-news` (Python) is the source-of-truth editorial engine — admin + Claude Code produce daily stories there, reviewed in a local admin-preview UI, then synced to Supabase via `engine/supabase_sync.py`. That module is fully coded but **no Supabase project exists yet** — this is genuinely new infrastructure for both repos.
- **Content contract is narrower than this site eventually wants**: the engine's `editorial.py` schema and `/daily-edition` prompt currently only produce `title, what_happened, background, what_court_held, why_it_matters, key_points, sources`. Richer fields this site's later milestones will want (UG/PG split relevance, timeline, structured PYQ connections, quiz questions) don't exist yet in what Claude writes for the engine. Extending past v1 requires updating the engine repo too, not just this one.
- **Audience is CLAT PG-specific for now** — stated repeatedly by the person building this when explaining the funnel motive. Whether CLAT UG aspirants are explicitly excluded or just not the initial focus wasn't fully confirmed; treating as PG-primary and revisiting if it matters later (see Key Decisions).
- The reference for what NOT to build (a 20-table, 20-page, ads-and-quizzes-from-day-one full EdTech platform spec) already exists and was deliberately triaged down — see the Out of Scope section above for what was cut and why.

## Constraints

- **Tech stack**: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Auth, Postgres, Row Level Security) — chosen for SEO-capable server rendering, a mature auth+DB story, and to keep the door open for a future Expo mobile app sharing the same Supabase backend.
- **Data source**: Supabase `published_stories` table, written by the separate `gavel-news` engine repo. Schema must stay in sync with what that repo's `supabase_sync.py` actually produces — don't design frontend fields the engine can't fill yet.
- **Image storage (when added)**: Cloudflare R2, not Supabase Storage — text/JSON stays in Supabase, only the resulting image URL is stored there. See Key Decisions.
- **No Supabase project exists yet** — needs to be created before any backend work lands.
- **Separate repo from the engine** — explicit choice; this project does not import or depend on `gavel-news`'s Python code, only its Supabase output.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate repo from the `gavel-news` engine, not a monorepo | Independent identity, deployment, and release cadence from the admin tooling | — Pending |
| Real motive is list-building for a future separate product (Gavelogy) | Explicit strategic direction from the person building this | — Pending |
| Single-question onboarding (attempt year only, no exam-type picker) | Minimize signup friction — friction directly reduces list size | — Pending |
| One plain-English relevance explanation instead of numeric UG/PG/confidence scores | Consistent with the engine's founding rejection of scoring formulas; also cheaper to produce correctly | — Pending |
| CLAT PG treated as the primary/only audience for v1 | Repeatedly stated when explaining the funnel motive; not yet explicitly confirmed as an exclusion of UG | — Pending, revisit if unclear later |
| Quiz, revision, planner, analytics, notifications, ads all deferred past v1 | None of them are needed to prove the core reading + signup loop; each is a substantial build on its own | — Pending |
| Teaser pattern: story pages publicly readable in summary form, full depth gated behind signup | Original "reading requires an account" requirement directly conflicted with "public SEO pages drive the list" — a login wall can't be indexed or shared. Teaser serves both: crawlable/shareable content plus a real reason to sign up. Surfaced by pitfalls research. | — Pending |
| Privacy Policy/Terms + explicit consent copy is a v1 deliverable, not later polish | Product's stated purpose (reading) diverges from its actual purpose (list-building for an undisclosed future product); India's DPDP Act 2023 treats that gap as a consent violation risk. Surfaced by pitfalls research. | — Pending |
| Story images are optional and, when present, stored on Cloudflare R2 — not in Supabase | Text content (title, body fields, key points, sources) stays cheap in Supabase Postgres indefinitely at this content volume (~36 MB/year). Images are the actual storage risk: Supabase Storage's free tier is small and charges egress; R2 gives 10 GB free storage plus zero egress fees at any scale, which matters once real traffic exists. Only the R2 image URL is stored in `published_stories` — Supabase never holds image bytes. | Decided — deferred to v2 (no image field in the v1 schema; admin upload UI is a `gavel-news` engine-repo addition, not required for Phases 1-5 here) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-22 after initialization*
