import { notFound } from "next/navigation";
import { FeedView } from "@/components/FeedView";
import { getDataSource } from "@/lib/data";
import { getEditionNeighbors } from "@/lib/editions";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function EditionPage({ params }: PageProps) {
  const { date } = await params;
  const data = getDataSource();
  const edition = await data.getEdition(date);
  if (!edition) notFound();

  const { prevEditionDate, nextEditionDate, editionIndex } =
    await getEditionNeighbors(data, edition.date);

  return (
    <FeedView
      stories={edition.stories}
      editionDate={edition.date}
      prevEditionDate={prevEditionDate}
      nextEditionDate={nextEditionDate}
      editionIndex={editionIndex}
      heading={`Edition · ${formatDate(edition.date)}`}
      subtitle={
        edition.stories.length === 1
          ? "One story from this day."
          : `${edition.stories.length} stories from this edition.`
      }
    />
  );
}
