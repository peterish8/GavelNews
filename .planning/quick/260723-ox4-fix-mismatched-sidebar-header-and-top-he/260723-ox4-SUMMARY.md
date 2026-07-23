---
quick_id: 260723-ox4
status: complete
---

# Quick Task 260723-ox4 Summary

**Description:** Fix mismatched sidebar-header and top-header heights so their border lines align

**Completed:** 2026-07-23

## What changed

- `components/Sidebar.tsx`: header row changed from content-driven height
  (`py-2.5`, no fixed height) to `h-16` fixed height, keeping `items-center`
  to vertically center the 1- or 2-line brand/dateline block.
- `components/AppShell.tsx`: header row changed from content-driven height
  (`py-1.5`, no fixed height) to the same `h-16` fixed height.

Both header bars now share one explicit height at every breakpoint, so
their `border-b` lines align into a single continuous top bar instead of
sitting at two different heights.

## Verification

- `pnpm exec tsc --noEmit` → no errors.
- Hit `http://localhost:3000/` through the running dev server and confirmed
  both header elements render with the `h-16` class in the actual HTML
  output (not just in source).
- Not visually verified in a browser (no screenshot tool available this
  session) — worth a quick look to confirm the border lines now align.

## Files touched

- `components/Sidebar.tsx`
- `components/AppShell.tsx`
