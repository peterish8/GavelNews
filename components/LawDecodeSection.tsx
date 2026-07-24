import type { LawDecode } from "@/lib/types";
import { Markdown } from "@/components/Markdown";

interface LawDecodeSectionProps {
  lawDecode?: LawDecode;
}

/**
 * Signed-in-only Law Decode block (schema v2). Degrades gracefully: any
 * missing sub-field just doesn't render.
 */
export function LawDecodeSection({ lawDecode }: LawDecodeSectionProps) {
  if (!lawDecode) return null;

  const {
    heading,
    sections,
    doctrines,
    legalTests,
    importantCases,
    constitutionalLink,
    staticConnections,
    bnsMapping,
    dontConfuse,
    memoryTrick,
  } = lawDecode;

  const hasContent =
    (sections && sections.length > 0) ||
    (doctrines && doctrines.length > 0) ||
    (legalTests && legalTests.length > 0) ||
    (importantCases && importantCases.length > 0) ||
    (constitutionalLink && constitutionalLink.length > 0) ||
    (staticConnections && staticConnections.length > 0) ||
    (bnsMapping && (bnsMapping.ipc || bnsMapping.bns)) ||
    (dontConfuse && dontConfuse.length > 0) ||
    memoryTrick;

  if (!hasContent) return null;

  return (
    <section className="mb-10">
      <h2>{heading || "Law Decode"}</h2>

      {sections && sections.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">Provisions</h3>
          <dl className="flex flex-col gap-3">
            {sections.map((s, i) => (
              <div
                key={i}
                className="rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <dt className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {s.provision}
                </dt>
                <dd className="text-sm leading-relaxed text-ink-2">
                  <Markdown>{s.explanation}</Markdown>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {doctrines && doctrines.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">Doctrines</h3>
          <dl className="flex flex-col gap-3">
            {doctrines.map((d, i) => (
              <div
                key={i}
                className="rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <dt className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {d.name}
                </dt>
                <dd className="text-sm leading-relaxed text-ink-2">
                  <Markdown>{d.explanation}</Markdown>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {legalTests && legalTests.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">Legal tests</h3>
          <ul className="!list-none !pl-0">
            {legalTests.map((t, i) => (
              <li
                key={i}
                className="!mb-3 rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <p className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {t.name}
                </p>
                <p className="!mb-0 text-sm leading-relaxed text-ink-2">{t.rule}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {importantCases && importantCases.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Important cases
          </h3>
          <ul className="!list-none !pl-0">
            {importantCases.map((c, i) => (
              <li
                key={i}
                className="!mb-3 rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <p className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {c.case}
                </p>
                <p className="!mb-0 text-sm leading-relaxed text-ink-2">
                  {c.principle}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {constitutionalLink && constitutionalLink.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Constitutional link
          </h3>
          <ul className="!list-none !pl-0">
            {constitutionalLink.map((c, i) => (
              <li
                key={i}
                className="!mb-3 rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <p className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {c.article}
                </p>
                <p className="!mb-0 text-sm leading-relaxed text-ink-2">{c.why}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {staticConnections && staticConnections.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Static connections
          </h3>
          <ul className="list-disc pl-5">
            {staticConnections.map((s, i) => (
              <li key={i} className="mb-1 text-[15px] leading-relaxed text-ink-2">
                {s.item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bnsMapping && (bnsMapping.ipc || bnsMapping.bns) && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">BNS mapping</h3>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {bnsMapping.ipc && <span>IPC: {bnsMapping.ipc}</span>}
            {bnsMapping.ipc && bnsMapping.bns && (
              <span className="text-ink-3"> → </span>
            )}
            {bnsMapping.bns && <span>BNS: {bnsMapping.bns}</span>}
          </p>
        </div>
      )}

      {dontConfuse && dontConfuse.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Don&apos;t confuse these
          </h3>
          <ul className="!list-none !pl-0">
            {dontConfuse.map((c, i) => (
              <li
                key={i}
                className="!mb-3 rounded-md border border-border-app bg-elevated-muted/50 p-3.5"
              >
                <p className="mb-1 font-serif text-[15px] font-semibold text-ink">
                  {c.confusion}
                </p>
                <p className="!mb-0 text-sm leading-relaxed text-ink-2">
                  {c.reality}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {memoryTrick && (
        <div className="surface-emphasis mb-0 p-4">
          <h3 className="!mt-0 mb-1 text-sm font-semibold text-ink-2">
            Memory trick
          </h3>
          <p className="!mb-0 text-[15px] leading-relaxed text-ink-2">
            {memoryTrick}
          </p>
        </div>
      )}
    </section>
  );
}
