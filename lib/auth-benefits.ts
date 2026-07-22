// Single source of truth: what free readers get vs what auth unlocks.

export type BenefitTier = "free" | "auth";

export type Benefit = {
  id: string;
  title: string;
  detail: string;
  tier: BenefitTier;
};

export const FREE_BENEFITS: Benefit[] = [
  {
    id: "edition",
    title: "Daily morning brief",
    detail: "Today's must-cover + optional stories, every day.",
    tier: "free",
  },
  {
    id: "teaser",
    title: "Full story teaser",
    detail: "What happened, background, and sources — no account.",
    tier: "free",
  },
  {
    id: "archive",
    title: "Archive & search",
    detail: "Browse past editions and search the catalog.",
    tier: "free",
  },
];

export const AUTH_BENEFITS: Benefit[] = [
  {
    id: "why",
    title: "Why it matters for CLAT",
    detail: "Syllabus map: which exam level, which topic it hits.",
    tier: "auth",
  },
  {
    id: "keys",
    title: "Key points",
    detail: "4–8 exam-ready bullets you can revise in ~60 seconds.",
    tier: "auth",
  },
  {
    id: "court",
    title: "What the court held",
    detail: "Ratio and holding, when the story is a judgment.",
    tier: "auth",
  },
  {
    id: "pyq",
    title: "Past CLAT questions",
    detail: "Related PYQs on the same topic, with year tags.",
    tier: "auth",
  },
  {
    id: "favorites",
    title: "Favorites",
    detail: "Save stories and reopen them from Your library.",
    tier: "auth",
  },
  {
    id: "progress",
    title: "Mark complete",
    detail: "Track which stories you've finished for the day.",
    tier: "auth",
  },
  {
    id: "settings",
    title: "Settings",
    detail: "Exam track (UG/PG), attempt year, theme, font size.",
    tier: "auth",
  },
  {
    id: "related",
    title: "Related stories",
    detail: "Same-category follow-ups in the story sidebar.",
    tier: "auth",
  },
];
