import { openai, OPENAI_CHAT_MODEL } from "./lib/openai";
import { generateImageBuffer } from "./replit_integrations/image";

const clamp = (n: unknown, min: number, max: number, fb: number): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return fb;
  return Math.min(max, Math.max(min, Math.round(v)));
};

const asString = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const asArr = (v: unknown, max = 20): string[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, max)
    : [];

function parseJson<T>(content: string): T {
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

async function callJson<T>(systemPrompt: string, userPrompt: string, maxTokens = 1500): Promise<T> {
  const r = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt + " Always respond with valid JSON only." },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });
  return parseJson<T>(r.choices[0]?.message?.content || "{}");
}

// ============== BRAND VOICE EXTRACTION ==============
export interface BrandVoiceExtraction {
  toneSummary: string;
  vocabulary: string[];
  doRules: string[];
  dontRules: string[];
  signatureMoves: string[];
}

export async function extractBrandVoice(samples: string[]): Promise<BrandVoiceExtraction> {
  const cleanSamples = samples
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((s) => s.slice(0, 1500));

  const prompt = `Analyze these ${cleanSamples.length} writing samples from a single creator. Extract their brand voice so future AI-written content can match it perfectly.

Samples:
${cleanSamples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join("\n\n")}

Return JSON:
{
  "toneSummary": "<2-3 sentences describing the voice>",
  "vocabulary": ["<word/phrase 1>", "<word/phrase 2>", ...],
  "doRules": ["Use short punchy sentences", ...],
  "dontRules": ["Avoid corporate jargon", ...],
  "signatureMoves": ["Opens with a contrarian question", ...]
}`;

  const raw = await callJson<any>(
    "You are a brand voice expert who studies creator tone, syntax, and lexicon.",
    prompt,
    1800
  );

  return {
    toneSummary: asString(raw?.toneSummary, 1000),
    vocabulary: asArr(raw?.vocabulary, 30),
    doRules: asArr(raw?.doRules, 12),
    dontRules: asArr(raw?.dontRules, 12),
    signatureMoves: asArr(raw?.signatureMoves, 12),
  };
}

// ============== THUMBNAIL STUDIO ==============
export interface ThumbnailIdea {
  prompt: string;
  style: string;
  ctrScore: number;
  notes: string;
}

export async function generateThumbnailIdeas(
  topic: string,
  platform: string,
  count = 3
): Promise<ThumbnailIdea[]> {
  const prompt = `Generate ${count} thumbnail concepts for a ${platform} post about: "${topic}".

Each thumbnail concept must be:
- A vivid, specific image-generation prompt for an AI image model. Include subject, composition, lighting, color palette, mood, text overlay (if any).
- Optimized for click-through rate on ${platform} (${platform === "youtube" ? "high contrast, expressive face, bold readable text" : "scroll-stopping in feed, eye contact, single focal point"}).
- Different style for each variant (mix of: bold-text overlay, photo-real subject, illustrated, before/after, expressive emotion).

Return JSON: { "thumbnails": [ { "prompt": "...", "style": "...", "ctrScore": <0-100 estimate>, "notes": "<why it works>" } ] }`;

  const raw = await callJson<any>(
    "You are a thumbnail strategist who has tested thousands of variations.",
    prompt,
    1500
  );
  const list = Array.isArray(raw?.thumbnails) ? raw.thumbnails.slice(0, count) : [];
  return list
    .map((t: any) => ({
      prompt: asString(t?.prompt, 1500),
      style: asString(t?.style, 50) || "general",
      ctrScore: clamp(t?.ctrScore, 0, 100, 60),
      notes: asString(t?.notes, 400),
    }))
    .filter((t: ThumbnailIdea) => t.prompt.length > 0);
}

export async function renderThumbnail(prompt: string): Promise<Buffer> {
  return generateImageBuffer(prompt, "1024x1024");
}
