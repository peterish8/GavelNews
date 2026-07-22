---
quick_id: 260722-wf7
status: complete
date: 2026-07-22
---

# Quick Task 260722-wf7: Center AppShell nameplate independent of search expand

## Result

Follow-up fix to 260722-wcu's single-row header. The nameplate was centered via `flex-1` between the left icon group and right utility group, so when `NavSearch` expands from a `size-9` button into a wider input form (`w-28`→`w-40`→`w-48`), the right group grew and the flex-1 box shrank, visibly shifting "Gavel News" left. Fixed by taking the nameplate out of flex flow entirely: `header` now has `relative`, and the nameplate `Link` is `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`, centered against the full header width regardless of sibling widths. Also restored the two-line stacked layout ("Gavel News" / "Daily Legal Brief", previously inline with "·") and bumped the nameplate font from `text-base sm:text-lg` to `text-lg sm:text-xl` per user ask.

## Verification

- `npx tsc --noEmit` — clean.
- Chrome DevTools MCP: screenshot at rest (two-line centered nameplate, bigger font) and again with search clicked open (input form expanded) — nameplate position identical in both, confirming the fix.

## Commit

- `ff952d1` — fix: absolutely-center AppShell nameplate, restore two-line layout

## Notes

Direct fix, no worktree executor — single-file, well-understood CSS positioning change, verified live against the user's running dev server via HMR.
