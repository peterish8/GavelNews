"use client";

import { useEffect, useState } from "react";

// STATE-02 (REQUIREMENTS.md): marking a story complete requires sign-in.
//
// Decision (2026-07-22): no localStorage fallback. Same reasoning as
// FavoriteButton — anonymous visitors see <SignInGate>, not this button.
// See FavoriteButton.tsx for the full rationale.

const KEY = "gavel-completed";

interface CompleteButtonProps {
  storyId: string;
}

export function CompleteButton({ storyId }: CompleteButtonProps) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={done}
      className={`btn-press inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
        done
          ? "border-success bg-success-soft text-success"
          : "border-border-app bg-elevated/80 text-ink-2 hover:border-success hover:bg-success-soft hover:text-success"
      }`}
    >
      {done ? <CheckCircleIcon /> : <CircleIcon />}
      <span>{done ? "Completed" : "Mark complete"}</span>
    </button>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}