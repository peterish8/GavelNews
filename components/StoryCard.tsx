import Link from "next/link";
import type { PublishedStory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";

interface StoryCardProps {
  story: PublishedStory;
  size?: "default" | "compact";
}

export function StoryCard({ story, size = "default" }: StoryCardProps) {
  const meta = CATEGORY_META[story.category];
  const isCompact = size === "compact";
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group block rounded-2xl border border-border-app bg-elevated p-5 shadow-[var(--s1)] transition-all duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-brand-border hover:shadow-[var(--shadow-md)] active:translate-y-0 active:shadow-[var(--s1)] md:p-6"
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="rounded-full border border-brand-border bg-brand-soft px-2.5 py-0.5 font-medium text-brand">
          {meta.label}
        </span>
        {story.examTags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-ink-3"
          >
            {t}
          </span>
        ))}
        <span className="text-ink-3">·</span>
        <span className="text-ink-3">{formatReadingTime(story.readingTimeMin)}</span>
      </div>

      <h3
        className={`mb-2 font-ui font-semibold tracking-tight text-ink transition-colors group-hover:text-brand ${
          isCompact ? "text-base" : "text-lg md:text-xl"
        }`}
      >
        {story.title}
      </h3>

      {story.summary && !isCompact && (
        <p className="mb-4 text-[14px] leading-relaxed text-ink-2">
          {story.summary}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-ink-3">
        <span>{formatDate(story.editionDate)}</span>
        <span className="font-medium text-brand transition-transform duration-[200ms] group-hover:translate-x-1">
          Read →
        </span>
      </div>
    </Link>
  );
}