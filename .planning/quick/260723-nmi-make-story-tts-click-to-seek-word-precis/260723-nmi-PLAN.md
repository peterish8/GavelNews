---
quick_id: 260723-nmi
status: planned
---

# Quick Task 260723-nmi: Make story TTS click-to-seek word-precise instead of sentence-precise

**Created:** 2026-07-23

## Problem

`components/StoryReader.tsx`'s article click handler resolves the clicked
position with `clickToTextOffset()` (word/char accurate, via
`caretRangeFromPoint`), but then calls `snapToSentenceStart(full, localOffset)`
before `playFrom(start)`. That snaps playback back to the start of whatever
sentence contains the click — so a click on a specific word starts speech from
the beginning of its sentence, not from that word.

`seekPct()` and `speakFromOffset()` already use `snapToWordStart()`, so the
click path is the only place with sentence-level snapping.

## Task

1. In the article `onClick` handler (`components/StoryReader.tsx`, click
   handler bound in the effect around line ~1018-1059), replace
   `snapToSentenceStart(full, localOffset)` with
   `snapToWordStart(full, localOffset)`.
   - Files: `components/StoryReader.tsx`
   - Action: swap the snap helper used before `playFrom(start)`
   - Verify: `grep -n "snapToSentenceStart\|snapToWordStart" components/StoryReader.tsx`
   - Done: click handler calls `snapToWordStart`, not `snapToSentenceStart`

2. Check whether `snapToSentenceStart` is still referenced anywhere else in
   the file. It was only used in this one call site (`seekPct` and
   `speakFromOffset` already use `snapToWordStart`). If it has no remaining
   callers, delete the now-dead `snapToSentenceStart` function definition.
   - Files: `components/StoryReader.tsx`
   - Action: remove unused function if dead
   - Verify: `grep -n "snapToSentenceStart" components/StoryReader.tsx` returns nothing (or only a definition if still referenced)
   - Done: no unused function left behind; `pnpm exec tsc --noEmit` (or project lint) has no new errors from this change

## Must-haves

- truths: Clicking a word starts TTS from that word, not from the start of its sentence.
- artifacts: components/StoryReader.tsx
- key_links: highlightWordAtOffset, activeBlockRef pause/resume-on-same-block logic, chunking (chunkArticleText) — all untouched by this change
