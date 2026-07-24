import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MOCK_STORIES } from "@/lib/mock/stories";
import { LawDecodeSection } from "@/components/LawDecodeSection";
import { ExamRadarSection } from "@/components/ExamRadarSection";
import { OneLineRevisionSection } from "@/components/OneLineRevisionSection";
import { VisualMemoryCard } from "@/components/VisualMemoryCard";
import { LegalMentorSection } from "@/components/LegalMentorSection";
import { ExamLensSection } from "@/components/ExamLensSection";
import { BeforeYouLeaveSection } from "@/components/BeforeYouLeaveSection";
import type {
  Challenge,
  ExamRadar,
  LawDecode,
  OneLineRevision,
  PublishedStory,
  Source,
  SourcesV2,
} from "@/lib/types";

const v2 = MOCK_STORIES.find((s) => s.schemaVersion === 2)!;
const v1 = MOCK_STORIES.find((s) => s.id === "s-001")!;

/**
 * Mirrors SourcesSection's SourceItem render logic from page.tsx so the
 * production "Objects are not valid as a React child" crash is covered
 * without importing the full Next.js page module.
 */
function renderSourceItem(src: Source): string {
  const label = src.type.replace("_", " ");
  const nameEl =
    src.url && src.url.trim() !== ""
      ? createElement(
          "a",
          {
            href: src.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-[15px] leading-snug",
          },
          src.name,
        )
      : createElement(
          "span",
          { className: "text-[15px] leading-snug text-ink-2" },
          src.name,
        );
  return renderToStaticMarkup(
    createElement(
      "li",
      { className: "!mb-3 flex items-start gap-3" },
      createElement(
        "span",
        {
          className:
            "mt-0.5 inline-flex shrink-0 rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-3",
        },
        label,
      ),
      nameEl,
    ),
  );
}

function renderSourcesV2(sourcesV2: SourcesV2): string {
  const items = [sourcesV2.primary, ...(sourcesV2.secondary ?? [])];
  return items.map(renderSourceItem).join("");
}

describe("schema v2 mock story", () => {
  it("includes a full v2-shaped example", () => {
    expect(v2).toBeTruthy();
    expect(v2.slug).toBe("section-294b-obscenity-test-sc");
    expect(v2.lawDecode?.sections?.length).toBeGreaterThan(0);
    expect(v2.examRadar?.probability).toBe(4);
    expect(v2.challenge?.mcqs?.length).toBeGreaterThan(0);
    expect(v2.challenge?.mcqs?.[0].options.A).toBeTruthy();
    expect(v2.challenge?.mcqs?.[0].answer).toMatch(/^[A-D]$/i);
    expect(v2.oneLineRevision?.line).toBeTruthy();
    expect(v2.visualMemoryCard).toContain("SECTION 294(b)");
    expect(v2.sourcesV2?.primary).toBeTruthy();
    expect(typeof v2.sourcesV2?.primary).toBe("object");
    expect(v2.sourcesV2?.primary.name).toBeTruthy();
  });

  it("keeps schema v1 mock story fields for fallback path", () => {
    expect(v1.schemaVersion).toBeUndefined();
    expect(v1.whatActuallyHappening).toBeTruthy();
    expect(v1.examLens?.fiveThings.length).toBeGreaterThan(0);
    expect(v1.quiz?.length).toBeGreaterThan(0);
    expect(v1.beforeYouLeave?.oneLiner).toBeTruthy();
    expect(v1.lawDecode).toBeUndefined();
  });
});

