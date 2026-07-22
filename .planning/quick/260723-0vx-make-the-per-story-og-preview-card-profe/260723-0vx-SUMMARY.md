---
phase: quick-260723-0vx
plan: 01
subsystem: ui
tags: [nextjs, next-og, opengraph, fonts, satori, branding]

# Dependency graph
requires: []
provides:
  - Per-story OG image with real Source Serif 4 + IBM Plex Mono typography
  - Graceful font-fetch fallback to generic sans-serif (no 500 on CDN failure)
affects: [story-pages, seo, sharing, opengraph]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Google Fonts CSS2 + PhantomJS UA fetch-and-parse for Satori TTF/OTF subsets at edge request time"
    - "All-or-nothing fonts option on ImageResponse — omit key entirely on failure"

key-files:
  created: []
  modified: [app/story/[slug]/opengraph-image.tsx]

key-decisions:
  - "Loaded both Source Serif 4 (700) and IBM Plex Mono (500) via Promise.all; any failure drops both fonts to avoid half-branded cards"
  - "AbortSignal.timeout(4000) on CSS and binary font fetches to protect crawlers from hung edge requests"
  - "text= subset param on Google Fonts CSS2 URL so Satori gets a small, correctly-glyph-covered TTF"

patterns-established:
  - "Runtime Google Fonts load for next/og ImageResponse with full sans fallback"

requirements-completed: []

# Metrics
duration: ~8min
completed: 2026-07-23
---

# Phase quick-260723-0vx: Professional per-story OG preview card Summary

**Per-story Open Graph cards now render the real Gavel News wordmark lockup (Source Serif 4 bold + IBM Plex Mono "DAILY LEGAL BRIEF") and story headline in Source Serif 4, matching AppShell / StoryReader typography — with full fallback to generic sans if Google Fonts is unreachable.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-07-23
- **Tasks:** 2 completed
- **Files modified:** 1

## Accomplishments

- Added `loadGoogleFont()` helper: CSS2 API fetch with legacy User-Agent (TTF/OTF), `text` subsetting, 4s abort timeouts
- Request-time `Promise.all` loads Source Serif 4 (700) + IBM Plex Mono (500); on any failure logs slug-scoped error and omits `fonts` from `ImageResponse`
- Wordmark restructured to stacked "Gavel News" (serif) + "DAILY LEGAL BRIEF" (mono uppercase)
- Category kicker + footer use mono; headline uses serif at 56px / line-height 1.15
- Red auth-hero gradient background and 1200×630 card geometry unchanged
- `pnpm typecheck` passes

## Task Commits

1. **Task 1 + Task 2: Branded OG fonts + typography lockup** — single plan commit (see git log)

_No TDD tasks in this plan._

## Files Created/Modified

- `app/story/[slug]/opengraph-image.tsx` — `loadGoogleFont`, dual-font load with fallback, branded JSX typography

## Decisions Made

- All-or-nothing font load: never pass a partial `fonts` array so cards never mix real serif with missing mono (or vice versa).
- Kept hardcoded red gradient hex values (Satori cannot resolve CSS custom properties from tokens.css).

## Verification

- `pnpm typecheck` / `npx tsc --noEmit` — pass
- Manual: `pnpm dev` then open `/story/governor-article-200-pocket-veto/opengraph-image` and confirm serif wordmark/headline + mono tagline on the red gradient

## Self-Check: PASSED

- [x] `loadGoogleFont` present and used via `Promise.all`
- [x] try/catch sets `fonts = undefined` on failure
- [x] `ImageResponse` options spread `fonts` only when loaded
- [x] Wordmark + tagline lockup, mono kicker/footer, serif headline
- [x] Gradient / dimensions unchanged
- [x] No new npm dependencies
- [x] SUMMARY written
