---
quick_id: 260722-wcu
status: complete
date: 2026-07-22
---

# Quick Task 260722-wcu: Merge AppShell top header utility row and masthead row into one

## Result

`components/AppShell.tsx`'s content-area header previously stacked two rows: a thin `h-9` utility bar (mobile nav toggle, search, sign-in) with its own bottom border, above a separate centered masthead row ("Gavel News" nameplate + "Your Daily Legal Brief" subtitle, `py-2.5`). Collapsed into a single `h-12` flex row: mobile toggle on the left, the nameplate centered via `flex-1` (name + compact "· Daily Legal Brief" inline label, no longer stacked), and search + sign-in on the right. Removed one full row's worth of height plus its border/padding entirely.

## Verification

- `npx tsc --noEmit` — clean, no errors.
- Visual check via Chrome DevTools MCP screenshot on the user's own running dev server (`localhost:3000`, picked up the change live via HMR) — confirmed single-row header, search icon and Sign in inline with "Gavel News", noticeably less vertical space than before.

## Commit

- `0597d8c` — fix: merge AppShell header utility row and masthead into one row

## Notes

Applied directly (no worktree executor) given the single-file, contained JSX restructuring — verified with both a typecheck and a live screenshot before committing. Builds on the earlier FeedView hero-spacing fix (260722-w8i) — together they remove the two biggest sources of "dead space at the top" the user flagged.
