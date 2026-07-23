import type { ExamLens } from "@/lib/types";

interface ExamLensSectionProps {
  examLens?: ExamLens;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-[var(--gv-ok,#16a34a)]",
  Medium: "text-[var(--gv-warn)]",
  Hard: "text-[var(--gv-danger,#dc2626)]",
};

/** Signed-in-only Exam Lens block (CONTENT-10). */
export function ExamLensSection({ examLens }: ExamLensSectionProps) {
  if (!examLens || examLens.fiveThings.length === 0) return null;

  return (
    <section className="surface-emphasis mb-10 p-5 md:p-6">
      <h2 className="!mt-0">Exam Lens</h2>

      <h3 className="mb-2 text-sm font-semibold text-ink-2">Five things to remember</h3>
      <ol className="mb-5 list-decimal pl-5">
        {examLens.fiveThings.map((thing, i) => (
          <li key={i} className="mb-1.5 text-[15px] leading-relaxed text-ink-2">
            {thing}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-4 border-t border-border-app pt-4 text-sm">
        {examLens.difficulty && (
          <span>
            Difficulty:{" "}
            <strong className={DIFFICULTY_COLOR[examLens.difficulty] ?? "text-ink"}>
              {examLens.difficulty}
            </strong>
          </span>
        )}
        {typeof examLens.examProbability === "number" && (
          <span>
            Exam probability:{" "}
            <strong className="text-ink">{examLens.examProbability}/5</strong>
          </span>
        )}
      </div>

      {examLens.staticLawConnection && (
        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">Static law connection</h3>
          <p className="text-[15px] leading-relaxed text-ink-2">{examLens.staticLawConnection}</p>
        </div>
      )}

      {examLens.expectedQuestionAreas && (
        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">Where examiners might probe this</h3>
          <p className="text-[15px] leading-relaxed text-ink-2">{examLens.expectedQuestionAreas}</p>
        </div>
      )}

      {examLens.pyqConnection && (
        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">PYQ connection</h3>
          <p className="text-[15px] leading-relaxed text-ink-2">{examLens.pyqConnection}</p>
        </div>
      )}
    </section>
  );
}
