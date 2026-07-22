# Architecture Research

**Domain:** Next.js App Router + Supabase content site with public SEO pages and authenticated user-state pages, fed by an externally-writing sibling repo
**Researched:** 2026-07-22
**Confidence:** HIGH (Next.js Server/Client Component model, Supabase `@supabase/ssr` pattern, RLS structure — all from official docs) / MEDIUM (on-demand revalidation vs time-based revalidation tradeoff for this specific two-repo setup — synthesized recommendation, not a documented "best practice")

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                    SIBLING REPO: gavel-news (Python)                   │
│  admin + Claude Code write stories → supabase_sync.py → writes with   │
│  SERVICE ROLE key (bypasses RLS) → published_stories table            │
└───────────────────────────────────┬────────────────────────────────────┘
                                     │ (one-way: writes only, this app never
                                     │  calls into the Python repo)
                                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (Postgres + Auth)                    │
│  ┌────────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │published_stories│ │ profiles │ │ favourites │ │ reading_progress │ │
│  │  RLS: public SELECT      RLS: owner-only read/write (auth.uid()) │ │
│  │  where published=true    No anon access. No cross-user access.  │ │
│  └────────────────┘ └──────────┘ └────────────┘ └──────────────────┘ │
│  auth.users (managed by Supabase Auth: Google OAuth + email)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                     │ anon key (public reads) /
                                     │ user JWT via cookies (authenticated reads/writes)
                                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    THIS REPO: gavel-news-web (Next.js App Router)      │
