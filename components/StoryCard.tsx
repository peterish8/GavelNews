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

/** Category-branded art for muted ("More stories for you") cards only. */
const CATEGORY_ART: Record<
  Category,
  {
    icon: typeof ScalesIcon;
    /** Gradient using brand-family tokens — themes with light/dark */
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
        className="surface-hero card-interactive group flex h-full flex-col overflow-hidden p-6 md:p-8"
      >
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-brand px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-on-accent">
            Lead · must cover
          </span>
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
        </div>

        <h2 className="mb-4 font-serif text-2xl font-bold leading-[1.15] tracking-tight text-ink transition-colors group-hover:text-brand md:text-[1.85rem] lg:text-[2.15rem]">
          {story.title}
        </h2>

        {story.summary && (
          <p className="mb-6 max-w-2xl flex-1 text-[15px] leading-relaxed text-ink-2 md:line-clamp-3 md:text-base">
            {story.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-app/80 pt-4 text-xs text-ink-3">
          <div className="flex items-center gap-2 font-sans">
            <span>{formatDate(story.editionDate)}</span>
            <span className="opacity-40">·</span>
            <span>{formatReadingTime(story.readingTimeMin)}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
            Open brief
            <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  if (size === "rail") {
    return (
      <Link
        href={`/story/${story.slug}`}
        className="group flex gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border-app hover:bg-elevated-muted/70"
      >
        <span className="mt-0.5 w-6 shrink-0 font-sans text-[11px] font-semibold tabular-nums text-ink-3">
          {String(index ?? 0).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-3">
            <span className="font-medium text-brand">{meta.shortLabel}</span>
            <span className="opacity-40">·</span>
            <span>{formatReadingTime(story.readingTimeMin)}</span>
          </div>
          <h3 className="font-ui text-[14px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand">
            {story.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (size === "muted") {
    const art = CATEGORY_ART[story.category];
    const Icon = art.icon;
    return (
      <Link
        href={`/story/${story.slug}`}
        className="surface-muted card-interactive group block overflow-hidden"
      >
        {/* Category art tile — no photography; CSS gradient + line icon */}
        <div
          className={`relative flex h-[7.5rem] items-center justify-center bg-gradient-to-br ${art.tile}`}
        >
          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] ${art.badge}`}
          >
            {meta.shortLabel}
          </span>
          {/* Soft radial sheen so the tile doesn't read flat */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--brand) 8%, transparent), transparent 60%)",
            }}
            aria-hidden
          />
          <Icon className={`${art.iconColor} transition-transform duration-200 group-hover:scale-105`} />
        </div>
        <div className="p-4 md:p-5">
          <h3 className="mb-2 font-ui text-[15px] font-semibold leading-snug tracking-tight text-ink-2 transition-colors group-hover:text-brand line-clamp-2">
            {story.title}
          </h3>
          <p className="font-sans text-[11px] text-ink-3">
            {formatReadingTime(story.readingTimeMin)}
          </p>
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
        className={`mb-2 font-ui font-semibold tracking-tight text-ink transition-colors group-hover:text-brand ${
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


