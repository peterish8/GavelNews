'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Gauge,
  Maximize2,
  MoreVertical,
  Pause,
  Play,
  Square,
} from 'lucide-react'
import { startTTS, stopTTS, pauseTTS, resumeTTS, subscribeTTS } from '@/lib/tts-manager'
import { MotionIcon } from '@/components/motion/icon-motion'
import { StudyTimer } from '@/components/learning/study-timer'
import { cn } from '@/lib/utils'
import { brandClass } from '@/lib/brand'

const SPEEDS = [0.75, 1, 1.05, 1.15, 1.25, 1.5, 2] as const
const LANGS = [
  { code: 'en-IN', label: 'EN-IN' },
  { code: 'en-US', label: 'EN-US' },
  { code: 'hi-IN', label: 'HI-IN' },
] as const

interface JudgmentReaderPillProps {
  getContent: () => string
  onBack: () => void
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  isEditMode: boolean
  onToggleEdit: () => void
  onToggleExpand: () => void
  pdfUrl?: string | null
}

export function JudgmentReaderPill({
  getContent,
  onBack,
  canPrev,
  canNext,
  onPrev,
  onNext,
  isEditMode,
  onToggleEdit,
  onToggleExpand,
  pdfUrl,
}: JudgmentReaderPillProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [langIdx, setLangIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [showControlsMenu, setShowControlsMenu] = useState(false)
  const [controlsMenuPos, setControlsMenuPos] = useState({ top: 0, left: 0 })
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [downloadMenuPos, setDownloadMenuPos] = useState({ top: 0, left: 0 })
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubValue, setScrubValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  const rafRef = useRef<number | null>(null)
  const startAtRef = useRef(0)
  const pausedAtMsRef = useRef(0)
  const durationMsRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return subscribeTTS((source) => {
      if (source !== 'notes' && source !== null) {
        stopRaf()
        setIsPlaying(false)
        setIsPaused(false)
        setProgress(0)
        setElapsedMs(0)
      }
    })
  }, [])

  function startRaf() {
    function tick() {
      const elapsed = pausedAtMsRef.current + (Date.now() - startAtRef.current)
      const pct = durationMsRef.current > 0
        ? Math.min(100, (elapsed / durationMsRef.current) * 100)
        : 0

      setProgress(pct)
      setElapsedMs(elapsed)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  function stopRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handlePlay = useCallback(() => {
    const text = getContent()
    if (!text.trim()) return

    const wordCount = text.trim().split(/\s+/).length
    durationMsRef.current = Math.round((wordCount / 130) * 60_000 / SPEEDS[speedIdx])
    pausedAtMsRef.current = 0
    startAtRef.current = Date.now()
    setProgress(0)
    setElapsedMs(0)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANGS[langIdx].code
    utterance.rate = SPEEDS[speedIdx]
    utterance.onstart = () => {
      startAtRef.current = Date.now()
      setIsPlaying(true)
      setIsPaused(false)
      startRaf()
    }
    utterance.onend = () => {
      stopRaf()
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
      setElapsedMs(0)
      pausedAtMsRef.current = 0
    }
    utterance.onerror = () => {
      stopRaf()
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
      setElapsedMs(0)
    }

    startTTS('notes', utterance)
  }, [getContent, langIdx, speedIdx])

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      startAtRef.current = Date.now()
      resumeTTS()
      setIsPaused(false)
      startRaf()
      return
    }

    pausedAtMsRef.current += Date.now() - startAtRef.current
    stopRaf()
    pauseTTS()
    setIsPaused(true)
  }, [isPaused])

  const handleStop = useCallback(() => {
    stopTTS('notes')
    stopRaf()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    setElapsedMs(0)
    pausedAtMsRef.current = 0
  }, [])

  const handleScrubStart = (e: React.PointerEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const nextValue = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setScrubValue(nextValue)
    setIsScrubbing(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nextValue = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setScrubValue(nextValue)
  }

  const handleScrubEnd = (e: React.PointerEvent) => {
    if (!isScrubbing) return
    setIsScrubbing(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function openPdfInNewTab() {
    if (!pdfUrl) return
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    setShowDownloadMenu(false)
  }

  function downloadPdfFile() {
    if (!pdfUrl) return
    const anchor = document.createElement('a')
    anchor.href = pdfUrl
    anchor.download = 'judgment.pdf'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setShowDownloadMenu(false)
  }

  const displayProgress = isScrubbing ? scrubValue : progress

  const controlsMenu = mounted && showControlsMenu
    ? createPortal(
        <>
          <div className="fixed inset-0 z-9999" onClick={() => setShowControlsMenu(false)} />
          <div
            className={cn('fixed min-w-[170px]', brandClass.dropdownPortal)}
            style={{
              top: controlsMenuPos.top,
              left: controlsMenuPos.left,
              transform: 'translateX(-50%)',
            }}
          >
            <div className={brandClass.dropdownLabel}>
              Reader Controls
            </div>
            <div className={cn('flex items-center gap-2 px-3 py-1.5 text-[11px] gav-text-muted')}>
              <Gauge className="w-3 h-3" />
              Speed
            </div>
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setSpeedIdx(SPEEDS.indexOf(speed))
                  setShowControlsMenu(false)
                }}
                className={cn(
                  brandClass.dropdownItem,
                  'justify-between px-3 py-2',
                  SPEEDS[speedIdx] === speed && brandClass.dropdownItemActive
                )}
              >
                <span>{speed}x</span>
                {SPEEDS[speedIdx] === speed && <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
              </button>
            ))}
            {isPlaying && (
              <>
                <div className={brandClass.dropdownDivider} />
                <button
                  onClick={() => {
                    handleStop()
                    setShowControlsMenu(false)
                  }}
                  className={cn(brandClass.dropdownItem, 'gap-2 px-3 py-2 text-[var(--gv-danger)]')}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop reading
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )
    : null

  const downloadMenu = mounted && showDownloadMenu
    ? createPortal(
        <>
          <div className="fixed inset-0 z-9998" onClick={() => setShowDownloadMenu(false)} />
          <div
            className={cn('fixed min-w-[180px]', brandClass.dropdownPortal)}
            style={{
              top: downloadMenuPos.top,
              left: downloadMenuPos.left,
              transform: 'translateX(-50%)',
            }}
          >
            <button
              onClick={openPdfInNewTab}
              disabled={!pdfUrl}
              className={cn(brandClass.dropdownItem, 'gap-3 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40')}
            >
              <MotionIcon icon={Download} className="w-4 h-4 gav-text-muted" />
              Open PDF
            </button>
            <button
              onClick={downloadPdfFile}
              disabled={!pdfUrl}
              className={cn(brandClass.dropdownItem, 'gap-3 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40')}
            >
              <MotionIcon icon={Download} className="w-4 h-4 text-slate-500" />
              Download PDF
            </button>
          </div>
        </>,
        document.body
      )
    : null

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex justify-center px-4 py-4">
      <div className={brandClass.readerBar}>
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <button
            onClick={() => {
              handleStop()
              setLangIdx((idx) => (idx + 1) % LANGS.length)
            }}
            className="rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-blue-700 transition-colors hover:bg-blue-100"
            title="Switch language"
          >
            {LANGS[langIdx].label}
          </button>

          <div className="relative flex items-center">
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setDownloadMenuPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
                setShowDownloadMenu((value) => !value)
              }}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <MotionIcon icon={Download} className="w-4 h-4" />
              <MotionIcon icon={ChevronDown} className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={isPlaying ? handlePauseResume : handlePlay}
            className="rounded-full p-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700"
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          <div
            className="relative hidden h-3 w-[180px] cursor-pointer touch-none select-none items-center md:flex group"
            onPointerDown={handleScrubStart}
            onPointerMove={handleScrubMove}
            onPointerUp={handleScrubEnd}
            onPointerCancel={handleScrubEnd}
          >
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-slate-200" />
            <div
              className="absolute left-0 h-1.5 rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-indigo-500"
              style={{ width: `${displayProgress}%` }}
            />
            <div
              className={cn(
                'absolute z-10 h-3.5 w-3.5 rounded-full border-2 border-blue-500 bg-white shadow-md',
                isScrubbing ? 'opacity-100 scale-110' : 'opacity-0 transition-opacity group-hover:opacity-100'
              )}
              style={{ left: `${displayProgress}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setControlsMenuPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 })
              setShowControlsMenu((value) => !value)
            }}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden shrink-0 md:flex">
          <StudyTimer />
        </div>

        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <span className="hidden text-sm font-medium tabular-nums text-slate-400 md:inline">
            {formatTime(elapsedMs)}
          </span>

          <div className="hidden h-5 w-px bg-slate-200 md:block" />

          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!canNext}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <button
            onClick={onToggleEdit}
            className={cn(
              'flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors',
              isEditMode
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Edit</span>
          </button>

          <button
            onClick={onToggleExpand}
            className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {controlsMenu}
      {downloadMenu}
    </div>
  )
}

