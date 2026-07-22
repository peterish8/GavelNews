import { getDataSource } from "@/lib/data";
import { SearchResults } from "@/components/SearchResults";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const data = getDataSource();
  const results = await data.searchStories(q);

  return <SearchResults initialQuery={q} initialResults={results} />;
}