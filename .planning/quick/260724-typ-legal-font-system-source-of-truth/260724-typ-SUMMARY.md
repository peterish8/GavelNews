---
status: complete
---

# Summary: Legal font system + single source of truth

## Status
complete

## What shipped
- **New stack:** Source Sans 3 (UI/labels), Source Serif 4 (display/body), Source Code Pro (code)
- **`app/system.css`:** single place for `--type-*` tokens, surface/theme overrides, `.label-law` / `.heading-law`
- **`app/globals.css`:** stripped of font/theme scatter; imports + `@theme` bridge only maps `var(--type-*)` → utilities
- **OG route:** Source Serif 4 + Source Sans 3 (was IBM Plex Mono)
- **`tokens.css`:** typography defaults are system fallbacks only; comment points to `system.css`

## How to change fonts next time
Edit `--type-ui` / `--type-serif` / `--type-mono` in `app/system.css` and the Google Fonts `@import` at the top of `app/globals.css`. Do not re-declare families in components.

## Verify
- `pnpm typecheck` — pass
