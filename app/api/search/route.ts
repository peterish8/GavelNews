import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data";
import type { SearchHit } from "@/lib/search";
import { CATEGORY_META } from "@/lib/types";

/** Full-catalog search (all editions / all stories in the data source). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(
    24,
    Math.max(1, Number(searchParams.get("limit") ?? "12") || 12),
  );

  const data = getDataSource();
  const stories = await data.searchStories(q);

  const hits: SearchHit[] = stories.slice(0, limit).map((s) => {
    const teaser =
      (s.summary?.trim() || s.whatHappened.trim()).slice(0, 120) +
      ((s.summary?.trim() || s.whatHappened.trim()).length > 120 ? "…" : "");
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      categoryLabel: CATEGORY_META[s.category]?.shortLabel ?? s.category,
      editionDate: s.editionDate,
      readingTimeMin: s.readingTimeMin,
      decision: s.decision,
      teaser,
    };
  });

  return NextResponse.json({
    q,
    total: stories.length,
    hits,
  });
}