│ ┌───────────────────────────┐   ┌────────────────────────────────────┐│
│ │  app/(public)/…            │   │  app/(app)/…                       ││
│ │  Server Components          │   │  Server Components + Client islands││
│ │  reads published_stories    │   │  reads/writes profiles/favourites/││
│ │  via anon key                │   │  reading_progress via user session││
│ │  SEO metadata, indexable    │   │  layout enforces auth, noindex     ││
│ │  /                          │   │  /dashboard                        ││
│ │  /story/[slug]              │   │  /settings                         ││
│ │  /archive                   │   │                                    ││
│ │  /search                    │   │                                    ││
│ └───────────────────────────┘   └────────────────────────────────────┘│
│                     ┌──────────────────────────┐                       │
│                     │  middleware.ts             │                       │
│                     │  refreshes Supabase session cookie on every       │
│                     │  request; redirects unauthenticated users away    │
│                     │  from app/(app)/*                                 │
│                     └──────────────────────────┘                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `app/(public)/*` route group | Server-rendered, indexable content pages (feed, story detail, archive, search) | Async Server Components; Supabase server client using anon key; `generateMetadata` per page; static-friendly caching |
| `app/(app)/*` route group | Authenticated dashboard/settings; must never be indexed | Shared layout that verifies session server-side and redirects to `/login` if absent; `robots: { index: false }` in layout metadata |
| `middleware.ts` | Session cookie refresh + coarse route gating (UX redirect, not the security boundary) | `@supabase/ssr` `createServerClient` inside middleware, `matcher` scoped to relevant paths |
| `lib/supabase/server.ts` | Server-side Supabase client factory (Server Components, Route Handlers, Server Actions) | `createServerClient` from `@supabase/ssr`, reads/writes cookies via `next/headers` |
| `lib/supabase/client.ts` | Browser Supabase client factory (Client Components only) | `createBrowserClient` from `@supabase/ssr`, uses `NEXT_PUBLIC_*` env vars |
| Client Component "islands" (favorite button, mark-complete toggle, theme toggle, filters) | Interactivity requiring state/events; call Server Actions or the browser client, never fetch content lists themselves | `'use client'`, receives server-fetched data as props, calls a Server Action to mutate |
| Server Actions (`app/actions/*.ts`) | Mutations: favorite/unfavorite, mark complete, update profile (exam year, theme), sign out | `'use server'` functions; re-validate `auth.getUser()` server-side before writing; call `revalidatePath`/`revalidateTag` after mutation |
| RLS policies (Postgres) | The actual security boundary — enforced regardless of what the app code does or forgets to check | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + per-table policies (see below) |
| `robots.ts` / per-layout metadata | Keeps authenticated routes out of search indexes as defense-in-depth alongside RLS | `Disallow: /dashboard`, `/settings` in `robots.ts`; **also** `noindex` meta tag per-page, because `robots.txt` alone doesn't stop indexing of already-linked URLs |

## Recommended Project Structure

```
src/
├── app/
│   ├── (public)/                  # Indexable, server-rendered, reads published_stories
│   │   ├── layout.tsx             # Public shell: header/nav, no auth requirement
│   │   ├── page.tsx                # Today's feed (Server Component)
│   │   ├── story/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Story detail, generateMetadata for OG/SEO
│   │   │       └── favorite-button.tsx  # Client island, receives storyId + initial state
│   │   ├── archive/
│   │   │   └── page.tsx
│   │   └── search/
│   │       └── page.tsx            # searchParams-driven Server Component
│   ├── (app)/                      # Authenticated, non-indexed
│   │   ├── layout.tsx              # Verifies session (redirect if none), sets noindex metadata
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Reading progress / favorites list
│   │   └── settings/
│   │       └── page.tsx            # Exam year, theme, sign out
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── callback/route.ts       # OAuth/email confirm exchange
│   │   └── signout/route.ts
│   ├── actions/                    # Server Actions (mutations)
│   │   ├── favorites.ts
│   │   ├── progress.ts
│   │   └── profile.ts
│   ├── robots.ts
│   ├── sitemap.ts                  # Generated from published_stories slugs
│   └── layout.tsx                  # Root layout (fonts, providers, theme)
├── lib/
│   └── supabase/
│       ├── server.ts               # createServerClient (Server Components/Actions/Route Handlers)
│       ├── client.ts               # createBrowserClient (Client Components)
│       └── proxy.ts                # updateSession() helper used by middleware.ts (Supabase's newer naming for this helper — see note below)
├── components/
│   ├── ui/                         # Presentational, mostly server-renderable
│   └── client/                     # Explicit home for 'use client' interactive pieces
├── types/
│   └── database.ts                 # Generated Supabase types (`supabase gen types typescript`)
└── middleware.ts                   # Thin wrapper calling lib/supabase/proxy.ts
```

### Structure Rationale

- **Route groups `(public)` and `(app)`:** Route groups don't affect the URL, but they let each half of the app have its own `layout.tsx` with different auth requirements and different metadata defaults. This is the cleanest native App Router mechanism for the exact split this project needs — no custom routing logic required.
- **`lib/supabase/server.ts` vs `client.ts` as two files, never merged:** Server client reads cookies via `next/headers` (only callable in Server Components/Actions/Route Handlers); browser client cannot. Keeping them as separate, clearly-named modules prevents accidentally importing the server client into a `'use client'` file (which breaks) or the browser client into a Server Component (which silently uses no session).
- **`app/actions/` for mutations:** All writes to `favourites`, `reading_progress`, and `profiles` go through Server Actions, not client-side Supabase calls. This keeps the write path server-verified (`auth.getUser()` re-checked) and lets each action call `revalidatePath`/`revalidateTag` so the UI reflects the change without a full client-side refetch layer.
- **`components/client/` as an explicit folder:** Because this app's default posture is "prefer Server Components," isolating the small number of genuinely interactive pieces (favorite button, theme toggle, filter chips) into one folder makes the server/client boundary visible in the file tree, not just in scattered `'use client'` directives.
- **`types/database.ts` generated, not hand-written:** Since the content schema is owned by the sibling engine repo and only loosely documented in this repo's PROJECT.md, generating types directly from the live Supabase schema (`supabase gen types typescript --project-id ...`) is the only way to keep this repo honest about what fields actually exist, and to catch schema drift early.

## Architectural Patterns

### Pattern 1: Server Component fetch, Client Component interactivity-only

**What:** Server Components fetch and render all data (story lists, story detail, archive, search results, dashboard data). Client Components receive that data as props and own only local interactive state (button pressed/not-pressed, form input, toggle). Client Components never independently fetch the same list data the server already rendered.

**When to use:** Default for this entire app. The only exceptions are pieces that need `onClick`, `useState`, or browser APIs (theme toggle needs `localStorage`/`prefers-color-scheme`; favorite button needs optimistic UI).

**Trade-offs:** Keeps almost all Supabase content-reading code on the server (smaller client bundle, SEO-correct HTML on first paint, RLS-friendly since anon key never needs to reach the browser for public content... though it's not secret anyway). Cost: every interactive element needs a small prop-drilling boundary and a Server Action, which is more files than a client-fetch-everything SPA style would need.

**Example:**
```typescript
// app/(public)/story/[slug]/page.tsx  (Server Component)
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient() // server client, anon key
  const { data: story } = await supabase
    .from('published_stories')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  let isFavorited = false
  if (user) {
    const { data } = await supabase
      .from('favourites')
      .select('story_id')
      .eq('user_id', user.id)
      .eq('story_id', story.id)
      .maybeSingle()
    isFavorited = !!data
  }

  return (
    <article>
      <h1>{story.title}</h1>
      {/* ...server-rendered content... */}
      <FavoriteButton storyId={story.id} initialFavorited={isFavorited} signedIn={!!user} />
    </article>
  )
}
```
```typescript
// components/client/favorite-button.tsx  (Client Component)
'use client'
import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/app/actions/favorites'

