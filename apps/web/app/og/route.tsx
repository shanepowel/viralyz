import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * The share image for any page: the page title set large on paper, under
 * the mark. `?title=` sets the words; `?kicker=` the small line on top.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("title") ?? "").trim().slice(0, 140);
  const title = !raw || raw === "Viralyz" ? "Make the ad. Mark it up. Then spend on it." : raw;
  const kicker = (searchParams.get("kicker") ?? "Ad creative for Meta and TikTok, checked before you spend").slice(0, 90);
  const size = title.length > 70 ? 60 : title.length > 40 ? 76 : 96;

  // The site's own typefaces, served from /public/fonts. If they cannot be
  // read the image still renders, in the default face.
  const font = (file: string) =>
    fetch(new URL(`/fonts/${file}`, req.url))
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
  const [display, mono] = await Promise.all([font("SchibstedGrotesk-ExtraBold.ttf"), font("IBMPlexMono-Medium.ttf")]);
  const fonts = [
    ...(display ? [{ name: "Schibsted Grotesk", data: display, weight: 800 as const, style: "normal" as const }] : []),
    ...(mono ? [{ name: "IBM Plex Mono", data: mono, weight: 500 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F4F1",
          color: "#111110",
          padding: "64px 72px",
          fontFamily: display ? "Schibsted Grotesk" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #111110",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 14 14">
              <path d="M2 7.5l3.2 3.2L12 3.5" fill="none" stroke="#0B6F3F" strokeWidth="2.4" strokeLinecap="square" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.035em" }}>viralyz</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: size,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              paddingTop: 18,
              borderTop: "2px solid #111110",
              fontSize: 22,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#62625E",
              fontFamily: mono ? "IBM Plex Mono" : "sans-serif",
            }}
          >
            {kicker}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, ...(fonts.length ? { fonts } : {}) },
  );
}
