# Requirements: Gavel News Web

**Defined:** 2026-07-22
**Core Value:** A CLAT PG aspirant can sign up in under a minute and immediately get genuinely useful daily current-affairs content

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Onboarding

- [ ] **AUTH-01**: User can sign up / sign in with Google
- [ ] **AUTH-02**: User can sign up / sign in with email
- [ ] **AUTH-03**: User session persists across browser refresh (via `getUser()` server-side revalidation, not just the session cookie)
- [ ] **AUTH-04**: On first login, user answers exactly one onboarding question — which year they're studying / attempt year — and nothing else
- [ ] **AUTH-05**: User can sign out from any page

### Legal & Compliance

- [ ] **LEGAL-01**: A real Privacy Policy and Terms page exist and are linked from signup
- [ ] **LEGAL-02**: Signup consent copy honestly discloses that the account/email may be used for future product updates (Gavelogy), not just current-affairs delivery — satisfies DPDP Act 2023 specific-purpose consent, not just a checkbox for its own sake

### Content & Reading

- [ ] **CONTENT-01**: Anyone (signed in or not) can open a story and read the public teaser: headline, summary, what happened, background, sources
- [ ] **CONTENT-02**: Signed-in users additionally see: key points, one plain-English "why this matters" explanation, and its PYQ connection where one exists
- [ ] **CONTENT-03**: User can view today's edition as a feed: headline, summary, category, date, estimated reading time
- [ ] **CONTENT-04**: User can filter the feed by exam relevance and a small set of categories
- [ ] **CONTENT-05**: User can browse a basic chronological archive of past editions
- [ ] **CONTENT-06**: User can search stories by title/keyword

### User State

- [ ] **STATE-01**: Signed-in user can favorite a story and unfavorite it
- [ ] **STATE-02**: Signed-in user can mark a story complete and undo that

### Settings

- [ ] **SETTINGS-01**: User can update their attempt year
- [ ] **SETTINGS-02**: User can toggle light/dark theme
- [ ] **SETTINGS-03**: User can sign out from the settings page

### Platform Quality

- [ ] **PLAT-01**: Site is mobile-first and usable on low-end Android devices (fast initial load is treated as step one of onboarding, not a separate concern)
- [ ] **PLAT-02**: Site meets baseline accessibility: semantic HTML, sufficient color contrast, visible focus states, keyboard navigation
- [ ] **PLAT-03**: Every table holding user data (profiles, favourites, reading_progress) has Row Level Security enabled with owner-only policies, verified programmatically (not just assumed from the dashboard toggle) — `published_stories` gets a public-read policy only, writable solely by the engine repo's service-role key
- [ ] **PLAT-04**: Public story/feed/archive pages have SEO metadata and Open Graph tags; authenticated dashboard/settings pages are excluded from indexing

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Learning Loop

- **QUIZ-01**: Every story has a five-question mastery quiz
- **QUIZ-02**: Quiz attempts, scores, and mistakes are tracked per user
- **CONTENT-07**: Story relevance is split into separate UG and PG perspectives (blocked on the engine repo producing split content)

### Retention & Habit

- **STATE-03**: User sees a current streak
- **STATE-04**: Weak-topic tracking based on quiz mistakes
- **REVISION-01**: Basic revision queue (due today / overdue / completed)
- **PROGRESS-01**: Simple progress counters (articles read this week, etc.)

### Growth Backlog (real, not launch-blocking)

- **PLANNER-01**: Lightweight daily study planner
- **PROGRESS-02**: Full analytics dashboard (UG/PG accuracy, weekly/monthly activity)
- **SEARCH-02**: Faceted search by case, provision, institution, person
- **NOTIF-01**: Email digests and reminders
- **ACCOUNT-01**: Self-service account data export / delete

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Advertisements | No traffic yet; premature infrastructure for a problem that doesn't exist, and undermines the trust the list-building funnel depends on |
| Three separate numeric relevance scores (UG/PG/confidence) per story | Replaced by one honest "why this matters" explanation; consistent with the source engine's founding rejection of scoring formulas |
| Full ~20-table Supabase schema, ~20-page sitemap (original spec) | Over-normalized for a product with zero validated usage patterns; add tables/pages as real usage demands them |
| Heavy gamification (badges, leaderboards) | Research flagged this risks feeling manipulative on a product whose real purpose is audience-warming — the deliberately narrow, quiz-free UX is itself the positioning |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-03 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| LEGAL-01 | Phase 2 | Pending |
| LEGAL-02 | Phase 2 | Pending |
| CONTENT-01 | Phase 3 | Pending |
| CONTENT-02 | Phase 3 | Pending |
| CONTENT-03 | Phase 3 | Pending |
| CONTENT-04 | Phase 3 | Pending |
| CONTENT-05 | Phase 3 | Pending |
| CONTENT-06 | Phase 3 | Pending |
| STATE-01 | Phase 4 | Pending |
| STATE-02 | Phase 4 | Pending |
| SETTINGS-01 | Phase 4 | Pending |
| SETTINGS-02 | Phase 4 | Pending |
| SETTINGS-03 | Phase 4 | Pending |
| PLAT-01 | Phase 5 | Pending |
| PLAT-02 | Phase 5 | Pending |
| PLAT-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-22*
*Last updated: 2026-07-22 after initial definition*
