"use client";

/**
 * Unified story TTS:
 * - One controller for click-anywhere, play/pause, scrubber
 * - Progress = position in full article text
 * - Word-by-word pastel yellow highlight while speaking
 *
 * Adapted from Gavelogy JudgmentReaderPill + use-note-tts + tts-manager.
 */

import {
  memo,
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
  isSynthLive,
  subscribeTTS,
} from "@/lib/tts-manager";

const SPEEDS = [0.75, 1, 1.05, 1.15, 1.25, 1.5, 2] as const;
const LANGS = [
  { code: "en-IN", label: "EN-IN" },
  { code: "en-US", label: "EN-US" },
  { code: "hi-IN", label: "HI-IN" },
] as const;

const HIGHLIGHT_NAME = "gavel-tts-word";
const HIGHLIGHT_STYLE_ID = "gavel-tts-word-highlight-style";
const WPM = 150; // used for duration estimate when boundary events are sparse

/**
 * Inject ::highlight() styles at runtime.
 * Lightning CSS (Next production CSS optimizer) does not recognize
 * ::highlight(custom-name) and emits a build warning if left in globals.css.
 */
function ensureHighlightStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `::highlight(${HIGHLIGHT_NAME}) {
  background-color: #fef08a;
  color: inherit;
}`;
  document.head.appendChild(style);
}

// ── DOM text helpers (read-only — never split/wrap text nodes) ───────

/** Full article text from text nodes only (stable for offsets + TTS). */
function getArticleText(root: HTMLElement): string {
  return root.textContent ?? "";
}

/** Build a Range over [start, start+length) in root's textContent stream. */
function rangeFromTextContentOffsets(
  root: HTMLElement,
  start: number,
  length: number,
): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let startNode: Text | null = null;
  let startOff = 0;
  let endNode: Text | null = null;
  let endOff = 0;
  const end = Math.max(start + 1, start + Math.max(1, length));

  let node = walker.nextNode() as Text | null;
  while (node) {
    // Skip empty text nodes
    if (!node.data) {
      node = walker.nextNode() as Text | null;
      continue;
    }
    const len = node.data.length;
    if (!startNode && pos + len > start) {
      startNode = node;
      startOff = start - pos;
    }
    if (startNode && pos + len >= end) {
      endNode = node;
      endOff = end - pos;
      break;
    }
    pos += len;
    node = walker.nextNode() as Text | null;
  }

  if (!startNode) return null;
  if (!endNode) {
    endNode = startNode;
    endOff = startNode.data.length;
  }

  // Clamp within the same text node when possible so we never cross tags mid-word
  if (startNode === endNode) {
    startOff = Math.max(0, Math.min(startOff, startNode.data.length));
    endOff = Math.max(startOff, Math.min(endOff, startNode.data.length));
  } else {
    // Prefer highlighting only within the start text node to avoid layout breaks
    endNode = startNode;
    // Extend to end of word inside this text node only
    let i = startOff;
    while (i < startNode.data.length && !/\s/.test(startNode.data[i]!)) i++;
    endOff = Math.max(startOff + 1, i);
    startOff = Math.max(0, Math.min(startOff, startNode.data.length));
  }

  try {
    const range = document.createRange();
    range.setStart(startNode, startOff);
    range.setEnd(endNode, endOff);
    return range;
  } catch {
    return null;
  }
}

/** Map click position → character offset in root.textContent. */
function clickToTextOffset(
  root: HTMLElement,
  clientX: number,
  clientY: number,
): number {
  try {
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
      caretPositionFromPoint?: (
        x: number,
        y: number,
      ) => { offsetNode: Node; offset: number } | null;
    };

    let node: Node | null = null;
    let offset = 0;

    if (doc.caretRangeFromPoint) {
      const cr = doc.caretRangeFromPoint(clientX, clientY);
      if (cr) {
        node = cr.startContainer;
        offset = cr.startOffset;
      }
    } else if (doc.caretPositionFromPoint) {
      const cp = doc.caretPositionFromPoint(clientX, clientY);
      if (cp) {
        node = cp.offsetNode;
        offset = cp.offset;
      }
    }

    if (!node || !root.contains(node)) return 0;

    const r = document.createRange();
    r.selectNodeContents(root);
    r.setEnd(node, offset);
    return r.toString().length;
  } catch {
    return 0;
  }
}

/**
 * Word highlight WITHOUT mutating the DOM (no mark tags, no word splits).
 * Uses the CSS Custom Highlight API when available.
 */
