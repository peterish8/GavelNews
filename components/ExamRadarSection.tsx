import type { ExamRadar, ExamRadarDifficulty } from "@/lib/types";

interface ExamRadarSectionProps {
  examRadar?: ExamRadar;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-[var(--gv-ok,#16a34a)]",
  Medium: "text-[var(--gv-warn)]",
  Hard: "text-[var(--gv-danger,#dc2626)]",
};

function difficultyLabel(d: ExamRadarDifficulty | undefined): string | null {
  if (!d) return null;
  if (typeof d === "string") return d;
  const parts = (["UG", "PG", "Judiciary"] as const)
    .map((k) => (d[k] ? `${k}: ${d[k]}` : null))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function difficultyTone(d: ExamRadarDifficulty | undefined): string {
  if (!d) return "text-ink";
  if (typeof d === "string") return DIFFICULTY_COLOR[d] ?? "text-ink";
  // Prefer PG tone when present (site audience is CLAT PG)
  const key = d.PG ?? d.UG ?? d.Judiciary;
  return key ? DIFFICULTY_COLOR[key] ?? "text-ink" : "text-ink";
}

/** Signed-in-only Exam Radar block (schema v2). */
export function ExamRadarSection({ examRadar }: ExamRadarSectionProps) {
  if (!examRadar) return null;

  const {
    heading,
    whyExam,
    likelyQuestions,
    examinerFocus,
    pyqConnection,
    probability,
    difficulty,
  } = examRadar;

  const hasContent =
    whyExam ||
    (likelyQuestions && likelyQuestions.length > 0) ||
    (examinerFocus && examinerFocus.length > 0) ||
    pyqConnection ||
    typeof probability === "number" ||
    difficulty;

  if (!hasContent) return null;

  const diffLabel = difficultyLabel(difficulty);

  return (
    <section className="surface-emphasis mb-10 p-5 md:p-6">
      <h2 className="!mt-0">{heading || "Exam Radar"}</h2>

      {whyExam && (
        <div className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">
            Why this is exam-relevant
          </h3>
          <p className="text-[15px] leading-relaxed text-ink-2">{whyExam}</p>
        </div>
      )}

      {likelyQuestions && likelyQuestions.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Likely questions
          </h3>
          <ul className="list-disc pl-5">
            {likelyQuestions.map((q, i) => (
              <li key={i} className="mb-1.5 text-[15px] leading-relaxed text-ink-2">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {examinerFocus && examinerFocus.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-2">
            Examiner focus
          </h3>
          <ul className="list-disc pl-5">
            {examinerFocus.map((f, i) => (
              <li key={i} className="mb-1.5 text-[15px] leading-relaxed text-ink-2">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-border-app pt-4 text-sm">
        {diffLabel && (
          <span>
            Difficulty:{" "}
            <strong className={difficultyTone(difficulty)}>{diffLabel}</strong>
          </span>
        )}
        {typeof probability === "number" && (
          <span>
            Exam probability:{" "}
            <strong className="text-ink">{probability}/5</strong>
          </span>
        )}
      </div>

      {pyqConnection && (
        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-ink-2">PYQ connection</h3>
          <p className="text-[15px] leading-relaxed text-ink-2">{pyqConnection}</p>
        </div>
      )}
    </section>
  );
}
