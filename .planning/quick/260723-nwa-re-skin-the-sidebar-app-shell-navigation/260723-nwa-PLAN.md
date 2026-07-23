---
quick_id: 260723-nwa
status: planned
---

# Quick Task 260723-nwa: Re-skin sidebar/app-shell nav to remove AI-slop tells

**Created:** 2026-07-23

## Context

User feedback: "the nav bar looks like ai slop, make a proper nav bar frontend ui ux."
The live nav is `AppShell.tsx` (top header strip) + `Sidebar.tsx` (collapsible drawer,
sections: Read / Your library / About, from `lib/nav.ts`). `TopNav.tsx` is dead,
unused code (a second, never-wired nav paradigm) and is left untouched by this task.

Asked the user whether to replace the sidebar with a conventional top nav bar, or
keep the sidebar/app-shell structure and just fix the visual execution. User chose:
**keep the sidebar, re-skin it** — preserve IA, routes, labels, descriptions; fix
only the visual details that read as generic AI-dashboard output.

## Audit findings (concrete tells to fix)

1. **Repeated identical mono-uppercase eyebrow treatment.** The exact class
   `font-mono text-[9px] font-semibold uppercase tracking-[0.14em]` (or equivalent)
   appears 4 times down one 264px column: once as the "Live edition" widget eyebrow,
   three times as section group labels (Read / Your library / About). That density
   of the same AI-signature micro-label is the strongest tell in the file.
   Fix: drop the eyebrow+boxed-card treatment from the edition widget entirely;
   replace with a plain, confident one-line dateline (no border, no box, no eyebrow).
   Keep the mono-caps convention only for the 3 section group labels (a legitimate,
   single-use wayfinding pattern).

2. **Boxed "Live edition" widget mimics a dashboard stat-card.** Bordered box with
   eyebrow label + bold stat line + secondary line is a SaaS-dashboard widget
   pattern, out of place in an editorial reading site's persistent nav.
   Fix: collapse to a single unboxed line, e.g. "Day 42 · Nov 12 · 6 stories",
   in the sidebar header area under the wordmark, not a separate card section.

3. ~~Absolute-position centering in `AppShell.tsx` header~~ — reconsidered during
   execution: `position:absolute; left:50%; translate:-50%` is a standard, working
   centering technique, not an AI-slop tell, and isn't demonstrably broken. Rewriting
   it would be pure regression risk for no visual benefit. Dropped from scope.

4. **Nested pill-in-pill mobile "quick actions" control** in `AppShell.tsx`
   (a `rounded-full` outer container wrapping a `rounded-full` search trigger and a
   `rounded-full` sign-in chip). Over-decorated for a 2-control mobile row.
   Fix: flatten to a single row without the outer pill wrapper; keep search +
   sign-in as adjacent controls with a simple divider, not nested pills.

## Task

1. Edit `components/Sidebar.tsx`:
   - Remove the boxed "Live edition" card (the `<div className="shrink-0
     border-b border-border-app px-3 py-2.5">...` block containing the eyebrow +
     stat lines).
   - Add a plain one-line dateline in the header area (next to/under the wordmark)
     showing edition index + date + story count, no border/box/eyebrow — normal
     text weight, `text-ink-3`/`text-ink-2` sizing consistent with the rest of the
     header.
   - Leave `SECTION_LABELS` mono-caps treatment as the only remaining eyebrow-style
     element in the file.
   - Leave nav item structure (icon box + label + description), `lib/nav.ts`,
     routes, and the account/sign-in footer block unchanged.
   - Files: `components/Sidebar.tsx`
   - Verify: render matches — edition info still visible, just restyled; no
     leftover unused props/vars from the removed card.
   - Done: no boxed "Live edition" widget remains; exactly one recurring
     mono-uppercase-eyebrow pattern left in the file (the section labels).

2. Edit `components/AppShell.tsx`:
   - Replace the `lg:absolute ... -translate-x-1/2 -translate-y-1/2` brand
     centering with a CSS grid header layout (3 columns: left controls / centered
     brand / right controls) so centering holds without absolute positioning.
   - Flatten the mobile "Quick actions" control: remove the outer `rounded-full
     ... p-0.5` wrapper pill; lay out `NavSearch` (compact) and the sign-in chip
     as a simple flex row with a hairline divider, matching the desktop treatment's
     restraint.
   - Files: `components/AppShell.tsx`
   - Verify: header still renders as a single line at each breakpoint (mobile,
     tablet, desktop); brand stays visually centered on `lg:`+ without relying on
     `absolute`/`translate`.
   - Done: no `lg:absolute`/`-translate-x-1/2`/`-translate-y-1/2` classes remain
     on the brand link; mobile quick-actions no longer double-nests pill shapes.

3. Typecheck + visual check:
   - `pnpm exec tsc --noEmit`
   - Load the running dev server (localhost:3000) and check the sidebar (open +
     collapsed + mobile drawer) and the top header at mobile/tablet/desktop widths
     in both light and dark mode.
   - Verify: no console errors, nav still fully functional (links, collapse
     toggle, mobile drawer open/close, sign-in/out affordances all present).

## Must-haves

- truths: IA/routes/labels/descriptions unchanged; the collapsible-sidebar
  structure is preserved; the specific tells above (repeated eyebrow, boxed
  edition widget, absolute-centering hack, nested mobile pill) are gone.
- artifacts: components/Sidebar.tsx, components/AppShell.tsx
- key_links: lib/nav.ts (unchanged), app/tokens.css (unchanged, colors reused
  as-is), components/ThemeToggle.tsx (unchanged), lib/auth-actions.ts (unchanged)
