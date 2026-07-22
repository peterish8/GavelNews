# Roadmap: Gavel News Web

## Overview

Gavel News Web ships in five phases that move from invisible infrastructure to a fully public, launch-ready product. Phase 1 stands up the Supabase backend (schema, RLS, seed data) and makes the one unresolved product decision — how much of a story is public versus gated — before any page depends on it. Phase 2 builds the auth/onboarding/legal spine so a real user identity exists. Phase 3 puts the actual reading experience in front of both anonymous visitors and signed-in users, working against the seed data from Phase 1 with zero rework needed once the sibling engine repo starts syncing real content. Phase 4 layers authenticated user-state (favorites, mark-complete, settings) on top of a working auth + content stack. Phase 5 closes with SEO metadata, mobile/low-end-Android performance, and accessibility — the launch-readiness pass that makes the organic-growth half of the funnel actually work.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Supabase Foundation & Reading-Flow Decision** - Schema, RLS, seed data, and the explicit public/gated content split are established before anything else depends on them.
- [ ] **Phase 2: Auth, Onboarding & Legal Consent** - Users can sign up/sign in with Google or email, complete one-question onboarding, and see honest DPDP-compliant consent copy.
- [ ] **Phase 3: Public & Gated Content Reading** - Anyone can read a story teaser; signed-in users see the deeper layer; users can browse, filter, and search.
- [ ] **Phase 4: Authenticated User State & Settings** - Signed-in users can favorite, mark-complete, and manage their account.
- [ ] **Phase 5: SEO, Performance & Launch Readiness** - Public pages are indexable and fast on low-end mobile, and the site meets baseline accessibility.

## Phase Details

### Phase 1: Supabase Foundation & Reading-Flow Decision
**Goal**: A correctly-modeled, RLS-secured Supabase backend exists with seed data, and the public-vs-gated reading-flow split is explicitly decided and encoded in the `published_stories` policy — before any later phase builds against it.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-03
**Success Criteria** (what must be TRUE):
  1. A Supabase project exists with `published_stories`, `profiles`, `favourites`, and `reading_progress` tables, each with Row Level Security enabled in the same migration that creates it.
  2. Every user-data table (`profiles`, `favourites`, `reading_progress`) has owner-only policies (including `WITH CHECK` on inserts) that are verified programmatically — not just assumed from the dashboard toggle.
  3. `published_stories` has a public-read policy scoped to published rows only, with no anon/authenticated write access — writes are documented as belonging solely to the sibling engine repo's service-role key, which this repo never holds.
  4. The public/gated reading-flow split (exactly which fields an anonymous visitor and Googlebot can see versus what requires sign-in) is explicitly decided, documented, and reflected in hand-seeded rows covering both the teaser and gated field sets.
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Auth, Onboarding & Legal Consent
**Goal**: A user can create a real identity — sign up or sign in with Google or email, answer exactly one onboarding question, and give honest, DPDP-compliant consent — with a session that survives a refresh and a working sign-out.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, LEGAL-01, LEGAL-02
**Success Criteria** (what must be TRUE):
  1. User can sign up or sign in with Google.
  2. User can sign up or sign in with email.
  3. User's session persists across a browser refresh, verified via server-side `getUser()` revalidation rather than trusting the session cookie alone.
  4. On first login only, user answers exactly one onboarding question (attempt year) and nothing else.
  5. User can sign out from any page.
  6. Signup flow links a real Privacy Policy and Terms page, and the consent copy honestly discloses that the account/email may be used for future product updates (Gavelogy), not just current-affairs delivery.
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 02-01: TBD

### Phase 3: Public & Gated Content Reading
**Goal**: Anyone can read a story's public teaser for SEO and shareability, signed-in users see the deeper content layer, and every visitor can browse, filter, and search the daily edition and archive.
**Mode:** mvp
**Depends on**: Phase 1 (schema, seed data, reading-flow decision), Phase 2 (auth, so the gated layer has something to gate on)
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06
**Success Criteria** (what must be TRUE):
  1. Anyone, signed in or not, can open a story and read the public teaser: headline, summary, what happened, background, sources.
  2. Signed-in users additionally see key points, one plain-English "why this matters" explanation, and its PYQ connection where one exists.
  3. User can view today's edition as a feed showing headline, summary, category, date, and estimated reading time.
  4. User can filter the feed by exam relevance and a small set of categories.
  5. User can browse a basic chronological archive of past editions.
  6. User can search stories by title or keyword.
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD

### Phase 4: Authenticated User State & Settings
**Goal**: Signed-in users can track their own engagement with content (favorites, completion) and manage their account from a settings page.
**Mode:** mvp
**Depends on**: Phase 2 (auth), Phase 3 (content to act on)
**Requirements**: STATE-01, STATE-02, SETTINGS-01, SETTINGS-02, SETTINGS-03
**Success Criteria** (what must be TRUE):
  1. Signed-in user can favorite a story and unfavorite it.
  2. Signed-in user can mark a story complete and undo that.
  3. User can update their attempt year from a settings page.
  4. User can toggle between light and dark theme.
  5. User can sign out from the settings page.
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: TBD

### Phase 5: SEO, Performance & Launch Readiness
**Goal**: Public pages are actually discoverable and fast enough on low-end Android to convert organic traffic into signups, and the site meets a baseline accessibility standard.
**Mode:** mvp
**Depends on**: Phase 3 (public page URLs/structure must be stable), Phase 2 (authenticated routes must exist to be excluded from indexing)
**Requirements**: PLAT-01, PLAT-02, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Public story, feed, and archive pages carry SEO metadata and Open Graph tags; authenticated dashboard/settings pages are excluded from indexing (verified via a logged-out view-source/robots check, not just assumed).
  2. Site loads and is fully usable on a low-end Android device / throttled connection, with fast initial load treated as step one of onboarding.
  3. Site meets baseline accessibility: semantic HTML, sufficient color contrast, visible focus states, and full keyboard navigation.
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Supabase Foundation & Reading-Flow Decision | 0/TBD | Not started | - |
| 2. Auth, Onboarding & Legal Consent | 0/TBD | Not started | - |
| 3. Public & Gated Content Reading | 0/TBD | Not started | - |
| 4. Authenticated User State & Settings | 0/TBD | Not started | - |
| 5. SEO, Performance & Launch Readiness | 0/TBD | Not started | - |
