---
phase: quick-260723-vk1
plan: 01
subsystem: ui
tags: [react-markdown, remark-gfm, react, next.js, modal, accessibility]

# Dependency graph
requires:
  - phase: quick-260723-oan
    provides: components/Markdown.tsx (react-markdown + remark-gfm wrapper, inline/block modes)
provides:
  - PYQSidebar question rows and modal render markdown-formatted text instead of raw strings
  - Full-viewport PYQQuestionModal replacing the cramped in-sidebar accordion
affects: [pyq-sidebar, story-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lift open/close selection state to the top-level list component (PYQSidebar) when a modal needs data (shared passage) only the parent has, rather than keeping it per-row"
    - "Modal body-scroll-lock + Escape-key pattern via useEffect with cleanup restoring document.body.style.overflow"

key-files:
  created: []
  modified:
    - components/PYQSidebar.tsx

key-decisions:
  - "Moved the new activeQuestionId useState above PYQSidebar's early `return null` guard to avoid a Rules-of-Hooks violation (plan text said 'after computing groups', which is after the early return) — functionally identical, but hooks must run unconditionally on every render."

patterns-established:
  - "Modal-via-lifted-state: row components report selection upward (onSelect(id)) instead of owning local open/close state, so a parent with broader data access can render the detail view"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-07-23
---

# Quick Task 260723-vk1: Fix PYQSidebar markdown rendering + inline accordion Summary

**PYQSidebar now renders CLAT question/option/explanation/passage markdown via the existing `Markdown` component and opens question detail in a full-viewport modal instead of a cramped inline accordion.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-23T22:42:00+05:30 (approx, worktree setup)
- **Completed:** 2026-07-23T22:50:42+05:30
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Question rows now open a full-screen modal (backdrop + centered panel) showing the shared passage (if grouped), question text, all four options with the correct one marked, and the explanation together — instead of a per-row inline accordion squeezed into a 320px sidebar column.
- Modal supports Escape-key, backdrop-click, and close-button dismissal, with page scroll locked while open and restored on close.
- Markdown syntax (`**1.**`, `**2.**`, etc.) in question text, options, explanation, and passage text now renders as actual bold/formatted text via the existing `Markdown` component, in both the collapsed group passage preview and the modal.
- The collapsed "Read the passage" toggle in `PYQGroupCard` was left structurally untouched (still its own local `passageOpen` state), only its text interpolation was wrapped in `Markdown`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace inline accordion with a full-screen question modal** - `f1fc2e3` (feat)
2. **Task 2: Render markdown in all free-text PYQ fields** - `bd266d9` (feat)

**Plan metadata:** (docs commit made separately by orchestrator)

## Files Created/Modified
- `components/PYQSidebar.tsx` - Lifted question-selection state to `PYQSidebar` (`activeQuestionId`), added `PYQQuestionModal` (full-viewport dialog with Escape/backdrop/close-button dismissal and scroll-lock), removed `PYQQuestionRow`'s local accordion `useState`, added `CloseIcon`, wrapped question text/options/explanation/passage text in `Markdown`/`Markdown inline`.

## Decisions Made
- Moved the `activeQuestionId` `useState` call in `PYQSidebar` to before the `if (!questions || questions.length === 0) return null;` early return, rather than "after computing groups" as the plan's prose described. The plan's own interface spec placed groups after the early return, so a literal reading would have called `useState` conditionally — a React Rules-of-Hooks violation risk if `questions.length` ever changed between renders of the same mounted instance. This is a strict improvement with identical runtime behavior for the documented case (component either always returns null or always renders); no scope change.

## Deviations from Plan

None beyond the Rules-of-Hooks placement fix noted above (which falls under Rule 1 - auto-fix bug, since a literal implementation could crash React with "Rendered more hooks than during the previous render").

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved `useState` call above early return to avoid Rules-of-Hooks violation**
- **Found during:** Task 1 (Replace inline accordion with a full-screen question modal)
- **Issue:** Plan instructed adding `useState` "after computing groups," which in `PYQSidebar` is after an early `if (!questions...) return null;` guard — calling a hook conditionally after an early return violates React's Rules of Hooks and risks a runtime crash if the component re-renders with a different `questions.length`.
- **Fix:** Moved `const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);` to the top of `PYQSidebar`, before the early return, so the hook always runs.
- **Files modified:** components/PYQSidebar.tsx
- **Verification:** `npx tsc --noEmit` passes; behavior for the documented case (component always returns null vs. always renders based on `questions` prop) is unchanged.
- **Committed in:** f1fc2e3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug-prevention)
**Impact on plan:** Necessary correctness fix, no scope creep — same outcome the plan intended, implemented in a way that doesn't violate React's hook-ordering invariant.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PYQSidebar's markdown rendering and modal detail view are complete and type-check cleanly.
- Manual visual verification (story page with linked PYQ questions, signed in) recommended per the plan's `<verification>` section: confirm bold markdown renders, modal opens/closes via all three methods, page doesn't scroll behind the modal, and the collapsed passage toggle still works independently.

---
*Phase: quick-260723-vk1*
*Completed: 2026-07-23*

## Self-Check: PASSED

- FOUND: components/PYQSidebar.tsx
- FOUND: .planning/quick/260723-vk1-fix-pyqsidebar-render-markdown-in-questi/260723-vk1-SUMMARY.md
- FOUND: f1fc2e3 (Task 1 commit)
- FOUND: bd266d9 (Task 2 commit)