function clearWordHighlight(_root: HTMLElement | null) {
  try {
    const CSSH = (
      window as unknown as {
        CSS?: { highlights?: { delete: (n: string) => void } };
      }
    ).CSS;
    CSSH?.highlights?.delete(HIGHLIGHT_NAME);
  } catch {
    /* ignore */
  }
}

function highlightWordAtOffset(
  root: HTMLElement,
  absStart: number,
  wordLen: number,
) {
  clearWordHighlight(root);
  ensureHighlightStyles();

  const full = root.textContent ?? "";
  if (!full || absStart < 0 || absStart >= full.length) return;

  // Snap to full word bounds in textContent (never half a glyph mid-word UI)
  let start = absStart;
  while (start > 0 && !/\s/.test(full[start - 1]!)) start--;
  let end = start;
  while (end < full.length && !/\s/.test(full[end]!)) end++;
  if (end <= start) {
    end = Math.min(full.length, start + Math.max(1, wordLen));
  }

  const range = rangeFromTextContentOffsets(root, start, end - start);
  if (!range || range.collapsed) return;

  // Non-destructive highlight
  try {
    const win = window as unknown as {
      Highlight?: new (...ranges: Range[]) => unknown;
      CSS?: { highlights?: { set: (n: string, h: unknown) => void } };
    };
    if (win.Highlight && win.CSS?.highlights) {
      const highlight = new win.Highlight(range);
      win.CSS.highlights.set(HIGHLIGHT_NAME, highlight);
    }
  } catch {
    /* no CSS Custom Highlight API support in this browser — no highlight */
  }

  // Soft scroll without changing layout
  try {
    const rect = range.getBoundingClientRect();
    if (rect.top < 80 || rect.bottom > window.innerHeight - 120) {
      const node = range.startContainer.parentElement;
      node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  } catch {
    /* ignore */
  }
}

/** One-time repair if older sessions left <mark> wrappers that split words. */
function repairBrokenMarks(root: HTMLElement) {
  root.querySelectorAll("mark.tts-word-highlight, mark").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (
      !el.classList.contains("tts-word-highlight") &&
      el.tagName !== "MARK"
    ) {
      return;
    }
    // Only unwrap our TTS marks
    if (
      el.classList.contains("tts-word-highlight") ||
      el.getAttribute("data-tts-mark") === "1"
    ) {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      parent.normalize();
    }
  });
  // Also unwrap any leftover empty marks from failed TTS
  root.querySelectorAll("mark.tts-word-highlight").forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize();
  });
}

function snapToWordStart(text: string, offset: number): number {
  if (offset <= 0) return 0;
  if (offset >= text.length) return text.length;
  // If mid-word, jump back to start of word
  let i = offset;
  if (/\S/.test(text[i] ?? "") && /\S/.test(text[i - 1] ?? "")) {
    while (i > 0 && /\S/.test(text[i - 1] ?? "")) i--;
  } else {
    while (i < text.length && /\s/.test(text[i] ?? "")) i++;
  }
  return i;
}

function estimateDurationMs(charCount: number, rate: number): number {
  const words = Math.max(1, charCount / 5);
  return Math.round((words / WPM) * 60_000 / rate);
}

// ── Long-utterance chunking (round 2) ─────────────────────────────────
//
// Round 1 spoke the entire rest of the article as ONE utterance and used a
// setInterval pause()+resume() "heartbeat" (lib/tts-manager.ts) to dodge
// Chromium's ~15s silent-cutoff on long utterances. Live testing after
// round 1 showed the word highlight periodically snapping back toward the
// start — on roughly the same cadence as the heartbeat. Per the Web Speech
// API, onboundary's charIndex is scoped to the utterance's own text, but
// Chromium is known to rebase that counter around pause()/resume() cycles
// on long utterances, so a nudge every ~10s was very likely the cause of
// the desync, not just a workaround for the cutoff.
//
// Fix: split the remaining text into short, sentence-aligned chunks and
// chain them with utterance.onend instead of pausing/resuming one long
// utterance. Every chunk is sized so its *estimated* speaking time stays
// well under the ~15s cutoff even at the slowest configured rate — so the
// cutoff never has a chance to matter, and pause()/resume() is only ever
// called for a single genuine user-initiated pause (not on a timer).
const CHUNK_BUDGET_MS = 10_000; // stay well clear of the ~15s cliff
const SLOWEST_RATE = 0.75; // must match the smallest value in SPEEDS

