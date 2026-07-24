"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, PublishedStory } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CategoryFilter } from "./CategoryFilter";
import { EmptyState } from "./EmptyState";
import { formatDate, formatReadingTime } from "@/lib/format";

interface FeedViewProps {
  stories: PublishedStory[];
  heading: string;
  subtitle?: string;
  /** ISO date of this edition */
  editionDate?: string;
  /** Previous edition date (for one-click back) */
  prevEditionDate?: string | null;
  /** Next edition date (for archive browsing) */
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

  // Hierarchy from decision field (admin/engine already sets this)
  const { lead, mustCoverRest, maybeStories } = useMemo(() => {
    const must = filtered.filter((s) => s.decision === "must_cover");
    const maybe = filtered.filter((s) => s.decision !== "must_cover");
    // Lead = first must_cover; fall back to first filtered story
    const leadStory = must[0] ?? filtered[0] ?? null;
    const restMust = leadStory
      ? must.filter((s) => s.id !== leadStory.id)
      : must;
    // If lead came from maybe (no must_cover), don't double-list it
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

  const dateLabel = editionDate ?? stories[0]?.editionDate;

  return (
    <div className="content-shell mx-auto max-w-6xl px-5 py-6 md:py-9">
      {/* Edition masthead */}
      <header className="mb-5 grid gap-6 border-b border-border-app pb-5 md:mb-6 md:grid-cols-[1.4fr_auto] md:items-end md:gap-10 md:pb-6">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {typeof editionIndex === "number" && editionIndex > 0 && (
              <span className="rounded border border-border-app bg-elevated/80 px-2.5 py-1 font-serif text-[11px] font-semibold text-ink-3">
                Day {editionIndex}
              </span>
            )}
            {dateLabel && (
              <span className="inline-flex items-center gap-2 rounded border border-brand-border bg-brand-soft px-2.5 py-1 font-serif text-[11px] font-semibold text-brand">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-40" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                </span>
                {formatDate(dateLabel)}
              </span>
            )}
          </div>

          <h1 className="heading-law max-w-xl text-[2.05rem] leading-[1.12] md:text-5xl lg:text-[3.1rem]">
            {heading}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-xl font-serif text-[15px] leading-relaxed text-ink-2 md:text-base">
              {subtitle}
            </p>
          )}

          {/* One-click previous / next edition — not a trip through /calendar */}
          {(prevEditionDate || nextEditionDate) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {prevEditionDate ? (
                <Link
                  href={`/edition/${prevEditionDate}`}
                  className="btn-press inline-flex items-center gap-1.5 rounded-full border border-border-app bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
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
                  className="btn-press inline-flex items-center gap-1.5 rounded-full border border-border-app bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
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

        <dl className="grid grid-cols-3 gap-2 sm:gap-3 md:min-w-[280px]">
          <Stat label="Stories" value={String(filtered.length)} />
          <Stat label="Read time" value={`${totalMins}m`} />
          <Stat
            label="Must cover"
            value={String(
              filtered.filter((s) => s.decision === "must_cover").length,
            )}
          />
        </dl>
      </header>

      {/* Filters */}
      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Syllabus filter
          </h2>
          <CategoryFilter selected={selected} onToggle={toggle} />
        </div>
        {selected.length > 0 && (
          <p className="font-sans text-[11px] text-ink-3 sm:text-right">
            {filtered.length}/{stories.length} matching
          </p>
        )}
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stories match"
          body="Try removing a filter, or check back tomorrow for the next edition."
        />
      ) : (
        <>
          {/* Lead must_cover + other must_cover rail */}
          {lead && (
            <section className="mb-8 grid gap-4 lg:grid-cols-12 lg:gap-5">
              <div className="lg:col-span-8">
                <StoryCard story={lead} size="featured" />
              </div>

              <aside className="flex flex-col lg:col-span-4">
                <div className="surface-standard flex h-full flex-col p-2 sm:p-3">
                  <div className="flex items-center justify-between px-3 pb-2 pt-2">
                    <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                      {mustCoverRest.length > 0
                        ? "Also must cover"
                        : "Start here"}
                    </h2>
                    <span className="font-sans text-[10px] text-ink-3">
                      {formatReadingTime(lead.readingTimeMin)} lead
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col divide-y divide-border-app/70">
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
                      <p className="px-3 py-5 text-sm leading-relaxed text-ink-3">
                        One must-cover story today. Everything below is optional
                        depth.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </section>
          )}

          {/* Remaining must_cover in standard grid (if more than rail holds) */}
          {mustCoverRest.length > 4 && (
            <section className="mb-10">
              <SectionLabel>More must cover</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {mustCoverRest.slice(4).map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i + 6} />
                ))}
              </div>
            </section>
          )}

          {/* Maybe stories — muted, below the fold */}
          {maybeStories.length > 0 && (
            <section>
              <SectionLabel>Also today · optional</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
        {children}
      </h2>
      <div className="mb-1 h-px flex-1 bg-border-app/80" aria-hidden />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted px-3 py-3 text-center">
      <dt className="font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">
        {label}
      </dt>
      <dd className="mt-1 font-ui text-xl font-bold tracking-tight text-ink md:text-2xl">
        {value}
      </dd>
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
