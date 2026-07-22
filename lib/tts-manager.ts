// Singleton browser TTS coordinator (from Gavelogy tts-manager).

export type TTSSource = "pdf" | "notes" | "story";
type Listener = (source: TTSSource | null) => void;

let active: TTSSource | null = null;
const listeners = new Set<Listener>();

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

  window.speechSynthesis.speak(utterance);
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
