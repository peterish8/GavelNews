---
phase: quick-260722-wgo
plan: 01
subsystem: ui
tags: [nextjs, next-og, metadata, opengraph, web-share-api, clipboard]

# Dependency graph
requires: []
provides:
  - SITE_URL env-driven constant (lib/site.ts) — single source of truth for metadataBase, canonical URLs, and share links
  - Richer generateMetadata on story pages (canonical, openGraph.url/siteName, twitter card)
  - Per-story branded OG image via Next.js opengraph-image.tsx file convention
  - ShareButton client component (Web Share API + clipboard-copy fallback)
affects: [story-pages, seo, sharing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SITE_URL centralization: env-driven base URL constant, imported wherever a canonical/absolute URL is needed instead of hardcoding localhost"
    - "Next.js file-convention OG image (opengraph-image.tsx) colocated with page.tsx, re-fetching story data independently since file-convention renders can't share fetched data across files"

key-files:
  created: [lib/site.ts, app/story/[slug]/opengraph-image.tsx, components/ShareButton.tsx]
  modified: [app/layout.tsx, app/story/[slug]/page.tsx, .env.example]

key-decisions:
  - "Used Next.js's built-in opengraph-image.tsx file convention (edge ImageResponse) instead of a hand-authored SVG placeholder or manual images field, since WhatsApp/Telegram expect raster PNG and no image field exists on PublishedStory"
  - "ShareButton does not fall back to clipboard when the user cancels the native Web Share sheet — clipboard fallback is only for browsers lacking Web Share API support entirely"

patterns-established:
  - "Env-driven site URL constant (lib/site.ts) as the only place the localhost fallback string is duplicated"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-07-22
---

# Phase quick-260722-wgo: Add proper Share button for story pages Summary

**Story pages now render rich branded OG preview cards (via a per-story Next.js `opengraph-image.tsx`) and a right-aligned Share button using the Web Share API with clipboard-copy fallback.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-07-22T23:29:00+05:30 (approx, from first commit)
- **Completed:** 2026-07-22T23:30:56+05:30
- **Tasks:** 3 completed
- **Files modified:** 7 (3 created, 4 modified — counting `.env.example` and `app/layout.tsx`)

## Accomplishments
- Centralized `SITE_URL` in `lib/site.ts`, removing the hardcoded `http://localhost:3000` from `app/layout.tsx`'s `metadataBase`
- `generateMetadata` in `app/story/[slug]/page.tsx` now emits `alternates.canonical`, `openGraph.url`/`siteName`, and a `twitter` summary_large_image card
- New `app/story/[slug]/opengraph-image.tsx` produces a real 1200x630 branded PNG per story (Gavel News wordmark, category kicker, headline, footer), using Next's `next/og` `ImageResponse` on the edge runtime
- New `components/ShareButton.tsx`: Web Share API when supported (no clipboard fallback on cancel), else `navigator.clipboard.writeText` + a 2s "Copied!" state
- `ShareButton` wired into the story page header actions row, right-aligned via `justify-between`, visible for both signed-in and signed-out visitors

## Task Commits

Each task was committed atomically:

1. **Task 1: Site URL constant, metadataBase fix, richer generateMetadata, per-story OG image** - `bdb37a2` (feat)
2. **Task 2: ShareButton client component (Web Share API + clipboard fallback)** - `93c3887` (feat)
3. **Task 3: Wire ShareButton into the story page header (right side)** - `c15768a` (feat)

_No TDD tasks in this plan; each task is a single commit._

## Files Created/Modified
- `lib/site.ts` - New `SITE_URL` constant (env-driven, trailing-slash stripped, localhost fallback)
- `app/layout.tsx` - `metadataBase` now built from `SITE_URL` instead of a hardcoded string
- `app/story/[slug]/page.tsx` - `generateMetadata` extended with canonical/OG/Twitter fields; header actions row now `flex justify-between` with `<ShareButton>` on the right
- `app/story/[slug]/opengraph-image.tsx` - New per-story branded OG image (edge `ImageResponse`, 1200x630 PNG)
- `components/ShareButton.tsx` - New client leaf component: Web Share API + clipboard fallback
- `.env.example` - Documents `NEXT_PUBLIC_SITE_URL`

## Decisions Made
- Per-story OG image built via Next.js's file-convention `opengraph-image.tsx` (edge `ImageResponse`) rather than a static/generic placeholder, since no image field exists on `PublishedStory` and WhatsApp/Telegram require raster PNG/JPG `og:image` — this is the only approach that renders the real per-story headline in the shared preview.
- `ShareButton` deliberately does not fall back to clipboard copy when a user cancels the native share sheet — cancellation is not a request to copy the link instead.

## Deviations from Plan

None - plan executed exactly as written. (One internal ordering note: the `ShareButton` import was initially added to `app/story/[slug]/page.tsx` during Task 1's edit by mistake, since `ShareButton` didn't exist yet; this was caught and removed before running `tsc --noEmit`/committing Task 1, and re-added correctly in Task 3 as the plan specified. No commit ever contained the premature import, so this is not tracked as a deviation against a committed state.)

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required. `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` in dev; set it to the real production domain in the deployment environment when going live (documented in `.env.example`).

## Next Phase Readiness
- Story pages are now fully shareable with correct branded previews and canonical URLs, independent of Phase 1 (Supabase) work — this uses the existing mock `getDataSource()` layer and will keep working unchanged once `DATA_SOURCE=supabase` is wired in Phase 5.
- No blockers.

---
*Phase: quick-260722-wgo*
*Completed: 2026-07-22*

## Self-Check: PASSED

All created/modified files verified present (`lib/site.ts`, `app/story/[slug]/opengraph-image.tsx`, `components/ShareButton.tsx`, `app/layout.tsx`, `app/story/[slug]/page.tsx`, `.env.example`). All three task commits verified present in git log (`bdb37a2`, `93c3887`, `c15768a`).
