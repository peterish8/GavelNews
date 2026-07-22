---
phase: quick-260722-wgo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [lib/site.ts, app/layout.tsx, app/story/[slug]/page.tsx, app/story/[slug]/opengraph-image.tsx, .env.example, components/ShareButton.tsx]
autonomous: true
requirements: []
must_haves:
  truths:
    - "Sharing a story link on WhatsApp/Telegram/iMessage/etc renders a rich preview card with Gavel News branding, the story's category, and its headline — not a blank/generic link"
    - "Each story page has a working Share button on the right side of the header actions row (same row as Favorite/Complete or the sign-in gate)"
    - "On a device/browser with Web Share API support, clicking Share opens the native OS share sheet pre-filled with the story title and canonical URL"
    - "On a browser without Web Share API support, clicking Share copies the canonical story URL to the clipboard and shows a 'Copied!' confirmation on the button itself"
    - "The canonical/OG URL reflects the real site domain via NEXT_PUBLIC_SITE_URL, not a hardcoded localhost value carried into production"
  artifacts:
    - path: "lib/site.ts"
      provides: "SITE_URL constant (single source of truth for metadataBase, canonical URLs, and share links)"
    - path: "app/story/[slug]/opengraph-image.tsx"
      provides: "Per-story branded OG image (1200x630 PNG) generated via next/og ImageResponse on the edge runtime"
    - path: "components/ShareButton.tsx"
      provides: "Client leaf component: Web Share API with clipboard-copy fallback"
  key_links:
    - from: "app/story/[slug]/page.tsx generateMetadata"
      to: "lib/site.ts SITE_URL"
      via: "import, used to build the canonical/openGraph.url"
      pattern: "SITE_URL"
    - from: "app/story/[slug]/page.tsx header actions row"
      to: "components/ShareButton.tsx"
      via: "<ShareButton title={story.title} url={...} />"
      pattern: "<ShareButton"
    - from: "app/story/[slug]/opengraph-image.tsx"
      to: "lib/data/index.ts getDataSource"
      via: "await data.getStory(slug) — reuses the one data-access layer, not an ad-hoc fetch"
      pattern: "getDataSource\\(\\)"
---

<objective>
Add a proper Share button to story pages (right side of the header actions row) and make shared links render a neat, branded preview card on WhatsApp/Telegram/etc. Two halves of one feature: (1) `generateMetadata` + a per-story Open Graph image so the *link itself* looks good when pasted anywhere, and (2) a small client `ShareButton` using the Web Share API with a clipboard-copy fallback so the *user* has an easy way to share it.

Purpose: Story pages are the primary shareable/SEO surface (per CLAUDE.md — teaser content is public precisely so it can be shared and found). Right now `generateMetadata` in `app/story/[slug]/page.tsx` sets a bare-bones OG title/description with no image, and `metadataBase` in `app/layout.tsx` is hardcoded to `http://localhost:3000` — so any OG image URL resolved against it would be broken in production. There's also no way for a reader to actually share a story besides copying the browser URL bar manually.

Output:
- `lib/site.ts` — new `SITE_URL` constant, env-driven, defaulting to localhost for dev (mirrors the existing `DATA_SOURCE=mock` fallback convention in `.env.example`).
- `app/layout.tsx` — `metadataBase` now built from `SITE_URL` instead of a hardcoded string.
- `app/story/[slug]/page.tsx` — richer `generateMetadata` (canonical URL, `openGraph.url`/`siteName`, `twitter` card) and a `<ShareButton>` wired into the header actions row.
- `app/story/[slug]/opengraph-image.tsx` — new file, Next.js's built-in per-route OG image convention (edge `ImageResponse`) rendering "Gavel News" branding + the story's category + headline. Next auto-injects the resulting `og:image`/`twitter:image` meta tags for this route — no manual `images` field needed in `generateMetadata`.
- `components/ShareButton.tsx` — new `"use client"` leaf component: Web Share API when available, `navigator.clipboard.writeText` + "Copied!" feedback otherwise.
- `.env.example` — documents the new `NEXT_PUBLIC_SITE_URL` var.

