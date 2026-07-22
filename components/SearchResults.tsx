"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublishedStory } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { EmptyState } from "./EmptyState";
import { SearchInput } from "./SearchInput";

interface SearchResultsProps {
  initialQuery: string;
  initialResults: PublishedStory[];
}

const RECENT_KEY = "gavel-recent-searches";

export function SearchResults({ initialQuery, initialResults }: SearchResultsProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [recent, setRecent] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const onSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((cur) => {
      const next = [trimmed, ...cur.filter((x) => x !== trimmed)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    startTransition(() => router.push(`/search?q=${encodeURIComponent(trimmed)}`));
  };

  const isInitial = !sp?.get("q");

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="mb-2 font-ui text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Search
        </h1>
        <p className="text-ink-2">
          Search across every published edition. Title, summary, and key points.
        </p>
      </header>

      <SearchInput value={query} onChange={setQuery} onSubmit={onSubmit} />

      {recent.length > 0 && isInitial && (
        <div className="mt-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Recent searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setQuery(r);
                  onSubmit(r);
                }}
                className="rounded-full border border-border-app bg-elevated px-3 py-1.5 text-xs text-ink-2 transition-all duration-[200ms] ease-out hover:border-brand-border hover:bg-brand-soft hover:text-brand active:scale-[0.95]"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="mt-10">
        {initialResults.length === 0 ? (
          <EmptyState
            title={query ? "No results" : "Search the archive"}
            body={
              query
                ? `Nothing matches "${query}". Try a different keyword.`
                : "Try keywords like 'Article 200', 'Section 302', 'DPDPA', 'murder'."
            }
          />
        ) : (
          <>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-3">
              {initialResults.length}{" "}
              {initialResults.length === 1 ? "result" : "results"}
              {query ? ` for "${query}"` : ""}
            </h2>
            <div className="grid gap-4">
              {initialResults.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}