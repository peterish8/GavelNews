// Singleton browser TTS coordinator (from Gavelogy tts-manager).

export type TTSSource = "pdf" | "notes" | "story";
type Listener = (source: TTSSource | null) => void;

let active: TTSSource | null = null;
const listeners = new Set<Listener>();

// Round 1 added a setInterval pause()+resume() "heartbeat" here to dodge
// Chromium's ~15s silent-cutoff on long utterances. Round 2 removed it:
// live testing showed the highlight desyncing ("coming from beginning")
// on a ~10s cadence that matches the heartbeat interval exactly. Per the
// Web Speech API spec, onboundary's charIndex is defined relative to the
// utterance's own text, but Chromium is known to rebase/reset that counter
// around pause()/resume() cycles on long-running utterances — repeatedly
// nudging the engine every 10s was very likely re-triggering that rebase
// on a timer, not just mitigating the cutoff.
//
// The cutoff itself is now avoided at the source (StoryReader.tsx chunks
// the article into short, sentence-aligned utterances chained via
// utterance.onend instead of speaking one long utterance) — so no
// keep-alive nudge is needed at all. pause()/resume() below are still
// used, but only for a single genuine user-initiated pause/resume, never
// on a repeating timer, which carries far less of the same risk.

function notify() {
  for (const fn of listeners) fn(active);
}

export function startTTS(
  source: TTSSource,
  utterance: SpeechSynthesisUtterance,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  active = source;
  notify();

  const prevEnd = utterance.onend;
  const prevErr = utterance.onerror;

  utterance.onend = function (this: SpeechSynthesisUtterance, e: SpeechSynthesisEvent) {
    if (active === source) {
      active = null;
      notify();
    }
    if (typeof prevEnd === "function") prevEnd.call(this, e);
  };

  utterance.onerror = function (
    this: SpeechSynthesisUtterance,
    e: SpeechSynthesisErrorEvent,
  ) {
    if (active === source) {
      active = null;
      notify();
    }
    if (typeof prevErr === "function") prevErr.call(this, e);
  };

  // Calling speak() synchronously right after cancel() is a documented
  // Chromium race that can silently drop the speak() call — defer by one
  // tick so cancel() has settled first.
  setTimeout(() => {
    if (active !== source) return; // superseded by a newer call in the meantime
    window.speechSynthesis.speak(utterance);
  }, 0);
}

export function stopTTS(source?: TTSSource): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!source || active === source) {
    window.speechSynthesis.cancel();
    active = null;
    notify();
  }
}

export function pauseTTS(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.pause();
}

export function resumeTTS(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.resume();
}

export function getActiveSource(): TTSSource | null {
  return active;
}

export function subscribeTTS(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
