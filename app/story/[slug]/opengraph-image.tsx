import { ImageResponse } from "next/og";
import { getDataSource } from "@/lib/data";
import { CATEGORY_META } from "@/lib/types";

export const runtime = "edge";
export const alt = "Gavel News story preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getDataSource();
  const story = await data.getStory(slug);

  const kicker = story ? CATEGORY_META[story.category].label : "Gavel News";
  const title = story
    ? story.title.length > 110
      ? `${story.title.slice(0, 110)}…`
      : story.title
    : "Daily CLAT Current Affairs";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1200px",
          height: "630px",
          padding: "64px",
          // Mirrors --auth-hero-gradient in app/tokens.css — CSS custom
          // properties aren't resolvable inside ImageResponse's renderer.
          background:
            "linear-gradient(135deg, #7f1d1d 0%, #dc2626 55%, #b91c1c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
          Gavel News
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
              opacity: 0.85,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 20, opacity: 0.85 }}>
          Daily CLAT Current Affairs
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
