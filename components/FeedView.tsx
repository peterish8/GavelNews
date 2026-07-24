"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Category, PublishedStory } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CategoryFilter } from "./CategoryFilter";
import { EmptyState } from "./EmptyState";
import { formatDate, formatReadingTime } from "@/lib/format";
import {
  BookmarkIcon,
  ClockIcon,
  DocumentIcon,
  FlameIcon,
  CalendarIcon,
} from "./icons";

interface FeedViewProps {
  stories: PublishedStory[];
  heading: string;
  subtitle?: string;
  /** ISO date of this edition */
  editionDate?: string;
  /** Previous edition date (for one-click back) */
  prevEditionDate?: string | null;
  /** Next edition date for archive browsing */
  nextEditionDate?: string | null;
  /** Total editions published (for "Day N" habit cue) */
  editionIndex?: number;
}

export function FeedView({
  stories,
  heading,
  subtitle,
  editionDate,
  prevEditionDate,
  nextEditionDate,
  editionIndex,
}: FeedViewProps) {
  const [selected, setSelected] = useState<Category[]>([]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return stories;
    return stories.filter((s) => selected.includes(s.category));
  }, [stories, selected]);

  const toggle = (cat: Category) =>
    setSelected((cur) =>
      cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat],
    );

  const { lead, mustCoverRest, maybeStories } = useMemo(() => {
    const must = filtered.filter((s) => s.decision === "must_cover");
    const maybe = filtered.filter((s) => s.decision !== "must_cover");
    const leadStory = must[0] ?? filtered[0] ?? null;
    const restMust = leadStory
      ? must.filter((s) => s.id !== leadStory.id)
      : must;
    const maybeClean = leadStory
      ? maybe.filter((s) => s.id !== leadStory.id)
      : maybe;
    return {
      lead: leadStory,
      mustCoverRest: restMust,
      maybeStories: maybeClean,
    };
  }, [filtered]);

  const totalMins = useMemo(
    () => filtered.reduce((sum, s) => sum + s.readingTimeMin, 0),
    [filtered],
  );

  const mustCoverCount = useMemo(
    () => filtered.filter((s) => s.decision === "must_cover").length,
    [filtered],
  );

  const avgMustRead = useMemo(() => {
    const must = filtered.filter((s) => s.decision === "must_cover");
    if (must.length === 0) return lead?.readingTimeMin ?? 0;
    return Math.round(
      must.reduce((s, x) => s + x.readingTimeMin, 0) / must.length,
    );
  }, [filtered, lead]);

  const dateLabel = editionDate ?? stories[0]?.editionDate;

  return (
    <div className="content-shell">
      {/* Morning Brief hero (spec §13–17) */}
      <section className="surface-brief relative mb-5 px-5 py-6 sm:px-7 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <svg
            className="absolute bottom-0 right-0 h-[70%] w-[55%] opacity-[0.07]"
            viewBox="0 0 400 200"
            preserveAspectRatio="xMaxYMax meet"
            fill="none"
          >
            <path
              d="M20 160c40-30 80-50 140-40s100 30 160 10 80-40 100-30"
              stroke="var(--brand)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M40 180c50-28 90-45 150-32s110 22 170 0"
              stroke="var(--brand)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              d="M60 140c45-22 95-38 145-28s95 18 155 5"
              stroke="var(--brand)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          <div className="min-w-0">
            <div className="mb-0 flex flex-wrap items-center gap-2">
              {typeof editionIndex === "number" && editionIndex > 0 && (
                <span className="inline-flex h-[34px] items-center rounded-[9px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.72)] px-3 text-[13px] font-semibold text-ink dark:bg-[rgba(26,24,40,0.7)]">
                  Day {editionIndex}
                </span>
              )}
              {dateLabel && (
                <span className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-brand-border bg-brand-soft px-3 text-[13px] font-semibold text-brand">
                  <CalendarIcon />
                  {formatDate(dateLabel)}
                </span>
              )}
            </div>

            <h1 className="page-title mt-[22px] max-w-xl text-[clamp(40px,4.2vw,58px)]">
              {heading}
            </h1>
            {subtitle && (
              <p className="mt-3.5 max-w-[540px] text-[17px] leading-[1.55] text-ink-2">
                {subtitle}
              </p>
            )}

            {(prevEditionDate || nextEditionDate) && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {prevEditionDate ? (
                  <Link
                    href={`/edition/${prevEditionDate}`}
                    className="btn-press inline-flex items-center gap-1.5 rounded-full border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                  >
                    <Chevron dir="left" />
                    {formatDate(prevEditionDate)}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-xs text-ink-3">
                    Oldest edition
                  </span>
                )}
                {nextEditionDate ? (
                  <Link
                    href={`/edition/${nextEditionDate}`}
                    className="btn-press inline-flex items-center gap-1.5 rounded-full border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                  >
                    {formatDate(nextEditionDate)}
                    <Chevron dir="right" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-ink-3">
                    Latest
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stat cards (spec §16) */}
          <dl className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:flex lg:gap-3">
            <Stat
              label="Stories"
              value={String(filtered.length)}
              icon={<DocumentIcon />}
              tone="brand"
            />
            <Stat
              label="Read Time"
              value={`${totalMins}m`}
              icon={<ClockIcon />}
              tone="magenta"
            />
            <Stat
              label="Must Cover"
              value={String(mustCoverCount)}
              icon={<BookmarkIcon />}
              tone="orange"
            />
          </dl>
        </div>
      </section>

      {/* Syllabus filter (spec §18) */}
      <section className="mb-[18px] mt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">
              Syllabus filter
            </h2>
            <div className="mt-2.5">
              <CategoryFilter selected={selected} onToggle={toggle} />
            </div>
          </div>
          {selected.length > 0 && (
            <p className="text-[11px] text-ink-3 sm:text-right">
              {filtered.length}/{stories.length} matching
            </p>
          )}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stories match"
          body="Try removing a filter, or check back tomorrow for the next edition."
        />
      ) : (
        <>
          {/* Priority grid (spec §19–26) */}
          {lead && (
            <section className="mb-6 grid items-stretch gap-[18px] lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
              <div className="min-w-0">
                <StoryCard story={lead} size="featured" />
              </div>

              <aside className="surface-standard flex min-h-0 flex-col p-5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-ink">
                    <span className="inline-flex text-brand" aria-hidden>
                      <FlameIcon className="text-brand" />
                    </span>
                    {mustCoverRest.length > 0
                      ? "Also must read"
                      : "Start here"}
                  </h2>
                  <span className="text-[11px] text-ink-3">
                    {avgMustRead} min read avg
                  </span>
                </div>
                <div className="h-px bg-[rgba(205,198,220,0.36)]" aria-hidden />

                <div className="flex flex-1 flex-col">
                  {mustCoverRest.length > 0 ? (
                    mustCoverRest.slice(0, 4).map((story, i) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        size="rail"
                        index={i + 2}
                      />
                    ))
                  ) : (
                    <p className="py-5 text-sm leading-relaxed text-ink-3">
                      One must-cover story today. Everything below is optional
                      depth.
                    </p>
                  )}
                </div>

                <Link
                  href="/archive"
                  className="btn-press mt-3 flex h-[42px] w-full items-center justify-center rounded-[10px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.42)] text-sm font-semibold text-brand hover:border-brand-border hover:bg-brand-soft dark:bg-[rgba(26,24,40,0.4)]"
                  style={{ fontWeight: 650 }}
                >
                  View all must read →
                </Link>
              </aside>
            </section>
          )}

          {mustCoverRest.length > 4 && (
            <section className="mb-8">
              <SectionLabel>More must cover</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {mustCoverRest.slice(4).map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i + 6} />
                ))}
              </div>
            </section>
          )}

          {/* More stories (spec §27–28) */}
          {maybeStories.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="section-title inline-flex items-center gap-2 text-[22px]">
                  <span className="inline-block size-2 rounded-full bg-brand" aria-hidden />
                  More stories for you
                </h2>
                <Link
                  href="/archive"
                  className="shrink-0 text-sm font-semibold text-brand hover:underline"
                  style={{ fontWeight: 650 }}
                >
                  View all stories →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {maybeStories.map((story) => (
                  <StoryCard key={story.id} story={story} size="muted" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
        {children}
      </h2>
      <div className="mb-1 h-px flex-1 bg-[rgba(205,198,220,0.36)]" aria-hidden />
    </div>
  );
}

type StatTone = "brand" | "magenta" | "orange";

const STAT_TONE: Record<StatTone, { chip: string; icon: string }> = {
  brand: {
    chip: "border-brand-border bg-brand-soft text-brand",
    icon: "text-brand",
  },
  magenta: {
    chip: "border-brand-2-border bg-brand-2-soft text-brand-2",
    icon: "text-brand-2",
  },
  orange: {
    chip: "border-gold-border bg-gold-soft text-gold",
    icon: "text-gold",
  },
};

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: StatTone;
}) {
  const t = STAT_TONE[tone];
  return (
    <div className="surface-stat flex w-[145px] min-w-[120px] flex-col px-[18px] py-5 sm:w-auto lg:w-[145px]">
      <div className="mb-3">
        <span
          className={`inline-flex size-9 items-center justify-center rounded-[10px] border ${t.chip}`}
        >
          <span className={t.icon}>{icon}</span>
        </span>
      </div>
      <dd className="font-[family-name:var(--font-editorial)] text-[31px] leading-none text-ink">
        {value}
      </dd>
      <dt className="mt-2 text-[12px] text-ink-3">{label}</dt>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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

