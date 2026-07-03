/**
 * Correlation engine. When external signals (hiring / funding / podcast) are
 * ingested, look back at the last 4 weeks of Pulse digest themes for the same
 * competitor and ask gpt-4o to surface plausible correlations — e.g. "Acme
 * just hired a Head of Demand Gen + their content shifted toward enterprise
 * positioning." Correlations are regenerated wholesale per competitor.
 */
import { openai, OPENAI_CHAT_MODEL } from "../lib/openai";
import { db } from "../db";
import { and, desc, eq, gte } from "drizzle-orm";
import {
  intelCompetitorDigests,
  intelHiringSignals,
  intelFundingSignals,
  intelPodcastSignals,
  intelSignalCorrelations,
  type IntelSignalCorrelation,
} from "@shared/schema";


type SignalRef = { type: "hiring" | "funding" | "podcast"; id: string; label: string };

export async function correlateSignals(competitorId: string): Promise<IntelSignalCorrelation[]> {
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

  // Recent signals across the three sources (detected in the last 4 weeks).
  const [hiring, funding, podcasts, digests] = await Promise.all([
    db.select().from(intelHiringSignals)
      .where(and(eq(intelHiringSignals.competitorId, competitorId), gte(intelHiringSignals.detectedAt, fourWeeksAgo))),
    db.select().from(intelFundingSignals)
      .where(and(eq(intelFundingSignals.competitorId, competitorId), gte(intelFundingSignals.detectedAt, fourWeeksAgo))),
    db.select().from(intelPodcastSignals)
      .where(and(eq(intelPodcastSignals.competitorId, competitorId), gte(intelPodcastSignals.detectedAt, fourWeeksAgo))),
    db.select().from(intelCompetitorDigests)
      .where(eq(intelCompetitorDigests.competitorId, competitorId))
      .orderBy(desc(intelCompetitorDigests.weekStart)).limit(4),
  ]);

  const signalRefs: SignalRef[] = [];
  // Prioritise GTM/marketing hires (most predictive of a positioning shift).
  const sortedHiring = [...hiring].sort((a, b) => Number(b.isGtmRole) - Number(a.isGtmRole)).slice(0, 12);
  for (const h of sortedHiring) {
    signalRefs.push({
      type: "hiring",
      id: h.id,
      label: `Hired: ${h.title}${h.department ? ` (${h.department})` : ""}${h.isGtmRole ? " [GTM role]" : ""}`,
    });
  }
  for (const f of funding.slice(0, 6)) {
    signalRefs.push({ type: "funding", id: f.id, label: `Funding: ${f.title}${f.amount ? ` — ${f.amount}` : ""}` });
  }
  for (const p of podcasts.slice(0, 6)) {
    signalRefs.push({ type: "podcast", id: p.id, label: `Podcast: ${p.guest || "exec"} on "${p.showName || "a show"}" — ${p.episodeTitle}` });
  }

  const themes = digests
    .flatMap((d) => (d.themes ?? []).map((t) => t.title))
    .filter(Boolean)
    .slice(0, 12);

  // Always clear stale correlations so removed signals don't linger.
  await db.delete(intelSignalCorrelations).where(eq(intelSignalCorrelations.competitorId, competitorId));

  if (signalRefs.length === 0 || themes.length === 0 || !process.env.OPENAI_API_KEY && !process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return [];
  }

  const signalLines = signalRefs.map((s, i) => `[${i + 1}] ${s.label}`).join("\n");
  const themeLines = themes.map((t, i) => `- ${t}`).join("\n");

  let parsed: { correlations?: Array<{ signalIndex?: number; headline?: string; explanation?: string; confidence?: number; relatedThemes?: string[] }> } = {};
  try {
    const resp = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a competitive-intelligence analyst. Given a competitor's recent external signals (new hires, funding, podcast appearances) and the content themes they've pushed over the last 4 weeks, surface only the PLAUSIBLE causal correlations — where a signal likely explains a content shift. Be conservative: skip signals with no thematic link. Respond with valid JSON only.",
        },
        {
          role: "user",
          content:
            `EXTERNAL SIGNALS:\n${signalLines}\n\nRECENT CONTENT THEMES:\n${themeLines}\n\n` +
            `Return JSON: {"correlations":[{"signalIndex":<1-based index into signals>,"headline":"<one-line 'X + Y' insight>","explanation":"<1-2 sentences>","confidence":<0-100>,"relatedThemes":["<matching theme titles>"]}]}. Only include correlations you'd stake your reputation on. Return an empty array if none are plausible.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 900,
    });
    parsed = JSON.parse(resp.choices?.[0]?.message?.content || "{}");
  } catch {
    return [];
  }

  const rows = (parsed.correlations || [])
    .map((c) => {
      const ref = c.signalIndex && c.signalIndex >= 1 ? signalRefs[c.signalIndex - 1] : undefined;
      const headline = String(c.headline || "").slice(0, 400);
      const explanation = String(c.explanation || "").slice(0, 800);
      if (!ref || !headline || !explanation) return null;
      return {
        competitorId,
        signalType: ref.type,
        signalId: ref.id,
        headline,
        explanation,
        confidence: typeof c.confidence === "number" ? Math.max(0, Math.min(100, Math.round(c.confidence))) : 50,
        relatedThemes: Array.isArray(c.relatedThemes) ? c.relatedThemes.map((t) => String(t).slice(0, 200)).slice(0, 4) : [],
      };
    })
    .filter((r): r is NonNullable<typeof r> => !!r)
    .slice(0, 8);

  if (rows.length === 0) return [];
  const inserted = await db.insert(intelSignalCorrelations).values(rows).returning();
  return inserted;
}
