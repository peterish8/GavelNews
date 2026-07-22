interface PYQSidebarProps {
  keyword: string;
}

// Phase 1: static illustrative PYQs based on keyword.
// Phase 5+ can wire this to the engine's `search_pyqs` MCP tool via API.
export function PYQSidebar({ keyword }: PYQSidebarProps) {
  const questions = getIllustrativePYQs(keyword);
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-soft/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand text-[var(--on-accent)]">
          <PyqIcon />
        </span>
        <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-brand">
          Past CLAT questions
        </h3>
      </div>
      <p className="mb-3 text-xs text-ink-3">On &quot;{keyword}&quot;</p>
      <ol className="space-y-2.5 text-sm">
        {questions.map((q, i) => (
          <li key={i} className="rounded-lg bg-elevated p-3 leading-snug text-ink-2">
            <span className="mr-1 font-semibold text-ink">{i + 1}.</span>
            {q}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[10px] text-ink-3">
        Illustrative only — questions shown are constructed for illustration. Real
        PYQ lookup ships when the engine&apos;s <code>search_pyqs</code> tool is
        wired to this site (post-v1).
      </p>
    </div>
  );
}

function PyqIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 17v.01M12 8a2 2 0 0 1 2 2c0 1.5-2 2-2 4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getIllustrativePYQs(keyword: string): string[] {
  const k = keyword.toLowerCase();
  if (k.includes("article 200") || k.includes("governor")) {
    return [
      "Under Article 200 of the Constitution, the Governor may — except when withholding assent — return a Bill to the Legislature for reconsideration. (CLAT 2019)",
      "Which of the following is NOT an option available to a Governor when a Bill is presented under Article 200? (CLAT 2021)",
      "The time-limit within which the Governor must act on a re-passed Bill was addressed by the Supreme Court in: (CLAT 2024)",
    ];
  }
  if (k.includes("section 302") || k.includes("murder") || k.includes("section 103")) {
    return [
      "Under Section 302 IPC (Section 103 BNS), 'murder' is defined as culpable homicide with any of the four specified intentions. (CLAT 2020)",
      "Which clause of Section 300 IPC corresponds to a death caused by an act done with the intention of causing bodily injury sufficient in the ordinary course to cause death? (CLAT 2018)",
      "Sudden provocation (Exception 1 to Section 300) does NOT apply if: (CLAT 2022)",
    ];
  }
  if (k.includes("section 27") || k.includes("evidence")) {
    return [
      "Section 27 of the Evidence Act is an exception to the rule against confessions. It admits: (CLAT 2017)",
      "Only that portion of a statement which leads directly to discovery is admissible under Section 27. (CLAT 2020)",
      "The 'causa causans' test for Section 27 was explained in: (CLAT 2023)",
    ];
  }
  if (k.includes("dpdpa") || k.includes("data protection")) {
    return [
      "Under the Digital Personal Data Protection Act 2023, the Data Protection Board has adjudicatory powers under: (CLAT 2025)",
      "Penalty under Section 33 DPDPA may extend up to: (CLAT 2025)",
      "Which of the following is NOT a 'data fiduciary' obligation under the DPDPA? (CLAT 2024)",
    ];
  }
  if (k.includes("consumer")) {
    return [
      "The pecuniary jurisdiction of District Consumer Disputes Redressal Commissions under the Consumer Protection Act 2019 (as amended in 2026) is: (CLAT 2026)",
      "Under the CCPA framework, the Central Authority may investigate suo motu in: (CLAT 2025)",
    ];
  }
  if (k.includes("sedition") || k.includes("section 152") || k.includes("124a")) {
    return [
      "Section 152 BNS replaces which pre-existing provision? (CLAT 2024)",
      "The leading Supreme Court decision on Section 124A IPC sedicion law is: (CLAT 2017)",
      "Mandatory minimum sentence under Section 152 BNS is: (CLAT 2025)",
    ];
  }
  if (k.includes("anticipatory") || k.includes("482")) {
    return [
      "Anticipatory bail under Section 438 CrPC (now 482 BNSS) is governed by which decision? (CLAT 2019)",
      "Anticipatory bail is NOT available for offences punishable with: (CLAT 2021)",
    ];
  }
  if (k.includes("aijs") || k.includes("312")) {
    return [
      "The All-India Judicial Service is contemplated under which Article? (CLAT 2020)",
      "Article 312 of the Constitution provides for All-India Services for: (CLAT 2022)",
    ];
  }
  // Default generic PYQs
  return [
    `Assertion-Reason: ${keyword} is a recurring constitutional / statutory topic in CLAT. (CLAT 2023)`,
    `Which of the following statements about ${keyword} is correct? (CLAT 2024)`,
    `In the context of ${keyword}, the Supreme Court has held that: (CLAT 2025)`,
  ];
}