**Decision on the OG image approach (per task constraints, explicit reasoning):** No image field exists on `PublishedStory` (`lib/types.ts`), and `public/` currently has no image assets to fall back to. A static, title-less generic OG image would not satisfy "shows... the news story title" from the user's ask, and a hand-authored SVG placeholder risks not rendering as `og:image` on WhatsApp/Telegram (they expect raster PNG/JPG). Next.js ships a first-class file convention for exactly this — `opengraph-image.tsx` colocated with `page.tsx` — that Next wires into the route's metadata automatically; no custom route/handler is being built by hand. It's a small (~40-line), framework-supported component using the edge runtime, well within "trivially simple." This is the only approach that produces a real per-story branded card with the actual headline visible, which is what "neat" means for this feature.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@app/story/[slug]/page.tsx
@app/layout.tsx
@lib/types.ts
@lib/data/index.ts

<interfaces>
From lib/types.ts (relevant fields for this feature):
```typescript
export interface PublishedStory {
  slug: string;
  title: string;
  category: Category;
  summary?: string;
  whatHappened: string;
  publishedAt: string; // ISO datetime
  // ...other fields not needed for metadata/share
}
export const CATEGORY_META: Record<Category, { label: string; shortLabel: string; description: string }>;
```

From lib/data/index.ts:
```typescript
export function getDataSource(): DataSource; // DataSource.getStory(slug): Promise<PublishedStory | null>
```

From app/story/[slug]/page.tsx (current generateMetadata, to be extended, not replaced):
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getDataSource();
  const story = await data.getStory(slug);
  if (!story) return { title: "Story not found — Gavel News" };
  return {
    title: `${story.title} — Gavel News`,
    description: story.summary ?? story.whatHappened.slice(0, 160),
    openGraph: { title: story.title, description: ..., type: "article", publishedTime: story.publishedAt },
  };
}
```

Existing button styling pattern to match (from components/FavoriteButton.tsx — use the same `btn-press` utility class and token-based colors, not new hardcoded colors):
```typescript
className="btn-press inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium border-border-app bg-elevated/80 text-ink-2 hover:border-accent-border hover:bg-accent-soft hover:text-accent"
```
(ShareButton should use the brand tokens instead of "accent" — `hover:border-brand-border hover:bg-brand-soft hover:text-brand` — since "accent"/"brand" naming varies slightly across existing components; check app/tokens.css for the exact token names in scope and prefer `--brand*` tokens which are confirmed present.)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Site URL constant, metadataBase fix, richer generateMetadata, per-story OG image</name>
  <files>lib/site.ts, app/layout.tsx, app/story/[slug]/page.tsx, app/story/[slug]/opengraph-image.tsx, .env.example</files>
  <action>
Create `lib/site.ts` exporting `SITE_URL`: reads `process.env.NEXT_PUBLIC_SITE_URL`, strips any trailing slash, falls back to `"http://localhost:3000"` if unset — same env-fallback convention as `DATA_SOURCE=mock` in `.env.example`. Add a one-line comment explaining it's the single source of truth for `metadataBase`, canonical URLs, and share links (do not duplicate the fallback string elsewhere).

In `app/layout.tsx`: import `SITE_URL` from `@/lib/site` and change `metadataBase: new URL("http://localhost:3000")` to `metadataBase: new URL(SITE_URL)`. Do not touch any other part of the root metadata object or the rest of the file.

In `app/story/[slug]/page.tsx`'s `generateMetadata`: import `SITE_URL` from `@/lib/site`. Keep the existing early return for "not found". For the found-story branch, build `const url = \`${SITE_URL}/story/${story.slug}\`;` and extend the returned `Metadata` object (do not remove existing fields) to add: `alternates: { canonical: url }`; add `url: url` and `siteName: "Gavel News"` inside the existing `openGraph` object; add a top-level `twitter: { card: "summary_large_image", title: story.title, description }` (reuse the same `description` variable already computed for `description`/`openGraph.description` — extract it into a local `const description = story.summary ?? story.whatHappened.slice(0, 160);` once and reuse in all three places instead of repeating the ternary). Do NOT add an `openGraph.images` field manually — the sibling `opengraph-image.tsx` file convention (created below) supplies it automatically.

