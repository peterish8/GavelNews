# Gavel News — Learners Site

Student-facing Next.js app for the Gavel News CLAT current-affairs
pipeline. Lives at `learners/` inside the `gavel-news` repo, separate
from the Python editorial engine (`engine/`).

## Quickstart

```bash
cd learners
pnpm install
pnpm dev          # http://localhost:3000
```

No Supabase project required in v1 — the site ships with mock data
(`DATA_SOURCE=mock` is the default).

## Layout

```
learners/
├── app/                    # Next.js App Router routes
│   ├── globals.css         # Tailwind v4 + theme bridge
│   ├── tokens.css          # Gavelogy color tokens (1:1 copy, no edits)
│   ├── layout.tsx          # Root layout + theme bootstrap
│   └── page.tsx            # Home — today's edition
├── components/             # Shared UI
│   ├── Footer.tsx
│   └── ThemeToggle.tsx
├── lib/                    # data, types, formatters (Phase 2)
├── supabase/               # schema.sql (Phase 5)
└── ...
```

## Env

```bash
# .env.local (copy .env.example)
DATA_SOURCE=mock                                    # or "supabase" once provisioned
NEXT_PUBLIC_SUPABASE_URL=                           # Phase 5
NEXT_PUBLIC_SUPABASE_ANON_KEY=                      # Phase 5
SUPABASE_SERVICE_ROLE_KEY=                          # Phase 5, server-only
```

## Build

```bash
pnpm build
pnpm start
```

## Design system

Colors come from `app/tokens.css` (copy of Gavelogy's tokens — light +
dark variants). Surface philosophy: **flat fills, one shadow, no
glassmorphism, no ambient orbs**. Lighter than Gavelogy by design.

See `../.planning/PROJECT.md` for the full design rules.