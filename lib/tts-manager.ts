// Copied from Gavelogy_trail: src/lib/tts-manager.ts
// Singleton TTS coordinator — only one speech stream at a time.

type TTSSource = "pdf" | "notes" | "story";
type Listener = (source: TTSSource | null) => void;

let _active: TTSSource | null = null;
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((fn) => fn(_active));
}

export function startTTS(
  source: TTSSource,
  utterance: SpeechSynthesisUtterance,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  _active = source;
  notify();

  const origEnd = utterance.onend;
  const origErr = utterance.onerror;
  utterance.onend = (e) => {
    if (_active === source) {
      _active = null;
      notify();
    }
    if (typeof origEnd === "function") {
      (origEnd as EventListener).call(utterance, e);
    }
  };
  utterance.onerror = (e) => {
    if (_active === source) {
      _active = null;
      notify();
    }
    if (typeof origErr === "function") {
      (origErr as EventListener).call(utterance, e);
    }
  };
  window.speechSynthesis.speak(utterance);
}

export function stopTTS(source?: TTSSource): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!source || _active === source) {
    window.speechSynthesis.cancel();
    _active = null;
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
  return _active;
}

export function subscribeTTS(fn: Listener): () => void {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}
