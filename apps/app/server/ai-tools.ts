import { openai, OPENAI_CHAT_MODEL } from "./lib/openai";

const clamp = (n: unknown, min: number, max: number, fallback: number): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
};

const asStringArray = (v: unknown, max: number = 30): string[] => {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, max);
};

const asString = (v: unknown, max: number = 2000): string => {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
};

function parseJson<T>(content: string): T {
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

async function callJson<T>(systemPrompt: string, userPrompt: string, maxTokens = 1500): Promise<T> {
  const response = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt + " Always respond with valid JSON only, no markdown." },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content || "{}";
  return parseJson<T>(content);
}

// Brand voice context shape (subset of BrandVoiceProfile from schema)
export interface BrandVoiceContext {
  name?: string | null;
  toneSummary?: string | null;
  vocabulary?: string[] | null;
  doRules?: string[] | null;
  dontRules?: string[] | null;
  signatureMoves?: string[] | null;
}

function brandVoiceBlock(bv?: BrandVoiceContext | null): string {
  if (!bv) return "";
  const parts: string[] = [];
  if (bv.toneSummary) parts.push(`Tone: ${bv.toneSummary}`);
  if (bv.vocabulary?.length) parts.push(`Signature vocabulary: ${bv.vocabulary.slice(0, 20).join(", ")}`);
  if (bv.signatureMoves?.length) parts.push(`Signature moves: ${bv.signatureMoves.slice(0, 10).join("; ")}`);
  if (bv.doRules?.length) parts.push(`DO: ${bv.doRules.slice(0, 10).join("; ")}`);
  if (bv.dontRules?.length) parts.push(`DON'T: ${bv.dontRules.slice(0, 10).join("; ")}`);
  if (!parts.length) return "";
  return `\n\nBRAND VOICE — write in this creator's exact voice (named "${bv.name || "creator"}"):\n${parts.join("\n")}\n`;
}

// ============== HOOK LAB ==============
export interface HookVariant {
  text: string;
  style: string;
  score: number;
  reasoning: string;
}

export interface HookGenerationResult {
  hooks: HookVariant[];
  bestHookIndex: number;
  bestHookExplanation: string;
}

export async function generateHooks(
  topic: string,
  platform: string,
  audience: string,
  brandVoice?: BrandVoiceContext | null
): Promise<HookGenerationResult> {
  const prompt = `Generate 10 attention-grabbing hooks (the first 1-2 lines that stop the scroll) for a ${platform} post about: "${topic}".
Target audience: ${audience || "general creators"}.${brandVoiceBlock(brandVoice)}

Each hook should use a different psychological trigger or style (curiosity gap, contrarian take, bold claim, question, story start, statistic, listicle teaser, "before this/now", challenge, secret reveal).

Score each from 1-100 on viral potential.${brandVoiceBlock(brandVoice)}

Return JSON:
{
  "hooks": [
    {"text": "<the hook line>", "style": "<curiosity gap | contrarian | bold claim | question | story | stat | listicle | transformation | challenge | secret>", "score": <1-100>, "reasoning": "<why this works>"}
  ],
  "bestHookIndex": <0-9>,
  "bestHookExplanation": "<why this hook beats the others>"
}`;

  const raw = await callJson<any>(
    "You are a viral content strategist who has studied millions of high-performing posts.",
    prompt,
    2500
  );

  const rawHooks = Array.isArray(raw?.hooks) ? raw.hooks.slice(0, 10) : [];
  const hooks: HookVariant[] = rawHooks.map((h: any) => ({
    text: asString(h?.text, 500),
    style: asString(h?.style, 50) || "general",
    score: clamp(h?.score, 0, 100, 50),
    reasoning: asString(h?.reasoning, 500),
  })).filter((h: HookVariant) => h.text.length > 0);

  const bestHookIndex = clamp(raw?.bestHookIndex, 0, Math.max(0, hooks.length - 1), 0);
  return {
    hooks,
    bestHookIndex,
    bestHookExplanation: asString(raw?.bestHookExplanation, 500),
  };
}

// ============== CAPTION STUDIO ==============
export interface CaptionRewriteResult {
  rewrittenCaption: string;
  hashtags: string[];
  viralScore: number;
  improvements: string[];
  variants: Array<{ tone: string; caption: string }>;
}

