# AGENTS.md

Project context for AI coding agents (Codex, Cursor, Gemini CLI, etc.). Claude Code should follow `CLAUDE.md` instead, which adds GSD-specific workflow requirements this file intentionally omits.

## Project

Gavel News Web — a free current-affairs reading site for CLAT PG aspirants. Reads published stories from Supabase, synced by a separate `gavel-news` engine repo. Story pages are publicly readable as a teaser (headline, summary, what happened, background, sources); deeper content (why it matters, key points, PYQ connection) plus favorite/mark-complete requires a free account.

Writes to `published_stories` belong solely to the sibling engine repo — this repo never writes to Supabase. It does hold the `service_role` key as `SUPABASE_SERVICE_ROLE_KEY`, read-only and server-only (never `NEXT_PUBLIC_`, only used in `lib/supabase/serviceRole.ts` which has `import "server-only"`), to read gated content (Legal Mentor/Exam Lens/quiz/PYQ) that the anon role's RLS policies no longer expose. anon/authenticated can only read `published_stories_teaser`, a column-limited public view.

## Stack

Check `package.json` for exact versions — it is the source of truth, not this file.

- Next.js 15.5.21 (App Router), React 19.0.0, TypeScript 5.7.3
- Tailwind CSS 4.x, CSS-first config — no `tailwind.config.js`
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`) for Postgres + Auth + RLS — not yet wired into the app (see Current State)
- pnpm package manager
- Vitest for tests, ESLint (`next/core-web-vitals`) for lint

## Current State

The app is configured to use Supabase (`DATA_SOURCE=supabase` in `.env.local`) but currently falls back to mock data when Supabase tables don't exist. A real Supabase project ("GavelNews") is linked via the CLI, with anon URL/key in local `.env.local` (gitignored). Schema/RLS/seed data have not shipped (`.planning/ROADMAP.md` Phase 1). Don't assume any Supabase table exists.

## Commands

- `pnpm dev` — dev server
- `pnpm build` / `pnpm start` — production build/serve
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest

## Structure

- `app/` — App Router routes
- `components/` — shared UI
- `lib/` — data access, auth, formatting, types
- `supabase/` — CLI project (linked, no migrations yet)
- `.planning/` — project/requirements/roadmap docs (read `PROJECT.md` and `ROADMAP.md` for full product context)

Recent additions worth knowing about: `components/ShareButton.tsx` (Web Share API + clipboard-copy fallback), `components/CalendarBrowser.tsx`, `lib/site.ts` (`SITE_URL` constant), and `app/story/[slug]/opengraph-image.tsx` (per-story branded OG preview image route).

## Conventions

- All data access goes through `lib/data/index.ts`'s `getDataSource()` — don't fetch data ad-hoc in components.
- Server Components by default; `"use client"` only on interactive leaf components. Public story/feed pages must stay server-rendered (SEO is a stated requirement).
- `app/tokens.css` is a generated copy of shared design tokens — don't hand-edit font/brand families there.
- `app/system.css` is the Gavel News design-system source of truth (fonts via `--type-*`, law-editorial surface overrides). Change typefaces only there + the Google Fonts import at the top of `app/globals.css`.

## Don't

- Don't use git worktrees for isolation — work directly on the local checkout. If a change needs isolation, use a normal feature branch off `main` instead, never a worktree. (A worktree-isolated background task once left a broken, uncommitted page sitting unmerged for a full session before anyone noticed.)
- Don't add a Prisma/Drizzle ORM layer — use `supabase-js` + CLI-generated types.
- Don't add ads, a quiz/mastery feature, revision/planner/analytics, or UG/PG split content — explicitly out of scope for v1.
- Don't prefix the service_role key with `NEXT_PUBLIC_`, and don't import `lib/supabase/serviceRole.ts` from a `"use client"` component or anything it transitively imports.
- Don't assume `zod`, `next-themes`, `lucide-react`, or shadcn/ui are installed — they aren't yet; check `package.json`.
