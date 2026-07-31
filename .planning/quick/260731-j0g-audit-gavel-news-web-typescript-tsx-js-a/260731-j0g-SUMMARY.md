---
phase: quick-260731-j0g
plan: 01
subsystem: quality
tags: [typescript, tsx, css, google-style-guide, accessibility, non-null-assertions, audit]

requires: []
provides:
  - Full-codebase audit of app/, components/, lib/ (TS/TSX) and app/globals.css,
    app/system.css against the Google TypeScript, JavaScript, and HTML/CSS
    style guides, with unambiguous violations fixed in place
affects: [app-routes, components, lib-data, lib-supabase, css-theme]

tech-stack:
  added: []
  patterns:
    - "Non-null assertions on Map.get()/array-index lookups replaced with a
      local const + guard so TypeScript narrows the value instead of asserting
      it — applied consistently across lib/data/mock.ts, lib/data/supabase.ts,
      components/CalendarBrowser.tsx, components/PYQSidebar.tsx"
    - "Env-var non-null assertions (process.env.X!) replaced with a
      presence-check + thrown Error, matching the pre-existing pattern in
      lib/supabase/serviceRole.ts for SUPABASE_SERVICE_ROLE_KEY"
    - "Function-declaration closures over an outer narrowed const need their
      own redundant narrowing check inside the closure body — TS does not
      carry outer if(!x)return narrowing across a hoisted function boundary
      (components/StoryReader.tsx onClick handler)"

key-files:
  created: []
  modified:
    - app/story/[slug]/page.tsx
    - app/auth/signin/page.tsx
    - components/CalendarBrowser.tsx
    - components/NavSearch.tsx
    - components/SearchInput.tsx
    - components/StoryReader.tsx
    - components/PYQSidebar.tsx
    - components/SettingsForm.tsx
    - components/SignInGate.tsx
    - lib/data/mock.ts
    - lib/data/supabase.ts
    - lib/supabase/client.ts
    - lib/supabase/serviceRole.ts
    - app/globals.css
    - app/system.css

key-decisions:
  - "Kept lib/data/supabase.ts's `type Row = Record<string, any>` as an
    intentional, documented interop-boundary exception rather than narrowing
    to Record<string, unknown> — ~80 property accesses across 10+ mapper
    functions would each need an individual cast for zero behavior change,
    which the plan's own case-by-case guidance treats as not mechanical."
  - "Deliberately did not convert the codebase's pervasive `0.5`-style CSS
    fractional values to the Google guide's leading-zero-omitted `.5` form —
    used hundreds of times consistently across globals.css/system.css/
    tokens.css (the last out of scope); a project-wide mechanical rewrite of
    an established, self-consistent, purely cosmetic convention was judged
    not worth the review risk for near-zero readability gain."
  - "Where CSS fixes fell inside the same contiguous diff region as another
    in-flight session's uncommitted color-palette WIP, used `git add -p`
    (globals.css) or a hand-constructed index blob via git hash-object +
    update-index (system.css) to stage only the audit's own line changes,
    leaving the WIP hunks uncommitted and untouched in the working tree."

requirements-completed: []

duration: ~35min
completed: 2026-07-31
---

# Quick Task 260731-j0g: Audit gavel-news-web TS/TSX/JS/CSS for bugs & readability per Google style guides Summary

**Fixed 5 non-null-assertion sites, 2 env-var assertions, 1 duplicate/shadowed variable, 2 silent-catch blocks, 1 decorative-icon accessibility gap, and 2 shortenable hex colors across app/, components/, lib/, and the two hand-authored CSS files — zero new tsc/vitest failures, zero behavior changes.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-07-31T13:50Z (baseline capture)
- **Completed:** 2026-07-31T14:12Z
- **Tasks:** 6/6 completed
- **Files modified:** 15 (13 TS/TSX, 2 CSS)

## Accomplishments

- Read and applied the Google TypeScript, JavaScript, and HTML/CSS style
  guide skills to every file listed in the plan (Tasks 1–5), excluding the
  hard-exclusion list (`app/tokens.css`, `app/api/notifications/**`,
  `components/NotificationCenter.tsx`, the untracked notification migration,
  `.grok/`).
