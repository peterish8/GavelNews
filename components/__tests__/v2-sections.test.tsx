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
} from "@/lib/types";

const v2 = MOCK_STORIES.find((s) => s.schemaVersion === 2)!;
const v1 = MOCK_STORIES.find((s) => s.id === "s-001")!;

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
