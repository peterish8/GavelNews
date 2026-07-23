"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";

// STATE-01 (REQUIREMENTS.md): favoriting a story requires sign-in.
//
// Decision (2026-07-22): no localStorage fallback. Anonymous visitors
// never see this button at all — the story page renders a <SignInGate>
// CTA in its place. This matches STATE-01 verbatim and avoids the
// "merge into account on sign-in" UX complexity. If the product later
// wants a local-first wishlist, this is the place to add it.
//
// Auth check: this component trusts that its parent only mounts it
// when `getCurrentUser().signedIn === true`. It does not re-check —
// it is a leaf, not a gate. The page-level gate is in
// app/story/[slug]/page.tsx.

const KEY = "gavel-favorites";

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

interface FavoriteButtonProps {
  storyId: string;
}

export function FavoriteButton({ storyId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  // Read favorite state on mount. v1 stores in localStorage as a
  // lightweight cache; post-Supabase this becomes a fetch from the
  // `favourites` table (RLS will scope the read to the current user).
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setIsFav(ids.includes(storyId));
    } catch {
      /* localStorage unavailable; default to not-favorited */
    }
  }, [storyId]);

  const toggle = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = isFav ? ids.filter((x) => x !== storyId) : [...ids, storyId];
      localStorage.setItem(KEY, JSON.stringify(next));
      setIsFav(!isFav);
    } catch {
      /* fail silently — UX should still feel responsive */
    }
  };

  const active = mounted && isFav;
  const t = reduceMotion ? { duration: 0 } : soft;
  const layoutT = reduceMotion ? { duration: 0 } : layoutEase;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from saved" : "Save story"}
      layout
      transition={{ layout: layoutT }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: active ? 1.03 : 1,
            }
      }
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium will-change-[transform,width] ${
        active
          ? "border-accent bg-accent-soft px-4 py-1.5 text-accent"
          : "border-border-app bg-elevated/80 px-3.5 py-1.5 text-ink-2 hover:border-accent-border hover:bg-accent-soft hover:text-accent"
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
                scale: active ? 1.08 : 1,
              }
        }
      >
        <BookmarkIcon filled={active} reduceMotion={!!reduceMotion} />
      </motion.span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={active ? "saved" : "save"}
          layout
          initial={reduceMotion ? false : { opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
          transition={t}
          className="inline-block"
        >
          {active ? "Saved" : "Save"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function BookmarkIcon({
  filled,
  reduceMotion,
}: {
  filled: boolean;
  reduceMotion: boolean;
}) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <motion.path
        d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={false}
        animate={{
          fill: filled ? "currentColor" : "rgba(0,0,0,0)",
          fillOpacity: filled ? 1 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                fill: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                fillOpacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }
        }
      />
    </svg>
  );
}
