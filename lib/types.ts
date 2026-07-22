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
  pyqKeyword?: string; // optional, for PYQ sidebar lookup
  decision: "must_cover" | "maybe"; // admin-set
  publishedAt: string; // ISO datetime
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