# Quick: Legal font system + single source of truth

## Goal
Replace scattered Inter / Libre Baskerville / IBM Plex Mono / Plus Jakarta with one neat legal-editorial stack, and centralize Gavel News design tokens so fonts + theme surfaces are not redefined in multiple CSS files.

## Stack (chosen)
| Role | Font |
|------|------|
| UI / buttons / labels | Source Sans 3 |
| Headlines / body / brand | Source Serif 4 |
| Code | Source Code Pro |

## Deliverables
1. `app/system.css` — sole source of truth for `--type-*` fonts + law-editorial surface overrides
2. `app/globals.css` — wiring only (font file import, Tailwind, tokens, system, @theme bridge, components)
3. OG image fonts aligned to Source Serif 4 + Source Sans 3
4. `tokens.css` typography defaults demoted to system-ui/Georgia fallbacks (no dead family names)

## Done when
- No Inter / Libre Baskerville / IBM Plex Mono / Plus Jakarta in live CSS stacks
- Components still use `font-ui` / `font-serif` / `font-mono` (no mass class renames)
- `pnpm typecheck` passes