Create `app/story/[slug]/opengraph-image.tsx` (new file, Next.js file-convention for per-route OG images — same directory as `page.tsx`, so it applies to every `/story/[slug]` render): export `runtime = "edge"`, `alt = "Gavel News story preview"`, `size = { width: 1200, height: 630 }`, `contentType = "image/png"`. Default export `async function Image({ params }: { params: Promise<{ slug: string }> })`: await params, call `getDataSource()` and `data.getStory(slug)` (same data-access layer as `page.tsx` and `generateMetadata` — Next's file-convention functions run as independent renders and cannot share fetched data across files, so re-calling `getDataSource().getStory()` here is the correct/only pattern, not an ad-hoc fetch). If no story, fall back to generic "Gavel News" branding text so the route never errors. Import `ImageResponse` from `next/og` and `CATEGORY_META` from `@/lib/types`. Render a simple branded card: a flex column filling the 1200x630 canvas, background using the existing brand gradient literal (`linear-gradient(135deg, #7f1d1d 0%, #dc2626 55%, #b91c1c 100%)` — matches `--auth-hero-gradient` in `app/tokens.css`; CSS custom properties are not resolvable inside `ImageResponse`'s isolated renderer, so inline the literal gradient value with a comment noting it mirrors `--auth-hero-gradient`), white text, "Gavel News" wordmark top-left (~30px bold), the story's `CATEGORY_META[category].label` as a small uppercase kicker, and the story title as the large headline (~52px bold, truncate to 110 chars with an ellipsis so very long headlines don't overflow the canvas), with a small "Daily CLAT Current Affairs" footer line. Return `new ImageResponse(<the JSX>, { width: 1200, height: 630 })`.

Update `.env.example`: add a new documented section (after the existing "Data source" section, before "Supabase") for `NEXT_PUBLIC_SITE_URL`, explaining it drives `metadataBase`/canonical URLs/share links and defaults to `http://localhost:3000` in dev; set the example value to `http://localhost:3000`.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>`lib/site.ts` exports `SITE_URL`; `app/layout.tsx` and `app/story/[slug]/page.tsx` both import and use it (no more hardcoded `"http://localhost:3000"` literal in `app/layout.tsx`); `generateMetadata` returns `alternates.canonical`, `openGraph.url`, `openGraph.siteName`, and a `twitter` card block in addition to the existing fields; `app/story/[slug]/opengraph-image.tsx` exists, exports `runtime = "edge"` + `size` + `contentType`, and renders the story's category + title via `getDataSource()`; `.env.example` documents `NEXT_PUBLIC_SITE_URL`; `npx tsc --noEmit` passes with no errors.</done>
</task>

<task type="auto">
  <name>Task 2: ShareButton client component (Web Share API + clipboard fallback)</name>
  <files>components/ShareButton.tsx</files>
  <action>
