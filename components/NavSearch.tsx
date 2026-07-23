"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { SearchHit } from "@/lib/search";

const FAV_KEY = "gavel-favorites";
const DONE_KEY = "gavel-completed";
const RECENT_KEY = "gavel-recent-searches";

type NavSearchProps = {
  /** Compact trigger for the mobile header pill */
  compact?: boolean;
  /** Controlled open (optional — used by mobile pill) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function NavSearch({
  compact = false,
  open: openProp,
  onOpenChange,
}: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (openProp === undefined) setInternalOpen(next);
    },
    [onOpenChange, openProp],
  );

  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    try {
      const favRaw = localStorage.getItem(FAV_KEY);
      const doneRaw = localStorage.getItem(DONE_KEY);
      const recentRaw = localStorage.getItem(RECENT_KEY);
      setFavIds(new Set(favRaw ? (JSON.parse(favRaw) as string[]) : []));
      setDoneIds(new Set(doneRaw ? (JSON.parse(doneRaw) as string[]) : []));
      setRecent(recentRaw ? (JSON.parse(recentRaw) as string[]) : []);
    } catch {
      /* ignore */
    }
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const runSearch = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=12`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as {
        hits: SearchHit[];
        total: number;
      };
      setHits(data.hits);
      setTotal(data.total);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setHits([]);
      setTotal(0);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(q.trim());
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, open, runSearch]);

  function remember(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((cur) => {
      const next = [trimmed, ...cur.filter((x) => x !== trimmed)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function goToSearchPage(query: string) {
    const trimmed = query.trim();
    remember(trimmed);
    setOpen(false);
    if (!trimmed) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function goToStory(hit: SearchHit) {
    remember(q);
    setOpen(false);
    router.push(`/story/${hit.slug}`);
  }

  const trigger = compact ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Search stories"
      title="Search (⌘K)"
      aria-expanded={open}
      aria-controls={panelId}
      className="inline-flex size-7 items-center justify-center rounded-sm text-ink-2 hover:bg-brand-soft hover:text-brand"
    >
      <SearchIcon />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open search"
      title="Search all stories (⌘K)"
      aria-expanded={open}
      aria-controls={panelId}
      className="icon-btn inline-flex h-8 items-center gap-2 rounded-full border border-border-app bg-elevated/80 px-2.5 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand sm:h-9 sm:px-3"
    >
      <SearchIcon />
      <span className="hidden text-[12px] font-medium sm:inline">Search</span>
      <kbd className="hidden rounded border border-border-app bg-elevated-muted px-1.5 py-0.5 font-mono text-[10px] text-ink-3 md:inline">
        ⌘K
      </kbd>
    </button>
  );

  const panel =
    mounted && open
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 px-3 pb-6 pt-[min(12vh,5rem)] backdrop-blur-[3px] sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search all stories"
            id={panelId}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="flex max-h-[min(78vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-app bg-elevated shadow-[var(--shadow-lg,0_16px_48px_rgba(0,0,0,0.18))]">
              <form
                className="flex shrink-0 items-center gap-2 border-b border-border-app px-3 py-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  goToSearchPage(q);
                }}
              >
                <SearchIcon className="shrink-0 text-brand" />
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search all stories…"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
                  aria-label="Search all current-affairs stories"
                  autoComplete="off"
                />
                {loading && (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    …
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-3 hover:bg-elevated-muted hover:text-ink"
                >
                  Esc
                </button>
              </form>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                {!q.trim() && recent.length > 0 && (
                  <div className="mb-2 px-1.5">
                    <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                      Recent
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recent.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setQ(r)}
                          className="rounded-full border border-border-app bg-elevated-muted/60 px-2.5 py-1 text-[11px] font-medium text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!q.trim() && recent.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-ink-3">
                    Search the full catalog — every edition, not just the
                    archive page.
                  </p>
                )}

                {q.trim() && hits.length === 0 && !loading && (
                  <p className="px-3 py-8 text-center text-sm text-ink-3">
                    No stories match &ldquo;{q.trim()}&rdquo;
                  </p>
                )}

                {hits.length > 0 && (
                  <ul className="space-y-0.5" role="listbox">
                    {hits.map((hit) => {
                      const isFav = favIds.has(hit.id);
                      const isDone = doneIds.has(hit.id);
                      return (
                        <li key={hit.id}>
                          <button
                            type="button"
                            role="option"
                            onClick={() => goToStory(hit)}
                            className="flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-soft/70 focus-visible:bg-brand-soft focus-visible:outline-none"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[13.5px] font-semibold leading-snug text-ink">
                                {hit.title}
                              </span>
                              {(isFav || isDone) && (
                                <span className="mt-0.5 flex shrink-0 items-center gap-1">
                                  {isFav && (
                                    <span
                                      className="rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-accent"
                                      title="Saved"
                                    >
                                      Saved
                                    </span>
                                  )}
                                  {isDone && (
                                    <span
                                      className="rounded-full bg-success-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-success"
                                      title="Completed"
                                    >
                                      Done
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-3">
                              <span className="font-medium text-brand">
                                {hit.categoryLabel}
                              </span>
                              <span aria-hidden>·</span>
                              <span>{formatDate(hit.editionDate)}</span>
                              <span aria-hidden>·</span>
                              <span>
                                {formatReadingTime(hit.readingTimeMin)}
                              </span>
                              {hit.decision === "must_cover" && (
                                <>
                                  <span aria-hidden>·</span>
                                  <span className="font-semibold text-ink-2">
                                    Must cover
                                  </span>
                                </>
                              )}
                            </div>
                            {hit.teaser && (
                              <p className="line-clamp-1 text-[12px] leading-snug text-ink-3">
                                {hit.teaser}
                              </p>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border-app px-3 py-2">
                <p className="font-mono text-[10px] text-ink-3">
                  {q.trim()
                    ? loading
                      ? "Searching…"
                      : `${total} in catalog`
                    : "Full database"}
                </p>
                <Link
                  href={
                    q.trim()
                      ? `/search?q=${encodeURIComponent(q.trim())}`
                      : "/search"
                  }
                  onClick={() => {
                    remember(q);
                    setOpen(false);
                  }}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  Open full search →
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {panel}
    </>
  );
}

function SearchIcon({ className = "text-current" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
