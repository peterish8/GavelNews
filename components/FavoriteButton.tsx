"use client";

import { useEffect, useState } from "react";

const KEY = "gavel-favorites";

interface FavoriteButtonProps {
  storyId: string;
}

export function FavoriteButton({ storyId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setIsFav(ids.includes(storyId));
    } catch {}
  }, [storyId]);

  const toggle = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = isFav ? ids.filter((x) => x !== storyId) : [...ids, storyId];
      localStorage.setItem(KEY, JSON.stringify(next));
      setIsFav(!isFav);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-[200ms] ease-out active:scale-[0.94] ${
        isFav
          ? "border-accent bg-accent-soft text-accent"
          : "border-border-app bg-elevated text-ink-2 hover:border-accent-border hover:bg-accent-soft hover:text-accent"
      }`}
    >
      <HeartIcon filled={isFav} />
      <span>{isFav ? "Favorited" : "Favorite"}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden
      className="transition-transform"
    >
      <path
        d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3.2 4 6.5 4c1.9 0 3.5 1 4.5 2.5 1-1.5 2.6-2.5 4.5-2.5 3.3 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}