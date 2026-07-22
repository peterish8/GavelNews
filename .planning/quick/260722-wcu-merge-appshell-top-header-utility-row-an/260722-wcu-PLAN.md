---
phase: quick-260722-wcu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [components/AppShell.tsx]
autonomous: true
requirements: []
must_haves:
  truths:
    - "AppShell's content-area header is a single row instead of two stacked rows (utility row + masthead row)"
    - "Search icon, sign-in link, and mobile nav toggle live inside the same row as the 'Gavel News' nameplate, not in a separate bar above it"
    - "Total header height is visibly reduced (removes one full row's worth of height + its own padding/border)"
    - "No functional regression: mobile nav toggle, search, and sign-in link all still work exactly as before"
  artifacts:
    - path: "components/AppShell.tsx"
      provides: "Single-row content-area header with nameplate + search + sign-in + mobile toggle combined"
---

<objective>
Collapse AppShell.tsx's two-row content-area header (a thin `h-9` utility row containing mobile-nav-toggle/search/sign-in, stacked above a separate centered `py-2.5` masthead row with "Gavel News" / "Your Daily Legal Brief") into a single row. User feedback: there's still dead vertical space at the top of the page, and the search icon / sign-in should live "inside" the Gavel News header itself rather than in a separate bar.

Purpose: components/AppShell.tsx lines 92-144 currently render:
1. A `border-b` utility row (`h-9`): mobile toggle (left), search + sign-in (right, via `ml-auto`).
2. A separate `Link` masthead row below it (centered "Gavel News" nameplate + subtitle, `py-2.5`).
Two rows means two lots of padding/borders stacking, which is the "space in top" the user is pointing at (this is on top of the already-fixed FeedView hero spacing from the previous quick task).

Output: One flex row: mobile toggle (left, mobile-only), centered "Gavel News" nameplate+subtitle (flex-1, so it stays visually centered), search + sign-in (right). No second row, no extra border/padding between them.
</objective>

<context>
@components/AppShell.tsx (lines 91-144 are the exact scope)
@components/TopNav.tsx (reference: this file already puts logo/nameplate + search + sign-in in ONE row for the non-sidebar layout — same principle, different visual density; do not copy TopNav's markup wholesale, AppShell's sidebar-based layout has different needs, e.g. no separate "Logo" icon component call, no primary nav links row since those live in Sidebar.tsx)
</context>

<tasks>

<task type="auto">
  <name>Task: Merge AppShell's utility row and masthead row into a single header row</name>
  <files>components/AppShell.tsx</files>
  <action>
Replace the current two-block `<header>` content (lines 92-144: the `h-9` utility row div followed by the separate masthead `Link`) with a single flex row containing all three groups. Concretely:

1. Keep the outer `<header className="flex shrink-0 flex-col border-b border-border-app bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-xl">` wrapper, but change its child from two stacked blocks into ONE row div, e.g.:
   `<div className="flex h-12 shrink-0 items-center gap-2 px-3 sm:px-4">`　(pick a height like h-12/h-14 that comfortably fits the nameplate text at a slightly reduced size — no separate row needed, so this single row can be a bit taller than the old h-9 without net height increase, since the second row + its border/padding is fully eliminated).

2. Left side (mobile-only): keep the existing mobile "Open navigation" button (`PanelLeftIcon`) and the desktop "showOutsideToggle" button exactly as they are now — same conditionals, same markup, just moved into this one row instead of the old utility row.

3. Center: the "Gavel News" nameplate — reduce from a stacked (name + subtitle) block at text-2xl/text-3xl to something that fits inline in a single compact row, e.g. name at `text-base font-serif font-bold sm:text-lg` with the "Your Daily Legal Brief" subtitle either dropped (redundant with Sidebar's own "CLAT brief" label) or kept as a small inline `hidden sm:inline` span next to the name rather than stacked beneath it. Wrap in `<Link href="/" className="link-press flex flex-1 items-center justify-center gap-2 min-w-0">` so it centers within the remaining space between the left icons and right utilities (flex-1 makes it self-center regardless of how wide the left/right groups are).

4. Right side: keep `<NavSearch />` and the sign-in `<Link>` exactly as they are now (same conditional on `!signedIn`, same classes) — just remove the `ml-auto` (no longer needed since the row's own flex layout with the centered flex-1 nameplate naturally pushes this group to the end; add `ml-auto` back only if the centered nameplate ends up not truly centering — test and adjust).

5. Delete the old separate masthead `<Link>` block entirely (former lines 132-143) — its content is now merged into step 3 above. Do not leave a duplicate "Gavel News" render.

Do not touch Sidebar.tsx, Footer.tsx, or any other component. Do not change the `showOutsideToggle` / `collapsed` state logic — only the JSX layout of what's currently two rows into one.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>components/AppShell.tsx renders one single header row (no second stacked masthead row below it); mobile nav toggle, search, and sign-in all present and functionally unchanged; "Gavel News" nameplate still visible, now inline within that one row; `npx tsc --noEmit` passes with no errors; visually the header takes noticeably less vertical space than before.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
None — pure client-rendered layout/JSX change to an existing component, no new data flow or dependency.

## STRIDE Threat Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick260722-02 | N/A | components/AppShell.tsx | accept | Pure layout/JSX restructuring, no logic/data/auth changes — no attack surface introduced |
</threat_model>

<verification>
1. `npx tsc --noEmit` passes.
2. Visual check in dev/browser: header is a single compact row; search icon and sign-in sit in the same row as "Gavel News"; mobile nav toggle still opens the drawer; total header height is visibly reduced vs. before.
</verification>

<success_criteria>
- Single-row header in AppShell.tsx replacing the previous two-row (utility bar + masthead) structure.
- Search, sign-in, and mobile toggle all present and working inside that one row.
- No unrelated files touched.
</success_criteria>

<output>
Create `.planning/quick/260722-wcu-merge-appshell-top-header-utility-row-an/260722-wcu-SUMMARY.md` when done
</output>
