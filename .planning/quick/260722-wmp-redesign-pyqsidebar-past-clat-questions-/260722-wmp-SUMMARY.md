---
quick_id: 260722-wmp
status: complete
date: 2026-07-22
---

# Quick Task 260722-wmp: Redesign PYQSidebar (Past CLAT questions box)

## Result

Widened the story-page sidebar column from 280px to 360px (`app/story/[slug]/page.tsx`) and redesigned `components/PYQSidebar.tsx`: bigger header (icon `size-7`→`size-9`, heading `text-xs`→`text-sm`, keyword subtitle moved under the heading instead of a separate paragraph), per-question numbered circular badges replacing plain `{i+1}.` text, `(CLAT YYYY)` extracted from each question string and shown as a separate pill instead of running inline with the question text, hover states and more padding on question cards, and a separator above the disclaimer footer.

Initially added `sticky top-20` so the box would stay visible longer while scrolling — this caused a real visual bug: `RelatedStories` (rendered right after it in the same `<aside>`) also gets `position: relative` from the shared `surface-hero` CSS class, so it painted on top of the sticky box during scroll, producing an overlapping/broken-looking stack (confirmed via user screenshot). Reverted to normal (non-sticky) flow per user's explicit follow-up ("let it scroll, no need to keep until last").

## Note on concurrent editing

A second Claude Code session was running in parallel in this same working directory, building a "share button" feature (quick task 260722-wgo) that also touched `app/story/[slug]/page.tsx`. My uncommitted edits were briefly absorbed into that session's commits since we share a working tree; when I went to commit this task's changes, `app/story/[slug]/page.tsx` had a second, unrelated in-flight edit (h1 typography) sitting alongside mine. Used `git add -p` to stage only my grid-column-width hunk, leaving the other session's h1 change untouched for it to commit itself — avoided clobbering concurrent work.

## Verification

- `npx tsc --noEmit` — clean.
- Chrome DevTools MCP screenshots: confirmed bigger/richer box at rest, confirmed the sticky-overlap bug via screenshot, confirmed it's gone (scrolls away normally) after reverting sticky.

## Commit

- `3dfaa71` — feat: redesign Past CLAT Questions sidebar box
