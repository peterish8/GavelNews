import type { ImportantTerm, CommonConfusion } from "@/lib/types";
import { Markdown } from "@/components/Markdown";

interface LegalMentorSectionProps {
  whatActuallyHappening?: string;
  whyDidThisHappen?: string;
  importantTerms?: ImportantTerm[];
  lawBehindIt?: string;
  analogy?: string;
  friendExplanation?: string;
  commonConfusions?: CommonConfusion[];
}

/**
 * Signed-in-only deep-dive layer (CONTENT-09). Degrades gracefully: any
 * missing sub-field just doesn't render, since older/synced stories may
 * not have every sub-block filled in.
 */
export function LegalMentorSection({
  whatActuallyHappening,
  whyDidThisHappen,
  importantTerms,
  lawBehindIt,
  analogy,
  friendExplanation,
  commonConfusions,
}: LegalMentorSectionProps) {
  const hasContent =
    whatActuallyHappening ||
    whyDidThisHappen ||
    (importantTerms && importantTerms.length > 0) ||
    lawBehindIt ||
    analogy ||
    friendExplanation ||
    (commonConfusions && commonConfusions.length > 0);

  if (!hasContent) return null;

  return (
    <section className="mb-10">
      <h2>Legal Mentor</h2>

      {whatActuallyHappening && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">
            What&apos;s actually happening
          </h3>
          <Markdown>{whatActuallyHappening}</Markdown>
        </div>
      )}

      {whyDidThisHappen && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">
            Why did this happen
          </h3>
          <Markdown>{whyDidThisHappen}</Markdown>
        </div>
      )}

      {importantTerms && importantTerms.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Important terms
          </h3>
          <dl className="flex flex-col gap-3">
            {importantTerms.map((t, i) => (
              <div key={i} className="rounded-md border border-border-app bg-elevated-muted/50 p-3.5">
                <dt className="mb-1 font-serif text-[15px] font-semibold text-ink">{t.term}</dt>
                <dd className="mb-1.5 text-sm leading-relaxed text-ink-2">{t.whatIsIt}</dd>
                <dd className="text-sm leading-relaxed text-ink-3 italic">{t.whyItMatters}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {lawBehindIt && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">The law behind it</h3>
          <Markdown>{lawBehindIt}</Markdown>
        </div>
      )}

      {analogy && (
        <div className="surface-emphasis mb-5 p-4">
          <h3 className="!mt-0 mb-1 text-sm font-semibold text-ink-2">Think of it like this</h3>
          <Markdown>{analogy}</Markdown>
        </div>
      )}

      {friendExplanation && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">
            Bro, what is this news?
          </h3>
          <Markdown>{friendExplanation}</Markdown>
        </div>
      )}

      {commonConfusions && commonConfusions.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-2">Don&apos;t confuse these</h3>
          <ul className="!list-none !pl-0">
            {commonConfusions.map((c, i) => (
              <li key={i} className="!mb-3 rounded-md border border-border-app bg-elevated-muted/50 p-3.5">
                <p className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {c.a} <span className="font-normal text-ink-3">vs</span> {c.b}
                </p>
                <p className="!mb-0 text-sm leading-relaxed text-ink-2">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
