import Image from "next/image";
import Link from "next/link";
import type { Category, PublishedStory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";
import {
  ArrowIcon,
  BookIcon,
  GavelIcon,
  PressIcon,
  ScalesIcon,
} from "./icons";

interface StoryCardProps {
  story: PublishedStory;
  /** featured = lead; default = must_cover; muted = maybe; rail = dense list */
  size?: "default" | "compact" | "featured" | "rail" | "muted";
  index?: number;
}

/**
 * Free-license (Unsplash) category photos for muted tiles.
 * Keyed by Category; missing keys fall back to CATEGORY_ART.
 */
const CATEGORY_PHOTOS: Partial<Record<Category, string>> = {
  "constitutional-law": "/images/categories/constitutional-law.jpg",
  "criminal-law": "/images/categories/criminal-law.jpg",
  "legal-current-affairs": "/images/categories/legal-current-affairs.jpg",
  "bare-acts-update": "/images/categories/bare-acts-update.jpg",
};

/** Category-branded art fallback for muted tiles (no photo path). */
const CATEGORY_ART: Record<
  Category,
  {
    icon: typeof ScalesIcon;
    tile: string;
    badge: string;
    iconColor: string;
  }
> = {
  "constitutional-law": {
    icon: ScalesIcon,
    tile: "from-brand-soft via-brand-soft/70 to-elevated",
    badge: "border-brand-border bg-brand-soft/95 text-brand",
    iconColor: "text-brand/55",
  },
  "criminal-law": {
    icon: GavelIcon,
    tile: "from-gold-soft via-gold-soft/60 to-elevated",
    badge: "border-gold-border bg-gold-soft/95 text-gold",
    iconColor: "text-gold/55",
  },
  "legal-current-affairs": {
    icon: PressIcon,
    tile: "from-brand-2-soft via-brand-2-soft/60 to-elevated",
    badge: "border-brand-2-border bg-brand-2-soft/95 text-brand-2",
    iconColor: "text-brand-2/55",
  },
  "bare-acts-update": {
    icon: BookIcon,
    tile: "from-support-soft via-support-soft/60 to-elevated",
    badge: "border-border-app bg-elevated/95 text-ink-2",
    iconColor: "text-ink-3/70",
  },
};

/** Semantic color for rail category labels (spec §25) */
const CATEGORY_RAIL_COLOR: Record<Category, string> = {
  "constitutional-law": "text-[#7c3aed] dark:text-[#a78bfa]",
  "criminal-law": "text-danger",
  "legal-current-affairs": "text-brand",
  "bare-acts-update": "text-brand-2",
};

export function StoryCard({
  story,
  size = "default",
  index,
}: StoryCardProps) {
  const meta = CATEGORY_META[story.category];

  if (size === "featured") {
    return (
      <Link
        href={`/story/${story.slug}`}
        className="surface-hero card-interactive group relative flex h-full min-h-[350px] flex-col overflow-hidden p-6 md:p-8"
      >
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex h-[29px] items-center rounded-[8px] bg-brand px-3 font-sans text-[11px] font-bold tracking-[0.025em] text-on-accent">
            LEAD · MUST COVER
          </span>
          <span className="inline-flex h-[29px] items-center rounded-[8px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.58)] px-[11px] font-medium text-ink-2">
            {meta.shortLabel}
          </span>
          {story.examTags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex h-[29px] items-center rounded-[8px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.58)] px-[11px] text-ink-3"
            >
              {t}
            </span>
          ))}
        </div>

        <h2 className="featured-title mb-0 max-w-[760px] transition-colors group-hover:text-brand">
          {story.title}
        </h2>

        {story.summary && (
          <p className="mt-[18px] max-w-[650px] flex-1 text-[15px] leading-[1.65] text-ink-2 md:line-clamp-4">
            {story.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-[12px] text-ink-3">
          <div className="flex items-center gap-2 font-sans">
            <span>{formatDate(story.editionDate)}</span>
            <span className="opacity-40">·</span>
            <span>{formatReadingTime(story.readingTimeMin)}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
            Read brief
            <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  if (size === "rail") {
    const catColor = CATEGORY_RAIL_COLOR[story.category];
    return (
      <Link
        href={`/story/${story.slug}`}
        className="group -mx-2 grid grid-cols-[28px_1fr] gap-3 rounded-xl border border-transparent px-2 py-[15px] transition-colors duration-150 hover:bg-[rgba(19,15,42,0.025)] dark:hover:bg-[rgba(242,240,248,0.04)]"
      >
        <span className="mt-0.5 w-7 shrink-0 text-[12px] font-semibold tabular-nums text-ink-2" style={{ fontWeight: 650 }}>
          {String(index ?? 0).padStart(2, "0")}
        </span>
        <div className="min-w-0 border-b border-[rgba(205,198,220,0.28)] pb-3 group-last:border-b-0">
          <div className="mb-0 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3">
            <span className={`font-medium ${catColor}`}>{meta.shortLabel}</span>
            <span className="opacity-40">·</span>
            <span>{formatReadingTime(story.readingTimeMin)}</span>
          </div>
          <h3
            className="mt-[5px] line-clamp-3 text-[13.5px] leading-[1.45] text-ink transition-colors group-hover:text-brand"
            style={{ fontWeight: 650 }}
          >
            {story.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (size === "muted") {
    const art = CATEGORY_ART[story.category];
    const photoSrc = CATEGORY_PHOTOS[story.category];
    const Icon = art.icon;
    const readLabel = formatReadingTime(story.readingTimeMin);

    return (
      <Link
        href={`/story/${story.slug}`}
        className="surface-muted card-interactive group block overflow-hidden"
      >
        <div className="relative aspect-video w-full overflow-hidden">
          {photoSrc ? (
            <>
              <Image
                src={photoSrc}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
                aria-hidden
              />
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm backdrop-blur-[2px] ${art.badge}`}
              >
                {meta.shortLabel}
              </span>
              <span className="absolute bottom-3 right-3 font-sans text-[11px] font-medium text-white/95 drop-shadow-sm">
                {readLabel}
              </span>
            </>
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${art.tile}`}
            >
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] ${art.badge}`}
              >
                {meta.shortLabel}
              </span>
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--brand) 8%, transparent), transparent 60%)",
                }}
                aria-hidden
              />
              <Icon
                className={`${art.iconColor} transition-transform duration-200 group-hover:scale-105`}
              />
              <span className="absolute bottom-3 right-3 font-sans text-[11px] text-ink-3">
                {readLabel}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-5">
          <h3
            className="line-clamp-2 text-[15px] leading-snug tracking-tight text-ink transition-colors group-hover:text-brand"
            style={{ fontWeight: 650 }}
          >
            {story.title}
          </h3>
          {story.summary && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-3">
              {story.summary}
            </p>
          )}
        </div>
      </Link>
    );
  }

  const isCompact = size === "compact";

  return (
    <Link
      href={`/story/${story.slug}`}
      className="surface-standard card-interactive group relative block overflow-hidden p-5 md:p-6"
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {typeof index === "number" && (
          <span className="font-sans text-[10px] font-semibold tabular-nums text-ink-3">
            {String(index).padStart(2, "0")}
          </span>
        )}
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
        <span className="text-ink-3">
          {formatReadingTime(story.readingTimeMin)}
        </span>
      </div>

      <h3
        className={`mb-2 font-semibold tracking-tight text-ink transition-colors group-hover:text-brand ${
          isCompact ? "text-base" : "text-lg md:text-xl"
        }`}
      >
        {story.title}
      </h3>

      {story.summary && !isCompact && (
        <p className="mb-4 line-clamp-3 text-[14px] leading-relaxed text-ink-2">
          {story.summary}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-ink-3">
        <span className="font-sans">{formatDate(story.editionDate)}</span>
        <span className="inline-flex items-center gap-1 font-medium text-brand transition-transform duration-200 group-hover:translate-x-0.5">
          Read
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
