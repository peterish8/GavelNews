---
quick_id: 260723-l3i
status: complete
---

# Quick Task 260723-l3i: Fix dark-theme color issues — Summary

## What happened

Traced all three reported dark-theme color issues to root causes in `app/tokens.css` / `app/globals.css` and fixed each at the token level (not per-component patches):

1. **TTS pink accent → proper red.** `:root.dark`'s `--brand` was `#F87171` (light coral, reads pink), while `--primary`/`--destructive` were already proper saturated reds. Changed `--brand: #F87171 → #EF4444`, `--brand-hover: #EF4444 → #DC2626`, `--brand-border` to match. This is the single token the TTS reader-pill (`components/StoryReader.tsx`) uses via `bg-brand`/`text-brand`/`border-brand`, so the play button, progress bar, and language chip all pick up the fix — as does every other `bg-brand`/`text-brand` usage site-wide in dark mode (54 files reference these utility classes).

2. **"Why it matters for CLAT" box (muddy grey-brown) → proper dark amber card.** `:root.dark` never defined `--gv-warn-soft` (or several sibling tokens), so `.surface-emphasis`'s dark rule silently fell back to the light theme's pale peach (`#FBEEDA`), color-mixed into near-black — producing the washed-out tan-grey in the screenshot. Added dark-mode values for `--gv-warn-soft` (`#451a03`, opaque dark amber so the existing `color-mix(35%, dark-bg)` composite reads as a rich dark card, not a wash) plus the full set of previously-missing siblings: `--gv-success-soft`, `--gv-danger-soft`, `--gv-accent`/`-hover`/`-soft`/`-border`, `--gv-gold`/`-soft`/`-border`, using low-opacity rgba overlays (matching the existing `--brand-soft` dark pattern) for the ones consumed as flat backgrounds (`bg-*-soft` on FavoriteButton, CompleteButton, NavSearch, SearchResults) rather than composited via `color-mix`.

3. **Footer invisible/wrong in dark mode.** Both `.surface-muted` (`app/globals.css:276`) and `Footer.tsx`'s inline background referenced `var(--elevated, #fff)` — `--elevated` is never defined anywhere in `tokens.css` (the real token is `--app-elevated`, which has correct light `#ffffff` / dark `#121218` values). The typo meant these always fell back to `#fff` regardless of theme, producing a white/washed band against the dark page. Fixed both references to `var(--app-elevated)`. This also fixes the same latent bug in `FeedView`, `StoryCard`, and `EmptyState` (all consume `.surface-muted`), which likely had the same subtle issue.

## Verification

- `pnpm exec tsc --noEmit` — clean, no errors.
- Confirmed no remaining `var(--elevated` references in the live tree (only a stale untracked worktree copy under `.claude/worktrees/` still has the old text — not part of the served app).
- Did not start the dev server / visually verify in a browser — CSS-variable/token-level change, recommend the user reload the dark-theme story page to confirm the box, TTS pill, and footer now look right.

## Deviations from plan

Extended scope slightly beyond the 3 reported symptoms: also added dark values for `--gv-success-soft`/`--gv-danger-soft`/`--gv-accent*`/`--gv-gold*`, since they had the exact same "missing dark override, falls back to light pastel" bug as `--gv-warn-soft`, and are consumed by components (FavoriteButton, CompleteButton, NavSearch, SearchResults) not currently exercised by the story page — same root cause, same one-line-per-token fix, done in the same touch of the file. Not visually verified for those specific components.

## Notes for follow-up

- `app/tokens.css` is documented as "a byte-identical copy of a shared design-token source." If there's an upstream design-system repo, mirror these fixes there too or they'll be overwritten on the next sync.