export function FavoriteButton({ storyId, initialFavorited, signedIn }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  if (!signedIn) return <LoginPrompt />

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        setFavorited((f) => !f) // optimistic
        await toggleFavorite(storyId)
      })}
    >
      {favorited ? 'Favorited' : 'Favorite'}
    </button>
  )
}
```

### Pattern 2: Layout-level auth gate for the private route group, middleware as UX-only

**What:** `middleware.ts` refreshes the Supabase session cookie on every request and does a coarse redirect for unauthenticated users hitting `app/(app)/*` (fast UX — no flash of protected content). But the **actual** enforcement happens twice more: (1) `app/(app)/layout.tsx` calls `supabase.auth.getUser()` server-side and redirects if there's no valid user, and (2) RLS policies on every table make it structurally impossible to read/write another user's rows even if the app-layer check were ever bypassed or buggy.

**When to use:** Always, for any Supabase + Next.js app with authenticated routes. Supabase's own docs explicitly warn that middleware reads the session from a cookie "which can be spoofed by anyone" — `getUser()`/`getClaims()` validates the JWT itself and is the trustworthy check. Middleware alone is not sufficient; RLS is the real backstop.

**Trade-offs:** Three layers (middleware, layout check, RLS) sounds redundant, but each guards a different failure mode: middleware gives good UX (no waterfall redirect-after-render), the layout check prevents any Server Component under `(app)/` from ever running with `user === null`, and RLS prevents data leakage even if application code has a bug. Skipping RLS and relying on app-layer checks only is the anti-pattern to avoid (see Anti-Patterns).

**Example:**
```typescript
// app/(app)/layout.tsx
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return <>{children}</>
}

export const metadata = {
  robots: { index: false, follow: false },
}
```

### Pattern 3: Time-based revalidation for public content, no direct coupling to the engine repo's write path

**What:** Because `published_stories` is written by a completely separate Python process (`supabase_sync.py`, running on its own schedule, outside this repo's control and outside this repo's deploy graph), this Next.js app has no natural signal for "new content just landed." Rather than building cross-repo webhook plumbing in v1, public content pages use short time-based revalidation (e.g. `export const revalidate = 60` or `300` on the feed/archive/search pages, longer or `revalidate = false`-then-manual on individual story pages once published since story content rarely changes after publish).

**When to use:** V1, given the engine publishes on a daily cadence (not real-time) and there is no shared secret/API contract between the two repos yet for webhook-triggered revalidation.

**Trade-offs:** Simple, zero cross-repo coupling, "good enough" staleness (up to the revalidate window) for a once-daily publish cadence. If the product later needs near-instant reflection of new stories (e.g. same-day breaking updates), the upgrade path is a Supabase Database Webhook on `published_stories` INSERT/UPDATE calling a Route Handler in this app that runs `revalidateTag('stories')` — but that requires the engine-side team/process to configure the webhook and a shared secret, which is explicitly out of scope for now per PROJECT.md's "no Supabase project exists yet" starting state.

## Data Flow

### Request Flow — Public Content Page

```
Visitor requests /story/some-case-slug
    ↓
Next.js Server Component (app/(public)/story/[slug]/page.tsx)
    ↓ createClient() [anon key, cookies for optional session]
Supabase Postgres — SELECT ... FROM published_stories WHERE slug = $1 AND published = true
    (RLS policy evaluated: anon/authenticated role, published = true → allowed)
    ↓
Server Component also checks auth.getUser() → if signed in, SELECT own favourites row (RLS: auth.uid() = user_id)
    ↓
HTML rendered server-side, streamed to browser — fully indexable, no client JS required for content
    ↓
Client island (FavoriteButton) hydrates for interactivity only
```

### Request Flow — Authenticated Mutation (favorite a story)

```
User clicks Favorite (Client Component, optimistic UI update)
    ↓
Server Action: toggleFavorite(storyId) — 'use server'
    ↓ createClient() [server, reads user's cookie-based JWT]
supabase.auth.getUser() — re-verify session server-side (not trusting client claim)
    ↓
INSERT/DELETE ... FROM favourites WHERE user_id = auth.uid() AND story_id = $1
    (RLS policy: to authenticated using (auth.uid() = user_id) — enforced regardless of app logic)
    ↓
revalidatePath('/story/[slug]') or revalidateTag('favourites:<userId>')
    ↓
Response returned to client; optimistic state reconciled
```

### Cross-Repo Data Flow

```
gavel-news (Python engine)
  admin + Claude Code write story → editorial.py schema
    ↓
  supabase_sync.py — writes with SERVICE ROLE key (bypasses RLS entirely by design;
  this is the only writer of published_stories)
    ↓
Supabase published_stories table  ←──────────────┐
    ↓ (read-only, anon/authenticated key,        │  this app (gavel-news-web) never
    │  RLS: SELECT where published = true)        │  writes to published_stories and
    ↓                                              │  never imports the engine's code —
gavel-news-web reads via Server Components         │  the table schema is the ONLY
  (time-based revalidation, see Pattern 3) ────────┘  contract between the two repos
```

### Key Data Flows

1. **Content publish → visible on site:** One-directional, engine → Supabase → this app's next revalidation window. No feedback loop; this app cannot write back to `published_stories` and should not have a service-role key at all (only the anon/publishable key and the user's session).
2. **User signup → profile row:** Supabase Auth creates `auth.users` row on signup; a Postgres trigger (`on_auth_user_created` → function that inserts into `public.profiles`) creates the corresponding `profiles` row automatically, pre-populated with `id = auth.users.id`. The app's one-question onboarding then does a single `UPDATE profiles SET attempt_year = ...` — it never needs to `INSERT` a profile itself.
3. **Favorite/progress writes → own-row only:** All mutations flow through Server Actions that re-verify `auth.getUser()`, then rely on RLS as the actual boundary — the app-layer check is a UX/defense-in-depth convenience, not the security mechanism.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k users | Exactly the structure above. Time-based revalidation, no caching layer beyond Next.js's built-in fetch/data cache, Supabase free/small tier is fine. |
| 1k–100k users | Add `revalidateTag`-based on-demand revalidation (Pattern 3's upgrade path) if content freshness complaints appear; add a CDN-level cache in front of public pages (Vercel does this automatically for static/ISR routes); consider connection pooling (Supabase's pooler, `pgbouncer`) if Server Component fan-out causes connection pressure. |
| 100k+ users | Denormalize/precompute the feed (e.g. a materialized view or a lightweight search index) if `published_stories` full-text search via `ILIKE`/`websearch_to_tsquery` becomes slow; consider moving `reading_progress` writes to a queue/batched-write pattern if write volume on that table gets heavy (it's a natural high-write-frequency table — one row touched per story per user). None of this is a v1 concern. |

### Scaling Priorities

1. **First bottleneck:** Content freshness perception, not load — the daily-publish + time-based-revalidation model will feel "stale" before it's ever slow. Fix: shrink the revalidate window or add the webhook-triggered `revalidateTag` path from Pattern 3.
2. **Second bottleneck:** `reading_progress` write volume at scale (one write per story-open per user is chattier than favorites). Fix: debounce client-side triggers for progress writes, or batch via a single upsert on "mark complete" rather than continuous scroll-tracking (the v1 requirement is just "mark complete," which keeps this cheap already — avoid scope-creeping into scroll-position tracking).

## Anti-Patterns

### Anti-Pattern 1: Relying on `middleware.ts` (or client-side route guards) as the actual security boundary

**What people do:** Gate `/dashboard` and `/settings` purely in middleware using the session cookie, and skip RLS on `profiles`/`favourites`/`reading_progress` because "the app already checks auth."
**Why it's wrong:** The cookie-derived session in middleware can be spoofed (this is explicitly called out in Supabase's own SSR docs), and even a correct app-layer check only protects paths that go through that exact code — a forgotten check on one Route Handler, Server Action, or future API route leaks data. RLS is enforced by Postgres itself regardless of which code path reaches it.
**Do this instead:** Treat middleware as UX (fast redirect, no flash of protected content), the layout-level `getUser()` check as defense-in-depth, and RLS policies on every table as the non-negotiable actual boundary. Every table in this schema (`profiles`, `favourites`, `reading_progress`) must have RLS enabled with owner-only policies from day one, before any real user data exists.

### Anti-Pattern 2: Fetching public content lists from Client Components with the browser Supabase client

**What people do:** Build the story feed as a `'use client'` component that calls `supabase.from('published_stories').select()` in a `useEffect`, because it's the pattern shown in many introductory Supabase tutorials.
**Why it's wrong:** Defeats the entire reason this project chose Next.js App Router — server-rendered, SEO-indexable HTML. A client-fetched feed renders an empty shell first, then fills in via JS, which is invisible to crawlers that don't execute JS fully or don't wait long enough, and adds a loading-spinner flash for every real user on every visit.
**Do this instead:** All public content reads happen in Server Components using the server Supabase client, as shown in Pattern 1. Client Components only handle the small interactive slivers (favorite button, filter UI state, theme toggle) and receive their initial data as props from the server.

### Anti-Pattern 3: Letting this app hold or use a Supabase service-role key

**What people do:** Copy the service-role key into this app's env vars "just in case," e.g. to simplify a server-side query that RLS is making annoying.
**Why it's wrong:** Service-role bypasses RLS entirely. If it ever reaches this repo (and especially if it's ever referenced from a Client Component bundle by mistake), it's a full database compromise. The service-role key belongs exclusively to the sibling `gavel-news` engine repo's `supabase_sync.py`, which is the only process that needs to bypass RLS to write `published_stories`.
**Do this instead:** This app only ever uses the anon/publishable key (public reads, subject to RLS) and per-user JWTs from the session cookie (authenticated reads/writes, subject to RLS). If a query seems to "need" service-role to work, that's a signal the RLS policy is wrong or missing — fix the policy, don't bypass it.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase (Postgres + Auth) | `@supabase/ssr` server/browser clients; RLS as the authorization layer | No Supabase project exists yet per PROJECT.md — creating it is a hard prerequisite before any backend-touching code lands, but schema/RLS can be designed and applied via migration files before real content exists. |
| Google OAuth (via Supabase Auth) | Supabase-managed OAuth provider config; app just calls `supabase.auth.signInWithOAuth({ provider: 'google' })` and handles the `/auth/callback` redirect | Needs a Google Cloud OAuth client configured with the Supabase project's callback URL once the project exists. |
| Sibling engine repo (`gavel-news`, Python) | **No direct integration** — the only contract is the `published_stories` table schema itself | This app must never import the engine's code or call into it directly (explicit constraint in PROJECT.md). Schema drift risk: if the engine's `supabase_sync.py` output shape changes, this app's `types/database.ts` (regenerated from live schema) and any hardcoded field assumptions need to be re-checked. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `(public)` route group ↔ `(app)` route group | No direct communication — separate layouts, separate auth posture. A signed-in user can freely navigate between both; the boundary is about rendering/indexing rules, not a hard user-facing wall. | Shared bits (e.g. a top nav showing "Dashboard" link when signed in) live in the root layout or a shared component that both route groups' layouts include. |
| Server Components ↔ Client islands | Props down, Server Actions up — no client-side data-fetching library (SWR/React Query) needed for this app's scope | Keeps the client bundle small and avoids a second source-of-truth for data that the server already fetched. |
| App code ↔ RLS policies | App code should assume RLS will reject unauthorized queries and handle the resulting empty/error result gracefully, not assume the app-layer check already made every query "safe" | Write RLS first, test against it directly (e.g. via `psql`/Supabase SQL editor with a test JWT) before building app code that leans on it. |

### Suggested RLS Policy Structure

```sql
-- published_stories: public read-only on published rows; no anon/authenticated writes at all
alter table public.published_stories enable row level security;

create policy "published stories are publicly readable"
on public.published_stories
for select
to anon, authenticated
using (published = true);
-- No insert/update/delete policy for anon/authenticated — only the engine's
-- service_role key writes this table, which bypasses RLS by design.

-- profiles: user reads/writes only their own row
alter table public.profiles enable row level security;

create policy "users can view own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
-- No insert policy needed for the app: a trigger on auth.users creates the
-- profile row (service-role context), the app only ever updates it.

-- favourites / reading_progress: same owner-only shape, both directions
alter table public.favourites enable row level security;

create policy "users manage own favourites"
on public.favourites for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter table public.reading_progress enable row level security;

create policy "users manage own reading progress"
on public.reading_progress for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

Two details worth calling out explicitly because they're easy to get subtly wrong:

- **Wrap `auth.uid()` in `(select auth.uid())`.** Supabase's own performance guidance recommends this form (it lets Postgres treat it as a stable sub-select the planner can cache/inline efficiently per statement) over calling `auth.uid()` bare inside `using()`. Matters more as `favourites`/`reading_progress` grow.
- **`for all` vs separate `for select`/`for insert`/`for update`/`for delete` policies.** `for all` (used above for `favourites`/`reading_progress`) is fine and simpler when the owner-only rule is identical across every operation. Split policies (used above for `profiles`) are worth it when different operations need different rules — e.g. `profiles` intentionally has no `insert` policy for the `authenticated` role because inserts happen via a trigger, not directly from the app.

## Build Order Implications

Given the question "can auth/RLS be built before real content exists, using seed data" — **yes, and it should be**, because it decouples this repo's timeline from the sibling engine repo's timeline (which, per PROJECT.md, hasn't even created the Supabase project yet). Suggested phase-level ordering:

1. **Supabase project + schema + RLS.** Create the project, apply migrations for all four v1 tables (`profiles`, `published_stories`, `favourites`, `reading_progress`) with RLS policies as above, hand-seed a handful of rows directly into `published_stories` via SQL (mirroring the engine's known field shape: `title, what_happened, background, what_court_held, why_it_matters, key_points, sources`, plus a `published`/`slug` field this app needs). This has zero dependency on the engine repo ever running.
2. **Auth flow.** Google + email signup/login via `@supabase/ssr`, the `profiles`-row-on-signup trigger, the single-question onboarding (attempt year), middleware + layout-level route protection for `(app)/*`. Fully testable against step 1's seed data.
3. **Public content pages.** Feed, story detail, archive, search — all Server Components reading `published_stories`. Works identically against seed data or real synced data, since it's the same table/schema; no code changes needed when the engine repo starts writing for real.
4. **Authenticated user-state features.** Favorite, mark-complete, settings (exam year, theme, sign out) — depends on both (2) auth existing and (3) content existing (you need a story to favorite). Server Actions + RLS-backed writes.
5. **SEO layer.** `generateMetadata` per story/feed/archive page, OG tags, `sitemap.ts` generated from `published_stories` slugs, `robots.ts` excluding `(app)/*`. Layered on top of (3) once page structure/URLs are stable — building this earlier risks churn as routes shift.
6. **Real engine integration.** Once the sibling repo's `supabase_sync.py` actually runs against the Supabase project created in step 1, no changes should be needed in this app *if* the seeded schema in step 1 accurately mirrored the engine's real output shape — which is why step 1 should be built by directly reading the engine repo's `editorial.py`/`supabase_sync.py` contract rather than guessing field names.

This ordering also isolates risk correctly: steps 1–2 and 4 are entirely this-repo's-own risk (standard Supabase+Next.js patterns, well-documented); step 6 is the one step with cross-repo risk (schema drift between what the engine actually writes and what this app assumes), and pushing it last means that risk is caught against a fully-built app rather than blocking early development.

## Sources

- [Supabase: Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — HIGH confidence, official docs, `@supabase/ssr` server/browser client pattern, middleware session-refresh pattern, explicit warning about cookie spoofing and the need for `getUser()`/`getClaims()` verification
- [Supabase: Build a User Management App with Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) — HIGH confidence, official docs, Server Action login/signup pattern, auth confirm route handler, sign-out route handler
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence, official docs, RLS enablement, `GRANT` statements per role, `(select auth.uid())` performance recommendation via security-definer-adjacent pattern
- [dev.to: Mastering Supabase RLS as a Beginner](https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175) — MEDIUM confidence, community source, but the "public posts / private posts / owner-only" policy shapes shown match the official pattern and were used to sanity-check the policy structure above
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — HIGH confidence, official docs, props-down data flow from Server to Client Components, "use Client Components for interactivity only" guidance
- [Next.js: robots.txt metadata file](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — HIGH confidence, official docs, `robots.ts` generation and per-user-agent rules
- [Next.js: How to implement Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration) — HIGH confidence, official docs, time-based `revalidate` export and `revalidateTag`/`revalidatePath` on-demand patterns
- Reddit r/nextjs discussion on ISR vs on-demand vs force-dynamic for a once-daily-publish content pipeline — LOW confidence (community discussion, not authoritative), used only to confirm that time-based revalidation is a commonly-accepted default for daily-cadence content sites rather than reaching for webhook-triggered revalidation immediately
- Medium: Next.js Route Groups — MEDIUM confidence, community source, confirms the `(public)`/`(account)`/`(admin)`-style route group pattern for separating public storefront from authenticated account areas, which maps directly onto this project's `(public)`/`(app)` split

**Note on terminology:** Supabase's official docs currently refer to the file that wires up `updateSession()` in newer Next.js versions as a "proxy" (`app/proxy.ts` / `export async function proxy(...)`) rather than the long-standing `middleware.ts` convention. This appears to reflect a recent/in-flux Next.js naming change. Confidence on which convention (`middleware.ts` vs a `proxy.ts` file) applies to the specific Next.js version this project will pin is LOW — verify against the installed Next.js version's own docs at implementation time rather than assuming either name.

---
*Architecture research for: Next.js App Router + Supabase content site (public SEO + authenticated user-state split)*
*Researched: 2026-07-22*
