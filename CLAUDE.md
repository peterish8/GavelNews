<!-- GSD:project-start source:PROJECT.md -->
## Project

**Gavel News Web** — a free current-affairs reading site for CLAT PG aspirants. Reads published stories from Supabase, synced by a separate `gavel-news` engine repo (Python; admin + Claude Code produce daily pieces, synced via `supabase_sync.py`). Story pages are publicly readable as a teaser (headline, summary, what happened, background, sources) for SEO/shareability; deeper content (why it matters, key points, PYQ connection) plus favorite/mark-complete requires a free account (Google or email).

**Core value:** sign up in under a minute, get genuinely useful daily current-affairs content — good enough that people come back on its own merits, not because they feel tricked into signing up.

**Real strategic purpose:** every signup captures an email for a future, separate product (Gavelogy) launch list — disclosed honestly in the Terms/consent copy (DPDP Act 2023 requirement; see `.planning/PROJECT.md`).

### Constraints
- **Separate repo from the `gavel-news` engine** — no import of its Python code, only its Supabase output.
- **This repo never holds the Supabase `service_role` key** — writes to `published_stories` belong solely to the engine repo. Only the anon/publishable key lives here.
- Full product context, requirements, and phase plan: `.planning/PROJECT.md`, `.planning/ROADMAP.md`.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

Versions below are what's actually pinned in `package.json` — check there before trusting any other doc, including this one.

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15.5.21, App Router | Not yet on Next 16 — `middleware.ts` is still correct; the `proxy.ts` rename only applies from Next 16 onward |
| UI | React 19.0.0 | |
| Language | TypeScript 5.7.3 | |
| Styling | Tailwind CSS 4.x, CSS-first config (`@import "tailwindcss"` in `app/globals.css`, tokens in `app/tokens.css`) | No `tailwind.config.js` — don't add one |
| Backend | Supabase (Postgres + Auth + RLS) via `@supabase/supabase-js` 2.49.4 + `@supabase/ssr` 0.5.2 | No live app wiring yet — see Current State below |
| Package manager | pnpm | Use `pnpm`, not `npm`/`yarn` (`pnpm-lock.yaml` is the lockfile) |
| Client state / misc | zustand, framer-motion, date-fns, clsx | zustand is installed but not yet used by any component — verify before assuming a store exists |
| Testing | Vitest — `pnpm test` | |
| Lint | ESLint + `eslint-config-next` (`next/core-web-vitals`) | |

**Not installed**, despite appearing in earlier drafts of this doc: `zod`, `next-themes`, `lucide-react`, shadcn/ui. Check `package.json` before importing any of these.

**Current state:** the app runs entirely on `DATA_SOURCE=mock` (`lib/data/index.ts`, 12 mock stories) — no live Supabase queries yet. A real Supabase project ("GavelNews", ref `fewdjzjkdblnvzvtjzgz`) now exists and is linked via the CLI, with the anon URL/key written to local `.env.local` (gitignored, not committed). Per `.planning/ROADMAP.md` Phase 1, schema/RLS/seed data still have not shipped — don't assume any table exists.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- All data access goes through `lib/data/index.ts`'s `getDataSource()`, switched on `process.env.DATA_SOURCE` (`mock` default). Add new data operations there, not as ad-hoc fetches in components.
- `app/tokens.css` is a byte-identical copy of a shared design-token source — treat as generated, don't hand-edit.
- Server Components by default; `"use client"` only on interactive leaf components (favorite button, theme toggle, filter chips) — public story/feed pages must stay server-rendered for SEO.
- No ORM — use `supabase-js` + CLI-generated types (`supabase gen types typescript`) once the schema exists, not Prisma/Drizzle.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

- `app/` — Next.js App Router routes: `/`, `story/[slug]`, `edition/[date]`, `archive`, `search`, `favorites`, `settings`, `auth/signin`, `about`. `story/[slug]/opengraph-image.tsx` is a Next.js file-convention route (edge runtime) that renders a per-story branded OG preview image via `next/og`'s `ImageResponse`, fetching Source Serif 4 + IBM Plex Mono from Google Fonts at request time with a fallback to generic sans-serif if that fetch fails.
- `components/` — shared UI: story reader, feed view, nav/search, auth gate, favorites, settings form, theme toggle, `ShareButton.tsx` (client component — Web Share API with clipboard-copy fallback), `CalendarBrowser.tsx`.
- `lib/` — `data/` (mock source + env switch), `auth.ts` / `auth-actions.ts`, `editions.ts`, `format.ts`, `types.ts`, `tts-manager.ts`, `site.ts` (`SITE_URL` constant, env-driven via `NEXT_PUBLIC_SITE_URL` — single source of truth for `metadataBase`/canonical URLs/share links).
- `supabase/` — CLI-linked project, no migrations yet (Phase 1 builds schema/RLS).
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
