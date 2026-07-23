// ────────────────────────────────────────────────────────────────────
// Gavel News — domain types
// Shape mirrors the Supabase schema in REQUIREMENTS.md §Schema.
// Story body sections (what_happened / background / what_court_held /
// why_it_matters) are stored as plain strings; lists (key_points /
// sources) as JSON. Same pattern as editorial.sqlite.
// ────────────────────────────────────────────────────────────────────

export type Category =
  | "constitutional-law"
  | "criminal-law"
  | "legal-current-affairs"
  | "bare-acts-update";

export type Exam = "UG" | "PG" | "Both";

export type SourceType = "newspaper" | "official" | "legal_website" | "statute";

export interface Source {
  name: string;
  url: string;
  type: SourceType;
}

export interface KeyPoint {
  text: string;
}

// ── Real, verified past-CLAT-question store (shared across stories) ────
// Rows in Supabase's pyq_passages/pyq_questions tables, synced one
// verified question at a time by the gavel-news engine (never a bulk
// dump) whenever a story's search_pyqs check confirms a genuine match.
// A story only ever carries IDs (see PublishedStory.pyqQuestionIds); the
// DataSource resolves those into the full objects below at read time.

export interface PYQPassage {
  id: string;
  exam: string;
  year: number;
  passageNumber?: number;
  text: string;
  topic?: string;
  concept?: string;
}

export interface PYQQuestion {
  id: string;
  exam: string;
  year: number;
  questionNumber?: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: "A" | "B" | "C" | "D";
  explanation?: string;
  topic?: string;
  difficulty?: string;
  passage?: PYQPassage;
}

// ── Legal Mentor deep-dive + Exam Lens + quiz (gated content) ──────────
// Field names mirror the gavel-news engine's supabase_sync.py payload and
// published_stories schema exactly (snake_case in Postgres, camelCase here).

export interface ImportantTerm {
  term: string;
  whatIsIt: string;
  whyItMatters: string;
}

export interface CommonConfusion {
  a: string;
  b: string;
  explanation: string;
}

export type QuizQuestionType =
  | "passage"
  | "conceptual"
  | "application"
  | "static_law"
  | "inference";

export interface QuizQuestion {
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExamLens {
  fiveThings: string[];
  pyqConnection?: string;
  staticLawConnection?: string;
  expectedQuestionAreas?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  examProbability?: number; // 1-5
}

export interface BeforeYouLeave {
  oneLiner: string;
  threeBullets: string[];
  examTip: string;
}

export interface PublishedStory {
  id: string;
  editionDate: string; // ISO date "2026-07-22"
  slug: string;
  title: string;
  category: Category;
  examTags: Exam[]; // which exams this is relevant to
  readingTimeMin: number;
  summary?: string; // 1-sentence card teaser (derived from what_happened in mock)
  whatHappened: string;
  background: string;
  whatCourtHeld: string | null; // null for non-judgments
  whyItMatters: string;
  keyPoints: KeyPoint[];
  sources: Source[];
  pyqKeyword?: string; // optional, legacy free-text theme tag
  pyqQuestionIds?: string[]; // raw links into pyq_questions, as stored
  pyqQuestions?: PYQQuestion[]; // resolved by the DataSource at read time
  decision: "must_cover" | "maybe"; // admin-set
  publishedAt: string; // ISO datetime

  // Legal Mentor deep-dive (gated behind sign-in in the story page)
  whatActuallyHappening?: string;
  whyDidThisHappen?: string;
  importantTerms?: ImportantTerm[];
  lawBehindIt?: string;
  analogy?: string;
  friendExplanation?: string;
  commonConfusions?: CommonConfusion[];

  // Exam Lens (gated behind sign-in in the story page)
  examLens?: ExamLens;

  // Challenge + Answers: fixed, pre-authored quiz (gated). Absent/empty for
  // older stories synced before the quiz feature existed - UI must degrade
  // gracefully (section simply doesn't render).
  quiz?: QuizQuestion[];

  // Before You Leave (gated behind sign-in in the story page)
  beforeYouLeave?: BeforeYouLeave;
}

export interface Edition {
  date: string; // ISO date "2026-07-22"
  stories: PublishedStory[];
}

export interface ArchiveMonth {
  month: string; // "2026-07"
  label: string; // "July 2026"
  editions: Edition[];
}

// User profile (for settings + RLS-aware reads)
export interface Profile {
  id: string;
  displayName: string;
  exam: Exam;
  attemptYear: number;
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  marketingOptIn: boolean;
}

// Category metadata for display
export const CATEGORY_META: Record<
  Category,
  { label: string; shortLabel: string; description: string }
> = {
  "constitutional-law": {
    label: "Constitutional Law",
    shortLabel: "Constitutional",
    description: "Supreme Court, high courts, and constitutional benches.",
  },
  "criminal-law": {
    label: "Criminal Law",
    shortLabel: "Criminal",
    description: "IPC, CrPC, evidence, and criminal procedure.",
  },
  "legal-current-affairs": {
    label: "Legal Current Affairs",
    shortLabel: "Current Affairs",
    description: "Legislative updates, ministry actions, and policy news.",
  },
  "bare-acts-update": {
    label: "Bare Acts Update",
    shortLabel: "Bare Acts",
    description: "Amendments to bare acts and statutory changes.",
  },
};

export const ALL_CATEGORIES: Category[] = [
  "constitutional-law",
  "criminal-law",
  "legal-current-affairs",
  "bare-acts-update",
];