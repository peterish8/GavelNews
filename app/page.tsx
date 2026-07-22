import { FeedView } from "@/components/FeedView";
import { getDataSource } from "@/lib/data";

export default async function HomePage() {
  const data = getDataSource();
  const edition = await data.getTodayEdition();
  return (
    <FeedView
      stories={edition.stories}
      heading="Today's Edition"
      subtitle="Daily CLAT current-affairs, written for UG and PG aspirants. Five minutes of reading, every morning."
    />
  );
}