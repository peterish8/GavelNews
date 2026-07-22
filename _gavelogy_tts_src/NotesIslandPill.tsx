'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Globe, Gauge, Timer, Headphones } from 'lucide-react'
import { startTTS, stopTTS, pauseTTS, resumeTTS, subscribeTTS } from '@/lib/tts-manager'

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const
const LANGS = [
  { code: 'en-IN', label: 'EN·IN' },
  { code: 'en-US', label: 'EN·US' },
  { code: 'hi-IN', label: 'HI·IN' },
] as const

interface NotesIslandPillProps {
  getContent: () => string
}

export function NotesIslandPill({ getContent }: NotesIslandPillProps) {
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [langIdx, setLangIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedAtRef = useRef(0)
  const startAtRef = useRef(0)

  useEffect(() => {
    return subscribeTTS((source) => {
      if (source !== 'notes' && source !== null) {
        setIsPlaying(false)
        setIsPaused(false)
        clearInterval(timerRef.current ?? undefined)
        setElapsed(0)
      }
    })
  }, [])

  const startTimer = useCallback(() => {
    startAtRef.current = Date.now() - pausedAtRef.current * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startAtRef.current) / 1000))
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const handlePlay = useCallback(() => {
    const text = getContent()
    if (!text.trim()) return

    pausedAtRef.current = 0
    setElapsed(0)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANGS[langIdx].code
    utterance.rate = SPEEDS[speedIdx]
    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); startTimer() }
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); stopTimer(); setElapsed(0); pausedAtRef.current = 0 }
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); stopTimer() }
    startTTS('notes', utterance)
  }, [getContent, langIdx, speedIdx, startTimer, stopTimer])

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resumeTTS()
      setIsPaused(false)
      startTimer()
    } else {
      pauseTTS()
      setIsPaused(true)
      pausedAtRef.current = elapsed
      stopTimer()
    }
  }, [isPaused, elapsed, startTimer, stopTimer])

  const handleStop = useCallback(() => {
    stopTTS('notes')
    setIsPlaying(false)
    setIsPaused(false)
    stopTimer()
    setElapsed(0)
    pausedAtRef.current = 0
  }, [stopTimer])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, '0')}`
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const pill = (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center" style={{ pointerEvents: 'auto' }}>
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative overflow-hidden"
        style={{ borderRadius: expanded ? 20 : 999 }}
      >
        <motion.div
          layout
          className="bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/10"
          style={{ borderRadius: 'inherit' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!expanded ? (
              /* ── Collapsed: single circle ── */
              <motion.button
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                onClick={() => setExpanded(true)}
                className="w-12 h-12 flex items-center justify-center relative"
                title="Open reader controls"
              >
                {isPlaying ? (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-indigo-500/20"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  />
                ) : null}
                <Headphones className={`w-5 h-5 ${isPlaying ? 'text-indigo-400' : 'text-white/70'}`} />
                {isPlaying && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-zinc-900" />
                )}
              </motion.button>
            ) : (
              /* ── Expanded: full controls ── */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 px-3 py-2.5 min-w-[280px]"
              >
                {/* Collapse handle */}
                <button
                  onClick={() => setExpanded(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                  title="Collapse"
                >
                  <Headphones className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-white/10 mx-0.5" />

                {/* Language */}
                <button
                  onClick={() => { handleStop(); setLangIdx(i => (i + 1) % LANGS.length) }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white/50 hover:text-indigo-400 hover:bg-white/10 transition-colors"
                  title="Switch language"
                >
                  <Globe className="w-3 h-3" />
                  <span>{LANGS[langIdx].label}</span>
                </button>

                {/* Speed */}
                <button
                  onClick={() => { handleStop(); setSpeedIdx(i => (i + 1) % SPEEDS.length) }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white/50 hover:text-indigo-400 hover:bg-white/10 transition-colors"
                  title="Playback speed"
                >
                  <Gauge className="w-3 h-3" />
                  <span>{SPEEDS[speedIdx]}×</span>
                </button>

                <div className="flex-1" />

                {/* Play / Pause / Resume */}
                {!isPlaying ? (
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors shadow-sm shadow-indigo-500/30"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Read aloud
                  </button>
                ) : (
                  <button
                    onClick={handlePauseResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/30"
                  >
                    {isPaused
                      ? <><Play className="w-3 h-3 fill-current" />Resume</>
                      : <><Pause className="w-3 h-3 fill-current" />Pause</>}
                  </button>
                )}

                {/* Stop */}
                {isPlaying && (
                  <button
                    onClick={handleStop}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Stop"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                )}

                {/* Timer */}
                <div className="flex items-center gap-1 text-xs font-mono text-white/25 min-w-[36px] justify-end">
                  <Timer className="w-3 h-3" />
                  {formatTime(elapsed)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )

  if (!mounted) return null
  return createPortal(pill, document.body)
}
