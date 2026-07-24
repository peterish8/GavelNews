import type { PublishedStory, Edition, ArchiveMonth, Category, Exam } from "@/lib/types";
import { MOCK_STORIES } from "@/lib/mock/stories";

// ────────────────────────────────────────────────────────────────────
// DataSource interface — same shape as the Supabase-backed
// implementation that Phase 5 will add. Mock today; swap tomorrow
// via `DATA_SOURCE` env var.
// ────────────────────────────────────────────────────────────────────

export interface DataSource {
  getTodayEdition(): Promise<Edition>;
  getEdition(date: string): Promise<Edition | null>;
  getStory(slug: string): Promise<PublishedStory | null>;
  getArchive(): Promise<ArchiveMonth[]>;
  searchStories(query: string, opts?: { category?: Category; exam?: Exam }): Promise<PublishedStory[]>;
  getRelatedStories(storyId: string): Promise<PublishedStory[]>;
}

// ── Helpers ─────────────────────────────────────────────────────────

function sortByDateDesc(stories: PublishedStory[]): PublishedStory[] {
  return [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function groupByEdition(stories: PublishedStory[]): Edition[] {
  const map = new Map<string, PublishedStory[]>();
  for (const s of stories) {
    if (!map.has(s.editionDate)) map.set(s.editionDate, []);
    map.get(s.editionDate)!.push(s);
  }
  return Array.from(map.entries())
    .map(([date, list]) => ({ date, stories: sortByDateDesc(list) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Mock implementation ─────────────────────────────────────────────

export const mockDataSource: DataSource = {
  async getTodayEdition(): Promise<Edition> {
    const all = sortByDateDesc(MOCK_STORIES);
    const today = all[0]?.editionDate ?? new Date().toISOString().slice(0, 10);
    const stories = all.filter((s) => s.editionDate === today);
    if (stories.length === 0) {
      // Fallback: most recent date with content.
      const recent = all[0]?.editionDate;
      return { date: recent ?? today, stories: all.filter((s) => s.editionDate === recent) };
    }
    return { date: today, stories };
  },

  async getEdition(date: string): Promise<Edition | null> {
    const stories = MOCK_STORIES.filter((s) => s.editionDate === date);
    if (stories.length === 0) return null;
    return { date, stories: sortByDateDesc(stories) };
  },

  async getStory(slug: string): Promise<PublishedStory | null> {
    return MOCK_STORIES.find((s) => s.slug === slug) ?? null;
  },

  async getArchive(): Promise<ArchiveMonth[]> {
    const editions = groupByEdition(MOCK_STORIES);
    const monthMap = new Map<string, { label: string; editions: Edition[] }>();
    for (const edition of editions) {
      const [year, month] = edition.date.split("-");
      const key = `${year}-${month}`;
      const date = new Date(`${edition.date}T00:00:00Z`);
      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
      if (!monthMap.has(key)) monthMap.set(key, { label, editions: [] });
      monthMap.get(key)!.editions.push(edition);
    }
    return Array.from(monthMap.entries())
      .map(([month, val]) => ({ month, label: val.label, editions: val.editions }))
      .sort((a, b) => b.month.localeCompare(a.month));
  },

  async searchStories(
    query: string,
    opts?: { category?: Category; exam?: Exam },
  ): Promise<PublishedStory[]> {
    const q = query.trim().toLowerCase();
    let candidates = sortByDateDesc(MOCK_STORIES);
    if (opts?.category) candidates = candidates.filter((s) => s.category === opts.category);
    if (opts?.exam) {
      candidates = candidates.filter((s) => s.examTags.includes(opts.exam!));
    }
    if (!q) return candidates;

    // Match across full catalog fields (title → body → tags), not archive-only.
    const tokens = q.split(/\s+/).filter(Boolean);
    return candidates.filter((s) => {
      const haystack = [
        s.title,
        s.summary ?? "",
        s.whatHappened ?? "",
        s.background ?? "",
        s.whatCourtHeld ?? "",
        s.whyItMatters ?? "",
        s.story?.summary ?? "",
        s.story?.takeaway ?? "",
        s.pyqKeyword ?? "",
        s.category,
        s.slug,
        ...s.examTags,
        ...(s.keyPoints ?? []).map((k) => k.text),
        ...s.sources.map((src) => src.name),
        s.sourcesV2?.primary ?? "",
        ...(s.sourcesV2?.secondary ?? []),
      ]
        .join(" ")
        .toLowerCase();
      // All tokens must match (AND) so multi-word queries stay precise.
      return tokens.every((t) => haystack.includes(t));
    });
  },

  async getRelatedStories(storyId: string): Promise<PublishedStory[]> {
    const story = MOCK_STORIES.find((s) => s.id === storyId);
    if (!story) return [];
    return MOCK_STORIES.filter(
      (s) => s.id !== story.id && s.category === story.category,
    ).slice(0, 3);
  },
};