Create `components/ShareButton.tsx` as a `"use client"` leaf component (per CLAUDE.md — interactive-only, no effect on the story page's server-rendering). Props: `{ title: string; url: string }`.

Behavior on click:
1. If `typeof navigator !== "undefined" && navigator.share` exists, call `await navigator.share({ title, url })` inside a try/catch. On success or on user cancellation (`AbortError` or any thrown error from `.share()`), do nothing further — do NOT fall through to the clipboard branch in this case (a user who cancels the native share sheet did not ask to copy the link instead; the clipboard path is only for browsers that lack Web Share API support at all).
2. Else (no `navigator.share` support), call `await navigator.clipboard.writeText(url)` inside a try/catch, and on success set a local `copied` state to `true`, resetting it to `false` after 2000ms via `setTimeout` (clear any prior timeout on repeated clicks so rapid clicking doesn't produce stale resets). On clipboard failure, fail silently (no crash, no unhandled rejection) — there is no further fallback per the task's explicit scope (Web Share + clipboard only, no third fallback UI).

Render a single `<button type="button">` styled with the existing `btn-press` utility class (see `components/FavoriteButton.tsx` for the exact pattern) plus token-based classes: `rounded-full border px-3.5 py-1.5 text-sm font-medium border-border-app bg-elevated/80 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand` (all tokens already defined in `app/tokens.css` — no new hardcoded colors). Label text: `"Copied!"` while `copied` is true, else `"Share"`. Include a small inline SVG share icon (standard three-node share glyph, `width="14" height="14"`, `stroke="currentColor"`, matching the sizing convention of `ArrowIcon`/`HeartIcon` in `components/StoryCard.tsx`/`components/FavoriteButton.tsx`) before the label. Set `aria-label="Share this story"` on the button.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>`components/ShareButton.tsx` exists, is a `"use client"` component accepting `{ title, url }`, uses `navigator.share` when present with no clipboard fallback on cancel, falls back to `navigator.clipboard.writeText` + a 2-second "Copied!" state when Web Share API is unsupported, is styled with existing `btn-press`/token-based classes (no new hardcoded colors), and `npx tsc --noEmit` passes with no errors.</done>
</task>

<task type="auto">
  <name>Task 3: Wire ShareButton into the story page header (right side)</name>
  <files>app/story/[slug]/page.tsx</files>
  <action>
In `app/story/[slug]/page.tsx`'s default export, locate the header actions `<div className="mt-6">` block (currently containing either the signed-in `FavoriteButton`/`CompleteButton`/email row, or the `<SignInGate>`). Change its className to `"mt-6 flex flex-wrap items-center justify-between gap-3"` and add `<ShareButton title={story.title} url={\`${SITE_URL}/story/${story.slug}\`} />` as a sibling after the existing conditional (signed-in block or `SignInGate`), so it renders in both branches, right-aligned via `justify-between` — this matches the same "single flex row, actions pushed to the far side" pattern already used in `components/AppShell.tsx`'s header row, rather than inventing a new floating/rail position (the sidebar `<aside>` further down the page is reserved for `PYQSidebar`/`RelatedStories` and is conditional on sign-in state, so it is not a reliable "always visible" anchor for Share). Import `ShareButton` from `@/components/ShareButton` and `SITE_URL` from `@/lib/site` at the top of the file alongside the other component imports. Do not change any other part of the header, body, or sidebar.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>`app/story/[slug]/page.tsx` imports and renders `<ShareButton>` inside the `mt-6` header actions row (now `flex flex-wrap items-center justify-between gap-3`), visible on the right side for both signed-in and signed-out visitors; `npx tsc --noEmit` passes with no errors; no other page markup changed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Story data → OG image renderer | `opengraph-image.tsx` reads the same public `published_stories`/mock story data already rendered on the page itself — no new trust boundary, same data that's already publicly served as a teaser per CLAUDE.md |
| Browser Web Share/Clipboard APIs | Client-side browser APIs invoked on explicit user click only; no data sent to any server, no new network boundary |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick260722-wgo-01 | Information Disclosure | app/story/[slug]/opengraph-image.tsx | accept | Renders only fields already publicly visible on the story page itself (title, category) — no gated/authenticated content (why-it-matters, key points) is ever included in the OG image |
| T-quick260722-wgo-02 | Tampering | components/ShareButton.tsx (clipboard/share API misuse) | accept | `url`/`title` are server-derived from the same story object already rendered on the page, not user-supplied input; no injection surface |
| T-quick260722-wgo-03 | Denial of Service | app/story/[slug]/opengraph-image.tsx (edge ImageResponse render cost) | accept | Static-ish per-story render, no loops over unbounded user input, title truncated to 110 chars before render |
</threat_model>

<verification>
1. `npx tsc --noEmit` passes with no errors across all three tasks.
2. `npm run dev` (or `pnpm dev`), visit any `/story/[slug]` page: confirm a "Share" button renders on the right side of the header actions row (both while signed out, seeing `SignInGate`, and signed in, seeing `FavoriteButton`/`CompleteButton`).
3. Click Share in a browser without Web Share API support (most desktop browsers): confirm the story URL is copied to the clipboard and the button label briefly reads "Copied!" before reverting to "Share".
4. Visit `http://localhost:3000/story/<any-mock-slug>/opengraph-image` directly in a browser: confirm it renders a 1200x630 PNG with "Gavel News" branding, the story's category, and its headline (not a blank/error page).
5. View page source (or React DevTools) on a story page and confirm `<meta property="og:title">`, `<meta property="og:image">`, `<meta name="twitter:card" content="summary_large_image">`, and `<link rel="canonical">` are all present and non-empty.
</verification>

<success_criteria>
- `lib/site.ts` centralizes `SITE_URL`; no hardcoded `localhost:3000` literal remains in `app/layout.tsx`.
- `app/story/[slug]/page.tsx` generateMetadata emits canonical URL, full OpenGraph fields (including `siteName`/`url`), and a Twitter card.
- `app/story/[slug]/opengraph-image.tsx` produces a real per-story branded PNG preview image via the Next.js file convention.
- `components/ShareButton.tsx` is a working client leaf component: Web Share API when supported, clipboard-copy + "Copied!" feedback otherwise.
- Share button is visible on the right side of every story page's header actions row, for both signed-in and signed-out visitors.
- `npx tsc --noEmit` passes with no errors after all three tasks.
</success_criteria>

<output>
Create `.planning/quick/260722-wgo-add-proper-share-button-for-story-pages-/260722-wgo-SUMMARY.md` when done
</output>
