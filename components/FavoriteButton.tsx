"use client";

import { useEffect, useState } from "react";

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

interface FavoriteButtonProps {
  storyId: string;
}

export function FavoriteButton({ storyId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`btn-press inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
        isFav
          ? "border-accent bg-accent-soft text-accent"
          : "border-border-app bg-elevated/80 text-ink-2 hover:border-accent-border hover:bg-accent-soft hover:text-accent"
      }`}
    >
      <HeartIcon filled={isFav && mounted} />
      <span>{mounted && isFav ? "Favorited" : "Favorite"}</span>
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