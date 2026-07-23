import type { DataSource } from "./mock";
import type {
  PublishedStory,
  Edition,
  ArchiveMonth,
  Category,
  Exam,
  ImportantTerm,
  CommonConfusion,
  QuizQuestion,
  ExamLens,
  BeforeYouLeave,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

// ────────────────────────────────────────────────────────────────────
// Supabase-backed DataSource (Phase 1/5). Reads the `published_stories`
// table synced by the sibling `gavel-news` engine repo's supabase_sync.py.
// Row shape is snake_case (Postgres/engine convention); this module is the
// one place that translates it into the camelCase PublishedStory the rest
// of the app uses - mirroring lib/mock/stories.ts's shape exactly so
// swapping DATA_SOURCE never requires touching a component.
// ────────────────────────────────────────────────────────────────────

type Row = Record<string, any>;

function mapImportantTerm(t: Row): ImportantTerm {
  return { term: t.term ?? "", whatIsIt: t.what_is_it ?? "", whyItMatters: t.why_it_matters ?? "" };
}

function mapCommonConfusion(c: Row): CommonConfusion {
  return { a: c.a ?? "", b: c.b ?? "", explanation: c.explanation ?? "" };
}

function mapQuizQuestion(q: Row): QuizQuestion {
  return {
    question: q.question ?? "",
    type: q.type ?? "conceptual",
    options: q.options ?? [],
    correctIndex: q.correct_index ?? 0,
    explanation: q.explanation ?? "",
  };
}

function mapExamLens(e: Row | null | undefined): ExamLens | undefined {
  if (!e || Object.keys(e).length === 0) return undefined;
  return {
    fiveThings: e.five_things ?? [],
    pyqConnection: e.pyq_connection || undefined,
    staticLawConnection: e.static_law_connection || undefined,
    expectedQuestionAreas: e.expected_question_areas || undefined,
    difficulty: e.difficulty || undefined,
    examProbability: e.exam_probability ?? undefined,
  };
}

function mapBeforeYouLeave(b: Row | null | undefined): BeforeYouLeave | undefined {
  if (!b || Object.keys(b).length === 0) return undefined;
  return {
    oneLiner: b.one_liner ?? "",
    threeBullets: b.three_bullets ?? [],
    examTip: b.exam_tip ?? "",
  };
}

function rowToStory(row: Row): PublishedStory {
  return {
    id: row.id,
    editionDate: row.edition_date,
    slug: row.slug,
    title: row.title,
    category: row.category as Category,
    examTags: (row.exam_tags ?? ["Both"]) as Exam[],
    readingTimeMin: row.reading_time_min ?? 1,
    summary: row.summary ?? undefined,
    whatHappened: row.what_happened ?? "",
    background: row.background ?? "",
    whatCourtHeld: row.what_court_held ?? null,
    whyItMatters: row.why_it_matters ?? "",
    keyPoints: (row.key_points ?? []).map((text: string) => ({ text })),
    sources: row.sources ?? [],
    pyqKeyword: row.pyq_keyword || undefined,
    decision: row.decision ?? "must_cover",
    publishedAt: row.published_at ?? row.created_at,

    whatActuallyHappening: row.what_actually_happening || undefined,
    whyDidThisHappen: row.why_did_this_happen || undefined,
    importantTerms: (row.important_terms ?? []).map(mapImportantTerm),
    lawBehindIt: row.law_behind_it || undefined,
    analogy: row.analogy || undefined,
    friendExplanation: row.friend_explanation || undefined,
    commonConfusions: (row.common_confusions ?? []).map(mapCommonConfusion),

    examLens: mapExamLens(row.exam_lens),

    quiz: (row.quiz ?? []).map(mapQuizQuestion),

    beforeYouLeave: mapBeforeYouLeave(row.before_you_leave),
  };
}

function sortByDateDesc(stories: PublishedStory[]): PublishedStory[] {
  return [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

const STORY_COLUMNS = "*";

export const supabaseDataSource: DataSource = {
  async getTodayEdition(): Promise<Edition> {
    const supabase = await createClient();
    const { data: latest } = await supabase
      .from("published_stories")
      .select("edition_date")
      .order("edition_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const date = latest?.edition_date ?? new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("published_stories")
      .select(STORY_COLUMNS)
      .eq("edition_date", date);

    return { date, stories: sortByDateDesc((data ?? []).map(rowToStory)) };
  },

  async getEdition(date: string): Promise<Edition | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("published_stories")
      .select(STORY_COLUMNS)
      .eq("edition_date", date);

    if (!data || data.length === 0) return null;
    return { date, stories: sortByDateDesc(data.map(rowToStory)) };
  },

  async getStory(slug: string): Promise<PublishedStory | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("published_stories")
      .select(STORY_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    return data ? rowToStory(data) : null;
  },

  async getArchive(): Promise<ArchiveMonth[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("published_stories")
      .select(STORY_COLUMNS)
      .order("edition_date", { ascending: false });

    const stories = (data ?? []).map(rowToStory);
    const editionMap = new Map<string, PublishedStory[]>();
    for (const s of stories) {
      if (!editionMap.has(s.editionDate)) editionMap.set(s.editionDate, []);
      editionMap.get(s.editionDate)!.push(s);
    }
    const editions: Edition[] = Array.from(editionMap.entries())
      .map(([edDate, list]) => ({ date: edDate, stories: sortByDateDesc(list) }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const monthMap = new Map<string, { label: string; editions: Edition[] }>();
    for (const edition of editions) {
      const [year, month] = edition.date.split("-");
      const key = `${year}-${month}`;
      const dateObj = new Date(`${edition.date}T00:00:00Z`);
      const label = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
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
    const supabase = await createClient();
    let q = supabase.from("published_stories").select(STORY_COLUMNS);
    if (opts?.category) q = q.eq("category", opts.category);
    if (opts?.exam) q = q.contains("exam_tags", [opts.exam]);

    const trimmed = query.trim();
    if (trimmed) {
      q = q.or(
        `title.ilike.%${trimmed}%,what_happened.ilike.%${trimmed}%,background.ilike.%${trimmed}%,summary.ilike.%${trimmed}%`,
      );
    }

    const { data } = await q.order("edition_date", { ascending: false });
    return sortByDateDesc((data ?? []).map(rowToStory));
  },

  async getRelatedStories(storyId: string): Promise<PublishedStory[]> {
    const supabase = await createClient();
    const { data: current } = await supabase
      .from("published_stories")
      .select("id, category")
      .eq("id", storyId)
      .maybeSingle();
    if (!current) return [];

    const { data } = await supabase
      .from("published_stories")
      .select(STORY_COLUMNS)
      .eq("category", current.category)
      .neq("id", storyId)
      .order("edition_date", { ascending: false })
      .limit(3);

    return (data ?? []).map(rowToStory);
  },
};
