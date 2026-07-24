---
phase: quick-260724-daz
plan: 01
subsystem: ui
tags: [tailwind, css-grid, sign-in, above-the-fold, layout]

# Dependency graph
requires: []
provides:
  - Two-column (lg:grid) sign-in page layout with the Google sign-in card visible above the fold on desktop
  - Reordered DOM (sign-in card before AuthBenefits) so mobile scroll order reaches the CTA first
affects: [signin-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fold-critical CTA vs. supporting content split into sibling grid columns with an actual JSX source-order swap (not CSS order-*), satisfying both mobile stacking order and desktop column placement with one change"
    - "lg:sticky lg:top-16 on a left-column card to keep a CTA in view while a taller right column scrolls"

key-files:
  created: []
  modified:
    - app/auth/signin/page.tsx

key-decisions:
  - "Worked from this worktree's actual file content (based on commit a1b12c9), which does not include a dev-mode-bypass block (signInDevMode/DevIcon) that exists in a separate, uncommitted local working copy outside the worktree. The plan's prose assumed that dev-bypass block exists; since it isn't part of this worktree's tracked history, that portion of the plan (bump dev-bypass button styling, leave dev-bypass block unchanged) is not applicable here — nothing to change or break."

requirements-completed: []

# Metrics
duration: ~15min
completed: 2026-07-24
---

# Quick Task 260724-daz: Redesign sign-in page so Google sign-in CTA is visible above the fold on desktop Summary

**Restructured `/auth/signin` into a two-column `lg:grid` layout (sticky sign-in card left, `AuthBenefits` comparison right) with a real JSX source-order swap so the Google CTA is both the first element in DOM order and visible without scrolling on desktop.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T04:05:00Z (approx)
- **Completed:** 2026-07-24T04:14:27Z
- **Tasks:** 2 (1 code task, 1 verification task)
- **Files modified:** 1

## Accomplishments

- Page container widened only at `lg`: `mx-auto max-w-3xl px-5 py-10 md:py-14` → `mx-auto max-w-3xl lg:max-w-6xl px-5 py-10 md:py-14`.
- Sign-in card and `<AuthBenefits>` wrapped in `lg:grid lg:grid-cols-[26rem_1fr] lg:items-start lg:gap-12`, with the sign-in card moved to be the **first JSX child** (an actual source-order swap, not a CSS `order-*` trick) — this fixes both the desktop left-column placement and the mobile/tablet stacking order (card reads before the long benefits comparison) with a single change.
- Sign-in card: `surface-hero mx-auto max-w-md p-6 sm:p-8` → `surface-hero mx-auto max-w-md p-6 sm:p-8 lg:sticky lg:top-16 lg:mx-0 lg:max-w-none lg:p-9`, keeping the CTA pinned in view while the visitor scrolls the (potentially long) right-hand benefits column.
- `<AuthBenefits>` wrapped in `<div className="mt-8 lg:mt-0">` so it keeps its own top gap on mobile/tablet but sits flush at the top of the right column on `lg`+.
- Google button polish: larger padding (`px-4 py-3` → `px-5 py-3.5`), larger text (`text-sm` → `text-[15px]`), `rounded-sm` → `rounded-md`, added `shadow-sm` plus `hover:-translate-y-0.5 hover:shadow-md` lift/elevation on hover (uses the existing `btn-press` transition, no new CSS). Did not switch to a solid `bg-brand` fill, per the plan, to avoid clashing with the multicolor Google "G" icon.
- `<GoogleIcon />` bumped from 18×18 to 20×20 to match the larger button.
- Card label ("Ready? Sign in takes a second" / "Sign in to open X") bumped from `mb-4 text-sm` to `mb-5 text-[15px]`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure into two-column layout + polish sign-in card** - `cf1ddd5` (feat)
2. **Task 2: Viewport + visual verification** - no code change, no commit (verification-only task; see below)

**Plan metadata:** (docs commit made separately by orchestrator)

## Files Created/Modified
- `app/auth/signin/page.tsx` — two-column `lg:grid` restructure, JSX reorder (sign-in card before `AuthBenefits`), sticky card, Google button visual polish, icon size bump. Only file touched, matching the plan's scope boundary.

## Verification Performed

**Static/build verification (Task 1):**
- `tsc --noEmit` (run via `node <main-repo-node_modules>/typescript/bin/tsc --noEmit -p tsconfig.json` from inside the worktree, since the worktree has no local `node_modules` and `pnpm exec` failed with `tsc not found`): **passed, zero errors.**
- `grep -n "surface-hero\|AuthBenefits" app/auth/signin/page.tsx` confirms the JSX reorder landed: `surface-hero` (sign-in card) is on line 75, `<AuthBenefits` is on line 111 — the sign-in card is earlier in source order, as required.

**Viewport/visual verification (Task 2) — could not be performed live in this environment:**
This execution environment (a GSD-executor sub-agent with Read/Write/Edit/Bash/Grep/Glob tools only) has no `/browse` skill or browser-automation MCP tool available, and no dev server was started, so live visual confirmation at 1440x900/1280x800/~390px and a dark-mode spot-check were **not performed**. Per the plan's fallback instruction, static layout reasoning was done instead:

- **Desktop (1440x900, 1280x800), both ≥ the `lg` (1024px) breakpoint:**
  Estimated cumulative height to the bottom of the "Continue with Google" button: header block (`py-10 md:py-14` top padding + label + `h1` + description paragraph + `mb-8`) ≈ 260–380px in the worst case (long `?next=` "Unlock X" copy wrapping to extra lines), plus the sign-in card's own padding-to-button offset (`lg:p-9` top padding + label + `mb-5` ≈ 76px) plus the button's own height (`py-3.5` + text ≈ 48–52px). Total ≈ 384–510px — well under both 800px and 900px viewport heights (with typical browser-chrome allowance still leaving 650–700px+ of usable viewport). No known reason the button would require scrolling at either target size, for either the default or `?next=` copy variant, but this has not been visually confirmed with a real browser.
- **Mobile (~390px, below `lg`):** all `lg:*` grid/sticky classes are inactive, so the wrapper `<div className="lg:grid ...">` renders as a plain block and its children stack in DOM order — sign-in card (`surface-hero`) first, then the `mt-8` benefits wrapper. This satisfies "sign-in card reached before the benefits comparison" by construction (DOM order), independent of viewport height.
- **Dark mode:** No new colors were introduced — the only classes added/changed (`shadow-sm`, `hover:-translate-y-0.5`, `hover:shadow-md`, sizing/spacing utilities, `lg:sticky lg:top-16`, `lg:grid-cols-[26rem_1fr]`) are either plain Tailwind utilities with no light/dark-specific meaning or already-existing tokens (`surface-hero`, `border-border-app`, `bg-elevated`, `text-ink`, `brand-soft`, `btn-press`) that are already dark-mode-aware via `:root.dark` rules present in `app/globals.css` (confirmed lines 279, 338, 398, 403, 410, 493 etc. define dark-mode variants for these same tokens). No regression expected, but not visually confirmed.

**Recommendation:** the orchestrator or user should run `pnpm dev` and visually confirm at 1440x900, 1280x800, ~390px, and one dark-mode desktop check before considering this fully verified — the static reasoning above is a best-effort substitute, not a replacement for the plan's intended live check.

## Decisions Made
- This worktree's `app/auth/signin/page.tsx` (based on commit `a1b12c9`) does not contain a dev-mode-bypass form/button (`signInDevMode`, `DevIcon`) or a `NODE_ENV !== "production"` block — only `signInWithGoogle`. A separate, uncommitted local working copy outside this worktree does have that block, but per the sandbox rules for this execution, only the worktree's tracked file state is authoritative. The plan's instructions to "leave the dev-mode-only bypass block ... structurally unchanged" and Task 2's "dev-bypass button (non-prod only) ... still clickable" check are therefore not applicable to the code actually being executed — there was nothing to preserve or break. All other plan instructions (grid restructure, reorder, sticky card, button polish, icon size, label size) were followed exactly as written, mapped onto the file as it actually exists in this worktree.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] `pnpm exec tsc` failed (`tsc not found`) because the worktree has no local `node_modules`**
- **Found during:** Task 1 verification step
- **Issue:** `pnpm exec tsc --noEmit` errored with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL — Command "tsc" not found` because this worktree checkout has no `node_modules` installed (worktrees don't automatically get a sibling `node_modules`).
- **Fix:** Ran the main repository's already-installed `typescript` binary directly against the worktree's own `tsconfig.json`: `node "<main-repo>\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`, executed from inside the worktree directory. This uses the worktree's own source files and `tsconfig.json` for type-checking; only the `tsc` binary itself was borrowed from the main checkout (no package install, no dependency change).
- **Files modified:** None (verification-only workaround).
- **Verification:** Command completed with zero output / exit 0 — no type errors.
- **Committed in:** N/A (no code change).

