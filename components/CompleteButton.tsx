"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";

// STATE-02 (REQUIREMENTS.md): marking a story complete requires sign-in.
//
// Decision (2026-07-22): no localStorage fallback. Same reasoning as
// FavoriteButton — anonymous visitors see <SignInGate>, not this button.
// See FavoriteButton.tsx for the full rationale.

const KEY = "gavel-completed";

/** Soft layout morph — width eases, no snappy bounce. */
const layoutEase: Transition = {
  type: "tween",
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1],
};

const soft: Transition = {
  type: "tween",
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
};

interface CompleteButtonProps {
  storyId: string;
}

export function CompleteButton({ storyId }: CompleteButtonProps) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setDone(ids.includes(storyId));
    } catch {
      /* localStorage unavailable; default to not-completed */
    }
  }, [storyId]);

  const toggle = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = done ? ids.filter((x) => x !== storyId) : [...ids, storyId];
      localStorage.setItem(KEY, JSON.stringify(next));
      setDone(!done);
    } catch {
      /* fail silently */
    }
  };

  if (!mounted) {
    return (
      <div className="inline-flex h-[34px] w-[140px] animate-pulse rounded-full border border-border-app bg-elevated" />
    );
  }

  const t = reduceMotion ? { duration: 0 } : soft;
  const layoutT = reduceMotion ? { duration: 0 } : layoutEase;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={done}
      aria-label={done ? "Mark as not complete" : "Mark complete"}
      layout
      transition={{ layout: layoutT }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: done ? 1.03 : 1,
            }
      }
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium will-change-[transform,width] ${
        done
          ? "border-success bg-success-soft px-4 py-1.5 text-success"
          : "border-border-app bg-elevated/80 px-3.5 py-1.5 text-ink-2 hover:border-success hover:bg-success-soft hover:text-success"
      }`}
      style={{
        transition: reduceMotion
          ? undefined
          : "background-color 0.36s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.36s cubic-bezier(0.22, 1, 0.36, 1), color 0.36s cubic-bezier(0.22, 1, 0.36, 1), padding 0.36s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <motion.span
        layout
        transition={{ layout: layoutT }}
        className="inline-flex size-3.5 shrink-0 items-center justify-center"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: done ? 1.08 : 1,
              }
        }
      >
        <CompleteIcon done={done} reduceMotion={!!reduceMotion} />
      </motion.span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "completed" : "mark"}
          layout
          initial={reduceMotion ? false : { opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
          transition={t}
          className="inline-block"
        >
          {done ? "Completed" : "Mark complete"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function CompleteIcon({
  done,
  reduceMotion,
}: {
  done: boolean;
  reduceMotion: boolean;
}) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <motion.path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{
          pathLength: done ? 1 : 0,
          opacity: done ? 1 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : done
              ? {
                  pathLength: {
                    duration: 0.36,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.05,
                  },
                  opacity: { duration: 0.14 },
                }
              : {
                  pathLength: {
                    duration: 0.24,
                    ease: [0.4, 0, 1, 1],
                  },
                  opacity: { duration: 0.18 },
                }
        }
      />
    </svg>
  );
}
