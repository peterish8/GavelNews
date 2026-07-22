"use client";

/**
 * Story TTS shell — adapted from Gavelogy:
 * - JudgmentReaderPill (play / pause / speed / scrub / lang)
 * - use-note-tts (click paragraph → read from there)
 * - lib/tts-manager.ts
 *
 * Single file to avoid flaky multi-chunk webpack loads.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  startTTS,
  stopTTS,
  pauseTTS,
  resumeTTS,
  subscribeTTS,
} from "@/lib/tts-manager";

const SPEEDS = [0.75, 1, 1.05, 1.15, 1.25, 1.5, 2] as const;
const LANGS = [
  { code: "en-IN", label: "EN-IN" },
  { code: "en-US", label: "EN-US" },
  { code: "hi-IN", label: "HI-IN" },
] as const;

// ── Click paragraph → speak ─────────────────────────────────────────

function useStoryTTS(articleRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = articleRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, [data-no-tts]")) return;

      const block = target.closest("p, li, h1, h2, h3") as HTMLElement | null;
      if (!block || !container!.contains(block)) return;

      const fullText = block.innerText?.trim();
      if (!fullText) return;

      if (block.classList.contains("speaking")) {
        stopTTS("story");
        block.classList.remove("speaking");
        return;
      }

      document
        .querySelectorAll(".speaking")
        .forEach((el) => el.classList.remove("speaking"));
      block.classList.add("speaking");

      let clickCharOffset = 0;
      try {
        const doc = document as Document & {
          caretRangeFromPoint?: (x: number, y: number) => Range | null;
        };
        const cr = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
        if (cr && block.contains(cr.startContainer)) {
          const r = document.createRange();
          r.setStart(block, 0);
          r.setEnd(cr.startContainer, cr.startOffset);
          clickCharOffset = r.toString().length;
        }
      } catch {
        /* ignore */
      }

      const sentences = fullText.split(/(?<=[.!?])\s+/).filter(Boolean);
      let charCount = 0;
      let startIdx = 0;
      for (let i = 0; i < sentences.length; i++) {
        charCount += sentences[i].length + 1;
        if (charCount > clickCharOffset) {
          startIdx = i;
          break;
        }
      }

      const textToRead = sentences.slice(startIdx).join(" ") || fullText;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.onend = () => block.classList.remove("speaking");
      utterance.onerror = () => block.classList.remove("speaking");
      startTTS("story", utterance);
    }

    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
      stopTTS("story");
      document
        .querySelectorAll(".speaking")
        .forEach((el) => el.classList.remove("speaking"));
    };
  }, [articleRef]);
}

// ── Pill ────────────────────────────────────────────────────────────

function NewsReaderPill({
  getContent,
  title,
}: {
  getContent: () => string;
  title?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [langIdx, setLangIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const pausedAtMsRef = useRef(0);
  const durationMsRef = useRef(0);
  const fullTextRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return subscribeTTS((source) => {
      if (source !== "story" && source !== null) {
        stopRaf();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setElapsedMs(0);
      }
    });
  }, []);

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
      if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) {
        return;
      }

      let sliceStart = Math.floor((fromPct / 100) * text.length);
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
      pausedAtMsRef.current = 0;
      startAtRef.current = Date.now();
      setProgress(fromPct);
      setElapsedMs(Math.round((fromPct / 100) * (durationMsRef.current || 1)));

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
    speakFrom(getContent(), 0);
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

  function formatTime(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const displayProgress = isScrubbing ? scrubValue : progress;

  const menu =
    mounted && showMenu
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMenu(false)}
            />
            <div
              className="gav-dropdown gav-dropdown--portal fixed min-w-[170px]"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                transform: "translateX(-50%)",
              }}
            >
              <div className="gav-dropdown-label">Speed</div>
              {SPEEDS.map((speed, i) => (
                <button
                  key={speed}
                  type="button"
                  className={
                    "gav-dropdown-item justify-between px-3 py-2" +
                    (speedIdx === i ? " gav-dropdown-item--active" : "")
                  }
                  onClick={() => {
                    setSpeedIdx(i);
                    setShowMenu(false);
                  }}
                >
                  <span>{speed}x</span>
                </button>
              ))}
              {isPlaying && (
                <>
                  <div className="gav-dropdown-divider" />
                  <button
                    type="button"
                    className="gav-dropdown-item px-3 py-2 text-[var(--gv-danger,#A11D2E)]"
                    onClick={() => {
                      handleStop();
                      setShowMenu(false);
                    }}
                  >
                    Stop reading
                  </button>
                </>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  // Portal the whole pill to body so overflow:hidden shell never clips it
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 md:bottom-6">
      <div className="gav-reader-bar pointer-events-auto shadow-lg">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <div className="hidden min-w-0 max-w-[9rem] flex-col sm:flex">
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
              setLangIdx((i) => (i + 1) % LANGS.length);
            }}
            className="rounded-full border border-brand-border bg-brand-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-brand hover:bg-brand hover:text-[var(--on-accent)]"
            title="Language"
          >
            {LANGS[langIdx].label}
          </button>

          <button
            type="button"
            data-no-tts
            onClick={isPlaying ? handlePauseResume : handlePlay}
            className="rounded-full bg-brand p-2.5 text-[var(--on-accent)] shadow-sm hover:bg-brand-hover active:scale-95"
            aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
          >
            {isPlaying && !isPaused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>

          <div
            data-no-tts
            className="group relative hidden h-3 w-[140px] cursor-pointer touch-none select-none items-center md:flex lg:w-[180px]"
            onPointerDown={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              const v = Math.max(
                0,
                Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
              );
              setScrubValue(v);
              setIsScrubbing(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!isScrubbing) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const v = Math.max(
                0,
                Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
              );
              setScrubValue(v);
            }}
            onPointerUp={(e) => {
              if (!isScrubbing) return;
              setIsScrubbing(false);
              e.currentTarget.releasePointerCapture(e.pointerId);
              const text = fullTextRef.current || getContent();
              speakFrom(text, scrubValue);
            }}
            onPointerCancel={(e) => {
              setIsScrubbing(false);
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
            }}
          >
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-border-app" />
            <div
              className="absolute left-0 h-1.5 rounded-full bg-brand"
              style={{ width: `${displayProgress}%` }}
            />
            <div
              className={
                "absolute z-10 h-3.5 w-3.5 rounded-full border-2 border-brand bg-elevated shadow " +
                (isScrubbing
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100")
              }
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
            className="rounded-full border border-border-app px-2 py-1 font-mono text-[10px] font-semibold text-ink-2 hover:border-brand-border hover:text-brand"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMenuPos({
                top: rect.top - 200,
                left: rect.left + rect.width / 2,
              });
              setShowMenu((v) => !v);
            }}
          >
            {SPEEDS[speedIdx]}x
          </button>
        </div>

        <p className="hidden shrink-0 text-[11px] text-ink-3 xl:block">
          Click a paragraph to start there
        </p>
      </div>
      {menu}
    </div>,
    document.body,
  );
}

// ── Public export ───────────────────────────────────────────────────

export function StoryReader({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const articleRef = useRef<HTMLDivElement>(null);
  useStoryTTS(articleRef);

  const getContent = useCallback(() => {
    return articleRef.current?.innerText?.trim() ?? "";
  }, []);

  return (
    <>
      <div ref={articleRef} className="story-tts-root" data-tts-root>
        {children}
      </div>
      <NewsReaderPill getContent={getContent} title={title} />
    </>
  );
}
