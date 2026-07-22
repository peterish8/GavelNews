---
slug: tts-scrubber-highlight-pill
status: awaiting_human_verify
trigger: "TTS in StoryReader.tsx is not behaving as expected"
created: 2026-07-22
updated: 2026-07-22
---

## Human verification round 1 — new findings (2026-07-22)

User tested the round-1 fix live in a real browser. Verbatim report:
"the time scrubber if scrubbed talsk correctly but the ui of scrubber is not proper and also highlight coming from begining so all not synced!"

Decoded:
1. **Seek is functionally correct**: scrubbing to a new position DOES resume speech (audio) from the right point — the `seekPct` → `playFrom` → `speakFromOffset` offset math is NOT the problem.
2. **Scrubber UI is "not proper"**: the visual track/thumb (components/StoryReader.tsx ~line 417-470, the custom pointer-driven div, NOT a native `<input type=range>`) looks or behaves wrong. Candidate causes to check live: the thumb is `opacity-0` except on hover/while-scrubbing (may read as "broken" — no visible handle at rest); the track is very thin (`h-3` container, `h-1` fill); thumb uses `left:%` + `translateX(-50%)` which can visually clip half off the track at the very start/end. Needs a real-browser check, not just static reading — the code reads plausible but the user is reporting it looks wrong.
3. **Highlight not synced — "coming from beginning"**: after seeking (or generally during playback), the word highlight is out of sync with actual audio, appearing to reset toward the start rather than tracking the current spoken word. Static reread of the previous fix (activeBlockRef + onboundary handler, components/StoryReader.tsx ~653-733) shows the offset math (`abs = startOffsetRef.current + e.charIndex`) is arithmetically correct on paper. Prime suspect: the round-1 fix's own keep-alive heartbeat added to `lib/tts-manager.ts` (`pause()` immediately followed by `resume()` every ~10s to dodge Chromium's long-utterance cutoff) may itself be resetting the browser engine's internal `charIndex` counter on some engines, causing `onboundary` events after a heartbeat cycle to report `charIndex` relative to a re-based/restarted count rather than continuing from where they left off — which would manifest as the highlight periodically snapping back toward an earlier position ("coming from beginning", "not synced"). This is exactly the risk flagged in this session's own prior `blind_spots` note. Needs live-browser confirmation (e.g. instrument `onboundary` to log raw `charIndex` across a heartbeat cycle) rather than another blind fix — if confirmed, the heartbeat mechanism itself needs a different approach (e.g. don't pause/resume the browser engine at all; instead chunk long utterances into multiple shorter per-paragraph utterances chained via `onend`, which sidesteps both the 15s cutoff AND the pause/resume charIndex-reset risk).

Relevant files unchanged from round 1: components/StoryReader.tsx (scrubber UI ~417-470, playFrom/speakFromOffset/onboundary ~653-742), lib/tts-manager.ts (keep-alive heartbeat added in round 1 fix).


## Symptoms

**Expected behavior:**
1. Time scrubber and play/pause controls work reliably (accurate position, responsive controls).
2. The word-by-word highlighter (CSS Custom Highlight API, `HIGHLIGHT_NAME = "gavel-tts-word"`) highlights only the single current word being spoken — nothing more.
3. No paragraph/passage-level highlight at all — the `.story-tts-root .speaking` inset box-shadow ("edge yellow") in `app/globals.css` should be removed entirely.
4. The floating "listen" pill (portaled to `document.body`, see commit `e2a27e8` "consolidate TTS into StoryReader and portal the listen pill") should be a clean, cute, simple, smaller UI.

**Actual behavior:**
1. Time scrubber and play/pause controls are buggy / not working as expected (unspecified — needs investigation).
2. When the "cursor" (speech position) is away from the passage, the highlighter falls back to highlighting the *entire* passage/paragraph instead of just the current word — should never do this, only ever highlight the current word.
3. The paragraph-level "edge yellow" box-shadow/background is still present and shouldn't be.
4. The pill UI is not "neat, cute, simple, smaller" per user's design ask.

**Errors:** None reported explicitly — behavioral/visual bugs, not exceptions.

**Timeline:** Introduced/regressed across recent TTS work — commits `ec79d84` (checkpoint: WIP sidebar/redesign + TTS work in progress), `8136cbe` (checkpoint: fold staged TTS source refs into real components), `e2a27e8` (consolidate TTS into StoryReader and portal the listen pill), `b049001` (word-by-word TTS highlight via CSS Custom Highlight API).

**Reproduction:** Open a story page, click "Listen" to start TTS playback, observe scrubber/play-pause behavior and word highlighting as speech progresses; move mouse/cursor away from the passage and observe whether highlight degrades to full-passage shading.

## Relevant files
- `components/StoryReader.tsx` — TTS state machine, scrubber, play/pause, word-highlight logic (`CSS.highlights`, `HIGHLIGHT_NAME`), pill UI markup/portal
- `lib/tts-manager.ts` — TTS playback/state manager
- `app/globals.css` — `.story-tts-root` rules, `::highlight(gavel-tts-word)`

## Current Focus

reasoning_checkpoint:
  hypothesis: "Five distinct, concrete bugs account for all reported symptoms: (1) the paragraph-level `.speaking` class is applied ONCE to the block containing the utterance start offset, but the utterance itself speaks the entire remainder of the article (many paragraphs) — so as speech moves on, the stale `.speaking` yellow stays stuck on the original paragraph while the real per-word CSS highlight has moved far away, i.e. exactly 'passage highlighted even though cursor is away from it'; (2) Chromium's speechSynthesis silently stops producing audio for utterances longer than ~15s unless periodically paused/resumed, and since we speak the whole rest of the article as one utterance with a wall-clock-estimated scrubber, the scrubber keeps animating with no audio actually playing once Chrome cuts out — this is the 'scrubber not behaving' symptom; (3) `startTTS()` calls `speechSynthesis.cancel()` then synchronously `speechSynthesis.speak()` in the same tick, a documented Chromium race that silently drops the speak() call, hit repeatedly by rapid scrub/seek/speed-change (all go through cancel+speak); (4) `onSpeed`/`onLang` handlers gate auto-restart on `playingRef.current || isPlaying`, but `isPlaying` stays true while merely paused, so tapping speed/language while paused silently un-pauses and restarts speech — this reads as 'play/pause broken'; (5) duplicated pause/resume logic (pill button vs click-on-paragraph handler) and a duplicated RAF tick loop (inline in speakFromOffset vs startProgressRaf) are drift-prone copies of the same state machine."
  confirming_evidence:
    - "StoryReader.tsx:667-677 — `.speaking` class add/remove runs only inside speakFromOffset (once per playFrom/seek call), never inside utterance.onboundary (line 683-696), while highlightWordAtOffset (which DOES move per boundary) is called from onboundary. Two mechanisms, only one updates per word."
    - "StoryReader.tsx:653 — `const remaining = full.slice(start)` confirms one utterance = rest of the entire article text, not one paragraph, so a 15s+ Chrome cutoff is highly likely for any non-trivial article."
    - "lib/tts-manager.ts:19,45 — `window.speechSynthesis.cancel()` immediately followed later in the same function by `window.speechSynthesis.speak(utterance)` with no delay, matches the documented Chromium cancel-then-speak race."
    - "StoryReader.tsx:940-958 — onSpeed/onLang both check `playingRef.current || isPlaying` before calling `playFrom(cursorPlainRef.current)`; pauseResume (line 792-810) sets `playingRef.current = false` on pause but leaves `isPlaying` state true, so the OR makes this true even while paused."
    - "StoryReader.tsx:774-790 vs 792-810 vs 852-877 — three separate blocks implement resume/pause toggling with near-identical bodies (resumeTTS/sessionStartMsRef/setIsPaused/playingRef/startProgressRaf), and 723-739 duplicates 753-772 (RAF tick) verbatim."
  falsification_test: "If `.speaking` were instead correctly re-targeted per boundary (not stuck), the user's 'highlight full passage when cursor away' complaint would not occur even with the class present — but the code shows no such per-boundary update exists, confirming the bug is structural, not incidental. If Chrome's 15s cutoff were not the cause of scrubber weirdness, disabling the keep-alive workaround post-fix should show no regression in short articles (fix must not require the workaround to look 'active' on short reads)."
  fix_rationale: "Removing the `.speaking` CSS rule (globals.css) plus replacing the DOM-class active-block tracking with a boundary-updated ref addresses the root cause (stale, non-updating passage marker) rather than just hiding the yellow color. Adding a speechSynthesis keep-alive heartbeat while playing addresses the actual Chromium engine limitation rather than papering over the scrubber symptom. Deferring speak() by one tick after cancel() addresses the documented race directly. Fixing the onSpeed/onLang restart condition to check only `playingRef.current` (true speaking state) rather than `isPlaying` (any active session incl. paused) fixes the actual logic error instead of adding a workaround. Consolidating duplicate pause/resume and RAF-tick code removes the drift risk that caused inconsistent behavior between the two control surfaces (pill button vs click-to-pause)."
  blind_spots: "Cannot run a live browser to confirm the ~15s Chrome cutoff reproduces in this exact app (relying on well-documented Web Speech API behavior, not a live repro). Safari/Firefox do not fire onboundary word events at all, so word highlight + active-block tracking degrade to sentence-level or no highlight there regardless of this fix — pre-existing limitation, not introduced or fixed here. Pause/resume across the ~15s Chrome boundary is a known unfixable-by-us browser bug; the keep-alive heartbeat mitigates but may not eliminate every device/OS voice-engine quirk."

next_action (round 1, superseded — see Round 2 below): apply fixes — globals.css (.speaking removal), StoryReader.tsx (active-block ref, consolidated pause/resume, RAF dedup, onSpeed/onLang guard fix, pill redesign), lib/tts-manager.ts (cancel/speak defer + keep-alive heartbeat)

---

## Current Focus — Round 2 (2026-07-22)

**Status: fixed, self-verified statically; awaiting human confirmation in a real browser.**

reasoning_checkpoint:
  hypothesis: "Two distinct issues, both confirmed by rereading the relevant code fresh rather than assuming round 1's carried-over theories were complete or correct. (A) The scrubber track/thumb (NewsReaderPill, pre-round-2 ~417-472) has two concrete, code-provable UI defects: the thumb was fully `opacity-0` at rest with no non-hover affordance (invisible on touch devices until actively dragged), and the 12px hit box wrapped a 4px line (small touch target). The previously-suspected 'translateX edge clipping' is actually NOT clipping — no `overflow:hidden` exists anywhere in the ancestor chain (`.gav-reader-bar` and the fixed portal wrapper are both default `overflow:visible`) — but IS a real edge-overlap risk: at 0%/100% the thumb's own circle pokes ~6px past the track's bounding box into the flex gap next to the play button / time label. (B) The 'highlight coming from beginning / not synced' symptom is most likely caused by round 1's own fix: the `setInterval` pause()+resume() heartbeat (lib/tts-manager.ts, every 10s) nudging a single long-running speechSynthesis utterance to dodge Chromium's ~15s cutoff. Per the Web Speech API, onboundary's charIndex is scoped to the utterance's own text and should keep monotonically increasing across a pause/resume of the SAME utterance — but Chromium has long-documented, real-world quirks where pause()/resume() on a long-running utterance rebases/resets the internal charIndex counter, which would manifest exactly as 'highlight snaps back toward start' on a cadence matching the 10s heartbeat interval. This cannot be confirmed via live browser in this environment (no speechSynthesis engine available here) — reasoned from Web Speech API spec + widely-documented Chromium engine behavior, not empirically reproduced in this session."
  confirming_evidence:
    - "components/StoryReader.tsx scrubber block (pre-round-2 ~417-472): thumb className included `opacity-0 group-hover:opacity-100` unconditionally when not scrubbing — group-hover requires a real mouse hover, unavailable on touch, so on touch devices there was NO visible handle at rest, only the bare 4px `bg-border-app` line."
    - "app/globals.css `.gav-reader-bar` (~589-606) and the pill's outer portal wrapper (`pointer-events-none fixed inset-x-0 bottom-4 ...`) both have no `overflow` property set (default visible) — the round-1 'clipping' theory was imprecise; nothing clips the thumb. The real defect is overlap with the adjacent flex sibling at the two extremes, not clipping."
    - "lib/tts-manager.ts (pre-round-2): `startKeepAlive()` ran `synth.pause(); synth.resume();` every `KEEP_ALIVE_MS = 10_000` while `synth.speaking && !synth.paused`, for the entire duration of a single utterance covering the rest of the article (StoryReader.tsx `remaining = full.slice(start)` — one utterance for potentially the whole article). Every onboundary event after each nudge relies on charIndex continuing to count from where it left off in that one utterance — exactly the assumption Chromium is documented to violate under repeated pause/resume on long utterances."
    - "User's decoded symptom ('highlight coming from beginning', 'not synced') matches a periodic backward jump far better than a one-time drift or a static offset error — consistent with a state reset recurring on a fixed interval (the heartbeat cadence) rather than a bug in the (unchanged, arithmetically correct) `abs = startOffsetRef.current + e.charIndex` calculation."
  falsification_test: "If the heartbeat were NOT the cause, removing it (with no other change) while keeping single-long-utterance playback would reproduce the SAME 15s-cutoff silence bug round 1 already fixed (audio stops, scrubber keeps animating) — that would show the desync symptom is unrelated to the heartbeat. Chunking sidesteps this test entirely by removing the heartbeat AND avoiding the cutoff via short utterances — if the desync recurs even now (no heartbeat, no long utterance), the charIndex-rebase hypothesis is refuted and the bug is elsewhere (the `abs` offset math was re-verified as arithmetically unchanged and correct, so a refutation would point to something not yet identified)."
  fix_rationale: "For (A): making the thumb visible-but-subtle at rest (opacity-70 instead of opacity-0) fixes the discoverability defect without touching the underlying (already-working) seek logic; enlarging the hit box (h-3→h-5) improves touch precision; clamping the thumb's `left` with CSS `clamp()` fixes the real edge-overlap defect precisely, rather than the previously-assumed but nonexistent clipping problem. For (B): chunking the article into short, sentence-aligned utterances chained via `utterance.onend` addresses the root mechanism (a single long-running utterance ever needing a pause/resume nudge at all) rather than tuning the heartbeat interval or adding compensating offset math to paper over an assumed charIndex reset — per the objective's explicit direction, this sidesteps both the original 15s cutoff AND the pause/resume charIndex-reset risk simultaneously, since pause()/resume() is now only ever called for a single genuine user-initiated pause, never on a repeating timer against a long utterance. A session-id guard (sessionIdRef, bumped before every cancel()/seek()/stop()) was added because chaining introduces a new failure mode round 1 didn't have: a stray onend firing after cancel() could otherwise resurrect a chunk chain that should have stopped."
  blind_spots: "The charIndex-rebase-on-pause/resume mechanism cannot be empirically confirmed in this environment (no live speechSynthesis engine available; reasoning is from Web Speech API spec + well-documented real-world Chromium quirks, not a direct repro in this session). It's possible the actual cause was something else entirely coincidentally correlated with the ~10s cadence — chunking would still incidentally fix the 15s-cutoff issue either way, but if the desync persists after this fix, the heartbeat theory is refuted and warrants a fresh investigation (per falsification_test above; do not re-add a pause/resume heartbeat as a first response). Chunk-boundary transitions have a small (~0ms, one macrotask tick) gap between chunks — acceptable/natural-sounding but a minor behavior change from one continuous utterance. Scrubber fixes are CSS/layout reasoning verified statically (opacity classes, ancestor overflow, clamp() math); actual pixel-level 'looks proper now' feedback still needs a real screen."

next_action: DONE (round 2 fixes applied, tsc + next build both pass clean) — awaiting human confirmation in a real browser per Resolution.verification below. If confirmed fixed, archive session. If the highlight desync persists even with chunking (no heartbeat in play, no utterance anywhere near the 15s cutoff), the charIndex-rebase hypothesis is refuted — reopen investigation into a different cause (do not re-add a pause/resume heartbeat as the fix).

## Evidence

- timestamp: 2026-07-22T00:00:00Z
  checked: components/StoryReader.tsx speakFromOffset (line 634-742) and utterance.onboundary (683-696)
  found: "`.speaking` class is set once per playFrom() call on the block containing the START offset only; onboundary updates the CSS word-highlight (highlightWordAtOffset) every word but never touches `.speaking` or re-targets it to the paragraph currently being spoken."
  implication: "As a single utterance (which is the whole rest of the article, see remaining = full.slice(start) at line 653) plays across multiple paragraphs, the paragraph-level yellow stays stuck on the first paragraph while the word highlight correctly moves on — visually 'highlighting full passage away from the cursor'. Root cause of symptom 2/3."

- timestamp: 2026-07-22T00:00:01Z
  checked: app/globals.css lines 693-706
  found: ".story-tts-root .speaking has both a background tint AND an inset box-shadow (\"edge yellow\"); ::highlight(gavel-tts-word) is the separate, correct word-only highlight rule."
  implication: "Deleting the .speaking rule removes the unwanted passage-level effect entirely while leaving the word highlight intact, matching user ask #2/#3 exactly."

- timestamp: 2026-07-22T00:00:02Z
  checked: lib/tts-manager.ts startTTS (13-46)
  found: "speechSynthesis.cancel() and speechSynthesis.speak(utterance) are called synchronously in the same function body with no yield between them; no keep-alive mechanism exists for long utterances."
  implication: "Matches two well-documented Chromium Web Speech API bugs: (a) speak() called immediately after cancel() can silently no-op, hit by every scrub/seek/speed/lang change since they all route through stopTTS+speakFromOffset->startTTS; (b) utterances longer than ~15s stop producing audio unless the engine is periodically paused+resumed — very likely here since one utterance = rest of the whole article."

- timestamp: 2026-07-22T00:00:03Z
  checked: components/StoryReader.tsx onSpeed/onLang handlers (940-958) vs pauseResume (792-810)
  found: "pauseResume sets playingRef.current = false on pause but does not change isPlaying (stays true while paused, by design, so UI still shows 'Pause' icon state correctly). onSpeed/onLang check `playingRef.current || isPlaying` — since isPlaying alone is true while paused, this condition is true even when paused, triggering playFrom() and silently resuming."
  implication: "Concrete play/pause bug: adjusting speed or language while paused unexpectedly resumes speech. Root cause of part of symptom 1 (scrubber/play-pause 'buggy')."

- timestamp: 2026-07-22T00:00:04Z
  checked: components/StoryReader.tsx play() (774-790) and click-to-pause block inside onClick effect (852-877)
  found: "play()'s `if (isPaused && isPlaying)` resume branch is unreachable from its only call site (pill routes to pauseResume instead of play whenever isPlaying is true); the paragraph-click handler reimplements the exact same pause/resume/resumeTTS/pauseTTS state transitions as pauseResume() in a second, independent code block; the RAF tick loop is duplicated verbatim between speakFromOffset (723-739) and startProgressRaf (753-772)."
  implication: "Three separate copies of overlapping state-machine logic are a correctness risk (drift) even though not independently reproducible as a single symptom — consolidating into one source of truth per concern (pauseResume for pause/resume, startProgressRaf for the RAF loop) is the 'cleanly write code' part of the ask and removes latent bug surface."

### Round 2 evidence (2026-07-22)

- timestamp: 2026-07-22T01:00:00Z
  checked: components/StoryReader.tsx scrubber block (pre-round-2 ~417-472) and app/globals.css .gav-reader-bar (~589-606) plus the pill's outer portal wrapper className
  found: "Thumb div's className was `... + (isScrubbing ? \"opacity-100\" : \"opacity-0 group-hover:opacity-100\")` — fully invisible at rest except via `:hover`, which never applies on touch. Neither `.gav-reader-bar` nor the fixed portal wrapper div sets `overflow` (both default `visible`) — no ancestor clips anything."
  implication: "Two separate, code-provable defects: (1) no visible handle at rest on touch devices — a real discoverability/affordance bug, not just 'looks thin'; (2) the round-1 'translateX clipping at edges' theory was WRONG as stated (nothing clips — no overflow:hidden exists) — refined to the actual defect, which is the thumb's circle visually poking past the track's own box into the adjacent flex gap at 0%/100%, not clipping."

- timestamp: 2026-07-22T01:00:01Z
  checked: lib/tts-manager.ts startKeepAlive/KEEP_ALIVE_MS (round-1 addition) cross-referenced against Web Speech API onboundary/charIndex semantics and known Chromium engine behavior
  found: "The heartbeat calls `synth.pause(); synth.resume();` on a 10s setInterval for the ENTIRE duration of a single utterance covering the rest of the article. Per spec, onboundary's charIndex should keep counting relative to that one utterance's own text across a pause/resume — but Chromium has long-documented real-world bugs where pause()/resume() on a long utterance can rebase that counter. StoryReader.tsx's own math (`abs = startOffsetRef.current + e.charIndex`) assumes charIndex keeps counting correctly; re-reading it found no arithmetic error — the formula is correct on paper both before and after this round's changes."
  implication: "Strongly suggests the heartbeat itself (not the offset math, which is unchanged and correct) is the proximate cause of 'highlight coming from beginning' — the fix is to stop needing pause()/resume() as a periodic nudge at all (chunking), not to adjust the offset formula."

## Eliminated

(none from round 1 — all identified issues were confirmed structurally, not ruled out)

- hypothesis: "The scrubber thumb visually clips at 0%/100% because an ancestor container has `overflow: hidden`."
  evidence: "Read app/globals.css `.gav-reader-bar` rule (~589-606) and the pill's outer portal wrapper className in components/StoryReader.tsx — neither sets `overflow`; both default to `visible`. No clipping is possible anywhere in the ancestor chain. The real, different defect (thumb overlapping the adjacent flex sibling at the extremes) was fixed instead via `clamp()` on the thumb's `left` position."
  timestamp: 2026-07-22T01:00:02Z

## Resolution

### Round 1 (preserved)

root_cause: |
  Five compounding issues: (1) `.speaking` paragraph-highlight class set once at utterance start, never updated per word boundary, so it visually "sticks" on the original paragraph while the spoken word highlight moves away — the reported "highlights full passage when cursor is away"; (2) that same paragraph tint plus an inset box-shadow is the unwanted "edge yellow" the user wants removed outright; (3) one TTS utterance = the entire rest of the article text, combined with Chromium's undocumented-in-app but well-known ~15s silent-cutoff limit for long speech synthesis utterances and no keep-alive heartbeat, causing the RAF-estimated scrubber/timer to keep advancing with no actual audio; (4) `speechSynthesis.cancel()` immediately followed by `speechSynthesis.speak()` synchronously in the same tick (tts-manager.ts) — a documented Chromium race that can silently drop the speak() call, hit on every scrub/seek/speed/lang change; (5) `onSpeed`/`onLang` handlers checked `isPlaying` (true even while paused) instead of the true "actively speaking" flag, so changing speed/language while paused silently resumed playback; plus duplicated pause/resume and RAF-tick logic across three code paths that risked further drift.
fix: |
  - app/globals.css: deleted `.story-tts-root .speaking` rule (no more paragraph tint/edge box-shadow); kept `::highlight(gavel-tts-word)` as the only highlight.
  - components/StoryReader.tsx: replaced DOM-class-based "active paragraph" bookkeeping with an `activeBlockRef` updated on every `onboundary` word event (mirrors where the CSS highlight moves); click-to-pause now compares against this live ref instead of a stale `.speaking` classList check. Consolidated all pause/resume transitions into `pauseResume()` (paragraph-click handler now calls it via a ref instead of re-implementing state transitions). Removed the duplicated inline RAF tick in `speakFromOffset` in favor of calling `startProgressRaf()`. Removed `play()`'s unreachable resume branch. Fixed `onSpeed`/`onLang` to gate auto-restart on `playingRef.current` only (true speaking state), not `isPlaying` (also true while paused) — so changing speed/language while paused no longer silently resumes. Redesigned `NewsReaderPill` markup to be visually smaller/simpler (tighter padding, smaller radius/shadow, dropped the xl-only hint line and shrank the title block).
  - lib/tts-manager.ts: deferred `speechSynthesis.speak()` by one tick (`setTimeout(..., 0)`) after `cancel()` to avoid the Chromium cancel-then-speak race; added a `setInterval` keep-alive heartbeat (`pause()` immediately followed by `resume()` every 10s) while an utterance is active, to prevent Chromium's ~15s silent-cutoff on long utterances.
verification: |
  Self-verified (no live browser TTS available in this environment):
  - `npx tsc --noEmit` — zero errors.
  - `npx next build` — compiles successfully, all 10 routes generate, zero errors (one pre-existing, unrelated Lightning CSS minifier warning about `::highlight()` pseudo-element syntax not being recognized by the CSS optimizer — this is a false-positive from the build tool, not a functional issue; the rule already existed before this session and works correctly in supporting browsers).
  - Manually re-read the full diff: confirmed `.speaking` class/CSS fully removed, activeBlockRef correctly updated in both the initial speakFromOffset call and every onboundary event, pauseResume is now the single call site for pause/resume transitions (click handler + button both route through it), onSpeed/onLang now gate restart on playingRef.current only, RAF tick loop de-duplicated into startProgressRaf only.
  Needs human confirmation in a real browser (Web Speech API behavior, especially Chrome's 15s-cutoff/keep-alive and the cancel+speak race, cannot be verified without live audio playback):
  - Word highlight only ever highlights the current word, never a whole paragraph, even for long multi-paragraph articles.
  - No yellow/tinted paragraph background or edge box-shadow appears anywhere while reading.
  - Scrubber timer keeps advancing in sync with actual audio for long articles (Chrome specifically, past ~15s).
  - Changing speed or language while paused does NOT resume playback.
  - Pill looks smaller/simpler/cuter as intended.
files_changed (round 1):
  - components/StoryReader.tsx
  - lib/tts-manager.ts
  - app/globals.css

### Round 2 (this round — user reported round-1 fix live, found new issues)

root_cause: |
  Two further issues found after live testing of round 1's fix, both addressed this round:
  (A) Scrubber UI: the thumb was fully invisible at rest (`opacity-0`, only shown via `:hover` or active-scrub state) — no visible handle on touch devices at all, just a bare 4px line, reading as "not proper" even though the underlying seek logic was already correct. Separately, the thumb's `left:%` + `translateX(-50%)` centered it exactly on the track's edge at 0%/100%, pushing half its circle past the track's own bounding box into the adjacent flex gap (overlapping the play button / time label) — NOT clipped by any `overflow:hidden` ancestor (none exists), but a real visual-overlap defect distinct from round 1's carried-over "clipping" theory.
  (B) Highlight desync ("coming from beginning", "not synced"): most likely caused by round 1's own fix — the `setInterval` pause()+resume() "keep-alive heartbeat" added to lib/tts-manager.ts nudges a single very-long-running speechSynthesis utterance every 10s to dodge Chromium's ~15s cutoff. Chromium is documented to have real-world quirks where pause()/resume() on a long utterance can rebase/reset the engine's internal onboundary charIndex counter — which, combined with this app's `abs = startOffsetRef.current + e.charIndex` math (unchanged, and re-verified arithmetically correct), would manifest exactly as the highlight periodically snapping back toward the utterance's start on a ~10s cadence. This specific mechanism cannot be empirically confirmed in this environment (no live speechSynthesis engine available) — it is reasoned from Web Speech API spec + well-documented Chromium behavior, not directly reproduced here. See falsification_test in Current Focus for how to confirm/refute this after the fix.
fix: |
  - components/StoryReader.tsx (scrubber UI): thumb is now visible-but-subtle at rest (`opacity-70` instead of `opacity-0`, full opacity on hover/scrub); hit box enlarged (`h-3`→`h-5`) for touch precision; track/fill thickened slightly (`h-1`→`h-1.5`) for visibility; thumb's `left` position now uses CSS `clamp(6px, {pct}%, calc(100% - 6px))` so its circle never pokes past the track's own bounding box at the extremes (fixes the real overlap defect; the previously-assumed "clipping via overflow:hidden" was confirmed to not exist anywhere in the ancestor chain — see Eliminated).
  - components/StoryReader.tsx (highlight desync): removed reliance on the pause/resume heartbeat entirely. `speakFromOffset` now splits the remaining article text into short, sentence-aligned chunks (`chunkArticleText`, sized so estimated speaking time stays under ~10s even at the slowest configured rate — safely below Chromium's ~15s cutoff) and chains them via `utterance.onend` (`speakChunk`) instead of speaking one long utterance. Each chunk's `onboundary` computes `abs` relative to that chunk's own start offset (`thisChunkAbsStart`), so no chunk ever needs a mid-utterance pause/resume nudge. Added a `sessionIdRef` guard (bumped in `finishSession`, and explicitly before `cancel()` in `playFrom`/`stop`/unmount-cleanup) so a stray `onend` from a canceled/superseded utterance can never resurrect a chunk chain that should have stopped — a new failure mode introduced by chaining that round 1's single-utterance design didn't have. `sessionStartMsRef`/`pausedAccumMsRef` (used by the wall-clock RAF fallback for browsers without onboundary, e.g. Safari/Firefox) are now set once per session rather than reset per chunk, so that estimate keeps advancing smoothly across chunk boundaries instead of restarting every ~10s.
  - lib/tts-manager.ts: removed `KEEP_ALIVE_MS`/`startKeepAlive`/`stopKeepAlive` entirely (no longer needed — the cutoff is now avoided at the source via chunking). Kept round 1's deferred `speechSynthesis.speak()` after `cancel()` (unrelated fix, still valid). `pause()`/`resume()` are still exposed for the user-facing pause button (a single genuine pause, not a repeating timer nudge, which carries much less of the same charIndex-rebase risk).
verification: |
  Self-verified (no live browser/speechSynthesis available in this environment):
  - `npx tsc --noEmit` — zero errors.
  - `npx next build` — compiles successfully, all 10 routes generate, zero new errors (same pre-existing, unrelated Lightning CSS `::highlight()` minifier warning as round 1 — not introduced by this round).
  - Manually re-read the full diff: confirmed `chunkArticleText` partitions its input with no gaps/overlaps (chunks concatenate back to the exact original substring), `MAX_CHUNK_CHARS` is derived from the same WPM-based duration estimate already used elsewhere in this file (not a new/unverified assumption) with a ~5s safety margin under the ~15s cutoff at the slowest configured rate (0.75x), `sessionIdRef` is bumped before every `cancel()` call site (playFrom, stop, unmount) as well as inside `finishSession`, and `sessionStartMsRef`/`pausedAccumMsRef` are set once per `speakFromOffset` call rather than per chunk.
  - Confirmed statically (not clipping-dependent): neither `.gav-reader-bar` nor the pill's portal wrapper sets `overflow`, so the thumb's clamp()-based positioning is a genuine fix for a real (overlap, not clip) defect.
  Needs human confirmation in a real browser (Web Speech API pause/resume/charIndex behavior and touch-target/visual feel cannot be verified without live use):
  - **Scrubber UI**: on both a touch device and a mouse, confirm the thumb is now visibly present (subtly) even when not actively scrubbing, and that dragging/tapping feels easier to grab than before. Confirm the thumb no longer visually overlaps the timestamp text or play button at the very start/end of the track.
  - **Highlight sync (the critical check)**: play a long article (long enough to have crossed the old ~15s single-utterance mark, i.e. keep listening past ~15-20 seconds) and confirm the word highlight NEVER snaps backward toward the start — it should track the current word continuously through multiple sentences/chunks with at most a barely-perceptible pause between chunk boundaries (a natural inter-sentence breath, not a jump).
  - If the highlight desync is GONE: this confirms the heartbeat/charIndex-rebase hypothesis and the fix is complete for this symptom.
  - If the highlight desync PERSISTS even now (no heartbeat, no long utterance ever approaching 15s): this refutes the charIndex-rebase hypothesis — report back with roughly how often the snap-back happens (fixed interval vs. random) so a fresh investigation can target the actual cause; do not suggest re-adding a pause/resume heartbeat.
  - Confirm seeking/scrubbing to a new position still resumes audio correctly (already confirmed working pre-round-2 per user report; chunking + sessionIdRef must not have regressed this).
files_changed (round 2):
  - components/StoryReader.tsx (scrubber UI opacity/hit-box/clamp fix; chunked utterance chaining replacing single long utterance; sessionIdRef race guard)
  - lib/tts-manager.ts (removed keep-alive heartbeat entirely)
