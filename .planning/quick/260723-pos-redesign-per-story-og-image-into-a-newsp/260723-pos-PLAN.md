---
quick_id: 260723-pos
status: planned
---

# Quick Task 260723-pos: Newspaper-masthead OG image layout

**Created:** 2026-07-23

## Context

User shared a screenshot of a New Indian Express article + a Woxsen
University site-info footer, and asked for the OG image layout to follow
that structure — "in our way fonts and stuffs just layout alone like this
but for us and brand style." Reference has three parts: (1) a masthead bar
— logo + bold nameplate on the left, a date on the right, thin rule below;
(2) a photo-left / headline-right row; (3) a full-width dark footer bar with
site name (bold, white) + URL (muted).

`PublishedStory` (`lib/types.ts`) has no image/photo field — there is no
real per-story photography to put in the photo slot. Using a fake `<div>`
"photo" placeholder would be exactly the kind of AI-slop fake-screenshot
pattern flagged earlier this session, so the photo slot is replaced with an
intentional brand graphic panel (brand-red gradient + the same gavel-shield
mark used as the site logo) instead of pretending to be a photograph.

## Task

- Files: `app/story/[slug]/opengraph-image.tsx`
- Action: rebuild the layout into three horizontal bands:
  1. Masthead bar — brand-mark badge + "Gavel News" nameplate (serif,
     bold, large) on the left, edition date (mono, uppercase, muted) on
     the right, `border-bottom` rule.
  2. Body row — fixed-size brand gradient panel (reusing `--brand-blend`
     colors and the same shield/checkmark path as `components/Sidebar.tsx`'s
     `Logo`) on the left; category kicker + headline + (when available)
     the story's `summary` as a short dek on the right.
  3. Footer bar — full-width dark (`--ink`) bar with "Gavel News" in white
     serif bold on the left, the site domain (derived from `SITE_URL`,
     protocol stripped) in muted mono on the right.
  - Keep existing behavior: font loading via Google Fonts CSS2 API with a
    graceful sans-serif fallback if that fetch fails; title truncation;
    edge runtime.
- Verify:
  - `pnpm exec tsc --noEmit`
  - Fetch `http://localhost:3000/story/<slug>/opengraph-image` from the
    running dev server, save the PNG, and view it to confirm the layout,
    proportions, and text all render correctly (not just that it returns
    200).

## Must-haves

- truths: OG image has a masthead bar (logo+name+date+rule), a body row
  (brand panel + kicker/headline/dek), and a dark footer bar (brand name +
  domain) — matching the reference's structure in Gavel News' own fonts/
  colors, with no fake photo placeholder.
- artifacts: app/story/[slug]/opengraph-image.tsx
