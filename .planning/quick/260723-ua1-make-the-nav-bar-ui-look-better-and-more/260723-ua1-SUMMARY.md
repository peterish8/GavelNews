---
quick_id: 260723-ua1
status: complete
---

# Quick Task 260723-ua1: Give the nav a distinctive legal-editorial identity — Summary

**One-liner:** Replaced the nav's remaining stock-dashboard vocabulary (filled-pill active state, boxed generic icon glyphs, bare mono-caps section labels, no masthead device) with brand-native primitives already defined in `app/tokens.css` — a `--brand-blend` masthead rule, `§`-prefixed serif-italic section labels, zero-padded mono docket-index markers, and a left-rule + soft-tint active row.

## What Was Done

### Task 1 — Masthead rule (`components/AppShell.tsx`, `components/Sidebar.tsx`)
- `AppShell.tsx`: split the content `<header>` into two parts — a `<div className="h-[2px] w-full" style={{ background: "var(--brand-blend)" }} />` rule as the first child, followed by the existing control row (mobile toggle, collapse toggle, nameplate, search/sign-in) now wrapped in its own `relative flex h-16 items-center gap-2 px-2.5 sm:px-4` div. The outer `<header>` keeps only the border/background/backdrop-blur.
- `Sidebar.tsx`: applied the same split to the sidebar's own header — outer `<div className="shrink-0 border-b border-border-app">` containing the brand-blend rule, then the existing `flex h-16 items-center justify-between gap-2 px-3` row (brand link + close/collapse controls) nested inside.
- Net effect: both nav surfaces (top content header and sidebar header) now render the same 2px brand-gradient masthead rule above their existing 64px control row.

### Task 2 — Docket-index nav body (`components/Sidebar.tsx`)
- **Section labels:** `SECTION_LABELS[section]` now renders as `"§ " + label` in `font-serif italic text-[11px] tracking-[0.01em] text-ink-3`, sitting above a `border-b border-border-app/50 pb-1.5 mb-1.5` hairline rule (previously bare `font-mono uppercase tracking-[0.16em]` text with no rule). The "· sign in" suffix keeps its conditional, now styled `not-italic opacity-70` to match the new label treatment.
- **Nav item marker:** deleted the `NavIcon` function entirely (six hand-drawn SVG glyph cases + unused default). `SidebarLink` now renders a plain `<span>` with a zero-padded sequential index (`String(NAV_ITEMS.indexOf(item) + 1).padStart(2, "0")`) in `font-mono text-[13px] font-semibold tabular-nums`, colored `text-ink-3` normally and `text-brand` when active — no background box.
- **Active row treatment:** replaced `bg-brand text-on-accent shadow-sm` (filled solid pill) with `border-l-[3px] border-brand bg-brand-soft pl-[calc(0.625rem-3px)]`, keeping `border-l-[3px] border-transparent` on the inactive branch so row width/alignment is identical either way. Corner radius unified to `rounded-lg` on both branches (dropped the active-only `rounded-xl`). Label text color changed from implicit white to `text-brand`; description subtext changed from `text-white/75` to `text-ink-2`.

### Task 3 — Visual verification (checkpoint)
Verified directly by the user in the browser against all four checkpoint criteria from the plan:
- Desktop sidebar expanded — masthead rule, docket 01-06 indices, left-rule/tinted active state on "Today", "§ Read"/"§ Your library"/"§ About" serif-italic labels with hairline rules — all confirmed.
- Desktop sidebar collapsed — masthead rule still visible above the control row — confirmed.
- Mobile drawer — same treatment, fully legible — confirmed.
- Light and dark mode — no contrast regressions in either — confirmed.

**Approved by user.**

## Verification

- `pnpm run typecheck` — passed after task 1 (masthead rule split) and again after task 2 (docket markers, label restyle, `NavIcon` removal). No type errors either time.
- Confirmed no remaining references to `NavIcon` anywhere in `components/Sidebar.tsx` after deletion.
- Confirmed `--brand-blend`, `--brand-soft`, `--brand-border` all already exist as tokens in `app/tokens.css`/`app/globals.css` — no new hex colors or fonts introduced, per the plan's must-have.

## Deviations from Plan

None — plan executed exactly as written for tasks 1 and 2.

One environment note (not a deviation from the plan's code, just process): this worktree had no `node_modules` installed at task start (fresh worktree), so `pnpm run typecheck` failed with `'tsc' is not recognized`. Ran `pnpm install --frozen-lockfile` first (no lockfile/package.json changes resulted — `git diff --stat pnpm-lock.yaml package.json` was empty), then typecheck ran clean.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `f90aa01` | feat(260723-ua1): add brand-blend masthead rule to AppShell and Sidebar headers |
| 2 | `ad2f4e9` | feat(260723-ua1): replace boxed nav icons with docket-index markers and left-rule active state |

## Files Changed

- `components/AppShell.tsx` — masthead rule split in content header
- `components/Sidebar.tsx` — masthead rule split in sidebar header; docket-index markers, § section labels, left-rule active state; `NavIcon` removed

## Status: Complete

All three tasks done, including the visual-verification checkpoint — approved by the user after manually checking desktop expanded, desktop collapsed, mobile drawer, and light/dark mode against the plan's checkpoint criteria.

## Self-Check: PASSED

- FOUND: components/AppShell.tsx
- FOUND: components/Sidebar.tsx
- FOUND commit: f90aa01
- FOUND commit: ad2f4e9
