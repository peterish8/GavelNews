import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDataSource } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORY_META, type PublishedStory } from "@/lib/types";
import { formatDate, formatReadingTime } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CompleteButton } from "@/components/CompleteButton";
import { RelatedStories } from "@/components/RelatedStories";
import { PYQSidebar } from "@/components/PYQSidebar";
import { SignInGate } from "@/components/SignInGate";
import { StoryReader } from "@/components/StoryReader";
import { ShareButton } from "@/components/ShareButton";
import { Markdown } from "@/components/Markdown";
import { LegalMentorSection } from "@/components/LegalMentorSection";
import { ExamLensSection } from "@/components/ExamLensSection";
import { QuizSection } from "@/components/QuizSection";
import { BeforeYouLeaveSection } from "@/components/BeforeYouLeaveSection";
import { LawDecodeSection } from "@/components/LawDecodeSection";
import { ExamRadarSection } from "@/components/ExamRadarSection";
import { ChallengeSection } from "@/components/ChallengeSection";
import { OneLineRevisionSection } from "@/components/OneLineRevisionSection";
import { VisualMemoryCard } from "@/components/VisualMemoryCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Prefer explicit schemaVersion; fall back to presence of v2 nested blocks. */
function isSchemaV2(story: PublishedStory): boolean {
  if (story.schemaVersion === 2) return true;
  if (story.schemaVersion === 1) return false;
  return Boolean(
    story.lawDecode ||
      story.examRadar ||
      story.challenge ||
      story.story?.summary ||
      story.visualMemoryCard,
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getDataSource();
  const story = await data.getStory(slug);
  if (!story) return { title: "Story not found — Gavel News" };
  const description =
    story.summary ??
    story.story?.summary?.slice(0, 160) ??
    story.whatHappened?.slice(0, 160) ??
    story.title;
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

function SourceItem({
  src,
  badge,
}: {
  src: { name: string; url: string; type: string };
  badge?: string;
}) {
  const label = badge ?? src.type.replace("_", " ");
  const nameEl =
    src.url && src.url.trim() !== "" ? (
      <a
        href={src.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[15px] leading-snug"
      >
        {src.name}
      </a>
    ) : (
      <span className="text-[15px] leading-snug text-ink-2">{src.name}</span>
    );

  return (
    <li className="!mb-3 flex items-start gap-3">
      <span className="mt-0.5 inline-flex shrink-0 rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
        {label}
      </span>
      {nameEl}
    </li>
  );
}

function SourcesSection({ story }: { story: PublishedStory }) {
  const hasV1 = story.sources.length > 0;
  const hasV2 =
    Boolean(story.sourcesV2?.primary?.name) ||
    (story.sourcesV2?.secondary?.length ?? 0) > 0;
  if (!hasV1 && !hasV2) return null;

  return (
    <section>
      <h2>Sources</h2>
      <ul className="!list-none !pl-0">
        {hasV2 && story.sourcesV2 && (
          <>
            <SourceItem src={story.sourcesV2.primary} />
            {(story.sourcesV2.secondary ?? []).map((src, i) => (
              <SourceItem key={i} src={src} />
            ))}
          </>
        )}
        {hasV1 &&
          story.sources.map((src, i) => (
            <SourceItem key={i} src={src} />
          ))}
      </ul>
    </section>
  );
}

function V2PublicBody({ story }: { story: PublishedStory }) {
  const block = story.story;
  return (
    <>
      {(block?.summary || story.whatHappened) && (
        <section className="mb-10">
          <h2>{block?.heading || "What happened"}</h2>
          <Markdown>{block?.summary || story.whatHappened || ""}</Markdown>
        </section>
      )}

      {block?.takeaway && (
        <section className="surface-emphasis mb-10 p-5 md:p-6">
          <h2 className="!mt-0">Takeaway</h2>
          <p className="!mb-0 text-[15px] leading-relaxed text-ink-2">
            {block.takeaway}
          </p>
        </section>
      )}

      {!block?.summary && story.background && (
        <section className="mb-10">
          <h2>Background</h2>
          <Markdown>{story.background}</Markdown>
        </section>
      )}
    </>
  );
}

function V2GatedBody({ story }: { story: PublishedStory }) {
  return (
    <>
      <LawDecodeSection lawDecode={story.lawDecode} />
      <ExamRadarSection examRadar={story.examRadar} />
      <ChallengeSection challenge={story.challenge} />
      <OneLineRevisionSection oneLineRevision={story.oneLineRevision} />
      <VisualMemoryCard visualMemoryCard={story.visualMemoryCard} />
    </>
  );
}

function V1Body({
  story,
  signedIn,
}: {
  story: PublishedStory;
  signedIn: boolean;
}) {
  return (
    <>
      {story.whatHappened && (
        <section className="mb-10">
          <h2>What happened</h2>
          <Markdown>{story.whatHappened}</Markdown>
        </section>
      )}

      {story.background && (
        <section className="mb-10">
          <h2>Background</h2>
          <Markdown>{story.background}</Markdown>
        </section>
      )}

      {signedIn ? (
        <>
          {story.whatCourtHeld && (
            <section className="mb-10">
              <h2>What the court held</h2>
              <Markdown>{story.whatCourtHeld}</Markdown>
            </section>
          )}

          {story.whyItMatters && (
            <section className="surface-emphasis mb-10 p-5 md:p-6">
              <h2 className="!mt-0 !text-[var(--gv-warn)]">
                Why it matters for CLAT
              </h2>
              <div className="[&>p:last-child]:!mb-0">
                <Markdown>{story.whyItMatters}</Markdown>
              </div>
            </section>
          )}

          {story.keyPoints && story.keyPoints.length > 0 && (
            <section className="mb-10">
              <h2>Key points</h2>
              <ul>
                {story.keyPoints.map((kp, i) => (
                  <li key={i}>
                    <Markdown inline>{kp.text}</Markdown>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <LegalMentorSection
            whatActuallyHappening={story.whatActuallyHappening}
            whyDidThisHappen={story.whyDidThisHappen}
            importantTerms={story.importantTerms}
            lawBehindIt={story.lawBehindIt}
            analogy={story.analogy}
            friendExplanation={story.friendExplanation}
            commonConfusions={story.commonConfusions}
          />

          <ExamLensSection examLens={story.examLens} />

          <QuizSection quiz={story.quiz} />

          <div className="mb-10">
            <BeforeYouLeaveSection beforeYouLeave={story.beforeYouLeave} />
          </div>
        </>
      ) : null}
    </>
  );
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getDataSource();
  const user = await getCurrentUser();
  const story = await data.getStory(slug);
  if (!story) notFound();

  const related = await data.getRelatedStories(story.id);
  const meta = CATEGORY_META[story.category];
  const v2 = isSchemaV2(story);

  const showSidebar =
    user.signedIn &&
    ((story.pyqQuestions?.length ?? 0) > 0 || related.length > 0);

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
            <span className="rounded-full border border-brand bg-brand px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-on-accent">
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
              benefit="Save stories · Mark complete · Track reading"
              context="actions"
              variant="compact"
              nextPath={`/story/${story.slug}`}
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
        <StoryReader title={story.title}>
          <div className="prose-article max-w-none">
            {v2 ? <V2PublicBody story={story} /> : <V1Body story={story} signedIn={user.signedIn} />}

            {user.signedIn ? (
              v2 ? (
                <V2GatedBody story={story} />
              ) : null
            ) : (
              <SignInGate
                benefit={
                  story.pyqKeyword
                    ? "Exam layer + past questions on this topic"
                    : "Exam layer: why it matters + key points"
                }
                context="exam-layer"
                nextPath={`/story/${story.slug}`}
              />
            )}

            <SourcesSection story={story} />
          </div>
        </StoryReader>

        {showSidebar && (
          <aside className="flex flex-col gap-6">
            {(story.pyqQuestions?.length ?? 0) > 0 && (
              <div className="order-1 md:order-2">
                <PYQSidebar questions={story.pyqQuestions!} />
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