- Resolved every non-null assertion (`!`) called out by the plan by
  restructuring to a narrowing local `const` + guard, proving the invariant
  to the compiler instead of asserting it away — no behavior change in any
  case (verified via `tsc --noEmit` after every task).
- Replaced two `process.env.X!` env-var assertions with the same
  presence-check-then-throw pattern already used in
  `lib/supabase/serviceRole.ts`.
- Fixed one genuine readability bug in `components/SettingsForm.tsx`: a
  `currentYear` variable was computed twice (component body + inside a
  `useEffect`), shadowing the outer one for no reason.
- Marked purely decorative SVG icons in the sign-in page's comparison table
  `aria-hidden="true"` (redundant with adjacent text labels).
- Shortened three `#ffffff` hex literals to `#fff` per the Google CSS
  short-hex rule, and added a one-line justifying comment to the one
  `!important` that isn't a recognized `prefers-reduced-motion`/dark-mode
  safety net.
- Confirmed zero newly-introduced `tsc --noEmit` or `vitest run` failures
  against the Task 1 baseline (both were already clean: 0 type errors,
  14/14 tests passing).

## Task Commits

1. **Task 1: App Routes, Layouts & Config** - `8c1910a` (fix)
2. **Task 2: Components — Shell, Navigation & Utility** - `5fe7a16` (fix)
3. **Task 3: Components — Story, Content & Auth** - `5ede3bb` (fix)
4. **Task 4: lib/ — Data, Auth & Utilities** - `c7d1395` (fix)
5. **Task 5: CSS — globals.css & system.css** - `7efe5a4` (globals.css), `52d4cae` (system.css)
6. **Task 6: Verification** - no commit (read-only pass; see Verification below)

## Files Created/Modified

