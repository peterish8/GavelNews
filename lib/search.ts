/** Lightweight search hit for popup + API responses. */
export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  editionDate: string;
  readingTimeMin: number;
  decision: "must_cover" | "maybe";
  teaser: string;
};
