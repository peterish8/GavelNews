'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Play, Pause, Square, MoreVertical, Timer } from 'lucide-react'
import { startTTS, stopTTS, pauseTTS, resumeTTS, subscribeTTS } from '@/lib/tts-manager'
import { cn } from '@/lib/utils'
import { brandClass } from '@/lib/brand'

const SPEEDS = [0.75, 1, 1.05, 1.15, 1.25, 1.5, 2] as const
const LANGS = [
  { code: 'en-IN', label: 'EN·IN' },
  { code: 'en-US', label: 'EN·US' },
  { code: 'hi-IN', label: 'HI·IN' },
] as const

interface NotesReaderPillProps {
  getContent: () => string
}

export function NotesReaderPill({ getContent }: NotesReaderPillProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [langIdx, setLangIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubValue, setScrubValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedAtRef = useRef(0)
  const startAtRef = useRef(0)

  useEffect(() => { setMounted(true) }, [])

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

    const wordCount = text.trim().split(/\s+/).length
    const estimatedSecs = Math.round((wordCount / 130) * 60 / SPEEDS[speedIdx])
    setDuration(estimatedSecs)
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

  const handleScrubStart = (e: React.PointerEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setScrubValue(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)))
    setIsScrubbing(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const handleScrubMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return
    const rect = e.currentTarget.getBoundingClientRect()
    setScrubValue(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)))
  }
  const handleScrubEnd = (e: React.PointerEvent) => {
    if (!isScrubbing) return
    setIsScrubbing(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const progress = isScrubbing
    ? scrubValue
    : duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, '0')}`
  }

  const menu = mounted && showMenu ? createPortal(
    <>
      <div className="fixed inset-0 z-9999" onClick={() => setShowMenu(false)} />
      <div
        className={cn('fixed min-w-[160px]', brandClass.dropdownPortal)}
        style={{ top: menuPos.top, left: menuPos.left, transform: 'translateX(-50%)' }}
      >
        <div className={brandClass.dropdownLabel}>Playback Speed</div>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => { setSpeedIdx(SPEEDS.indexOf(s)); setShowMenu(false) }}
            className={cn(
              brandClass.dropdownItem,
              'justify-between px-3 py-1.5',
              SPEEDS[speedIdx] === s && brandClass.dropdownItemActive
            )}
          >
            <span>{s}x</span>
            {SPEEDS[speedIdx] === s && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />}
          </button>
        ))}
        <div className={brandClass.dropdownDivider} />
          <div className={brandClass.dropdownLabel}>Language</div>
          {LANGS.map((l, i) => (
            <button
              key={l.code}
              onClick={() => { handleStop(); setLangIdx(i); setShowMenu(false) }}
              className={cn(
                brandClass.dropdownItem,
                'justify-between px-3 py-1.5',
                langIdx === i && brandClass.dropdownItemActive
              )}
            >
              <span>{l.label}</span>
              {langIdx === i && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />}
            </button>
          ))}
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="sticky top-0 z-20 flex justify-center py-2 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-elevated)_92%,transparent)] backdrop-blur-md shadow-[var(--shadow-brand-sm)] text-[var(--ink)]"
        style={{ minWidth: 280 }}
      >
        {/* Language label */}
        <button
          onClick={() => { handleStop(); setLangIdx(i => (i + 1) % LANGS.length) }}
          className="text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors px-1 shrink-0"
          title="Switch language"
        >
          {LANGS[langIdx].label}
        </button>

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-700 shrink-0" />

        {/* Play / Pause / Resume */}
        <button
          onClick={isPlaying ? handlePauseResume : handlePlay}
          className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors focus:outline-none p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 shrink-0"
          title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Read Aloud'}
        >
          {isPlaying && !isPaused
            ? <Pause className="w-4 h-4 fill-current" />
            : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Scrubber */}
        <div
          className="relative flex-1 h-3 flex items-center cursor-pointer group select-none touch-none min-w-[80px]"
          onPointerDown={handleScrubStart}
          onPointerMove={handleScrubMove}
          onPointerUp={handleScrubEnd}
          onPointerCancel={handleScrubEnd}
        >
          <div className="absolute left-0 right-0 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          <div
            className={cn('absolute left-0 h-1 bg-blue-500 rounded-full', !isScrubbing && 'transition-all duration-300 ease-out')}
            style={{ width: `${progress}%` }}
          />
          <div
            className={cn(
              'absolute h-3 w-3 bg-blue-600 rounded-full shadow-md z-10',
              !isScrubbing && 'transition-all duration-300 ease-out',
              isScrubbing ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
            )}
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1 text-xs font-mono text-gray-400 shrink-0 min-w-[40px]">
          <Timer className="w-3 h-3" />
          {formatTime(elapsed)}
        </div>

        {/* Stop — only when playing */}
        {isPlaying && (
          <button
            onClick={handleStop}
            className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
            title="Stop"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        )}

        <div className="w-px h-3.5 bg-gray-200 dark:bg-zinc-700 shrink-0" />

        {/* Speed / options */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            const rect = e.currentTarget.getBoundingClientRect()
            setMenuPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
            setShowMenu(v => !v)
          }}
          className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 shrink-0"
          title="Options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {menu}
    </div>
  )
}
