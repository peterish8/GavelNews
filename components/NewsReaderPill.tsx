"use client";

/**
 * Adapted from Gavelogy_trail:
 *   src/components/judgment/JudgmentReaderPill.tsx
 *   + src/lib/tts-manager.ts
 *
 * Dynamic-island style study bar: play/pause, speed, lang, scrub, timer.
 * Stripped judgment-only controls (PDF/edit/tabs) for Gavel News stories.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  startTTS,
  stopTTS,
  pauseTTS,
  resumeTTS,
  subscribeTTS,
} from "@/lib/tts-manager";
import { cn } from "@/lib/cn";

const SPEEDS = [0.75, 1, 1.05, 1.15, 1.25, 1.5, 2] as const;
const LANGS = [
  { code: "en-IN", label: "EN-IN" },
  { code: "en-US", label: "EN-US" },
  { code: "hi-IN", label: "HI-IN" },
] as const;

interface NewsReaderPillProps {
  /** Full article plain text for "play all" */
  getContent: () => string;
  title?: string;
}

export function NewsReaderPill({ getContent, title }: NewsReaderPillProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [langIdx, setLangIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showControlsMenu, setShowControlsMenu] = useState(false);
  const [controlsMenuPos, setControlsMenuPos] = useState({ top: 0, left: 0 });
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const pausedAtMsRef = useRef(0);
  const durationMsRef = useRef(0);
  const fullTextRef = useRef("");

  useEffect(() => {
    setMounted(true);
    setUnsupported(
      typeof window === "undefined" || !("speechSynthesis" in window),
    );
  }, []);

  useEffect(() => {
    return subscribeTTS((source) => {
      // Another source took over (or stopped) — reset UI if not us
      if (source !== "story" && source !== null) {
        stopRaf();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setElapsedMs(0);
      }
      if (source === null) {
        // finished / cancelled
      }
    });
  }, []);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      stopTTS("story");
      stopRaf();
    };
  }, []);

  function startRaf() {
    function tick() {
      const elapsed = pausedAtMsRef.current + (Date.now() - startAtRef.current);
      const pct =
        durationMsRef.current > 0
          ? Math.min(100, (elapsed / durationMsRef.current) * 100)
          : 0;
      setProgress(pct);
      setElapsedMs(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  const speakFrom = useCallback(
    (text: string, fromPct = 0) => {
      if (!text.trim()) return;

      const startChar = Math.floor((fromPct / 100) * text.length);
      // Snap to next word boundary
      let sliceStart = startChar;
      if (sliceStart > 0) {
        const space = text.indexOf(" ", sliceStart);
        sliceStart = space === -1 ? sliceStart : space + 1;
      }
      const spoken = text.slice(sliceStart).trim() || text;
      fullTextRef.current = text;

      const wordCount = spoken.trim().split(/\s+/).length;
      durationMsRef.current = Math.round(
        ((wordCount / 130) * 60_000) / SPEEDS[speedIdx],
      );
      // Treat scrub start as already elapsed proportion of remaining duration
      pausedAtMsRef.current = 0;
      startAtRef.current = Date.now();
      setProgress(fromPct);
      setElapsedMs(
        Math.round((fromPct / 100) * (durationMsRef.current || 1)),
      );

      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = LANGS[langIdx].code;
      utterance.rate = SPEEDS[speedIdx];
      utterance.onstart = () => {
        startAtRef.current = Date.now();
        setIsPlaying(true);
        setIsPaused(false);
        startRaf();
      };
      utterance.onend = () => {
        stopRaf();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setElapsedMs(0);
        pausedAtMsRef.current = 0;
      };
      utterance.onerror = () => {
        stopRaf();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setElapsedMs(0);
      };

      startTTS("story", utterance);
    },
    [langIdx, speedIdx],
  );

  const handlePlay = useCallback(() => {
    const text = getContent();
    speakFrom(text, 0);
  }, [getContent, speakFrom]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      startAtRef.current = Date.now();
      resumeTTS();
      setIsPaused(false);
      startRaf();
      return;
    }
    pausedAtMsRef.current += Date.now() - startAtRef.current;
    stopRaf();
    pauseTTS();
    setIsPaused(true);
  }, [isPaused]);

  const handleStop = useCallback(() => {
    stopTTS("story");
    stopRaf();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setElapsedMs(0);
    pausedAtMsRef.current = 0;
  }, []);

  const handleScrubStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const nextValue = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    setScrubValue(nextValue);
    setIsScrubbing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nextValue = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    setScrubValue(nextValue);
  };

  const handleScrubEnd = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    // Re-speak from scrub position (Gavelogy UI scrub + real seek for news)
    const text = fullTextRef.current || getContent();
    speakFrom(text, scrubValue);
  };

  function formatTime(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const displayProgress = isScrubbing ? scrubValue : progress;

  const controlsMenu =
    mounted && showControlsMenu
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[9999]"
              onClick={() => setShowControlsMenu(false)}
            />
            <div
              className="gav-dropdown gav-dropdown--portal fixed min-w-[170px]"
              style={{
                top: controlsMenuPos.top,
                left: controlsMenuPos.left,
                transform: "translateX(-50%)",
              }}
            >
              <div className="gav-dropdown-label">Reader controls</div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-ink-3">
                <GaugeIcon />
                Speed
              </div>
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    const idx = SPEEDS.indexOf(speed);
                    if (idx >= 0) setSpeedIdx(idx);
                    setShowControlsMenu(false);
                  }}
                  className={cn(
                    "gav-dropdown-item justify-between px-3 py-2",
                    SPEEDS[speedIdx] === speed && "gav-dropdown-item--active",
                  )}
                >
                  <span>{speed}x</span>
                  {SPEEDS[speedIdx] === speed && (
                    <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
              {isPlaying && (
                <>
                  <div className="gav-dropdown-divider" />
                  <button
                    type="button"
                    onClick={() => {
                      handleStop();
                      setShowControlsMenu(false);
                    }}
                    className="gav-dropdown-item gap-2 px-3 py-2 text-[var(--gv-danger,#A11D2E)]"
                  >
                    <StopIcon />
                    Stop reading
                  </button>
                </>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  if (unsupported) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:bottom-6">
      <div className="gav-reader-bar pointer-events-auto">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <div className="hidden min-w-0 max-w-[10rem] flex-col sm:flex">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Listen
            </span>
            <span className="truncate text-xs font-semibold text-ink">
              {title ?? "Story"}
            </span>
          </div>

          <div className="hidden h-5 w-px bg-border-app sm:block" />

          <button
            type="button"
            data-no-tts
            onClick={() => {
              handleStop();
              setLangIdx((idx) => (idx + 1) % LANGS.length);
            }}
            className="rounded-full border border-brand-border bg-brand-soft px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-brand transition-colors hover:bg-brand hover:text-[var(--on-accent)]"
            title="Switch language"
          >
            {LANGS[langIdx].label}
          </button>

          <button
            type="button"
            data-no-tts
            onClick={isPlaying ? handlePauseResume : handlePlay}
            className="rounded-full bg-brand p-2 text-[var(--on-accent)] shadow-sm transition-transform hover:bg-brand-hover active:scale-95"
            aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
          >
            {isPlaying && !isPaused ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Scrubber */}
          <div
            data-no-tts
            className="group relative hidden h-3 w-[140px] cursor-pointer touch-none select-none items-center md:flex lg:w-[200px]"
            onPointerDown={handleScrubStart}
            onPointerMove={handleScrubMove}
            onPointerUp={handleScrubEnd}
            onPointerCancel={handleScrubEnd}
          >
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-border-app" />
            <div
              className="absolute left-0 h-1.5 rounded-full"
              style={{
                width: `${displayProgress}%`,
                background: "var(--brand-blend)",
              }}
            />
            <div
              className={cn(
                "absolute z-10 h-3.5 w-3.5 rounded-full border-2 border-brand bg-elevated shadow-md",
                isScrubbing
                  ? "scale-110 opacity-100"
                  : "opacity-0 transition-opacity group-hover:opacity-100",
              )}
              style={{
                left: `${displayProgress}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>

          <span className="hidden text-sm font-medium tabular-nums text-ink-3 md:inline">
            {formatTime(elapsedMs)}
          </span>

          <button
            type="button"
            data-no-tts
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setControlsMenuPos({
                top: rect.top - 8,
                left: rect.left + rect.width / 2,
              });
              // open upward from bottom pill
              setControlsMenuPos({
                top: rect.top - 220,
                left: rect.left + rect.width / 2,
              });
              setShowControlsMenu((v) => !v);
            }}
            className="rounded-full p-1.5 text-ink-3 transition-colors hover:bg-elevated-muted hover:text-ink"
            aria-label="Speed and controls"
            title={`${SPEEDS[speedIdx]}x`}
          >
            <MoreIcon />
          </button>

          <span className="hidden rounded-full border border-border-app px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-3 lg:inline">
            {SPEEDS[speedIdx]}x
          </span>
        </div>

        <p className="hidden shrink-0 text-[11px] text-ink-3 xl:block">
          Click any paragraph to start from there
        </p>
      </div>

      {controlsMenu}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 13V7M5.5 17.5A9 9 0 1 1 18.5 17.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}
