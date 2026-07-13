import { NextResponse } from "next/server";

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

/** Affiliate apply: 30% recurring / 12 months. Persists when DB is wired. */
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
  const code = makeCode(name);
  // TODO: insert affiliates row via @repo/db
  return NextResponse.json({
    ok: true,
    code,
    commissionBps: 3000,
    recurringMonths: 12,
    status: "pending",
    channel: (body.channel || "").trim() || null,
  });
}