describe("SourcesV2 render (production crash regression)", () => {
  it("renders primary Source object and secondary with empty url as plain text", () => {
    const sourcesV2: SourcesV2 = {
      primary: {
        name: "LiveLaw",
        url: "https://www.livelaw.in/example",
        type: "legal_website",
      },
      secondary: [
        {
          name: "Bar & Bench",
          url: "https://www.barandbench.com/example",
          type: "legal_website",
        },
        {
          name: "The Hindu (print, Delhi edition, 20 July 2026, pp.1, 3)",
          url: "",
          type: "newspaper",
        },
      ],
    };

    // Would throw React error #31 if a raw object were passed as a child
    let html: string;
    expect(() => {
      html = renderSourcesV2(sourcesV2);
    }).not.toThrow();

    html = renderSourcesV2(sourcesV2);
    expect(html).toContain("LiveLaw");
    expect(html).toContain('href="https://www.livelaw.in/example"');
    expect(html).toContain("Bar &amp; Bench");
    expect(html).toContain("The Hindu (print, Delhi edition, 20 July 2026, pp.1, 3)");
    // empty-url item must be plain text (span), not an <a>
    expect(html).toMatch(
      /<span class="text-\[15px\] leading-snug text-ink-2">The Hindu \(print, Delhi edition, 20 July 2026, pp\.1, 3\)<\/span>/,
    );
    // never stringify a Source object into the DOM
    expect(html).not.toContain("[object Object]");
    expect(html).not.toContain('"url"');
  });

  it("mock v2 story sourcesV2 matches production shape and renders safely", () => {
    expect(v2.sourcesV2).toBeDefined();
    expect(typeof v2.sourcesV2!.primary).toBe("object");
    expect(v2.sourcesV2!.primary).toHaveProperty("name");
    expect(v2.sourcesV2!.primary).toHaveProperty("url");
    expect(v2.sourcesV2!.primary).toHaveProperty("type");
    expect(v2.sourcesV2!.secondary?.some((s) => s.url === "")).toBe(true);

    let html = "";
    expect(() => {
      html = renderSourcesV2(v2.sourcesV2!);
    }).not.toThrow();
    expect(html).not.toContain("[object Object]");
    // must only put strings (names) into text nodes, never raw objects
    expect(html).toContain(v2.sourcesV2!.primary.name);
  });

  it("coerce-style bare string primary would still render as text not object", () => {
    // Defensive path: if primary ever arrives already coerced as Source with empty url
    const coerced: SourcesV2 = {
      primary: { name: "Bare string source", url: "", type: "official" },
      secondary: [],
    };
    const html = renderSourcesV2(coerced);
    expect(html).toContain("Bare string source");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("[object Object]");
  });
});

describe("v2 section components (server-renderable)", () => {
  it("LawDecodeSection renders provisions and memory trick", () => {
    const html = renderToStaticMarkup(
      createElement(LawDecodeSection, {
        lawDecode: v2.lawDecode as LawDecode,
      }),
    );
    expect(html).toContain("Decode the Law");
    expect(html).toContain("Section 294(b) IPC");
    expect(html).toContain("Memory trick");
    expect(html).toContain("Community standards test");
  });

  it("LawDecodeSection returns null when empty", () => {
    const html = renderToStaticMarkup(
      createElement(LawDecodeSection, { lawDecode: undefined }),
    );
    expect(html).toBe("");
  });

  it("ExamRadarSection renders why_exam and difficulty map", () => {
    const html = renderToStaticMarkup(
      createElement(ExamRadarSection, {
        examRadar: v2.examRadar as ExamRadar,
      }),
    );
    expect(html).toContain("Exam Radar");
    expect(html).toContain("Why this is exam-relevant");
    expect(html).toContain("4/5");
    expect(html).toContain("UG:");
  });

  it("OneLineRevisionSection renders the line", () => {
    const html = renderToStaticMarkup(
      createElement(OneLineRevisionSection, {
        oneLineRevision: v2.oneLineRevision as OneLineRevision,
      }),
    );
    expect(html).toContain("One Line Revision");
    expect(html).toContain("294(b)");
  });

  it("VisualMemoryCard renders preformatted ASCII", () => {
    const html = renderToStaticMarkup(
      createElement(VisualMemoryCard, {
        visualMemoryCard: v2.visualMemoryCard,
      }),
    );
    expect(html).toContain("Visual Memory Card");
    expect(html).toContain("<pre");
    expect(html).toContain("SECTION 294(b) OBSCENITY");
  });

  it("challenge MCQ shape uses lettered options + answer letter", () => {
    const challenge = v2.challenge as Challenge;
    for (const mcq of challenge.mcqs ?? []) {
      expect(mcq.options).toHaveProperty("A");
      expect(mcq.options).toHaveProperty("B");
      expect(mcq.options).toHaveProperty("C");
      expect(mcq.options).toHaveProperty("D");
      expect(["A", "B", "C", "D"]).toContain(mcq.answer.toUpperCase());
      // Must not be the v1 0-indexed array shape
      expect(Array.isArray(mcq.options)).toBe(false);
    }
  });
});

describe("v1 fallback section components still render", () => {
  it("LegalMentorSection still works for schema v1 data", () => {
    const html = renderToStaticMarkup(
      createElement(LegalMentorSection, {
        whatActuallyHappening: v1.whatActuallyHappening,
        importantTerms: v1.importantTerms,
        analogy: v1.analogy,
      }),
    );
    expect(html).toContain("Legal Mentor");
    expect(html).toContain("Pocket Veto");
  });

  it("ExamLensSection still works for schema v1 data", () => {
    const html = renderToStaticMarkup(
      createElement(ExamLensSection, { examLens: v1.examLens }),
    );
    expect(html).toContain("Exam Lens");
    expect(html).toContain("Five things to remember");
  });

  it("BeforeYouLeaveSection still works for schema v1 data", () => {
    const html = renderToStaticMarkup(
      createElement(BeforeYouLeaveSection, {
        beforeYouLeave: v1.beforeYouLeave,
      }),
    );
    expect(html).toContain("Before you leave");
    expect(html).toContain("Article 200");
  });
});

