---
quick_id: 260723-nwa
status: complete
---

# Quick Task 260723-nwa Summary

**Description:** Re-skin the sidebar/app-shell navigation to remove AI-generated-dashboard visual tells while preserving its IA and structure

**Completed:** 2026-07-23

## Decision checkpoint

User was asked whether to replace the collapsible sidebar with a conventional
top nav bar, or keep the sidebar and just fix its visual execution. Chose:
**keep the sidebar, re-skin it.** IA, routes, labels, and descriptions in
`lib/nav.ts` are unchanged.

## What changed

**`components/Sidebar.tsx`**
- Removed the boxed "Live edition" widget (bordered card with a
  `font-mono uppercase tracking` eyebrow + bold stat line + secondary line) —
  a dashboard-stat-card pattern out of place in a reading site's nav. That
  eyebrow treatment was repeated 4 times down one 264px column (once for the
  widget, three times for section group labels), the strongest AI-tell in
  the file.
- Replaced it with a plain one-line dateline under the "Gavel News" wordmark
  in the header (e.g. "Day 42 · Nov 12 · 6 stories") — no border, no box, no
  eyebrow label. The `font-mono uppercase tracking` eyebrow convention now
  appears only once in the file, for the three section group labels
  (Read / Your library / About), which is a legitimate single-use wayfinding
  pattern rather than a repeated tell.

**`components/AppShell.tsx`**
- Flattened the mobile "quick actions" control: removed the outer
  `rounded-full border ... p-0.5 shadow-sm` pill that wrapped the (already
  circular) search trigger and sign-in chip. Over-nested pill-in-pill chrome
  for a 2-control row; now a plain flex row with normal gap spacing.
- Widened the mobile sign-in chip's label from "Sign" to "Sign in" now that
  it isn't squeezed inside a wrapper pill.

**Scope note:** the plan originally flagged the `lg:absolute
left-1/2 -translate-x-1/2 -translate-y-1/2` brand-centering technique in
`AppShell.tsx` as a tell to replace with CSS Grid. On review this is a
standard, working centering technique (not in the design skill's AI-tell
catalog, not demonstrably broken) — rewriting it would have been pure
regression risk for a purely cosmetic-purity gain. Dropped from scope,
left untouched.

**Deliberately unchanged:** `TopNav.tsx` remains dead/unused code (a second,
never-wired nav paradigm) — out of scope for this task; `lib/nav.ts` IA,
`ThemeToggle`, account/sign-out footer block, nav item icon-box treatment,
brand colors/tokens.

## Verification

- `pnpm exec tsc --noEmit` → no errors.
- **Not visually verified in a browser** — no browser/screenshot tool was
  available in this session. The dev server is running at localhost:3000;
  worth checking the sidebar (open/collapsed/mobile drawer) and the header
  (mobile/tablet/desktop, light/dark) before considering this fully done.

## Files touched

- `components/Sidebar.tsx`
- `components/AppShell.tsx`