/** Max characters per chunk so it stays under CHUNK_BUDGET_MS even at the
 * slowest configured rate (uses the same WPM estimate as estimateDurationMs,
 * solved for charCount instead of duration). */
const MAX_CHUNK_CHARS = Math.max(
  40,
  Math.floor((CHUNK_BUDGET_MS * SLOWEST_RATE * WPM * 5) / 60_000),
);

/** Find the offset of the last sentence-ending match strictly inside
 * `window` (relative offset, or -1 if none). Uses matchAll rather than a
 * manual exec()-loop so there is no shared regex lastIndex state to manage. */
function lastSentenceBoundary(window: string): number {
  const pattern = /[.!?]["']?\s+(?=[A-Z0-9]|$)/g;
  let last = -1;
  for (const match of window.matchAll(pattern)) {
    last = match.index + match[0].length;
  }
  return last;
}

/**
 * Split `text` into a contiguous sequence of chunks (chunks.join("") === text,
 * no gaps/overlaps — required so absolute-offset math stays exact across
 * chunk boundaries). Prefers sentence boundaries; falls back to the nearest
 * earlier word boundary for sentences longer than MAX_CHUNK_CHARS.
 */
function chunkArticleText(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    let end = Math.min(text.length, i + MAX_CHUNK_CHARS);
    if (end < text.length) {
      const lookaheadEnd = Math.min(text.length, end + 60);
      const window = text.slice(i, lookaheadEnd);
      const rel = lastSentenceBoundary(window);
      if (rel > 0) {
        end = i + rel;
      } else {
        // No sentence boundary in range — fall back to the nearest earlier
        // word boundary so we never split mid-word.
        let j = end;
        while (j > i + 1 && !/\s/.test(text[j]!)) j--;
        if (j > i) end = j;
      }
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks.length > 0 ? chunks : [text];
}

// ── Pill UI ─────────────────────────────────────────────────────────

function NewsReaderPill({
  title,
  isPlaying,
  isPaused,
  progress,
  elapsedMs,
  durationMs,
  speedIdx,
  langIdx,
  onPlay,
  onPauseResume,
  onStop,
  onSeekPct,
  onSpeed,
  onLang,
}: {
  title?: string;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  elapsedMs: number;
  durationMs: number;
  speedIdx: number;
  langIdx: number;
  onPlay: () => void;
  onPauseResume: () => void;
  onStop: () => void;
  onSeekPct: (pct: number) => void;
  onSpeed: (idx: number) => void;
  onLang: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Keep the speed popover mounted through its close transition instead of
  // unmounting instantly, so it can animate out rather than just vanishing.
  useEffect(() => {
    if (showMenu) {
      setMenuMounted(true);
      return;
    }
    if (!menuMounted) return;
    const t = setTimeout(() => setMenuMounted(false), 220);
    return () => clearTimeout(t);
  }, [showMenu, menuMounted]);

  const displayProgress = isScrubbing ? scrubValue : progress;

  function formatTime(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (!mounted) return null;

  return createPortal(
    <>
    {/* Backdrop must be a SIBLING behind the dock, not a child of the bar.
        When it lived inside the bar with z-[9998] it covered the speed chips
        and ate their clicks — so picking 1.15x only closed the menu and left
        playback at 1x. */}
    {menuMounted && (
      <div
        className="fixed inset-0 z-40"
        data-no-tts
        aria-hidden
        onClick={() => setShowMenu(false)}
      />
    )}
    <div
      className="gav-tts-dock pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-2 sm:bottom-4 sm:px-3 md:bottom-5"
      role="group"
      aria-label={`Listen to ${title ?? "this story"}`}
    >
      <div
        className={
          "gav-reader-bar pointer-events-auto" +
          (menuMounted ? " gav-reader-bar--expanded" : "")
        }
      >
        <button
          type="button"
          data-no-tts
          onClick={isPlaying ? onPauseResume : onPlay}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-on-accent shadow-sm hover:bg-brand-hover active:scale-95 sm:h-8 sm:w-8"
          aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
        >
          {isPlaying && !isPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        {/* Scrubber, time, divider, and language collapse out of the way while
            the speed row is open — that's what makes room for it inside the
            SAME pill instead of needing a second floating box. */}
        <div
          className={
            "gav-reader-collapsible flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5" +
            (menuMounted ? " gav-reader-collapsible--hidden" : "")
          }
        >
          <div
            data-no-tts
            className="group relative h-8 min-w-0 flex-1 cursor-pointer touch-none select-none sm:h-5 sm:max-w-[160px] sm:flex-none sm:w-[110px] lg:w-[160px]"
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
              onSeekPct(scrubValue);
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
            {/* Track + thumb centered in tall touch target (mobile-first). */}
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border-app" />
            <div
              className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
              style={{ width: `${displayProgress}%` }}
            />
            <div
              className="absolute top-1/2 z-10 h-3.5 w-3.5 rounded-full border-2 border-brand bg-elevated shadow opacity-100 sm:h-3 sm:w-3"
              style={{
                left: `clamp(7px, ${displayProgress}%, calc(100% - 7px))`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <span className="shrink-0 text-[10px] font-medium tabular-nums text-ink-3 sm:text-[11px]">
            {formatTime(elapsedMs)}
            <span className="text-ink-3/60">
              <span className="sm:hidden">/</span>
              <span className="hidden sm:inline"> / </span>
              {formatTime(durationMs)}
            </span>
          </span>

          <div className="h-4 w-px shrink-0 bg-border-app" aria-hidden />

          <button
            type="button"
            data-no-tts
            onClick={onLang}
            className="shrink-0 rounded-full px-1.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-brand hover:bg-brand-soft sm:px-2 sm:py-0.5"
            title="Language"
          >
            {LANGS[langIdx].label}
          </button>
        </div>

        {/* No separate popover surface — the speed control lives directly in
            the bar's own flex row, so opening it grows the SAME pill instead
            of spawning a second floating box beside it. */}
        {!menuMounted ? (
          <button
            type="button"
            data-no-tts
            aria-haspopup="true"
            aria-expanded={showMenu}
            className="shrink-0 rounded-full px-1.5 py-1 font-ui text-[11px] font-semibold tabular-nums text-ink-2 hover:bg-brand-soft hover:text-brand sm:px-2 sm:py-0.5"
            onClick={() => setShowMenu(true)}
          >
            {SPEEDS[speedIdx]}x
          </button>
        ) : (
          <div
            className="flex min-w-0 shrink items-center gap-0.5 overflow-x-auto whitespace-nowrap"
            data-no-tts
          >
            {SPEEDS.map((speed, i) => (
              <button
                key={speed}
                type="button"
                data-no-tts
                aria-pressed={speedIdx === i}
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeed(i);
                  setShowMenu(false);
                }}
                className={
                  "shrink-0 rounded-full px-2 py-1 font-ui text-[11px] font-semibold tabular-nums transition-colors " +
                  (speedIdx === i
                    ? "bg-brand text-on-accent"
                    : "text-ink-2 hover:bg-brand-soft hover:text-brand")
                }
              >
                {speed}x
              </button>
            ))}
            {isPlaying && (
              <button
                type="button"
                data-no-tts
                aria-label="Stop reading"
                title="Stop reading"
                onClick={(e) => {
                  e.stopPropagation();
                  onStop();
                  setShowMenu(false);
                }}
                className="ml-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[var(--gv-danger,#A11D2E)] hover:bg-[var(--gv-danger,#A11D2E)]/10"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </>,
    document.body,
  );
}

// Memoized so pill progress state updates don't wipe word <mark> nodes
const StableArticle = memo(function StableArticle({
  innerRef,
  children,
}: {
  innerRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div ref={innerRef} className="story-tts-root" data-tts-root>
      {children}
    </div>
  );
});

// ── Public StoryReader ──────────────────────────────────────────────

export function StoryReader({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const articleRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [langIdx, setLangIdx] = useState(0);

  // Mutable session (refs so event handlers always see latest)
  const fullTextRef = useRef("");
  const startOffsetRef = useRef(0); // plain offset where current utterance began
  const cursorPlainRef = useRef(0); // current plain offset (word being spoken)
  const rateRef = useRef<number>(SPEEDS[1]);
  const langRef = useRef<string>(LANGS[0].code);
  // Anchor for the between-boundaries word-advance estimate below: the last
  // offset/time we actually KNOW is correct (a real onboundary event, or the
  // clicked/chunk start position if none has fired yet). Some voices only
  // fire sparse or sentence-level boundaries — without this, the highlight
  // would freeze at the clicked word for the whole utterance whenever that
  // happens, instead of advancing word by word.
  const lastBoundaryOffsetRef = useRef(0);
  const lastBoundaryTimeRef = useRef(0);
  const lastHighlightedWordStartRef = useRef(-1);
  const totalDurationRef = useRef(0);
  const sessionStartMsRef = useRef(0); // Date.now when utterance started
  const pausedAccumMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  /** Soft-pause (audio cancelled, session kept for resume). */
  const pausedRef = useRef(false);
  /** Mirrors React isPlaying for click handlers (no stale closures). */
  const isPlayingRef = useRef(false);
  /** Last time we saw real speech activity (boundary or synth live). */
  const lastSpeechActivityRef = useRef(0);
  // The paragraph/block currently being spoken — updated on every word
  // boundary so click-to-pause always targets the block the cursor is
  // actually in (no CSS styling attached; bookkeeping only).
  const activeBlockRef = useRef<HTMLElement | null>(null);
  // Bumped by finishSession() and by every fresh speakFromOffset() call.
  // Chunk-chain callbacks (onboundary/onend/onerror) close over the value
  // captured at chunk-start time and no-op if a newer session has since
  // started — otherwise a stray onend firing after cancel()/seek() could
  // resurrect a chunk chain that should have stopped (see round 2 notes on
  // chunkArticleText).
  const sessionIdRef = useRef(0);

  useEffect(() => {
    rateRef.current = SPEEDS[speedIdx];
  }, [speedIdx]);
  useEffect(() => {
    langRef.current = LANGS[langIdx].code;
  }, [langIdx]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const syncProgressFromCursor = useCallback(() => {
    const full = fullTextRef.current;
    const len = Math.max(1, full.length);
    const cur = cursorPlainRef.current;
    const pct = Math.min(100, (cur / len) * 100);
    setProgress(pct);
    // Elapsed based on character position through full article
    const total = totalDurationRef.current || estimateDurationMs(len, rateRef.current);
    setDurationMs(total);
    setElapsedMs(Math.round((cur / len) * total));
  }, []);

  const clearHighlight = useCallback(() => {
    clearWordHighlight(articleRef.current);
  }, []);

  // Track which block (p/li/h1-3/section) contains the offset currently
  // being spoken — bookkeeping only, no styling attached to it. Used so
  // click-to-pause always targets wherever the cursor actually is, instead
  // of a block picked once at the start of a (potentially multi-paragraph)
  // utterance.
  const updateActiveBlock = useCallback((root: HTMLElement, absOffset: number) => {
    try {
      const range = rangeFromTextContentOffsets(root, absOffset, 1);
      const block = range?.startContainer.parentElement?.closest(
        "p, li, h1, h2, h3, section",
      );
      activeBlockRef.current = (block as HTMLElement) ?? null;
    } catch {
      /* ignore */
    }
  }, []);

  // Repair any old DOM-splitting marks from previous TTS version
  useEffect(() => {
    if (articleRef.current) repairBrokenMarks(articleRef.current);
  }, []);

  const finishSession = useCallback(() => {
    // Invalidate any in-flight chunk-chain callbacks (see sessionIdRef).
    sessionIdRef.current += 1;
    stopRaf();
    playingRef.current = false;
    pausedRef.current = false;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setElapsedMs(0);
    cursorPlainRef.current = 0;
    startOffsetRef.current = 0;
    activeBlockRef.current = null;
    lastHighlightedWordStartRef.current = -1;
    clearHighlight();
  }, [clearHighlight, stopRaf]);

  /**
   * Progress loop while audio is live.
   * - Prefer real speech activity (onboundary updates cursor).
   * - Do NOT invent cursor motion while the synth is dead (that caused
   *   "seconds keep ticking, highlight frozen, looks paused").
   * - If synth dies mid-session, freeze into a clean soft-pause so the
   *   pill shows the resume (play) affordance consistently.
   */
  const startProgressRaf = useCallback(() => {
    stopRaf();
    lastSpeechActivityRef.current = Date.now();
    const tick = () => {
      if (!playingRef.current || pausedRef.current) return;

      if (isSynthLive()) {
        lastSpeechActivityRef.current = Date.now();
      } else {
        // Synth silent for a bit while we think we're playing → soft-pause
        // instead of faking progress. (Chrome often drops speak() after cancel.)
        const silentFor = Date.now() - lastSpeechActivityRef.current;
        if (silentFor > 900) {
          playingRef.current = false;
          pausedRef.current = true;
          isPlayingRef.current = true;
          setIsPlaying(true);
          setIsPaused(true);
          stopRaf();
          return;
        }
      }

      // Estimate the current word between real onboundary events, so the
      // highlight keeps advancing even for voices that fire boundaries
      // sparsely (sentence-only) or not at all. A real onboundary event
      // always wins on arrival (it resets lastBoundaryOffsetRef/TimeRef),
      // so this is a fallback/smoothing layer, not a replacement — it only
      // ever advances forward from the last known-correct position.
      const root = articleRef.current;
      const full = fullTextRef.current;
      if (root && full) {
        const charsPerMs = (WPM * 5) / 60_000; // chars/ms at rate 1
        const elapsed = Date.now() - lastBoundaryTimeRef.current;
        const estimated =
          lastBoundaryOffsetRef.current + elapsed * charsPerMs * rateRef.current;
        const clamped = Math.min(full.length - 1, Math.max(0, Math.floor(estimated)));
        const wordStart = snapToWordStart(full, clamped);
        if (wordStart > lastHighlightedWordStartRef.current) {
          lastHighlightedWordStartRef.current = wordStart;
          cursorPlainRef.current = Math.max(cursorPlainRef.current, wordStart);
          const wordLen = full.slice(wordStart).match(/^\S+/)?.[0]?.length ?? 1;
          highlightWordAtOffset(root, wordStart, wordLen);
          updateActiveBlock(root, wordStart);
        }
      }

      // Only mirror elapsed from the last real cursor (boundaries). Do not
      // wall-clock-estimate past the spoken position — that desynced UI.
      syncProgressFromCursor();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, syncProgressFromCursor, updateActiveBlock]);

  const speakFromOffset = useCallback(
    (plainOffset: number) => {
      const root = articleRef.current;
      if (!root || typeof window === "undefined" || !window.speechSynthesis) return;

      // Never leave old mark wrappers around
      repairBrokenMarks(root);

      const full = getArticleText(root);
      if (!full.trim()) return;

      fullTextRef.current = full;
      const start = snapToWordStart(
        full,
        Math.max(0, Math.min(full.length, plainOffset)),
      );
      startOffsetRef.current = start;
      cursorPlainRef.current = start;

      const remaining = full.slice(start);
      if (!remaining.trim()) {
        finishSession();
        return;
      }

      totalDurationRef.current = estimateDurationMs(full.length, rateRef.current);
      setDurationMs(totalDurationRef.current);
      syncProgressFromCursor();

      // Highlight first word immediately (CSS highlight only — no DOM split)
      const firstWord = remaining.match(/^\S+/)?.[0] ?? remaining.slice(0, 1);
      highlightWordAtOffset(root, start, firstWord.length);
      updateActiveBlock(root, start);
      lastBoundaryOffsetRef.current = start;
      lastBoundaryTimeRef.current = Date.now();
      lastHighlightedWordStartRef.current = start;

      // Round 2: speak `remaining` as a chain of short chunks (see
      // chunkArticleText) instead of one long utterance, so Chromium's
      // ~15s cutoff never comes into play and no pause()/resume()
      // keep-alive nudge is needed (that nudge was the likely cause of the
      // "highlight snaps back toward start" bug reported after round 1).
      const chunks = chunkArticleText(remaining);

      // sessionStartMsRef/pausedAccumMsRef anchor the WHOLE session's
      // wall-clock estimate (used by startProgressRaf as a fallback for
      // browsers that don't fire onboundary, e.g. Safari/Firefox) — set
      // once here, and deliberately NOT reset per chunk, so the estimate
      // keeps advancing smoothly across chunk boundaries instead of
      // restarting every ~10s.
      sessionStartMsRef.current = Date.now();
      pausedAccumMsRef.current = 0;

      const mySession = ++sessionIdRef.current;
      let chunkIdx = 0;
      let chunkAbsStart = start;

      const speakChunk = () => {
        if (sessionIdRef.current !== mySession) return; // superseded — stop chaining
        if (chunkIdx >= chunks.length) {
          finishSession();
          return;
        }
        const chunkText = chunks[chunkIdx];
        const thisChunkAbsStart = chunkAbsStart;

        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = langRef.current;
        utterance.rate = rateRef.current;

        utterance.onboundary = (e: SpeechSynthesisEvent) => {
          if (sessionIdRef.current !== mySession) return;
          if (pausedRef.current) return;
          // charIndex is relative to this chunk's own text
          if (e.name !== "word" && e.name !== "sentence") return;
          lastSpeechActivityRef.current = Date.now();
          const abs = thisChunkAbsStart + (e.charIndex ?? 0);
          cursorPlainRef.current = abs;
          const fullNow = fullTextRef.current;
          const len =
            e.charLength && e.charLength > 0
              ? e.charLength
              : (fullNow.slice(abs).match(/^\S+/)?.[0].length ?? 1);
          if (articleRef.current) {
            highlightWordAtOffset(articleRef.current, abs, len);
            updateActiveBlock(articleRef.current, abs);
          }
          // A real boundary event is authoritative — resync the estimate's
          // anchor to it so the fallback advance in startProgressRaf keeps
          // counting forward from here, not from a stale earlier point.
          lastBoundaryOffsetRef.current = abs;
          lastBoundaryTimeRef.current = Date.now();
          lastHighlightedWordStartRef.current = snapToWordStart(fullNow, abs);
          syncProgressFromCursor();
        };

        utterance.onstart = () => {
          if (sessionIdRef.current !== mySession) return;
          lastSpeechActivityRef.current = Date.now();
          // Anchor the estimate at this chunk's start too, in case its
          // first onboundary is delayed or never arrives at all (some
          // voices only fire boundaries sparsely, or not per-chunk).
          lastBoundaryOffsetRef.current = thisChunkAbsStart;
          lastBoundaryTimeRef.current = Date.now();
          playingRef.current = true;
          pausedRef.current = false;
          isPlayingRef.current = true;
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          if (sessionIdRef.current !== mySession) return;
          if (pausedRef.current) return; // soft-paused — do not chain
          lastSpeechActivityRef.current = Date.now();
          chunkIdx += 1;
          chunkAbsStart = thisChunkAbsStart + chunkText.length;
          speakChunk();
        };

        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          if (sessionIdRef.current !== mySession) return;
          // Expected when we cancel for pause / seek / restart.
          const err = String(e.error ?? "");
          if (
            err === "interrupted" ||
            err === "canceled" ||
            err === "cancelled"
          ) {
            return;
          }
          finishSession();
        };

        startTTS("story", utterance);
      };

      pausedRef.current = false;
      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);
      playingRef.current = true;
      lastSpeechActivityRef.current = Date.now();
      startProgressRaf();
      speakChunk();
    },
    [finishSession, startProgressRaf, syncProgressFromCursor, updateActiveBlock],
  );

  const playFrom = useCallback(
    (plainOffset: number) => {
      // Invalidate the current chunk chain BEFORE cancel() runs — some
      // engines fire the outgoing utterance's onend synchronously inside
      // cancel(), which (without this) could race ahead and speak the old
      // chain's next chunk a moment before speakFromOffset mints the new
      // session id below.
      sessionIdRef.current += 1;
      stopTTS("story");
      stopRaf();
      speakFromOffset(plainOffset);
    },
    [speakFromOffset, stopRaf],
  );

  // Only called when nothing is currently playing (the pill routes to
  // pauseResume instead whenever isPlaying is true) — so this always starts
  // a fresh utterance from the last cursor position, never resumes.
  const play = useCallback(() => {
    const offset =
      cursorPlainRef.current > 0 &&
      cursorPlainRef.current < fullTextRef.current.length
        ? cursorPlainRef.current
        : 0;
    playFrom(offset);
  }, [playFrom]);

  const pauseResume = useCallback(() => {
    // Refs avoid stale React state when the user clicks faster than re-render.
    if (!isPlayingRef.current) {
      play();
      return;
    }
    if (pausedRef.current) {
      // Resume from frozen cursor (Chrome resume() is unreliable after cancel).
      const offset = cursorPlainRef.current;
      pausedRef.current = false;
      setIsPaused(false);
      playFrom(offset);
      return;
    }
    // Immediate hard pause. Chromium pause() often lags ~1–2s on chunks.
    // cancel() stops now; keep session (isPlaying) so next press resumes.
    pausedAccumMsRef.current += Date.now() - sessionStartMsRef.current;
    sessionIdRef.current += 1;
    playingRef.current = false;
    pausedRef.current = true;
    isPlayingRef.current = true;
    stopRaf();
    stopTTS("story");
    setIsPaused(true);
    setIsPlaying(true);
  }, [play, playFrom, stopRaf]);

  const stop = useCallback(() => {
    // Bump before cancel() for the same reason as in playFrom — some
    // engines fire onend synchronously inside cancel().
    sessionIdRef.current += 1;
    stopTTS("story");
    finishSession();
  }, [finishSession]);

  const seekPct = useCallback(
    (pct: number) => {
      const full =
        fullTextRef.current ||
        (articleRef.current ? getArticleText(articleRef.current) : "");
      if (!full) return;
      fullTextRef.current = full;
      const offset = snapToWordStart(
        full,
        Math.floor((Math.max(0, Math.min(100, pct)) / 100) * full.length),
      );
      playFrom(offset);
    },
    [playFrom],
  );

  // External stop from another TTS source
  useEffect(() => {
    return subscribeTTS((source) => {
      if (source !== "story" && source !== null) {
        finishSession();
      }
    });
  }, [finishSession]);

  // pauseResume is the single source of truth for pause/resume state
  // transitions. The click listener below is only bound once (see effect
  // deps), so it reaches the latest pauseResume through this ref rather
  // than re-implementing the same transitions a second time.
  const pauseResumeRef = useRef(pauseResume);
  useEffect(() => {
    pauseResumeRef.current = pauseResume;
  }, [pauseResume]);

  // Click anywhere in article → unified session from that point
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, [data-no-tts]")) return;

      const block = target.closest("p, li, h1, h2, h3") as HTMLElement | null;
      if (!block || !root!.contains(block)) return;

      // Second click on the paragraph currently being spoken (whether
      // actively playing or paused) = pause/resume. activeBlockRef tracks
      // wherever the cursor actually is, updated on every word boundary —
      // not a stale block picked once at the start of the session — and is
      // cleared to null whenever there's no active session, so this check
      // also naturally means "click elsewhere starts a new session".
      if (activeBlockRef.current !== null && block === activeBlockRef.current) {
        pauseResumeRef.current();
        return;
      }

      const full = getArticleText(root!);
      fullTextRef.current = full;

      let localOffset = clickToTextOffset(root!, e.clientX, e.clientY);
      // If click mapping failed, fall back to start of the clicked block
      if (localOffset <= 0) {
        try {
          const r = document.createRange();
          r.selectNodeContents(root!);
          r.setEndBefore(block);
          localOffset = r.toString().length;
        } catch {
          localOffset = 0;
        }
      }

      // Start from the exact word clicked, not the start of its sentence
      const start = snapToWordStart(full, localOffset);
      playFrom(start);
    }

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      sessionIdRef.current += 1; // invalidate any in-flight chunk chain
      stopTTS("story");
      clearHighlight();
      stopRaf();
    };
  }, [playFrom, clearHighlight, stopRaf, startProgressRaf]);

  // Refresh full text length on mount for duration display
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (articleRef.current) {
        repairBrokenMarks(articleRef.current);
        const full = getArticleText(articleRef.current);
        fullTextRef.current = full;
        const d = estimateDurationMs(full.length, rateRef.current);
        totalDurationRef.current = d;
        setDurationMs(d);
      }
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <StableArticle innerRef={articleRef}>{children}</StableArticle>
      <NewsReaderPill
        title={title}
        isPlaying={isPlaying}
        isPaused={isPaused}
        progress={progress}
        elapsedMs={elapsedMs}
        durationMs={durationMs}
        speedIdx={speedIdx}
        langIdx={langIdx}
        onPlay={play}
        onPauseResume={pauseResume}
        onStop={stop}
        onSeekPct={seekPct}
        onSpeed={(i) => {
          const nextRate = SPEEDS[i] ?? SPEEDS[1];
          setSpeedIdx(i);
          rateRef.current = nextRate;
          // Duration scales with rate — refresh estimate so the pill clock
          // matches the speed the user just picked.
          const full = fullTextRef.current;
          if (full) {
            const d = estimateDurationMs(full.length, nextRate);
            totalDurationRef.current = d;
            setDurationMs(d);
            const cur = cursorPlainRef.current;
            setElapsedMs(
              Math.round((Math.min(cur, full.length) / Math.max(1, full.length)) * d),
            );
          }
          // Only restart if actually speaking right now — if paused, just
          // remember the new speed for whenever the user presses resume
          // (previously this checked `isPlaying`, which stays true while
          // paused too, so changing speed while paused silently resumed).
          if (playingRef.current) {
            playFrom(cursorPlainRef.current);
          }
        }}
        onLang={() => {
          setLangIdx((i) => {
            const next = (i + 1) % LANGS.length;
            langRef.current = LANGS[next].code;
            if (playingRef.current) {
              // restart at cursor with new lang after state updates
              queueMicrotask(() => playFrom(cursorPlainRef.current));
            }
            return next;
          });
        }}
      />
    </>
  );
}
