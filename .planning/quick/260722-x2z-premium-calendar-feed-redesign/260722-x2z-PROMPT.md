# Standalone execution prompt — hand this to another AI coding agent

Project root: `c:\Users\nithy\Desktop\.website-production\gavel-news-web` (Next.js 15.1.4 App Router, React 19, TypeScript 5.7.3, Tailwind CSS 4 with no `tailwind.config.js` — CSS-first tokens in `app/globals.css` / `app/tokens.css`, package manager `pnpm`).

## Task

Redesign date-browsing on this site (`/archive`) into a big, premium, "cute" interactive calendar:

1. A large month-grid calendar (not a small widget) where every date cell that has a published news edition shows a small numeric badge with how many articles/stories were published that day. Dates with nothing published are visibly dimmed and not clickable.
2. Clicking a date with stories reveals that day's news as a **dense, Twitter/X-style feed** — a vertical list of compact rows (headline + one-line teaser + small meta line), not big cards — directly on the page, no full navigation/reload.
3. Clicking any individual story in that feed opens the **existing** full article page at `/story/[slug]` — do not build a new article page, it already exists and must stay untouched.
4. The whole thing should feel premium and polished: generous spacing, soft rounded corners, brand-colored accents, subtle hover/tap motion, smooth panel transitions — not a bare HTML calendar.

This is purely a **presentation-layer** feature. Do not touch `lib/data/`, `lib/types.ts`, `lib/editions.ts`, or any Supabase/data-source code — the existing `getDataSource().getArchive()` function already returns everything needed:

```ts
// lib/types.ts
interface PublishedStory { id: string; editionDate: string; slug: string; title: string; category: Category; examTags: Exam[]; readingTimeMin: number; summary?: string; decision: "must_cover" | "maybe"; /* ...more fields, see file */ }
interface Edition { date: string; stories: PublishedStory[] }
interface ArchiveMonth { month: string; label: string; editions: Edition[] }
```
`getDataSource().getArchive()` returns `ArchiveMonth[]`, newest month first. `Edition.stories.length` is your per-date article count.

## Files to read first (do not skip — match existing conventions exactly)

- `app/archive/page.tsx` — current page: fetches `getDataSource().getArchive()` and renders a plain flat month-by-month list of edition link-cards. **Keep this exact fetch and keep this exact existing JSX block lower on the page** (as a no-JS/SEO fallback) — you are adding the calendar *above* it, not replacing it.
- `app/edition/[date]/page.tsx` — existing per-date page using `<FeedView>` (magazine/lead+rail layout). Do not modify. Link out to it from the new feed panel as a secondary "View full edition" CTA.
- `app/story/[slug]/page.tsx` — the existing full article page. Do not modify. This is what story rows in the new Twitter-style feed must link to (`/story/${story.slug}`).
- `components/FeedView.tsx` — see the prev/next-edition button styling (`btn-press`, rounded-full, border-border-app) to mirror for calendar month-nav buttons.
- `components/StoryCard.tsx` — see the `rail` size variant (dense numbered row with category label + reading time + title) as the closest existing analog for the new feed rows; category pill styling here should be reused for the new feed's category tags.
- `components/TopNav.tsx` — "Archive" nav link already points to `/archive` and already matches `/edition/*` too — no nav changes are needed, `/archive` is already the entry point.
- `lib/format.ts` — reuse `formatDate()` and `formatReadingTime()`, don't reimplement date formatting.
- `lib/types.ts` — `CATEGORY_META` for category label/shortLabel/pill text.
- `app/globals.css` — reusable classes: `.glass-card`, `.surface-hero`, `.surface-standard`, `.surface-muted`, `.card-interactive`, `.btn-press`, and CSS variables `--brand`, `--brand-soft`, `--brand-border`, `--brand-blend`, `--ink`, `--ink-2`, `--ink-3`. **Compose the new UI from these existing tokens/classes only** — do not invent new hardcoded colors, so light/dark mode (`:root.dark`) keeps working automatically.
- Confirm `framer-motion` is a dependency (`package.json`) and check how it's already used elsewhere in the repo, then follow that same style for: the feed panel's mount/unmount transition (`AnimatePresence` + slide/fade), and a tap-scale (`whileTap={{ scale: 0.95 }}`) on calendar date cells.

## What to build

### 1. New component: `components/CalendarBrowser.tsx`

`"use client"` component, props `{ archive: ArchiveMonth[] }`.

