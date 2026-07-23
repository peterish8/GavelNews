"use client";

import { useState } from "react";
import type { PYQQuestion } from "@/lib/types";

interface PYQSidebarProps {
  questions: PYQQuestion[];
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

/**
 * Real, verified past-CLAT questions linked to this story (see
 * PublishedStory.pyqQuestionIds, resolved by the DataSource from Supabase's
 * pyq_questions/pyq_passages tables). Every question here was confirmed by
 * an actual search_pyqs check against the real ingested corpus - nothing
 * here is illustrative or invented. Renders nothing if the story has no
 * linked questions, rather than fabricating a generic one.
 */
export function PYQSidebar({ questions }: PYQSidebarProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="surface-hero p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-on-accent">
          <PyqIcon />
        </span>
        <div className="min-w-0">
          <h3 className="font-ui text-sm font-semibold uppercase tracking-wider text-brand">
            Past CLAT questions
          </h3>
          <p className="mt-0.5 text-xs text-ink-3">
            {questions.length === 1
              ? "A real question on this exact theme"
              : `${questions.length} real questions on this exact theme`}
          </p>
        </div>
      </div>
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <PYQCard key={q.id} index={i} question={q} />
        ))}
      </ol>
    </div>
  );
}

function PYQCard({ index, question }: { index: number; question: PYQQuestion }) {
  const [open, setOpen] = useState(false);
  const options = [question.optionA, question.optionB, question.optionC, question.optionD];
  const hasOptions = options.some(Boolean);

  return (
    <li className="rounded-xl border border-border-app/70 bg-elevated/70 transition-colors hover:border-brand-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 p-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-elevated-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-3">
              {question.exam} {question.year}
            </span>
          </span>
          <span className="block text-[13.5px] leading-relaxed text-ink-2">
            {question.questionText}
          </span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="border-t border-border-app/60 px-3.5 pb-4 pt-3">
          {question.passage?.text && (
            <blockquote className="mb-3 rounded-md border-l-2 border-brand-border bg-elevated-muted/60 p-3 text-[12.5px] leading-relaxed text-ink-3 italic">
              {question.passage.text}
            </blockquote>
          )}

          {hasOptions && (
            <div className="mb-3 flex flex-col gap-1.5">
              {options.map((opt, i) => {
                if (!opt) return null;
                const label = OPTION_LABELS[i];
                const isCorrect = question.correctAnswer === label;
                return (
                  <div
                    key={label}
                    className={
                      "flex items-start gap-2 rounded-md border px-2.5 py-2 text-[13px] leading-snug " +
                      (isCorrect
                        ? "border-[var(--gv-ok,#16a34a)] bg-[var(--gv-ok,#16a34a)]/10 text-ink"
                        : "border-border-app text-ink-2")
                    }
                  >
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-ink-3">
                      {label}
                    </span>
                    <span>{opt}</span>
                    {isCorrect && (
                      <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--gv-ok,#16a34a)]">
                        Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {question.explanation && (
            <p className="text-[12.5px] leading-relaxed text-ink-3">
              {question.explanation}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`mt-0.5 shrink-0 text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PyqIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 17v.01M12 8a2 2 0 0 1 2 2c0 1.5-2 2-2 4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
