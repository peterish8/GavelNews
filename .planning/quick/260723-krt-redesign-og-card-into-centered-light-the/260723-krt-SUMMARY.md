---
phase: quick-260723-krt
plan: 01
subsystem: ui
tags: [next-og, satori, opengraph, tailwind-tokens]

# Dependency graph
requires:
  - phase: quick-260723-0vx
    provides: loadGoogleFont helper, Promise.all/try-catch font-loading, serifFamily/monoFamily derivation for the OG card route
provides:
  - Centered, light-theme "masthead" OG card layout that visually echoes AppShell.tsx's real site header
affects: [og-image, story-sharing, seo-preview]

# Tech tracking
tech-stack:
  added: []
  patterns: ["OG card colors/layout sourced as hardcoded hex literals from app/tokens.css (Satori cannot resolve CSS custom properties)"]

key-files:
  created: []
  modified: ["app/story/[slug]/opengraph-image.tsx"]

key-decisions:
  - "Used app/tokens.css --bg (#F7F6FB) rather than pure white for the card background, so it visually reads as the real app's header rather than a generic white card"
  - "Wordmark set larger (52px) than headline (46px) to make the brand lockup the dominant visual element, mirroring AppShell.tsx's centered masthead treatment"

patterns-established: []

requirements-completed: []

# Metrics
duration: ~15min
completed: 2026-07-23
---

# Phase quick-260723-krt: Redesign OG card into centered light-theme masthead Summary

**Replaced the per-story OG preview card's left-aligned white-on-red-gradient layout with a centered light-theme masthead (wordmark, tagline, divider, kicker, headline, footer) that visually echoes the real site's AppShell header — all font-loading logic left untouched.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-23T09:41:53Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `app/story/[slug]/opengraph-image.tsx`'s returned JSX tree replaced per the plan's `<interfaces>` spec: light `#F7F6FB` background, `alignItems: "center"`, 72px padding, no top-level `color`
- New masthead group (52px serif wordmark `#130F2A`, 15px mono uppercase tagline `#857FA0`, new 160x2px `#E8D4D4` divider) added above the story group
- Story group restyled: kicker recolored to brand red `#DC2626`, headline recentered (`textAlign: "center"`, `width: "1040px"`, 46px, `lineHeight: 1.2`, `#130F2A`)
- Footer line recolored to muted mono `#857FA0` at 18px
- `loadGoogleFont`, the `Promise.all`/try-catch font-loading block, and `serifFamily`/`monoFamily` derivation verified byte-identical to before this task
- Verified locally: real-font path renders correctly (visual inspection) and fallback path (deliberately broken Google Fonts hostname) still returns a valid 200 PNG in the identical light-theme layout with generic sans-serif substituted, not a 500

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace the OG card JSX with the centered light-theme masthead layout** - `76f3c2b` (feat)

**Plan metadata:** committed separately by the orchestrator (not included in this agent's commits per constraints)

## Files Created/Modified
- `app/story/[slug]/opengraph-image.tsx` - Returned JSX tree recolored/recentered into a light-theme masthead layout; `loadGoogleFont`/font-loading logic unchanged

## Decisions Made
None beyond what the plan specified — all values (hex colors, font sizes, spacing) were taken verbatim from the plan's `<interfaces>` block, which itself sourced them from `app/tokens.css` and `components/AppShell.tsx`.

## Deviations from Plan

None - plan executed exactly as written. All values in the JSX tree match the `<interfaces>` spec verbatim; `loadGoogleFont` and the font-loading try/catch block are byte-identical to the pre-task version (only the deliberate temporary hostname typo used for fallback-path verification touched that function, and it was reverted before committing — confirmed via `git diff` showing the fetch URL restored to `https://fonts.googleapis.com/...`).

## Issues Encountered

- The worktree had no `node_modules` (git worktrees don't share installed dependencies) and port 3000 was already occupied by a dev server running from the main repo checkout (not this worktree), so it would not have reflected the code change. Resolved by running `pnpm install` inside the worktree and starting a dedicated `next dev -p 3101` server scoped to this worktree for verification; the server was stopped after verification completed. This was infrastructure setup, not a plan deviation.
- `pnpm dev -- -p 3101` mis-forwarded the `--` separator (`next dev -- -p 3101` treated `-p 3101` as a positional project-directory argument and failed); switched to `npx next dev -p 3101` directly, which started correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- OG card redesign complete and verified both with real Google Fonts and via the font-loading fallback path locally.
- Plan's `<verification>` step 4 (production check on `https://gavelnews.vercel.app/story/<real-slug>/opengraph-image`) is post-deploy and out of scope for this local execution — flagged for whoever deploys this change to spot-check once live.

---
*Phase: quick-260723-krt*
*Completed: 2026-07-23*

## Self-Check: PASSED

- FOUND: `app/story/[slug]/opengraph-image.tsx`
- FOUND: `.planning/quick/260723-krt-redesign-og-card-into-centered-light-the/260723-krt-SUMMARY.md`
- FOUND: commit `76f3c2b`
