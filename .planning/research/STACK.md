# Stack Research

**Domain:** Next.js + Supabase content-reading web app (auth-gated user state, SEO-critical public pages, future Expo mobile companion)
**Researched:** 2026-07-22
**Confidence:** HIGH (core stack verified against official docs, npm registry, and Supabase/Next.js release notes) / MEDIUM on a few fast-moving specifics (Next.js 16 proxy rename, new Supabase key format) flagged below

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.x (App Router) | Framework, SSR/SSG, routing, Server Actions | Current stable major (verified via npm and `nextjs.org/docs/app/guides/upgrading/version-16`). App Router gives server-rendered public story pages for SEO — the explicit reason this stack was chosen — while Server Actions/Server Components cover the auth-gated favorites/progress state without a separate API layer. |
| React | 19.2.x | UI runtime | Required by Next.js 16 (peer dependency). Brings `useOptimistic` and `useActionState`, which are the right primitives for "favorite/mark complete" style interactions — no extra client state library needed. |
| TypeScript | 5.9.x (latest `7.0.2` is a preview/beta line — see note) | Type safety across app + Supabase schema | `npm view typescript version` currently resolves to a `7.x` pre-release tag; the safe production choice is the latest **5.9.x** stable release, not the `7.0.2` dist-tag your registry mirror returned. Pin explicitly (`"typescript": "^5.9.0"`) rather than trusting `latest`. Pairs with Supabase CLI-generated DB types for end-to-end type safety. |
| Tailwind CSS | 4.x (CSS-first config) | Styling | v4 is the current major; config lives in CSS (`@import "tailwindcss"` + `@theme`) instead of `tailwind.config.js`, and setup is just `tailwindcss` + `@tailwindcss/postcss`. This is what `nextjs.org/docs/app/getting-started/css` and `tailwindcss.com/docs/guides/nextjs` document today — don't scaffold a v3-style config from memory. |
| Supabase (Postgres + Auth + RLS) | Platform (managed), client libs below | Database, authentication, authorization | Matches the project's stated constraint. Managed Postgres + built-in Auth + Row Level Security is the correct amount of backend for a content site with light user state — no separate backend service needed. |
| `@supabase/supabase-js` | 2.110.x | Supabase client SDK | Official JS/TS client; same package used on web and in the future Expo app, which is exactly the "shared backend" requirement in PROJECT.md. |
| `@supabase/ssr` | 0.12.x | Cookie-based session handling for SSR | The **only** currently-supported way to do Supabase auth in a server-rendered Next.js app. The older `@supabase/auth-helpers-nextjs` package is deprecated — official Supabase docs explicitly say `npm uninstall @supabase/auth-helpers-nextjs` / `npm install @supabase/ssr`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | 4.x | Runtime validation | Validate the onboarding form (exam year), settings form, and any Server Action inputs. Small, zero-dependency, pairs naturally with `useActionState`. |
| `next-themes` | latest 0.4.x | Light/dark theme toggle | Settings page requires a theme toggle. `next-themes` is the de facto standard for App Router (no FOUC, works with `next/font` and Tailwind's `dark:` variant) — don't hand-roll this with `localStorage` + `useEffect`. |
| `lucide-react` | latest 0.5xx.x | Icons | Tree-shakeable, matches shadcn/ui's icon choice if you adopt shadcn components (see below). Avoid a full icon-font (FontAwesome) — unnecessary weight for a mobile-first, low-end-Android target. |
| shadcn/ui (selected components only: Button, Input, Dialog/Sheet, Toast/Sonner) | CLI-based, no version pin (copied source, not an npm dependency) | Accessible UI primitives | Use it **selectively** for the handful of interactive components (auth forms, filter controls, toasts on favorite/complete) where accessibility (keyboard nav, ARIA) is a stated requirement and hand-rolling correctly is real work. Do not adopt the full component library "just in case" — it's copy-paste source you now own and maintain, so only pull in what's actually used. |
| `next/font` (built-in, not a separate package) | bundled with Next.js | Self-hosted fonts | Zero extra requests, no layout shift, works well on low-end Android — use instead of a Google Fonts `<link>` tag. |
| Supabase CLI (`supabase`) | dev dependency, latest | Local dev, migrations, generated TS types | `npx supabase gen types typescript --project-id ... > lib/database.types.ts` gives you compile-time-checked query results. Also drives schema migrations as version-controlled SQL files instead of clicking through the dashboard — important since this repo owns the frontend schema surface and the engine repo owns writes. |
| `@vercel/analytics` + `@vercel/speed-insights` | latest | Lightweight traffic/perf telemetry | Optional but cheap (free on Hobby tier, a `<script>` + one import) — useful to see if the "genuinely good enough that people come back" bet is working, without standing up a full analytics stack. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + `eslint-config-next` | Linting | Still what `create-next-app` scaffolds by default as of Next.js 16; Biome is a credible faster alternative but is not yet the framework default — don't switch unless you have a specific reason to. |
| Prettier | Formatting | Pair with `eslint-config-next` (which no longer bundles formatting rules). One `prettier.config.js` with the Tailwind plugin (`prettier-plugin-tailwindcss`) to auto-sort class names — genuinely worth it once you have more than a few components. |
| Vercel CLI | Local prod-parity builds, env pulling | `vercel env pull` keeps local `.env.local` in sync with dashboard-managed secrets. |

## Installation

```bash
# Core
npx create-next-app@latest gavel-news-web --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
npm install @supabase/supabase-js @supabase/ssr

# Supporting
npm install zod next-themes lucide-react
npm install @vercel/analytics @vercel/speed-insights
npx shadcn@latest init   # then: npx shadcn@latest add button input dialog sonner

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss supabase
```

Note: `create-next-app@latest` already installs Tailwind v4 and wires the PostCSS plugin — you do not need to hand-configure `tailwind.config.js`.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Vercel (hosting) | Netlify, Cloudflare Pages, self-host on Railway/Render | Vercel is the default for a reason here: zero-config Next.js support (same company builds both), generous Hobby tier (100GB bandwidth, 1M function invocations/month) that comfortably covers a pre-launch content site, and first-class ISR/edge caching for the SEO-critical public pages. Switch away only if you outgrow serverless function limits (10s execution on Hobby) — e.g. long-running background jobs — which this project's read-mostly workload won't hit. The content generation itself already happens out-of-band in the separate `gavel-news` engine repo, so Vercel never needs to do heavy lifting. |
| Supabase Auth (Google + Email OTP/magic link) | Password-based email auth, Clerk/Auth0/NextAuth | PROJECT.md explicitly wants signup "in under a minute" with minimal friction. Magic-link or OTP email sign-in avoids a password field entirely (no password reset flow to build either). A third-party auth provider (Clerk, Auth0) would duplicate what Supabase Auth already gives you for free and would fragment the "one Supabase backend shared with the future Expo app" goal — skip these unless you need enterprise SSO. |
| Postgres full-text search (`tsvector`/`to_tsquery` + GIN index) | Algolia, Meilisearch, Typesense, `pg_trgm` | The site needs "search stories by title/keyword" over what will be at most a few thousand rows initially. A generated `tsvector` column + GIN index (`ALTER TABLE stories ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (...) STORED`) is genuinely fast at this scale and adds zero new infrastructure. Revisit a dedicated search service only if you need typo-tolerance/fuzzy ranking at a much larger corpus size — not a v1 concern. |
| No client state library (Server Components + Server Actions + `useOptimistic`) | Redux, Zustand, Jotai, TanStack Query | This is a content-reading site, not an app with complex client-side state graphs. Favorites and reading-progress toggles are a handful of Server Actions with `useOptimistic` for instant feedback; the feed/archive/story pages are server-rendered. Pulling in a state-management library here is the over-engineering PROJECT.md explicitly warns against. Reconsider only if a future milestone adds real-time collaborative or heavily interactive client state. |
| shadcn/ui (selective) | Full component library (MUI, Chakra, Mantine) | Those libraries ship a runtime dependency and their own design system you must fight or fully adopt. shadcn/ui components are copied into your repo as plain Tailwind + Radix code, so you keep full control and only pay for what you use — appropriate for a small, mobile-first site with modest UI surface area. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` | Officially deprecated by Supabase; the migration guide (`supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers`) tells you to remove it. Any tutorial still referencing it (many still do, dated 2023-2024) is stale. | `@supabase/ssr` |
| `middleware.ts` as the file name in Next.js 16 (if starting fresh on 16) | Next.js 16 renamed Middleware to **Proxy** — the file is now `proxy.ts` with an exported `proxy()` function, not `middleware()`. Every Supabase SSR auth tutorial you'll find (including current official Supabase docs snippets) still shows `middleware.ts`/`updateSession` wired through the old file name, because most were written against Next.js 14/15. This is the single most likely "worked in the tutorial, breaks in this project" trap. Confirm current Next.js version before wiring session refresh, and use `npx @next/codemod@canary middleware-to-proxy .` if you scaffold from an older example. **Confidence: MEDIUM** — verify against the exact Next.js version pinned in package.json at implementation time, since this is a very recent (late-2025/2026) change and docs are still catching up. | `proxy.ts` exporting `proxy()`, same cookie-forwarding logic as before |
| Legacy Supabase `anon` / `service_role` JWT keys, for a brand-new project | Supabase is rolling out new-format keys: **publishable** (`sb_publishable_...`, replaces `anon`) and **secret** (`sb_secret_...`, replaces `service_role`). Since "no Supabase project exists yet" (per PROJECT.md), start on the new format rather than provisioning legacy keys you'll need to migrate later. **Confidence: MEDIUM** — this is an active rollout; confirm current default in the Supabase dashboard at project-creation time, both key formats are still functionally supported. | `sb_publishable_...` client-side, `sb_secret_...` server-only (never shipped to the browser) |
| The ~20-table normalized schema from the original spec | PROJECT.md explicitly rejects this as premature. A wide, deeply normalized schema before there's a single validated usage pattern creates RLS policies to write and maintain for tables nothing uses yet. | A minimal schema: `stories` (public-read, published only), `profiles` (1:1 with `auth.users`, holds `exam_year`, theme pref), `favorites` (user_id + story_id), `reading_progress`/`completions` (user_id + story_id + completed_at). Add tables only when a real feature needs them. |
| Redux / Zustand / MobX for this milestone | No complex cross-cutting client state exists yet — feed filters, favorites, and theme are all either server state or trivially local. Adding a global store now is speculative architecture for a "not a complex app" product. | Server Components for data, Server Actions + `useOptimistic` for mutations, React `useState`/URL search params for local UI state (filters). |
| Client-side-only rendering (`"use client"` on story/feed pages) | Public story pages exist specifically for SEO/organic reach (stated in PROJECT.md). CSR-only pages ship an empty shell to crawlers and hurt Core Web Vitals on the low-end Android devices this product targets. | Server Components by default; `"use client"` only on the specific interactive leaf components (favorite button, theme toggle, filter chips). |
| A dedicated ORM (Prisma, Drizzle) on top of Supabase | Adds a second schema-definition source of truth and a build step, when `supabase-js` + CLI-generated types already give you type-safe queries against the actual Postgres schema (which the separate `gavel-news` engine repo also writes to via `supabase_sync.py`). Two schema sources of truth is exactly the sync-drift risk PROJECT.md flags as a constraint. | `supabase-js` query builder + `supabase gen types typescript` |

## Stack Patterns by Variant

**If the future Expo mobile app work starts (per PROJECT.md's stated future intent):**
- Use `@supabase/supabase-js` directly in Expo (no `@supabase/ssr`, which is web/SSR-specific) with `expo-secure-store` as the auth storage adapter, matching Supabase's official Expo quickstart (`docs.expo.dev/guides/using-supabase`).
- Because both web and mobile share the same Supabase project, RLS policies written now (scoped to `auth.uid()`, not to any web-specific concept) automatically cover the mobile client with zero backend changes — this is the payoff of the "Supabase Auth for both" decision, so keep policies platform-agnostic from day one.
- Do not reach for a monorepo/shared-package tool (Turborepo, Nx) preemptively — this project is explicitly a separate repo from its sibling engine repo already; add a mobile repo the same way when that milestone actually starts, don't restructure now for a feature that isn't being built yet.

**If organic SEO traffic becomes the primary growth channel (stated strategic motive):**
- Use `generateMetadata` per story route + `next/og` or a static OG image per story for social shares — cheap relative to its funnel value here (every signup captures an email for Gavelogy).
- Prefer ISR (`revalidate` on story pages) over full static export — stories are added daily by the engine repo's sync job, so pages need to pick up new content without a full redeploy.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `next@16.2.x` | `react@19.2.x`, `react-dom@19.2.x`, Node.js `>=20.9.0` | Verified via `npm view next engines`. Confirm your deployment/CI Node version is 20.9+ before pinning Next 16 — this is a hard floor, not a recommendation. |
| `@supabase/ssr@0.12.x` | `@supabase/supabase-js@^2.x` | `@supabase/ssr` is a thin cookie-adapter layer over `supabase-js`; keep both on current majors together. |
| `tailwindcss@4.x` | `@tailwindcss/postcss@4.x` (same major) | v4 moved PostCSS integration into its own package; do not mix a v3 `tailwind.config.js` approach with v4's CSS-first `@theme` — pick one, and `create-next-app@latest` already does v4 correctly. |
| `shadcn/ui` CLI-generated components | `tailwindcss@4.x`, `lucide-react` | Current `shadcn` CLI generates v4-compatible components by default; if you find an older shadcn tutorial referencing `tailwind.config.js` theme extension, it predates v4 — regenerate via the current CLI rather than hand-porting. |

## Sources

- `nextjs.org/docs/app/guides/upgrading/version-16` — confirmed Next.js 16 is current stable, Node engine floor
- `nextjs.org/docs/messages/middleware-to-proxy` — confirmed Middleware→Proxy rename in Next.js 16, migration codemod
- `nextjs.org/docs/app/getting-started/css` — confirmed Tailwind v4 setup pattern for App Router
- `tailwindcss.com/docs/guides/nextjs` — confirmed v4 CSS-first config, no `tailwind.config.js` requirement
- `supabase.com/docs/guides/auth/server-side/creating-a-client` — confirmed `@supabase/ssr` as current recommended SSR client pattern
- `supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers` — confirmed `@supabase/auth-helpers-nextjs` deprecation
- `supabase.com/docs/guides/getting-started/api-keys` — confirmed new publishable/secret key format rolling out alongside legacy anon/service_role
- `supabase.com/docs/guides/database/postgres/row-level-security` — confirmed RLS performance patterns (wrap `auth.uid()` in `select`, index policy columns, scope policies `TO authenticated`/`TO anon`)
- `supabase.com/docs/guides/database/full-text-search` — confirmed native Postgres FTS pattern (`tsvector` + GIN index) sufficient for this scale
- `docs.expo.dev/guides/using-supabase` and `supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth` — confirmed shared-backend pattern for the future Expo app (same `supabase-js`, platform-specific storage adapter)
- `vercel.com/docs/plans/hobby` — confirmed Hobby tier limits (100GB bandwidth/mo, 1M function invocations) are sufficient for this project's pre-launch traffic profile
- npm registry (`npm view <pkg> version`, checked live 2026-07-22) — confirmed exact current versions: `next@16.2.11`, `react@19.2.8`, `@supabase/ssr@0.12.3`, `@supabase/supabase-js@2.110.8`, `tailwindcss@4.3.3`, `zod@4.4.3`
- WebSearch (multiple sources cross-referenced, MEDIUM confidence individually, elevated to stated confidence where corroborated by official docs above) — Next.js 16 proxy rename community discussion, Supabase new API key rollout discussion threads

---
*Stack research for: CLAT PG current-affairs reading web app (Next.js + Supabase)*
*Researched: 2026-07-22*
