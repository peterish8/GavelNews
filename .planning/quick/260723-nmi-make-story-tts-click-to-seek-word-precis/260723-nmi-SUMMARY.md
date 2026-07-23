---
quick_id: 260723-nmi
status: complete
---

# Quick Task 260723-nmi Summary

**Description:** Make story TTS click-to-seek word-precise instead of sentence-precise

**Completed:** 2026-07-23

## What changed

`components/StoryReader.tsx`'s article click handler used
`snapToSentenceStart()` before starting playback, which snapped the TTS
cursor back to the start of the clicked sentence rather than the clicked
word. Replaced with `snapToWordStart()` so clicking any word starts speech
from that exact word (matching what `seekPct()` and `speakFromOffset()`
already did). Removed the now-unused `snapToSentenceStart()` function.

## Verification

- `grep -n "snapToSentenceStart" components/StoryReader.tsx` → no matches (fully removed)
- `pnpm exec tsc --noEmit` → no errors
- `highlightWordAtOffset`, chunking (`chunkArticleText`), and the
  `activeBlockRef` pause/resume-on-same-block logic were untouched.

## Files touched

- `components/StoryReader.tsx`
