"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "./EmptyState";

const KEY = "gavel-favorites";

// Client list — v1 stores favorite IDs in localStorage (same key as FavoriteButton).
// Post-Supabase this becomes a server fetch of the favourites table.
export function FavoritesList() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setIds([]);
    }
  }, []);

  if (ids === null) {
    return (
      <p className="text-sm text-ink-3" aria-live="polite">
        Loading saved stories…
      </p>
    );
  }

  if (ids.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        body="When you save a story, it shows up here for quick revision."
        action={
          <Link
            href="/"
            className="btn-press inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-accent"
          >
            Open today&apos;s edition
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      {ids.map((id) => (
        <li
          key={id}
          className="surface-standard flex items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p className="font-sans text-[10px] uppercase tracking-wider text-ink-3">
              Story id
            </p>
            <p className="font-medium text-ink">{id}</p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Find in edition
          </Link>
        </li>
      ))}
    </ul>
  );
}
