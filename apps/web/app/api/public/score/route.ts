import { NextResponse } from "next/server";

/**
 * Public partial score endpoint (adoption plan 3.1A).
 * Returns a coarse overall score + one fix for marketing funnel.
 * Full pipeline lives in the app; this is intentionally limited.
 */
export async function POST(req: Request) {
  let url = "";
  try {
    const body = (await req.json()) as { url?: string };
    url = (body.url || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }
  try {
    void new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Deterministic demo score from URL hash until app public scoring is wired.
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) >>> 0;
  const score = 42 + (h % 41); // 42–82 band for partial public results

  return NextResponse.json({
    score,
    weakest: "opening",
    fix: "Your first line buries the point. Lead with the outcome.",
    points: 12,
    locked: true,
  });
}
