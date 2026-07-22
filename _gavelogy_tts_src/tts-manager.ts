// Singleton TTS coordinator — prevents PDF and Notes from speaking simultaneously.
type TTSSource = 'pdf' | 'notes'
type Listener = (source: TTSSource | null) => void

let _active: TTSSource | null = null
const _listeners = new Set<Listener>()

function notify() {
  _listeners.forEach(fn => fn(_active))
}

export function startTTS(source: TTSSource, utterance: SpeechSynthesisUtterance): void {
  window.speechSynthesis.cancel()
  _active = source
  notify()

  const origEnd = utterance.onend
  const origErr = utterance.onerror
  utterance.onend = (e) => {
    if (_active === source) { _active = null; notify() }
    if (typeof origEnd === 'function') (origEnd as EventListener).call(utterance, e)
  }
  utterance.onerror = (e) => {
    if (_active === source) { _active = null; notify() }
    if (typeof origErr === 'function') (origErr as EventListener).call(utterance, e)
  }
  window.speechSynthesis.speak(utterance)
}

export function stopTTS(source?: TTSSource): void {
  if (!source || _active === source) {
    window.speechSynthesis.cancel()
    _active = null
    notify()
  }
}

export function pauseTTS(): void {
  window.speechSynthesis.pause()
}

export function resumeTTS(): void {
  window.speechSynthesis.resume()
}

export function getActiveSource(): TTSSource | null {
  return _active
}

export function subscribeTTS(fn: Listener): () => void {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
