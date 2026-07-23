---
quick_id: 260723-pos
status: complete
---

# Quick Task 260723-pos Summary

**Description:** Redesign per-story OG image into a newspaper-masthead layout (masthead bar, brand panel + headline row, dark footer bar) inspired by a reference screenshot, in Gavel News fonts/brand

**Completed:** 2026-07-23

## What changed

`app/story/[slug]/opengraph-image.tsx` rebuilt from a single centered
masthead card into a three-band newspaper layout:

1. **Masthead bar** — brand-mark badge (brand-soft rounded square with the
   gavel-shield glyph) + "Gavel News" nameplate on the left, edition date
   (mono, uppercase, muted) on the right, hairline rule below.
2. **Body row** — a 300×300 brand-gradient panel (same colors as the
   `--brand-blend` token, same shield/checkmark path as the site's real
   `Logo` component) stands in for the reference's photo slot — there's no
   per-story photography in `PublishedStory` to use, and a fake `<div>`
   photo placeholder would be exactly the AI-slop pattern flagged earlier
   in this session. Category kicker + headline + (when `story.summary`
   exists) a short dek sit to the right.
3. **Footer bar** — full-width dark (`#130F2A`, matching `--ink`) bar with
   "Gavel News" in white serif bold and the site domain (derived from
   `SITE_URL`, protocol stripped) in muted mono, mirroring the reference's
   dark site-info footer.

Font loading (Google Fonts CSS2 API, sans-serif fallback on fetch failure),
edge runtime, and title truncation are all unchanged in mechanism — only
extended to also account for the new dek text and date/domain strings in
the font subset text.

## Verification

- `pnpm exec tsc --noEmit` → no errors.
- Fetched `http://localhost:3000/story/governor-article-200-pocket-veto/opengraph-image`
  from the running dev server (HTTP 200, ~74KB PNG) and viewed the actual
  rendered image — confirmed all three bands render correctly: masthead
  with logo/name/date/rule, brand panel + kicker "CONSTITUTIONAL LAW" +
  headline + dek, dark footer with "Gavel News" + domain.

## Files touched

- `app/story/[slug]/opengraph-image.tsx`
