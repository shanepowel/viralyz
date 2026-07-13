import { NextResponse } from "next/server";

type Body = {
  email?: string;
  reportSlug?: string;
  source?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  const reportSlug = (body.reportSlug || "viral-score-report-2026").trim();
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  // TODO: upsert report_leads via @repo/db
  return NextResponse.json({
    ok: true,
    email,
    reportSlug,
    source: body.source || "web",
  });
}
