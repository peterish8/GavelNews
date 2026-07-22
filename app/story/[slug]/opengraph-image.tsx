import { ImageResponse } from "next/og";
import { getDataSource } from "@/lib/data";
import { CATEGORY_META } from "@/lib/types";

export const runtime = "edge";
export const alt = "Gavel News story preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Fetch a Google Fonts TTF/OTF subset for Satori (next/og).
 * Uses an old User-Agent so the CSS2 API serves opentype/truetype instead of woff2.
 * Both fetches hard-timeout at 4s so a dead CDN cannot hang the OG edge route.
 */
async function loadGoogleFont(
  fontFamily: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, {
      headers: {
        // Old/basic User-Agent so Google's CSS2 API serves a ttf/otf src URL instead of woff2
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34",
      },
      signal: AbortSignal.timeout(4000),
    })
  ).text();
  const resource = css.match(
    /src: url\(([^)]+)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const res = await fetch(resource[1], {
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 200) return await res.arrayBuffer();
  }
  throw new Error(`failed to load font data for ${fontFamily}`);
}

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

  // Subset text for each face — keeps the Google Fonts response small/correct
  const serifText = `${title} Gavel News…`;
  const monoText = [
    "DAILY LEGAL BRIEF",
    "Daily CLAT Current Affairs",
    "Constitutional Law",
    "Criminal Law",
    "Legal Current Affairs",
    "Bare Acts Update",
  ].join(" ");

  type OgFont = {
    name: string;
    data: ArrayBuffer;
    weight: 500 | 700;
    style: "normal";
  };
  let fonts: OgFont[] | undefined;
  try {
    const [serifData, monoData] = await Promise.all([
      loadGoogleFont("Source Serif 4", 700, serifText),
      loadGoogleFont("IBM Plex Mono", 500, monoText),
    ]);
    fonts = [
      {
        name: "Source Serif 4",
        data: serifData,
        weight: 700 as const,
        style: "normal" as const,
      },
      {
        name: "IBM Plex Mono",
        data: monoData,
        weight: 500 as const,
        style: "normal" as const,
      },
    ];
  } catch (err) {
    console.error(`[og-image] font load failed for slug="${slug}"`, err);
    fonts = undefined;
  }

  const serifFamily = fonts ? "Source Serif 4" : "sans-serif";
  const monoFamily = fonts ? "IBM Plex Mono" : "sans-serif";

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
          fontFamily: serifFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: serifFamily,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            Gavel News
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: monoFamily,
              fontSize: 15,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 2.5,
              opacity: 0.82,
            }}
          >
            DAILY LEGAL BRIEF
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontFamily: monoFamily,
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
              fontFamily: serifFamily,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: monoFamily,
            fontSize: 20,
            opacity: 0.85,
          }}
        >
          Daily CLAT Current Affairs
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
    },
  );
}