export async function rewriteCaption(
  original: string,
  platform: string,
  brandVoice?: BrandVoiceContext | null
): Promise<CaptionRewriteResult> {
  const prompt = `Rewrite this caption to maximize viral potential on ${platform}:

Original: "${original}"

Apply: scroll-stopping first line, emotional resonance, clear CTA, optimal length for ${platform}, native voice. Add 8-15 strategic hashtags (mix of broad and niche).${brandVoiceBlock(brandVoice)}

Also generate 3 alternate-tone variants.${brandVoiceBlock(brandVoice)}

Return JSON:
{
  "rewrittenCaption": "<the improved caption>",
  "hashtags": ["#tag1", "#tag2", ...],
  "viralScore": <0-100 score for the rewrite>,
  "improvements": ["<what was changed and why 1>", "..."],
  "variants": [
    {"tone": "punchy", "caption": "..."},
    {"tone": "story-driven", "caption": "..."},
    {"tone": "controversial", "caption": "..."}
  ]
}`;

  const raw = await callJson<any>(
    "You are a caption-writing expert who has written for accounts with millions of followers.",
    prompt,
    2000
  );

  const rawVariants = Array.isArray(raw?.variants) ? raw.variants.slice(0, 5) : [];
  const variants = rawVariants
    .map((v: any) => ({ tone: asString(v?.tone, 50), caption: asString(v?.caption, 2000) }))
    .filter((v: any) => v.caption.length > 0);

  return {
    rewrittenCaption: asString(raw?.rewrittenCaption, 3000),
    hashtags: asStringArray(raw?.hashtags, 20),
    viralScore: clamp(raw?.viralScore, 0, 100, 50),
    improvements: asStringArray(raw?.improvements, 10),
    variants,
  };
}

// ============== CROSS-PLATFORM REPURPOSER ==============
export interface RepurposeVariantAI {
  platform: string;
  text: string;
  hashtags: string[];
  platformNote: string;
}

const PLATFORM_GUIDE: Record<string, string> = {
  tiktok: "TikTok caption: 80-300 chars, conversational, hook in first 8 words, 3-6 hashtags, trending sound friendly.",
  reels: "Instagram Reels caption: 80-300 chars, sensory + emotional opener, 3-8 hashtags, single CTA.",
  shorts: "YouTube Shorts caption: 80-300 chars, curiosity hook, 3-6 hashtags, frames the click-through.",
  instagram: "Instagram feed caption: 200-1200 chars, story-led, line breaks for scannability, 5-15 hashtags at end.",
  twitter: "X / Twitter post: under 240 chars, punchy single-claim hook, 0-2 hashtags max, no fluff.",
  x: "X / Twitter post: under 240 chars, punchy single-claim hook, 0-2 hashtags max, no fluff.",
  threads: "Threads post: 150-400 chars, conversational, opinion-led, 0-3 hashtags.",
  linkedin: "LinkedIn post: 600-1500 chars, professional voice, story → insight → CTA, line breaks every 1-2 sentences, 2-5 hashtags.",
  youtube: "YouTube long-form description: 200-1500 chars, SEO-rich first line, structured paragraphs, 3-8 hashtags.",
};