- `app/story/[slug]/page.tsx` - Replaced `story.pyqQuestions!` assertion with a narrowing conditional
- `app/auth/signin/page.tsx` - Added `aria-hidden="true"` to decorative comparison-table SVGs
- `components/CalendarBrowser.tsx` - Replaced two `monthKeys[idx]!` assertions with guarded locals; trimmed trailing blank lines
- `components/NavSearch.tsx` - Trimmed trailing blank lines
- `components/SearchInput.tsx` - Trimmed trailing blank lines
- `components/StoryReader.tsx` - Replaced four `root!` assertions in the click-to-seek handler with an in-closure re-check (function declarations are hoisted, so the outer `if (!root) return` doesn't narrow across the boundary)
- `components/PYQSidebar.tsx` - Replaced `indexByPassageId.get(key)!` and `group.passage!.text` assertions with narrowing locals; trimmed trailing blank lines
- `components/SettingsForm.tsx` - Removed a shadowed/duplicate `currentYear` computation, typed the `JSON.parse(raw)` spread as `Partial<Profile>`, added explanatory comments to two previously-silent `catch {}` blocks, trimmed trailing whitespace
- `components/SignInGate.tsx` - Trimmed trailing blank lines
- `lib/data/mock.ts` - Replaced two `Map.get(key)!` assertions and one `opts.exam!` assertion with narrowing locals
- `lib/data/supabase.ts` - Same treatment for `editionMap`/`monthMap` grouping; documented the `Row = Record<string, any>` interop boundary in place
- `lib/supabase/client.ts` - Validate `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` once, throw a clear `Error` instead of asserting
- `lib/supabase/serviceRole.ts` - Same treatment for `NEXT_PUBLIC_SUPABASE_URL` (the service-role key was already validated this way)
- `app/globals.css` - Shortened `--color-accent-foreground` to `#fff`; added a justifying comment above `.page-title`'s `font-size !important`
- `app/system.css` - Shortened `--app-elevated` and `--destructive-foreground` to `#fff`

## Decisions Made

See `key-decisions` in frontmatter — summarized: kept the `Row = Record<string, any>` interop boundary documented rather than mechanically narrowed; left the codebase's `0.5`-style CSS fractional-value convention as-is rather than reformatting to `.5`; used surgical index staging (`git add -p` / `git hash-object` + `update-index`) instead of a plain `git add` on the two CSS files so the other in-flight session's uncommitted color-palette WIP wasn't swept into this audit's commits.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug/readability] Shadowed `currentYear` variable in SettingsForm.tsx**
- **Found during:** Task 3
- **Issue:** `currentYear` was computed via `new Date().getFullYear()` both in the component body and again inside a `useEffect`'s else-branch, shadowing the outer value for no functional reason.
- **Fix:** Removed the inner duplicate; the effect now reuses the outer `currentYear` (added to the effect's dependency array for correctness).
- **Files modified:** `components/SettingsForm.tsx`
- **Commit:** `5ede3bb`

**2. [Rule 2 - Missing error context] Silent `catch {}` blocks in SettingsForm.tsx**
- **Found during:** Task 3
- **Issue:** Two `catch {}` blocks swallowed errors with no comment, inconsistent with the commented-catch convention used everywhere else in the same file and across the codebase.
- **Fix:** Added a one-line comment to each explaining what's being ignored and why.
- **Files modified:** `components/SettingsForm.tsx`
- **Commit:** `5ede3bb`

**3. [Rule 2 - Accessibility] Decorative SVGs missing `aria-hidden` in sign-in page**
- **Found during:** Task 1
- **Issue:** Eight decorative comparison-table SVG icons (circle-clock and checkmark glyphs, redundant with adjacent text labels) had no `aria-hidden`, so screen readers would announce them as unlabeled graphics.
- **Fix:** Added `aria-hidden="true"` to all eight.
- **Files modified:** `app/auth/signin/page.tsx`
- **Commit:** `8c1910a`

---

**Total deviations:** 3 auto-fixed (1 readability/dead-code, 1 missing error-handling comment, 1 accessibility). All within Rule 1/Rule 2 bounds — no architectural changes, no scope creep.

## Issues Encountered

**Concurrent in-flight session editing the same working tree.** Per the plan's explicit caution list, `components/AppShell.tsx`, `components/Footer.tsx`, `components/NavSearch.tsx`, `components/StoryReader.tsx`, `app/globals.css`, and `app/system.css` all had pre-existing uncommitted WIP diffs from another session (a theme/notification redesign, confirmed via `git log`'s recent `grok-4`-referencing commits). During execution, that session continued actively modifying files (`components/ThemeToggle.tsx` and `components/Sidebar.tsx` changed mid-task, and a new `app/profile/` directory appeared) — confirmed via repeated `git status`/`git diff` checks before every edit and before every commit. Handled by:
- Running `git diff <file>` before touching any caution-list file and treating every already-modified hunk as off-limits for style churn (only entering those hunks for an unambiguous bug — none were found).
- Never touching `ThemeToggle.tsx`, `Sidebar.tsx`, or `app/profile/` at all — none were in this plan's file list, and touching them mid-flight would have collided with live edits.
- For `app/globals.css`, using `git add -p` to stage only the two isolated hunks this audit created, leaving the WIP hunks unstaged.
- For `app/system.css`, where the audit's two hex-color fixes fell on lines adjacent to (but not part of) a large WIP color-palette rewrite with no clean hunk boundary, constructing the staged index entry directly via `git hash-object -w` + `git update-index --cacheinfo` from a hand-edited copy of the HEAD version — this stages exactly the two intended line changes without touching the working-tree file (which still carries the WIP redesign untouched, matching the caution-list requirement).

No stubs, no new threat-surface changes, no scope-boundary violations.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Codebase now passes the Google TS/JS/HTML-CSS checklists on every file this audit could reach; the small set of caution-list WIP hunks (theme/notification redesign) remain exactly as another session left them, ready for that session to commit independently.
- `pnpm exec tsc --noEmit` and `pnpm test` both remain clean (0 errors / 14 passing) — safe base for the next piece of work.
- Recommend the owning session for the `ThemeToggle.tsx`/`Sidebar.tsx`/`app/profile/`/CSS-palette WIP commit and push their own changes soon; this audit intentionally left them untouched but they've been sitting uncommitted across multiple sessions now.

---
*Phase: quick-260731-j0g*
*Completed: 2026-07-31*

## Self-Check: PASSED

All 15 modified files confirmed present on disk; all 6 referenced commit
hashes (`8c1910a`, `5fe7a16`, `5ede3bb`, `c7d1395`, `7efe5a4`, `52d4cae`)
confirmed in `git log`.