---

**Total deviations:** 1 auto-fixed (1 blocking-issue workaround), plus 1 documented scope-mapping decision (dev-bypass block not present in this worktree's code).
**Impact on plan:** No scope creep. The `tsc` workaround only affects how verification was run, not what was verified. The dev-bypass-block note only clarifies that a plan instruction referencing code that doesn't exist in this worktree's tracked history was correctly treated as inapplicable rather than fabricated.

## Issues Encountered
- No `/browse` skill or browser-automation tool was available in this execution context, so Task 2's live viewport/visual verification (1440x900, 1280x800, ~390px, dark-mode spot-check, click-through of all CTAs) could not be performed. Static layout reasoning was substituted and is documented above; live confirmation is recommended as a follow-up.

## User Setup Required
None — no external service configuration required. If the orchestrator/user wants to run the live viewport check, no setup beyond `pnpm install` (if not already run in this worktree) and `pnpm dev` is needed.

## Next Phase Readiness
- Code change is type-safe and matches every explicit instruction in the plan for the two-column restructure, JSX reorder, sticky card, and Google button polish.
- Outstanding: live visual/viewport confirmation at 1440x900, 1280x800, ~390px, and dark mode — recommended before closing out this quick task as fully done.

## Post-Executor Reconciliation (orchestrator, not the executor)

The dev-mode-bypass block the executor correctly identified as absent from its worktree
turned out to be real, pre-existing **uncommitted** work sitting in the main working tree
(never committed anywhere, `git log` confirms `a1b12c9` doesn't include it) — along with
several other unrelated uncommitted files (font-system CSS work, `.gitignore`, `AGENTS.md`,
`lib/auth-actions.ts`, `app/story/[slug]/opengraph-image.tsx`) from what appears to be a
separate, still-in-progress task.

Before merging the executor's worktree branch, the orchestrator stashed all of that
pre-existing uncommitted work (`git stash push -u`), merged the worktree branch cleanly,
then popped the stash back. Only `app/auth/signin/page.tsx` conflicted (both sides touched
the sign-in-card block). Resolved by hand: kept the two-column layout structure from this
plan, with the dev-bypass form/button reinserted inside the same `surface-hero` card,
after the Google button's helper paragraph — its original position. `npx tsc --noEmit`
passed clean on the reconciled file. All other stashed files were verified byte-identical
to their pre-stash state and left uncommitted, untouched, exactly as found — not part of
this task's scope. Commit `1aad1d0` carries the reconciled file (superseding `cf1ddd5`
after the merge).

---
*Phase: quick-260724-daz*
*Completed: 2026-07-24*

## Self-Check: PASSED

- FOUND: app/auth/signin/page.tsx
- FOUND: .planning/quick/260724-daz-redesign-sign-in-page-so-google-sign-in-/260724-daz-SUMMARY.md
- FOUND: cf1ddd5 (Task 1 commit)
