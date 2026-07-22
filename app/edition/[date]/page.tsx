import { notFound } from "next/navigation";
import { FeedView } from "@/components/FeedView";
import { getDataSource } from "@/lib/data";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function EditionPage({ params }: PageProps) {
  const { date } = await params;
  const data = getDataSource();
  const edition = await data.getEdition(date);
  if (!edition) notFound();

  return (
    <FeedView
      stories={edition.stories}
      heading={`Edition · ${formatDate(edition.date)}`}
      subtitle={
        edition.stories.length === 1
          ? "One story from this day."
          : `${edition.stories.length} stories from this edition.`
      }
    />
  );
}