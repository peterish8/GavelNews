import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDataSource } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORY_META } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CompleteButton } from "@/components/CompleteButton";
import { RelatedStories } from "@/components/RelatedStories";
import { PYQSidebar } from "@/components/PYQSidebar";
import { SignInGate } from "@/components/SignInGate";
import { StoryReader } from "@/components/StoryReader";
import { ShareButton } from "@/components/ShareButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getDataSource();
  const story = await data.getStory(slug);
  if (!story) return { title: "Story not found — Gavel News" };
  const description = story.summary ?? story.whatHappened.slice(0, 160);
  const url = `${SITE_URL}/story/${story.slug}`;
  return {
    title: `${story.title} — Gavel News`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: story.title,
      description,
      type: "article",
      publishedTime: story.publishedAt,
      url,
      siteName: "Gavel News",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getDataSource();
  const user = await getCurrentUser();
  const story = await data.getStory(slug);
  if (!story) notFound();

  const related = await data.getRelatedStories(story.id);
  const meta = CATEGORY_META[story.category];

  const showSidebar =
    user.signedIn &&
    (Boolean(story.pyqKeyword) || related.length > 0);

  return (
    <article className="relative mx-auto max-w-5xl px-5 py-8 pb-20 md:py-10 md:pb-20">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-3">
        <Link href="/" className="transition-colors hover:text-ink">
          Today
        </Link>
        <span>/</span>
        <Link
          href={`/edition/${story.editionDate}`}
          className="transition-colors hover:text-ink"
        >
          {formatDate(story.editionDate)}
        </Link>
        <span>/</span>
        <span className="text-ink-2">{meta.label}</span>
      </nav>

      <header className="mb-4 md:mb-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-border bg-brand-soft px-2.5 py-0.5 font-medium text-brand">
            {meta.label}
          </span>
          {story.decision === "must_cover" && (
            <span className="rounded-full border border-brand bg-brand px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--on-accent)]">
              Must cover
            </span>
          )}
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
          <span className="text-ink-3">·</span>
          <span className="text-ink-3">{formatDate(story.editionDate)}</span>
        </div>

        <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight text-ink md:text-4xl md:leading-[1.15]">
          {story.title}
        </h1>

        {story.summary && (
          <p className="text-lg leading-relaxed text-ink-2">{story.summary}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {user.signedIn ? (
            <div className="flex flex-wrap items-center gap-2">
              <FavoriteButton storyId={story.id} />
              <CompleteButton storyId={story.id} />
            </div>
          ) : (
            <SignInGate
              benefit="Save favorites · Mark complete · Track reading"
              context="actions"
              variant="compact"
            />
          )}
          <ShareButton
            title={story.title}
            url={`${SITE_URL}/story/${story.slug}`}
          />
        </div>
      </header>

      <div
        className={
          showSidebar
            ? "grid gap-10 md:grid-cols-[1fr_360px] md:gap-12"
            : "grid gap-10"
        }
      >
        {/* Story body + TTS (Gavelogy JudgmentReaderPill / useNoteTTS) */}
        <StoryReader title={story.title}>
          <div className="prose-article max-w-none">
            <section className="mb-10">
              <h2>What happened</h2>
              {story.whatHappened.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </section>

            <section className="mb-10">
              <h2>Background</h2>
              {story.background.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </section>

            {user.signedIn ? (
              <>
                {story.whatCourtHeld && (
                  <section className="mb-10">
                    <h2>What the court held</h2>
                    {story.whatCourtHeld.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </section>
                )}

                <section className="surface-emphasis mb-10 p-5 md:p-6">
                  <h2 className="!mt-0 !text-[var(--gv-warn)]">
                    Why it matters for CLAT
                  </h2>
                  <p className="!mb-0">{story.whyItMatters}</p>
                </section>

                <section className="mb-10">
                  <h2>Key points</h2>
                  <ul>
                    {story.keyPoints.map((kp, i) => (
                      <li key={i}>{kp.text}</li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <SignInGate
                benefit={
                  story.pyqKeyword
                    ? "Exam layer + past questions on this topic"
                    : "Exam layer: why it matters + key points"
                }
                context="exam-layer"
              />
            )}

            {story.sources.length > 0 && (
              <section>
                <h2>Sources</h2>
                <ul className="!list-none !pl-0">
                  {story.sources.map((src, i) => (
                    <li key={i} className="!mb-3 flex items-start gap-3">
                      <span className="mt-0.5 inline-flex shrink-0 rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
                        {src.type.replace("_", " ")}
                      </span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] leading-snug"
                      >
                        {src.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </StoryReader>

        {showSidebar && (
          <aside className="flex flex-col gap-6">
            {/* Mobile: PYQ first, related at end. Desktop: related then PYQ. */}
            {story.pyqKeyword && (
              <div className="order-1 md:order-2">
                <PYQSidebar keyword={story.pyqKeyword} />
              </div>
            )}
            <div className="order-2 md:order-1">
              <RelatedStories stories={related} />
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
