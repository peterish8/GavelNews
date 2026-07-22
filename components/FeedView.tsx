"use client";

import { useMemo, useState } from "react";
import type { Category, PublishedStory } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CategoryFilter } from "./CategoryFilter";
import { EmptyState } from "./EmptyState";

interface FeedViewProps {
  stories: PublishedStory[];
  heading: string;
  subtitle?: string;
}

export function FeedView({ stories, heading, subtitle }: FeedViewProps) {
  const [selected, setSelected] = useState<Category[]>([]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return stories;
    return stories.filter((s) => selected.includes(s.category));
  }, [stories, selected]);

  const toggle = (cat: Category) =>
    setSelected((cur) =>
      cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat],
    );

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
      <header className="mb-10 md:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          Today&apos;s Edition
        </div>
        <h1 className="mb-2 font-ui text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {heading}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-base text-ink-2 md:text-lg">{subtitle}</p>
        )}
      </header>

      <section className="mb-8">
        <h2 className="mb-3 font-ui text-xs font-semibold uppercase tracking-wider text-ink-3">
          Filter by category
        </h2>
        <CategoryFilter selected={selected} onToggle={toggle} />
        {selected.length > 0 && (
          <p className="mt-3 text-xs text-ink-3">
            Showing {filtered.length} of {stories.length} stories
          </p>
        )}
      </section>

      <section>
        {filtered.length === 0 ? (
          <EmptyState
            title="No stories match"
            body="Try removing a filter, or check back tomorrow for the next edition."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {filtered.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}