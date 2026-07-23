"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublishedStory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";
import { EmptyState } from "./EmptyState";
import { SearchInput } from "./SearchInput";

interface SearchResultsProps {
  initialQuery: string;
  initialResults: PublishedStory[];
}

const RECENT_KEY = "gavel-recent-searches";
const FAV_KEY = "gavel-favorites";
const DONE_KEY = "gavel-completed";

export function SearchResults({
  initialQuery,
  initialResults,
}: SearchResultsProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [recent, setRecent] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
      const favRaw = localStorage.getItem(FAV_KEY);
      const doneRaw = localStorage.getItem(DONE_KEY);
      setFavIds(new Set(favRaw ? (JSON.parse(favRaw) as string[]) : []));
      setDoneIds(new Set(doneRaw ? (JSON.parse(doneRaw) as string[]) : []));
    } catch {
      /* ignore */
    }
  }, []);

  const onSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((cur) => {
      const next = [trimmed, ...cur.filter((x) => x !== trimmed)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    startTransition(() =>
      router.push(`/search?q=${encodeURIComponent(trimmed)}`),
    );
  };

  const isInitial = !sp?.get("q");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 md:py-16">
      <header className="mb-8">
        <h1 className="mb-2 font-ui text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Search
        </h1>
        <p className="text-ink-2">
          Full catalog — every published edition and story. Title, summary, body,
          and key points.
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
            title={query ? "No results" : "Search the catalog"}
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
            <ul className="divide-y divide-border-app overflow-hidden rounded-2xl border border-border-app bg-elevated">
              {initialResults.map((s) => {
                const meta = CATEGORY_META[s.category];
                const isFav = favIds.has(s.id);
                const isDone = doneIds.has(s.id);
                const teaser =
                  s.summary?.trim() || s.whatHappened.trim().slice(0, 120);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/story/${s.slug}`}
                      className="pressable flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-brand-soft/50 sm:px-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[15px] font-semibold leading-snug text-ink">
                          {s.title}
                        </h3>
                        {(isFav || isDone) && (
                          <span className="mt-0.5 flex shrink-0 gap-1">
                            {isFav && (
                              <span className="rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-accent">
                                Saved
                              </span>
                            )}
                            {isDone && (
                              <span className="rounded-full bg-success-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-success">
                                Done
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-3">
                        <span className="font-medium text-brand">
                          {meta.shortLabel}
                        </span>
                        <span aria-hidden>·</span>
                        <span>{formatDate(s.editionDate)}</span>
                        <span aria-hidden>·</span>
                        <span>{formatReadingTime(s.readingTimeMin)}</span>
                        {s.decision === "must_cover" && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="font-semibold text-ink-2">
                              Must cover
                            </span>
                          </>
                        )}
                      </div>
                      {teaser && (
                        <p className="line-clamp-1 text-[12.5px] leading-snug text-ink-3">
                          {teaser}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
