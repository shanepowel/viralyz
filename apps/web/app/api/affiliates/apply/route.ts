import { NextResponse } from "next/server";
import { createDb, hasDatabaseUrl, upsertAffiliate } from "@repo/db";

type Body = {
  name?: string;
  email?: string;
  channel?: string;
};

function makeCode(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "vz"}${suffix}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  if (!name || !email.includes("@")) {
    return NextResponse.json(
      { error: "Name and a valid email are required" },
      { status: 400 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on this deployment" },
      { status: 503 },
    );
  }

  try {
    const db = createDb();
    const code = makeCode(name);
    const row = await upsertAffiliate(db, {
      email,
      name,
      code,
      channel: (body.channel || "").trim() || null,
    });
    return NextResponse.json({
      ok: true,
      code: row.code,
      id: row.id,
      commissionBps: row.commissionBps,
      recurringMonths: row.recurringMonths,
      status: row.status,
      persisted: true,
    });
  } catch (err) {
    console.error("affiliate apply failed", err);
    return NextResponse.json(
      { error: "Could not apply. Try again." },
      { status: 500 },
    );
  }
}
