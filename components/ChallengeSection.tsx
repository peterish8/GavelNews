"use client";

import { useState } from "react";
import type { Challenge, ChallengeMcq } from "@/lib/types";

interface ChallengeSectionProps {
  challenge?: Challenge;
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

/**
 * Schema v2 Challenge quiz. Letter options + answer letter (not the v1
 * 0-indexed options array). Reveal-on-answer, per-question local state only.
 */
export function ChallengeSection({ challenge }: ChallengeSectionProps) {
  if (!challenge?.mcqs || challenge.mcqs.length === 0) return null;

  return (
    <section className="mb-10">
      <h2>{challenge.heading || "Challenge + Answers"}</h2>
      <div className="flex flex-col gap-5">
        {challenge.mcqs.map((q, i) => (
          <ChallengeCard key={i} index={i} question={q} />
        ))}
      </div>
    </section>
  );
}

function ChallengeCard({
  index,
  question,
}: {
  index: number;
  question: ChallengeMcq;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correctLetter = (question.answer || "").toUpperCase();

  return (
    <div className="rounded-md border border-border-app p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-serif text-[15px] font-semibold leading-snug text-ink">
          {index + 1}. {question.question}
        </p>
        {question.type && (
          <span className="shrink-0 rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
            {question.type.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {OPTION_KEYS.map((letter) => {
          const optionText = question.options?.[letter];
          if (!optionText) return null;
          const isCorrect = letter === correctLetter;
          const isPicked = letter === selected;
          let stateClass = "border-border-app hover:border-brand";
          if (answered && isCorrect) {
            stateClass =
              "border-[var(--gv-ok,#16a34a)] bg-[var(--gv-ok,#16a34a)]/10";
          } else if (answered && isPicked && !isCorrect) {
            stateClass =
              "border-[var(--gv-danger,#dc2626)] bg-[var(--gv-danger,#dc2626)]/10";
          }

          return (
            <button
              key={letter}
              type="button"
              disabled={answered}
              onClick={() => setSelected(letter)}
              className={`btn-press rounded-md border px-3.5 py-2.5 text-left text-sm leading-snug text-ink-2 transition-colors disabled:cursor-default ${stateClass}`}
            >
              <span className="mr-2 font-semibold text-ink-3">{letter}.</span>
              {optionText}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 rounded-md bg-elevated-muted/70 p-3.5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">
            {selected === correctLetter ? "Correct" : "Not quite"}
          </p>
          <p className="text-sm leading-relaxed text-ink-2">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
