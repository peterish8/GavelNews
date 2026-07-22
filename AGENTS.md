# AGENTS.md

Project context for AI coding agents (Codex, Cursor, Gemini CLI, etc.). Claude Code should follow `CLAUDE.md` instead, which adds GSD-specific workflow requirements this file intentionally omits.

## Project

Gavel News Web — a free current-affairs reading site for CLAT PG aspirants. Reads published stories from Supabase, synced by a separate `gavel-news` engine repo. Story pages are publicly readable as a teaser (headline, summary, what happened, background, sources); deeper content (why it matters, key points, PYQ connection) plus favorite/mark-complete requires a free account.

This repo never holds the Supabase `service_role` key — writes to `published_stories` belong solely to the sibling engine repo.

## Stack

Check `package.json` for exact versions — it is the source of truth, not this file.

- Next.js 15.1.4 (App Router), React 19.0.0, TypeScript 5.7.3
- Tailwind CSS 4.x, CSS-first config — no `tailwind.config.js`
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`) for Postgres + Auth + RLS — not yet wired into the app (see Current State)
- pnpm package manager
- Vitest for tests, ESLint (`next/core-web-vitals`) for lint

## Current State

The app currently runs entirely on mock data (`DATA_SOURCE=mock`, see `lib/data/index.ts`) — there is no live Supabase querying yet. A Supabase CLI project is linked locally, but schema/RLS/seed data have not shipped (`.planning/ROADMAP.md` Phase 1). Don't assume any Supabase table exists.

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

## Conventions

- All data access goes through `lib/data/index.ts`'s `getDataSource()` — don't fetch data ad-hoc in components.
- Server Components by default; `"use client"` only on interactive leaf components. Public story/feed pages must stay server-rendered (SEO is a stated requirement).
- `app/tokens.css` is a generated copy of shared design tokens — don't hand-edit.

## Don't

- Don't add a Prisma/Drizzle ORM layer — use `supabase-js` + CLI-generated types.
- Don't add ads, a quiz/mastery feature, revision/planner/analytics, or UG/PG split content — explicitly out of scope for v1.
- Don't put a Supabase `service_role` key anywhere in this repo, including as an empty placeholder.
- Don't assume `zod`, `next-themes`, `lucide-react`, or shadcn/ui are installed — they aren't yet; check `package.json`.
