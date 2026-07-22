import type { DataSource } from "@/lib/data/mock";

/** Chronological helpers for prev/next edition navigation. */
export async function getEditionNeighbors(
  data: DataSource,
  date: string,
): Promise<{
  prevEditionDate: string | null;
  nextEditionDate: string | null;
  editionIndex: number;
}> {
  const archive = await data.getArchive();
  // Newest first
  const dates = archive
    .flatMap((m) => m.editions.map((e) => e.date))
    .sort((a, b) => b.localeCompare(a));

  const idx = dates.indexOf(date);
  const editionIndex = dates.length; // total published days (habit cue)

  if (idx === -1) {
    return {
      prevEditionDate: null,
      nextEditionDate: null,
      editionIndex,
    };
  }

  // dates is newest→oldest: next = newer (lower index), prev = older (higher index)
  return {
    prevEditionDate: dates[idx + 1] ?? null,
    nextEditionDate: idx > 0 ? dates[idx - 1] : null,
    editionIndex,
  };
}
