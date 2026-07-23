---
quick_id: 260723-oan
status: planned
---

# Quick Task 260723-oan: Markdown rendering for story body content

**Created:** 2026-07-23

## Problem

User: "also the news inside showing text instead i wnat it to support .md !
markdown! ... so we can give pointers bolds and so much more!"

`app/story/[slug]/page.tsx` rendered `whatHappened`, `background`,
`whatCourtHeld`, `whyItMatters`, and each `keyPoints[].text` as literal text —
split on `"\n\n"` into `<p>` tags with no inline formatting. The engine repo
(`gavel-news`, admin + Claude Code) produces this content daily; there was no
way for it to express bold, bullet points, or links.

## Task

1. Add `react-markdown` (10.1.0) + `remark-gfm` (4.0.1) as dependencies.
   No markdown library existed in `package.json` before this.
2. Create `components/Markdown.tsx`: thin wrapper around `ReactMarkdown` +
   `remarkGfm` (bold/italic/links/lists/tables/strikethrough support). Takes
   an `inline` prop that strips the wrapping `<p>` (via `disallowedElements`
   + `unwrapDisallowed`) for short single-line content nested inside an
   existing block element (key points inside `<li>`).
3. `app/story/[slug]/page.tsx`: replace the `.split("\n\n").map(para => <p>)`
   pattern for `whatHappened`, `background`, `whatCourtHeld`, `whyItMatters`
   with `<Markdown>{story.field}</Markdown>`. Replace
   `keyPoints.map(kp => <li>{kp.text}</li>)` with
   `<li><Markdown inline>{kp.text}</Markdown></li>`.
4. `app/globals.css` `.prose-article`: add `ol` styling (mirrors existing
   `ul`), `li > p` margin (so a paragraph-wrapped list item doesn't add extra
   space), `code` (inline code — mono font, subtle background pill), and
   `blockquote` (left border + italic) — remark-gfm can produce all of these
   even though only bold/lists were explicitly requested.
5. Verify:
   - `pnpm exec tsc --noEmit`
   - Render `Markdown` via `react-dom/server`'s `renderToStaticMarkup` in a
     throwaway script to confirm `**bold**`, lists, and links produce the
     expected `<strong>`/`<ul><li>`/`<a>` tags, and that `inline` mode strips
     the `<p>` wrapper. Delete the script after.
   - Hit a real story page through the running dev server (curl) to confirm
     the Next.js/RSC bundle actually renders react-markdown without a 500 or
     error boundary (tsc alone doesn't catch bundler/ESM issues).

## Must-haves

- truths: story body fields support markdown (bold, italic, links, bulleted
  and numbered lists, tables, strikethrough via GFM); key points render
  inline without an extra paragraph wrapper.
- artifacts: components/Markdown.tsx, app/story/[slug]/page.tsx,
  app/globals.css, package.json, pnpm-lock.yaml
