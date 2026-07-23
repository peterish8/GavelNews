"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";

interface QuizSectionProps {
  quiz?: QuizQuestion[];
}

const TYPE_LABEL: Record<string, string> = {
  passage: "Passage",
  conceptual: "Conceptual",
  application: "Application",
  static_law: "Static law",
  inference: "Inference",
};

/**
 * Fixed, pre-authored Challenge + Answers quiz (CONTENT-11). Reveal-on-answer,
 * per-question local state only — never scored or tracked per user.
 * Renders nothing for stories synced before the quiz feature existed.
 */
export function QuizSection({ quiz }: QuizSectionProps) {
  if (!quiz || quiz.length === 0) return null;

  return (
    <section className="mb-10">
      <h2>Challenge + Answers</h2>
      <div className="flex flex-col gap-5">
        {quiz.map((q, i) => (
          <QuizCard key={i} index={i} question={q} />
        ))}
      </div>
    </section>
  );
}

function QuizCard({ index, question }: { index: number; question: QuizQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="rounded-md border border-border-app p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-serif text-[15px] font-semibold leading-snug text-ink">
          {index + 1}. {question.question}
        </p>
        <span className="shrink-0 rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
          {TYPE_LABEL[question.type] ?? question.type}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {question.options.map((option, optIndex) => {
          const isCorrect = optIndex === question.correctIndex;
          const isPicked = optIndex === selected;
          let stateClass = "border-border-app hover:border-brand";
          if (answered && isCorrect) {
            stateClass = "border-[var(--gv-ok,#16a34a)] bg-[var(--gv-ok,#16a34a)]/10";
          } else if (answered && isPicked && !isCorrect) {
            stateClass = "border-[var(--gv-danger,#dc2626)] bg-[var(--gv-danger,#dc2626)]/10";
          }

          return (
            <button
              key={optIndex}
              type="button"
              disabled={answered}
              onClick={() => setSelected(optIndex)}
              className={`btn-press rounded-md border px-3.5 py-2.5 text-left text-sm leading-snug text-ink-2 transition-colors disabled:cursor-default ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 rounded-md bg-elevated-muted/70 p-3.5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">
            {selected === question.correctIndex ? "Correct" : "Not quite"}
          </p>
          <p className="text-sm leading-relaxed text-ink-2">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