- Build a `Map<string, Edition>` keyed by ISO date from the flattened archive, plus the sorted list of months that actually have editions (to clamp navigation — no dead empty months).
- State: `viewMonth` (which month is currently displayed — default to the month of the most recent edition, i.e. `archive[0]`), `selectedDate` (default to the single most recent edition date, so the feed panel is populated immediately on first render, not empty).
- **Month header**: centered "{Month} {Year}" label with prev/next chevron buttons (reuse the button visual language from `FeedView`'s prev/next-edition buttons). Disable/hide navigation past the oldest/newest month that has an edition.
- **Weekday row**: Sun–Sat abbreviations, small mono/uppercase/tracked labels, 7-column grid header.
- **Date grid**: standard 7-column month grid with correct leading/trailing blank cells so the 1st of the month aligns to its real weekday. Compute using UTC dates the same way `app/archive/page.tsx` already does (`new Date(\`${date}T00:00:00Z\`)`, `.getUTCDate()`, `timeZone: "UTC"`) to stay timezone-consistent with the rest of the app.
  - Cells must be **large** — this needs to visually read as "big premium calendar," not a compact sidebar widget. `aspect-square`, generous rounded corners (e.g. `rounded-2xl`), comfortably tap-sized.
  - **Has an edition**: an interactive `motion.button`, brand-tinted background/border when unselected (`bg-brand-soft` / `border-brand-border`), filled brand background + `ring-2 ring-brand` when selected. Day number displayed. A small circular count badge pinned to a corner (absolute-positioned, `bg-brand`, white/on-accent text, tiny bold number = `edition.stories.length`). Hover: gentle scale/shadow lift. Tap: `whileTap={{ scale: 0.95 }}`. `aria-label="{formatted date} — {n} stories"`, `aria-pressed={selectedDate === date}`.
  - **No edition**: plain muted day number, `disabled`, no hover, no badge, `cursor-default`.
- **Selected-day feed panel**, rendered below the grid only when `selectedDate` has a matching edition (wrap in `AnimatePresence` for a smooth slide/fade transition when the selection changes):
  - Small header: formatted selected date, story count, and a secondary-styled "View full edition →" link to `/edition/${selectedDate}`.
  - **Twitter/X-style dense feed** — a vertical list of thin rows (`divide-y`) inside a card container (`surface-standard` or `glass-card`), *not* the big `StoryCard` cards. Each row is a `<Link href={\`/story/${story.slug}\`}>` and shows: a small category pill (`CATEGORY_META[story.category].shortLabel`, styled like the pills already used in `StoryCard`), the story title (bold, 1 line, truncated), a 1-line teaser under it if `story.summary` exists (muted, `line-clamp-1`), and a small meta line (`formatReadingTime(...)`, plus a "Must cover" tag only if `story.decision === "must_cover"`). Mirror the existing hover treatment used on `StoryCard`'s dense/rail rows.
- Keep everything in this one new file — no other new files, no `lib/` changes.

### 2. Update `app/archive/page.tsx`

- Keep the existing `getDataSource().getArchive()` call and the entire existing month-list JSX exactly as it is today — it moves further down the page, unchanged, as a plain-link fallback.
- Import and render `<CalendarBrowser archive={archive} />` between the page's existing `<header>` and the existing list `<div className="space-y-12">…</div>`.
- Add a small section label above the existing list (same visual pattern as other `font-mono uppercase tracking-[0.18em] text-ink-3` section labels elsewhere in the codebase, e.g. `FeedView`'s internal `SectionLabel`), something like "All editions" / "Browse as list", so it clearly reads as calendar-first, list-as-fallback.
- No other changes to this file.

## Acceptance criteria (verify all of these before calling it done)

1. `npx tsc --noEmit` passes with no new errors.
2. `pnpm dev` → `/archive` shows a big month-grid calendar above the existing list. On first load, the most recent published date is pre-selected and its stories already show in the feed panel below the calendar.
3. Every date with a published edition shows a numeric article-count badge and is clickable/keyboard-focusable; dates with nothing published are visibly dimmed and non-interactive.
4. Clicking a different in-range date updates the feed panel in place — no full page navigation, no reload.
5. Clicking a story row in the feed panel goes to the existing, unmodified `/story/[slug]` full article page.
6. The "View full edition" link goes to the existing, unmodified `/edition/[date]` page (`FeedView` magazine layout).
7. Prev/next month buttons are disabled or hidden once you'd navigate past the oldest/newest month that actually has a published edition.
8. The original plain-link edition list still renders below the calendar, unchanged, and every link in it still works.
9. Check both light and dark mode — everything should look correct in both since only existing CSS variables/utility classes are used, no new hardcoded colors.
10. `lib/data/`, `lib/types.ts`, and `lib/editions.ts` are untouched — this was a UI-only change.

Do not add authentication gating, new routes, or nav changes — `/archive` is already the correct, already-linked entry point. Do not delete or rewrite the existing archive list markup — only add the calendar above it.
