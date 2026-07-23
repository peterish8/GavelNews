"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import type { ArchiveMonth, Edition } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const panelTransition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

interface CalendarBrowserProps {
  archive: ArchiveMonth[];
}

export function CalendarBrowser({ archive }: CalendarBrowserProps) {
  const reduceMotion = useReducedMotion();

  const { editionByDate, monthKeys, mostRecentDate } = useMemo(() => {
    const map = new Map<string, Edition>();
    const months: string[] = [];
    for (const m of archive) {
      months.push(m.month);
      for (const ed of m.editions) {
        map.set(ed.date, ed);
      }
    }
    // archive is newest-first; editions within a month are newest-first
    const recent =
      archive[0]?.editions[0]?.date ??
      Array.from(map.keys()).sort((a, b) => b.localeCompare(a))[0] ??
      null;
    return {
      editionByDate: map,
      monthKeys: months, // newest first, months that have editions only
      mostRecentDate: recent,
    };
  }, [archive]);

  const [viewMonth, setViewMonth] = useState(
    () => mostRecentDate?.slice(0, 7) ?? monthKeys[0] ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => mostRecentDate,
  );

  const monthIndex = monthKeys.indexOf(viewMonth);
  const canPrev = monthIndex >= 0 && monthIndex < monthKeys.length - 1; // older
  const canNext = monthIndex > 0; // newer

  const goPrevMonth = () => {
    if (!canPrev) return;
    setViewMonth(monthKeys[monthIndex + 1]!);
  };
  const goNextMonth = () => {
    if (!canNext) return;
    setViewMonth(monthKeys[monthIndex - 1]!);
  };

  const monthLabel = useMemo(() => {
    if (!viewMonth) return "";
    const fromArchive = archive.find((m) => m.month === viewMonth)?.label;
    if (fromArchive) return fromArchive;
    const [y, m] = viewMonth.split("-").map(Number);
    if (!y || !m) return viewMonth;
    return `${MONTHS_LONG[m - 1]} ${y}`;
  }, [archive, viewMonth]);

  const cells = useMemo(() => {
    if (!viewMonth) return [] as Array<{ key: string; day: number | null; iso: string | null }>;
    const [y, m] = viewMonth.split("-").map(Number);
    const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sun
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const out: Array<{ key: string; day: number | null; iso: string | null }> = [];

    for (let i = 0; i < firstDow; i++) {
      out.push({ key: `pad-${i}`, day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      out.push({ key: iso, day: d, iso });
    }
    // Pad trailing cells so the grid ends on a full week
    while (out.length % 7 !== 0) {
      out.push({ key: `trail-${out.length}`, day: null, iso: null });
    }
    return out;
  }, [viewMonth]);

  const selectedEdition = selectedDate
    ? editionByDate.get(selectedDate) ?? null
    : null;

  /** Must-cover first, then the rest — "important" articles surface on click. */
  const dayStories = useMemo(() => {
    if (!selectedEdition) return [];
    return [...selectedEdition.stories].sort((a, b) => {
      const aMust = a.decision === "must_cover" ? 0 : 1;
      const bMust = b.decision === "must_cover" ? 0 : 1;
      return aMust - bMust;
    });
  }, [selectedEdition]);

  if (!viewMonth || monthKeys.length === 0) {
    return null;
  }

  return (
    <section className="mb-10" aria-label="Browse editions by date">
      {/* Split layout: same-height columns — calendar left, day list right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(20rem,38rem)_minmax(0,1fr)] lg:items-stretch lg:gap-6 xl:grid-cols-[minmax(22rem,42rem)_minmax(0,1fr)]">
        {/* ── Calendar panel (left) ── */}
        <div className="glass-card flex h-full min-h-0 w-full max-w-2xl flex-col p-4 sm:p-5 lg:max-w-none lg:p-6">
          {/* Month header */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canPrev}
              aria-label="Previous month with editions"
              className="btn-press inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/90 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-30"
            >
              <Chevron dir="left" />
            </button>

            <h2 className="font-ui text-lg font-bold tracking-tight text-ink sm:text-xl">
              {monthLabel}
            </h2>

            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canNext}
              aria-label="Next month with editions"
              className="btn-press inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/90 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-30"
            >
              <Chevron dir="right" />
            </button>
          </div>

          {/* Weekday row */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date grid — true square cells */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {cells.map((cell) => {
              if (cell.day === null || !cell.iso) {
                return (
                  <div
                    key={cell.key}
                    className="aspect-square w-full"
                    aria-hidden
                  />
                );
              }

              const edition = editionByDate.get(cell.iso);
              const hasEdition = Boolean(edition);
              const isSelected = selectedDate === cell.iso;
              const count = edition?.stories.length ?? 0;

              if (!hasEdition) {
                return (
                  <div
                    key={cell.key}
                    className="flex aspect-square w-full cursor-default items-center justify-center rounded-md border border-transparent"
                  >
                    <span className="font-ui text-sm font-medium tabular-nums text-ink-3/45 sm:text-base">
                      {cell.day}
                    </span>
                  </div>
                );
              }

              return (
                <motion.button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cell.iso)}
                  aria-label={`${formatDate(cell.iso)} — ${count} ${count === 1 ? "story" : "stories"}`}
                  aria-pressed={isSelected}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { scale: 1.04 }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 480, damping: 28 }
                  }
                  className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-md border transition-shadow duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
                    isSelected
                      ? "border-brand bg-brand text-on-accent shadow-sm ring-2 ring-brand"
                      : "border-brand-border bg-brand-soft text-brand hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`font-ui text-base font-bold tabular-nums sm:text-lg md:text-xl ${
                      isSelected ? "text-on-accent" : "text-ink"
                    }`}
                  >
                    {cell.day}
                  </span>

                  <span
                    className={`absolute right-1 top-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold tabular-nums sm:size-5 sm:text-[10px] ${
                      isSelected
                        ? "bg-on-accent text-brand"
                        : "bg-brand text-on-accent"
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Day articles panel (right) — same height as calendar ── */}
        <div className="relative min-h-[18rem] min-w-0 self-stretch">
          <AnimatePresence mode="wait" initial={false}>
            {selectedEdition && selectedDate ? (
              <motion.div
                key={selectedDate}
                initial={
                  reduceMotion ? false : { opacity: 0, x: 10 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: -6 }
                }
                transition={reduceMotion ? { duration: 0 } : panelTransition}
                className="flex flex-col lg:absolute lg:inset-0"
              >
                {/* Compact header */}
                <div className="mb-2.5 flex shrink-0 flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[11px] text-ink-3">
                    <span className="font-medium text-ink-2">
                      {formatDate(selectedDate)}
                    </span>
                    <span className="mx-1.5 opacity-40">·</span>
                    {selectedEdition.stories.length}{" "}
                    {selectedEdition.stories.length === 1 ? "story" : "stories"}
                  </p>
                  <Link
                    href={`/edition/${selectedDate}`}
                    className="btn-press inline-flex items-center gap-1 text-[11px] font-medium text-ink-3 hover:text-brand"
                  >
                    Full edition
                    <span aria-hidden>→</span>
                  </Link>
                </div>

                <div className="surface-standard flex min-h-0 flex-1 flex-col overflow-hidden">
                  <ul className="min-h-0 flex-1 divide-y divide-border-app/80 overflow-y-auto overscroll-contain">
                    {dayStories.map((story) => {
                      const meta = CATEGORY_META[story.category];
                      const isMust = story.decision === "must_cover";
                      return (
                        <li key={story.id}>
                          <Link
                            href={`/story/${story.slug}`}
                            className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-elevated-muted/70 sm:px-5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full border border-brand-border bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                                  {meta.shortLabel}
                                </span>
                                {isMust && (
                                  <span className="rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium text-ink-3">
                                    Must cover
                                  </span>
                                )}
                              </div>
                              <h4 className="font-ui text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand sm:truncate">
                                {story.title}
                              </h4>
                              {story.summary && (
                                <p className="mt-0.5 line-clamp-2 text-sm text-ink-2 sm:line-clamp-1">
                                  {story.summary}
                                </p>
                              )}
                              <p className="mt-1 font-mono text-[11px] text-ink-3">
                                {formatReadingTime(story.readingTimeMin)}
                              </p>
                            </div>
                            <span className="mt-1 shrink-0 self-center text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                              <ArrowIcon />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border-app bg-elevated-muted/40 px-6 py-10 text-center lg:absolute lg:inset-0"
              >
                <p className="font-ui text-sm font-medium text-ink-2">
                  Pick a highlighted day
                </p>
                <p className="mt-1 max-w-xs text-sm text-ink-3">
                  Days with an edition show a count badge. Click one to see that
                  day&apos;s important stories here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
