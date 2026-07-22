import { FeedView } from "@/components/FeedView";
import { getDataSource } from "@/lib/data";
import { getEditionNeighbors } from "@/lib/editions";

export default async function HomePage() {
  const data = getDataSource();
  const edition = await data.getTodayEdition();
  const { prevEditionDate, nextEditionDate, editionIndex } =
    await getEditionNeighbors(data, edition.date);

  return (
    <FeedView
      stories={edition.stories}
      editionDate={edition.date}
      prevEditionDate={prevEditionDate}
      nextEditionDate={nextEditionDate}
      editionIndex={editionIndex}
      heading="Morning brief"
      subtitle="Must-cover stories first. Optional depth below. Five minutes, every morning."
    />
  );
}
