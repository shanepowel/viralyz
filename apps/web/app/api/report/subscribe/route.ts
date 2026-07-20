import { NextResponse } from "next/server";
import { createDb, hasDatabaseUrl, upsertReportLead } from "@repo/db";

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

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on this deployment" },
      { status: 503 },
    );
  }

  try {
    const db = createDb();
    const row = await upsertReportLead(db, {
      email,
      reportSlug,
      source: body.source || "web",
    });
    return NextResponse.json({
      ok: true,
      id: row.id,
      email: row.email,
      reportSlug: row.reportSlug,
      persisted: true,
    });
  } catch (err) {
    console.error("report subscribe failed", err);
    return NextResponse.json(
      { error: "Could not save your email." },
      { status: 500 },
    );
  }
}
