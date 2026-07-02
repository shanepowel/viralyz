import { listUsersForWeeklyDigest, markDigestSent, getWeeklyDigestPayload } from "./storage-extras";
import { renderWeeklyDigestEmail, renderCompetitorDigestEmail, sendEmail } from "./email";
import { autopilotTick } from "./agent";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { intelCompetitors, users } from "@shared/schema";
import { refreshAndDigest } from "./intelligence";

const HOUR_MS = 60 * 60 * 1000;
const TICK_MS = HOUR_MS;
const AUTOPILOT_TICK_MS = 5 * 60 * 1000; // 5 minutes — agent needs faster cadence
const INTEL_CHECK_MS = HOUR_MS; // check hourly; only acts Mon 08:00 UTC

let started = false;

function log(message: string) {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${t} [scheduler] ${message}`);
}

export async function runWeeklyDigestJob(now = new Date()): Promise<{ sent: number; skipped: number }> {
  const due = await listUsersForWeeklyDigest(now);
  let sent = 0;
  let skipped = 0;
  for (const u of due) {
    if (!u.email) { skipped++; continue; }
    try {
      const payload = await getWeeklyDigestPayload(u.id, now);
      const msg = renderWeeklyDigestEmail({
        firstName: u.firstName ?? null,
        email: u.email,
        analysisCount: payload.analysisCount,
        topAnalysis: payload.topAnalysis,
        averageScore: payload.averageScore,
        upcomingPosts: payload.upcomingPosts,
        accuracy: payload.accuracy,
      });
      const res = await sendEmail(msg);
      if (res.ok) { await markDigestSent(u.id, now); sent++; } else { skipped++; }
    } catch (e: any) {
      log(`digest failed for ${u.id}: ${e?.message || e}`);
      skipped++;
    }
  }
  if (due.length) log(`weekly digest run: sent=${sent} skipped=${skipped} candidates=${due.length}`);
  return { sent, skipped };
}

let lastIntelRunDayKey: string | null = null;

export async function runIntelligenceWeeklyJob(now = new Date()): Promise<{ refreshed: number; emailed: number }> {
  const rows = await db.select().from(intelCompetitors);
  let refreshed = 0;
  let emailed = 0;
  for (const c of rows) {
    try {
      const digest = await refreshAndDigest(c);
      refreshed++;
      if (!c.emailDigestEnabled) continue;
      const [u] = await db.select().from(users).where(eq(users.id, c.userId)).limit(1);
      if (!u?.email) continue;
      const msg = renderCompetitorDigestEmail({
        firstName: u.firstName ?? null,
        email: u.email,
        competitorName: c.name,
        competitorId: c.id,
        weekStart: digest.weekStart,
        themes: (digest.themes ?? []).map((t) => ({ title: t.title, summary: t.summary })),
        amplifiers: digest.amplifiers ?? [],
        qualifiedEngagement: digest.qualifiedEngagement,
        rawEngagement: digest.rawEngagement,
        postsThisWeek: digest.postsThisWeek,
        velocityChangePct: digest.velocityChangePct,
      });
      const r = await sendEmail(msg);
      if (r.ok) emailed++;
    } catch (e: any) {
      log(`intel digest failed for ${c.id}: ${e?.message || e}`);
    }
  }
  if (rows.length) log(`intel weekly run: refreshed=${refreshed} emailed=${emailed} candidates=${rows.length}`);
  return { refreshed, emailed };
}

export function startScheduler() {
  if (started) return;
  started = true;
  log(`scheduler started (digest=${TICK_MS / 1000}s, autopilot=${AUTOPILOT_TICK_MS / 1000}s)`);

  const digestTick = async () => {
    try { await runWeeklyDigestJob(); } catch (e: any) { log(`digest tick error: ${e?.message || e}`); }
  };
  setTimeout(digestTick, 60 * 1000);
  setInterval(digestTick, TICK_MS);

  const autopilotTickFn = async () => {
    try { await autopilotTick(); } catch (e: any) { log(`autopilot tick error: ${e?.message || e}`); }
  };
  setTimeout(autopilotTickFn, 30 * 1000);
  setInterval(autopilotTickFn, AUTOPILOT_TICK_MS);

  const intelTick = async () => {
    const now = new Date();
    // Run on Monday between 08:00 and 09:00 UTC, once per day.
    if (now.getUTCDay() !== 1 || now.getUTCHours() !== 8) return;
    const dayKey = now.toISOString().slice(0, 10);
    if (lastIntelRunDayKey === dayKey) return;
    lastIntelRunDayKey = dayKey;
    try { await runIntelligenceWeeklyJob(now); } catch (e: any) { log(`intel tick error: ${e?.message || e}`); }
  };
  setTimeout(intelTick, 90 * 1000);
  setInterval(intelTick, INTEL_CHECK_MS);
}