export async function repurposeForPlatforms(
  sourceText: string,
  platforms: string[],
  brandVoice?: BrandVoiceContext | null
): Promise<RepurposeVariantAI[]> {
  const platformList = platforms
    .map((p) => `- ${p}: ${PLATFORM_GUIDE[p.toLowerCase()] ?? "Native to that platform's voice."}`)
    .join("\n");

  const prompt = `Repurpose the following source post into ONE platform-native variant per target platform listed.

SOURCE POST:
"""
${sourceText.slice(0, 4000)}
"""

TARGET PLATFORMS:
${platformList}

For EACH platform, produce a fully rewritten variant that:
- Honours the platform's length, tone, and hashtag conventions described above.
- Keeps the core idea but reshapes hook, structure, and CTA for that platform's audience.
- Includes a short "platformNote" (max 1 sentence) explaining the single biggest tweak you made for that platform.${brandVoiceBlock(brandVoice)}

Return JSON:
{
  "variants": [
    {
      "platform": "<platform>",
      "text": "<rewritten caption / post body>",
      "hashtags": ["#tag", ...],
      "platformNote": "<one sentence on what you changed for this platform>"
    }
  ]
}`;

  const raw = await callJson<any>(
    "You are a cross-platform content strategist who has rewritten thousands of viral posts across TikTok, Reels, Shorts, X, LinkedIn, Threads, Instagram, and YouTube.",
    prompt,
    3500
  );

  const ALIASES: Record<string, string> = {
    "x": "twitter", "x / twitter": "twitter", "x/twitter": "twitter", "twitter/x": "twitter",
    "ig": "instagram", "insta": "instagram", "instagram reels": "reels",
    "ig reels": "reels", "yt": "youtube", "yt shorts": "shorts",
    "youtube shorts": "shorts", "tt": "tiktok", "li": "linkedin",
  };
  const normalize = (raw: string): string => {
    const k = raw.trim().toLowerCase();
    return ALIASES[k] ?? k;
  };

  const list = Array.isArray(raw?.variants) ? raw.variants : [];
  const allowed = new Set(platforms.map((p) => p.toLowerCase()));
  return list
    .map((v: any): RepurposeVariantAI => ({
      platform: normalize(asString(v?.platform, 40)),
      text: asString(v?.text, 5000),
      hashtags: asStringArray(v?.hashtags, 20).map((h) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`)),
      platformNote: asString(v?.platformNote, 300),
    }))
    .filter((v: RepurposeVariantAI) => v.text.length > 0 && allowed.has(v.platform));
}

// ============== TREND RADAR ==============
export interface TrendTopicAI {
  topic: string;
  category: string;
  hashtags: string[];
  description: string;
  momentum: number;
  estimatedReach: string;
  bestFormat: string;
}

export async function generateTrends(
  platform: string,
  niche: string
): Promise<TrendTopicAI[]> {
  const prompt = `Generate 8 currently-relevant trending content angles for ${niche} creators on ${platform}.

These should reflect what is plausibly trending right now (formats, narratives, angles, debates, evergreen-but-hot topics) — be specific, concrete, and immediately actionable. Avoid generic advice.

For each:
- topic: a specific content angle/topic (not just a keyword)
- category: one of "format", "topic", "challenge", "narrative", "audio", "debate"
- hashtags: 4-8 relevant hashtags
- description: 1-2 sentences explaining why this is hot right now
- momentum: 1-100 how fast it's growing
- estimatedReach: text like "100K-500K" or "1M+"
- bestFormat: short suggested format (e.g. "30s reaction reel", "carousel of 7 slides")

Return JSON: { "trends": [ ... ] }`;

  const raw = await callJson<any>(
    "You are a real-time trends analyst tracking viral content patterns across platforms.",
    prompt,
    2500
  );
  const list = Array.isArray(raw?.trends) ? raw.trends.slice(0, 12) : [];
  return list
    .map((t: any) => ({
      topic: asString(t?.topic, 300),
      category: asString(t?.category, 30) || "topic",
      hashtags: asStringArray(t?.hashtags, 10),
      description: asString(t?.description, 500),
      momentum: clamp(t?.momentum, 0, 100, 50),
      estimatedReach: asString(t?.estimatedReach, 50),
      bestFormat: asString(t?.bestFormat, 200),
    }))
    .filter((t: TrendTopicAI) => t.topic.length > 0);
}

// ============== IDEA GENERATOR ==============
export interface IdeaResult {
  title: string;
  hook: string;
  outline: string[];
  predictedScore: number;
  difficulty: string;
}

export async function generateIdeas(
  niche: string,
  platform: string,
  pastTopics: string,
  count: number = 8,
  brandVoice?: BrandVoiceContext | null
): Promise<IdeaResult[]> {
  const prompt = `Generate ${count} fresh content ideas for a ${niche} creator on ${platform}.
${pastTopics ? `Their recent posts have covered: ${pastTopics}. Avoid duplication.` : ""}

For each idea provide:
- title: the working title
- hook: a strong opening line (1-2 sentences)
- outline: 4-6 bullet points covering structure (each a short string)
- predictedScore: predicted viral score 0-100
- difficulty: "easy" | "medium" | "hard"

Mix easy quick-wins with ambitious flagship ideas. Be specific and platform-native.${brandVoiceBlock(brandVoice)}

Return JSON: { "ideas": [ ... ] }`;

  const raw = await callJson<any>(
    "You are a creative director who has shipped thousands of viral content ideas.",
    prompt,
    3000
  );
  const list = Array.isArray(raw?.ideas) ? raw.ideas.slice(0, 12) : [];
  const allowedDifficulty = new Set(["easy", "medium", "hard"]);
  return list
    .map((i: any) => {
      const diff = asString(i?.difficulty, 20).toLowerCase();
      return {
        title: asString(i?.title, 300),
        hook: asString(i?.hook, 500),
        outline: asStringArray(i?.outline, 10),
        predictedScore: clamp(i?.predictedScore, 0, 100, 50),
        difficulty: allowedDifficulty.has(diff) ? diff : "medium",
      };
    })
    .filter((i: IdeaResult) => i.title.length > 0);
}
