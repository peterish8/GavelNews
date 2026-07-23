"use client";

import { useState } from "react";
import type { PYQPassage, PYQQuestion } from "@/lib/types";

interface PYQSidebarProps {
  questions: PYQQuestion[];
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface PYQGroup {
  passage: PYQPassage | undefined;
  questions: PYQQuestion[];
}

/** Questions sharing the same passage (e.g. a 4-question CLAT set) get
 * grouped so the passage renders once, not once per question. */
function groupByPassage(questions: PYQQuestion[]): PYQGroup[] {
  const groups: PYQGroup[] = [];
  const indexByPassageId = new Map<string, number>();
  for (const q of questions) {
    const key = q.passage?.id;
    if (key && indexByPassageId.has(key)) {
      groups[indexByPassageId.get(key)!].questions.push(q);
      continue;
    }
    if (key) indexByPassageId.set(key, groups.length);
    groups.push({ passage: q.passage, questions: [q] });
  }
  return groups;
}

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
  const groups = groupByPassage(questions);

  let runningIndex = 0;

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
      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const startIndex = runningIndex;
          runningIndex += group.questions.length;
          return (
            <PYQGroupCard
              key={group.passage?.id ?? group.questions[0].id}
              group={group}
              startIndex={startIndex}
            />
          );
        })}
      </div>
    </div>
  );
}

function PYQGroupCard({ group, startIndex }: { group: PYQGroup; startIndex: number }) {
  const [passageOpen, setPassageOpen] = useState(false);
  const first = group.questions[0];
  const hasPassage = Boolean(group.passage?.text);

  return (
    <div className="rounded-xl border border-border-app/70 bg-elevated/70">
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5">
        <span className="rounded-full bg-elevated-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-3">
          {first.exam} {first.year}
        </span>
        {group.questions.length > 1 && (
          <span className="text-[11px] text-ink-3">
            {group.questions.length} questions, one passage
          </span>
        )}
      </div>

      {hasPassage && (
        <div className="px-3.5 pt-2">
          <button
            type="button"
            onClick={() => setPassageOpen((v) => !v)}
            className="flex items-center gap-1.5 py-1 text-[12px] font-medium text-brand"
            aria-expanded={passageOpen}
          >
            <ChevronIcon open={passageOpen} />
            {passageOpen ? "Hide the passage" : "Read the passage"}
          </button>
          {passageOpen && (
            <blockquote className="mb-1 rounded-md border-l-2 border-brand-border bg-elevated-muted/60 p-3 text-[12.5px] leading-relaxed text-ink-3 italic">
              {group.passage!.text}
            </blockquote>
          )}
        </div>
      )}

      <ol className="flex flex-col gap-2 p-3.5 pt-2">
        {group.questions.map((q, i) => (
          <PYQQuestionRow key={q.id} index={startIndex + i} question={q} />
        ))}
      </ol>
    </div>
  );
}

function PYQQuestionRow({ index, question }: { index: number; question: PYQQuestion }) {
  const [open, setOpen] = useState(false);
  const options = [question.optionA, question.optionB, question.optionC, question.optionD];
  const hasOptions = options.some(Boolean);

  return (
    <li className="rounded-lg border border-border-app/60 bg-elevated/40 transition-colors hover:border-brand-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 p-3 text-left"
        aria-expanded={open}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
          {index + 1}
        </span>
        <span className="block min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink-2">
          {question.questionText}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="border-t border-border-app/60 px-3 pb-3.5 pt-2.5">
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
            <p className="text-[12.5px] leading-relaxed text-ink-3">{question.explanation}</p>
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
