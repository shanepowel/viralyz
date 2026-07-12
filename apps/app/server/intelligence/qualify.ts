/**
 * Buyer-shaped engager qualification. Cheap deterministic regex first, then
 * one optional OpenAI batch for ambiguous titles. Cached on engager name in
 * a process-local Map to avoid re-classification across digest cycles.
 */
import { openai, isOpenAIConfigured } from "../lib/openai";

export type Engager = { name: string; title?: string; company?: string };
export type QualifiedEngager = Engager & { qualified: boolean };

const QUALIFIED_TITLE_RX =
  /\b(vp|vice president|head of|director|svp|chief|c[a-z]o)\b.*\b(marketing|sales|growth|revenue|demand|product|engineering|operations|customer)|founder|co-?founder|principal|owner/i;

const cache = new Map<string, boolean>();

function deterministicQualify(e: Engager): boolean | null {
  if (!e.title || e.title.trim().length < 3) return false;
  if (QUALIFIED_TITLE_RX.test(e.title)) return true;
  // Common non-buyer titles -> definitive no, skip the LLM.
  if (/student|intern|junior|assistant|coordinator|recruiter/i.test(e.title)) return false;
  return null;
}

export async function qualifyEngagers(engagers: Engager[]): Promise<QualifiedEngager[]> {
  const out: QualifiedEngager[] = [];
  const ambiguous: Engager[] = [];
  for (const e of engagers) {
    const key = `${e.name}::${e.title || ""}`;
    const cached = cache.get(key);
    if (cached !== undefined) {
      out.push({ ...e, qualified: cached });
      continue;
    }
    const det = deterministicQualify(e);
    if (det !== null) {
      cache.set(key, det);
      out.push({ ...e, qualified: det });
    } else {
      ambiguous.push(e);
    }
  }
  if (ambiguous.length === 0 || !isOpenAIConfigured()) {
    for (const e of ambiguous) {
      cache.set(`${e.name}::${e.title || ""}`, false);
      out.push({ ...e, qualified: false });
    }
    return out;
  }
  // One batched LLM call for the ambiguous tail.
  try {
    const list = ambiguous.map((e, i) => `${i + 1}. ${e.name} - ${e.title || "(no title)"}${e.company ? ` @ ${e.company}` : ""}`).join("\n");
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You classify whether a person looks like a B2B buyer/decision-maker (VP, Director, Head of, Founder, etc. in marketing, sales, product, growth, revenue, demand gen, eng leadership) versus a non-buyer (IC, student, recruiter, etc.). Respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Classify each. Return JSON: {"results":[{"index":1,"qualified":true|false}, ...]}.\n\n${list}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });
    const raw = resp.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as { results?: Array<{ index: number; qualified: boolean }> };
    const map = new Map<number, boolean>();
    for (const r of parsed.results || []) map.set(r.index, !!r.qualified);
    ambiguous.forEach((e, i) => {
      const q = map.get(i + 1) ?? false;
      cache.set(`${e.name}::${e.title || ""}`, q);
      out.push({ ...e, qualified: q });
    });
  } catch {
    for (const e of ambiguous) {
      cache.set(`${e.name}::${e.title || ""}`, false);
      out.push({ ...e, qualified: false });
    }
  }
  return out;
}
