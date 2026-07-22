// Singleton browser TTS coordinator (from Gavelogy tts-manager).

export type TTSSource = "pdf" | "notes" | "story";
type Listener = (source: TTSSource | null) => void;

let active: TTSSource | null = null;
const listeners = new Set<Listener>();

/**
 * Monotonic generation for speak scheduling.
 * cancel() often fires the previous utterance's onend/onerror *after* a new
 * startTTS() already set `active` again. Without a generation check those
 * late handlers null `active` and the pending speak() is skipped — so play
 * appears to die after ~1s with a stuck UI.
 */
let speakGen = 0;

function notify() {
  for (const fn of listeners) fn(active);
}

function unstickSynth(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  // Chrome can leave the synth "paused" after cancel(); speak() then no-ops.
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {
    /* ignore */
  }
}

export function startTTS(
  source: TTSSource,
  utterance: SpeechSynthesisUtterance,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const gen = ++speakGen;
  active = source;
  notify();

  // Cancel prior utterance after claiming gen so late handlers see stale gen.
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  unstickSynth();

  const prevEnd = utterance.onend;
  const prevErr = utterance.onerror;

  utterance.onend = function (
    this: SpeechSynthesisUtterance,
    e: SpeechSynthesisEvent,
  ) {
    if (gen === speakGen && active === source) {
      active = null;
      notify();
    }
    if (typeof prevEnd === "function") prevEnd.call(this, e);
  };

  utterance.onerror = function (
    this: SpeechSynthesisUtterance,
    e: SpeechSynthesisErrorEvent,
  ) {
    if (gen === speakGen && active === source) {
      active = null;
      notify();
    }
    if (typeof prevErr === "function") prevErr.call(this, e);
  };

  // speak() right after cancel() is a documented Chromium race — defer.
  window.setTimeout(() => {
    if (gen !== speakGen || active !== source) return;
    unstickSynth();
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore */
    }
  }, 40);
}

export function stopTTS(source?: TTSSource): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  // Another source owns TTS — leave it alone.
  if (source && active && active !== source) return;

  speakGen += 1; // invalidate pending speak timeouts
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  unstickSynth();
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  active = null;
  notify();
}

export function pauseTTS(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* ignore */
  }
}

export function resumeTTS(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}

export function getActiveSource(): TTSSource | null {
  return active;
}

export function isSynthLive(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking || window.speechSynthesis.pending;
}

export function subscribeTTS(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
