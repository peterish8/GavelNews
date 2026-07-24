import { ImageResponse } from "next/og";
import { getDataSource } from "@/lib/data";
import { CATEGORY_META } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

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

/** Brand gavel-shield mark — same path data as components/Sidebar.tsx's Logo. */
function BrandMark({ size, stroke = "#ffffff" }: { size: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z"
        stroke={stroke}
        strokeWidth={1.4}
        fill={stroke}
        fillOpacity={0.16}
      />
      <path
        d="M9.5 12.5l1.8 1.8 3.5-3.6"
        stroke={stroke}
        strokeWidth={1.8}
      />
    </svg>
  );
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
    ? story.title.length > 92
      ? `${story.title.slice(0, 92)}…`
      : story.title
    : "Daily CLAT Current Affairs";
  const dek = story?.summary
    ? story.summary.length > 130
      ? `${story.summary.slice(0, 130)}…`
      : story.summary
    : null;
  const dateLabel = formatDate(
    story?.editionDate ?? new Date().toISOString().slice(0, 10),
  ).toUpperCase();
  const domain = SITE_URL.replace(/^https?:\/\//, "");

  // Subset text for each face — keeps the Google Fonts response small/correct.
  // Matches app/system.css: Source Serif 4 (display) + Source Sans 3 (labels).
  const serifText = `${title}${dek ?? ""}Gavel News…`;
  const sansText = [
    "DAILY LEGAL BRIEF",
    "Daily CLAT Current Affairs",
    "Constitutional Law",
    "Criminal Law",
    "Legal Current Affairs",
    "Bare Acts Update",
    dateLabel,
    domain,
  ].join(" ");

  type OgFont = {
    name: string;
    data: ArrayBuffer;
    weight: 500 | 700;
    style: "normal";
  };
  let fonts: OgFont[] | undefined;
  try {
    const [serifData, sansData] = await Promise.all([
      loadGoogleFont("Source Serif 4", 700, serifText),
      loadGoogleFont("Source Sans 3", 500, sansText),
    ]);
    fonts = [
      {
        name: "Source Serif 4",
        data: serifData,
        weight: 700 as const,
        style: "normal" as const,
      },
      {
        name: "Source Sans 3",
        data: sansData,
        weight: 500 as const,
        style: "normal" as const,
      },
    ];
  } catch (err) {
    console.error(`[og-image] font load failed for slug="${slug}"`, err);
    fonts = undefined;
  }

  const serifFamily = fonts ? "Source Serif 4" : "serif";
  const monoFamily = fonts ? "Source Sans 3" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          background: "#F7F6FB",
          fontFamily: serifFamily,
        }}
      >
        {/* ── Masthead bar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 64px",
            borderBottom: "2px solid #E8D4D4",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "#FEF2F2",
                border: "2px solid #FECACA",
              }}
            >
              <BrandMark size={30} stroke="#DC2626" />
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: serifFamily,
                fontSize: 46,
                fontWeight: 700,
                letterSpacing: -0.5,
                color: "#130F2A",
              }}
            >
              Gavel News
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: monoFamily,
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: 1.5,
              color: "#857FA0",
            }}
          >
            {dateLabel}
          </div>
        </div>

        {/* ── Body: brand panel + headline block ──────────────────── */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 48,
            padding: "0 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 300,
              height: 300,
              borderRadius: 24,
              flexShrink: 0,
              background:
                "linear-gradient(135deg, #DC2626 0%, #EF4444 62%, #F87171 100%)",
            }}
          >
            <BrandMark size={130} stroke="#ffffff" />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: monoFamily,
                fontSize: 20,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#DC2626",
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: serifFamily,
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#130F2A",
              }}
            >
              {title}
            </div>
            {dek && (
              <div
                style={{
                  display: "flex",
                  fontFamily: serifFamily,
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: "#434056",
                }}
              >
                {dek}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer bar ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 64px",
            background: "#130F2A",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: serifFamily,
              fontSize: 30,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Gavel News
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: monoFamily,
              fontSize: 19,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {domain}
          </div>
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
