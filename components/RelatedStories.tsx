import Link from "next/link";
import type { PublishedStory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";

interface RelatedStoriesProps {
  stories: PublishedStory[];
}

export function RelatedStories({ stories }: RelatedStoriesProps) {
  if (stories.length === 0) return null;
  return (
    <div className="surface-standard p-5">
      <h3 className="mb-3 font-ui text-xs font-semibold uppercase tracking-wider text-ink-3">
        Related stories
      </h3>
      <ul className="space-y-3">
        {stories.map((s) => {
          const meta = CATEGORY_META[s.category];
          return (
            <li key={s.id}>
              <Link
                href={`/story/${s.slug}`}
                className="pressable group -mx-2 block rounded-lg p-2 hover:bg-elevated-muted/60"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                  <span className="rounded-full bg-brand-soft px-1.5 py-0.5 font-medium text-brand">
                    {meta.shortLabel}
                  </span>
                  <span className="text-ink-3">{formatReadingTime(s.readingTimeMin)}</span>
                </div>
                <h4 className="text-sm font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                  {s.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-ink-3">{formatDate(s.editionDate)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}