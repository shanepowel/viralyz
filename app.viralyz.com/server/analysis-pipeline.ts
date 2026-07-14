import {
  resolveScoringProfile,
  predictRetentionCurve,
  normalizeFixes,
  estimateConfidence,
  runAnalysisPipeline,
  type AnalysisResultV2,
  type StageListener,
  type FixSuggestion,
} from "@repo/score-engine";
import OpenAI from "openai";
import {
  cleanupDir,
  cleanupFile,
  extractAudioWav,
  extractFrames,
  probeMedia,
  writeTempMedia,
  type ExtractedFrame,
} from "./lib/media/ffmpeg";
import { transcribeAudio, type TranscriptResult } from "./lib/media/transcribe";
import { loadMediaBuffer } from "./lib/media/resolve";

const openai = new OpenAI({
  apiKey:
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL:
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    undefined,
});

export interface MediaContext {
  fileUrl?: string | null;
  durationSeconds?: number | null;
  frames: ExtractedFrame[];
  transcript: TranscriptResult | null;
  thumbnailDataUrl?: string | null;
  probeNotes?: string;
}

function buildPrompt(opts: {
  title: string;
  description: string;
  platform: string;
  contentType: string;
  profileFocus: string;
  profileVersion: string;
  hookWindowSeconds: number;
  media: MediaContext;
}): string {
  const transcriptBlock = opts.media.transcript?.text
    ? `\nTranscript (Whisper):\n"""${opts.media.transcript.text.slice(0, 6000)}"""\n`
    : "";

  const segmentHints =
    opts.media.transcript?.segments?.length
      ? `\nTimed segments (first 12):\n${opts.media.transcript.segments
          .slice(0, 12)
          .map(
            (s) =>
              `- ${s.start.toFixed(1)}s–${s.end.toFixed(1)}s: ${s.text.trim()}`,
          )
          .join("\n")}\n`
      : "";

  const frameBlock =
    opts.media.frames.length > 0
      ? `\n${opts.media.frames.length} video frames were extracted at ~1fps (first/mid/last described to you via vision). Use them for visual + pacing judgment.\n`
      : "";

  const durationLine =
    opts.media.durationSeconds != null
      ? `- Duration: ${opts.media.durationSeconds.toFixed(1)}s\n`
      : "";

  return `You are an expert content analyst for social media. Analyze the following content and provide a detailed viral score breakdown.

Scoring profile: ${opts.profileVersion}
Platform focus: ${opts.profileFocus}
Critical hook window: first ${opts.hookWindowSeconds} second(s).

Content Details:
- Title: ${opts.title}
- Description / script: ${opts.description}
- Platform: ${opts.platform}
- Content Type: ${opts.contentType}
${durationLine}${opts.media.probeNotes ? `- Media notes: ${opts.media.probeNotes}\n` : ""}${transcriptBlock}${segmentHints}${frameBlock}

Analyze this content and provide scores out of 20 for each category. Be specific and actionable in your suggestions.

Respond in this exact JSON format:
{
  "viralScore": <total score out of 100>,
  "hookScore": <score out of 20>,
  "hookAnalysis": "<detailed analysis>",
  "hookSuggestions": ["<s1>", "<s2>", "<s3>"],
  "visualScore": <score out of 20>,
  "visualAnalysis": "<detailed analysis>",
  "visualSuggestions": ["<s1>", "<s2>", "<s3>"],
  "structureScore": <score out of 20>,
  "structureAnalysis": "<detailed analysis>",
  "structureSuggestions": ["<s1>", "<s2>", "<s3>"],
  "metadataScore": <score out of 20>,
  "metadataAnalysis": "<detailed analysis>",
  "metadataSuggestions": ["<s1>", "<s2>", "<s3>"],
  "timingScore": <score out of 20>,
  "timingAnalysis": "<analysis>",
  "optimalPostingTime": "<e.g. Tuesday 6PM EST>",
  "top3Fixes": [
    {"component": "hook|visual|structure|metadata|timing", "issue": "<issue>", "fix": "<actionable fix>", "predictedImpact": <points>},
    {"component": "hook|visual|structure|metadata|timing", "issue": "<issue>", "fix": "<actionable fix>", "predictedImpact": <points>},
    {"component": "hook|visual|structure|metadata|timing", "issue": "<issue>", "fix": "<actionable fix>", "predictedImpact": <points>}
  ],
  "predictedScoreAfterFixes": <projected score>
}

Be honest but constructive. Most content scores 40–70. Always include "component" on each top3Fixes item.`;
}

async function describeFramesForPrompt(
  frames: ExtractedFrame[],
): Promise<string> {
  if (!frames.length) return "";
  // Sample first, mid, last for vision to keep cost/latency sane
  const picks = [
    frames[0],
    frames[Math.floor(frames.length / 2)],
    frames[frames.length - 1],
  ].filter(Boolean) as ExtractedFrame[];

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe each frame briefly for viral short-form scoring: subject, text overlays, emotion, clutter, and motion implication. One sentence per frame.",
            },
            ...picks.map((f) => ({
              type: "image_url" as const,
              image_url: { url: f.dataUrl, detail: "low" as const },
            })),
          ],
        },
      ],
    });
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.warn("[vision] frame describe failed:", err);
    return `${picks.length} frames available at ${picks.map((f) => `${f.atSeconds.toFixed(1)}s`).join(", ")}`;
  }
}

function clampResult(
  raw: Partial<AnalysisResultV2>,
  profileVersion: string,
  confidence: number,
  title: string,
  description: string,
  platform: string,
  durationSeconds?: number | null,
): AnalysisResultV2 {
  const top3Fixes = normalizeFixes(raw.top3Fixes ?? []);
  const hookScore = Math.min(20, Math.max(0, Number(raw.hookScore) || 0));
  const visualScore = Math.min(20, Math.max(0, Number(raw.visualScore) || 0));
  const structureScore = Math.min(
    20,
    Math.max(0, Number(raw.structureScore) || 0),
  );
  const metadataScore = Math.min(20, Math.max(0, Number(raw.metadataScore) || 0));
  const timingScore = Math.min(20, Math.max(0, Number(raw.timingScore) || 0));
  const viralScore = Math.min(100, Math.max(0, Number(raw.viralScore) || 0));

  const retentionCurve = predictRetentionCurve({
    platform,
    title,
    description,
    hookScore,
    visualScore,
    structureScore,
    durationSeconds,
  });

  return {
    viralScore,
    hookScore,
    hookAnalysis: raw.hookAnalysis || "",
    hookSuggestions: raw.hookSuggestions || [],
    visualScore,
    visualAnalysis: raw.visualAnalysis || "",
    visualSuggestions: raw.visualSuggestions || [],
    structureScore,
    structureAnalysis: raw.structureAnalysis || "",
    structureSuggestions: raw.structureSuggestions || [],
    metadataScore,
    metadataAnalysis: raw.metadataAnalysis || "",
    metadataSuggestions: raw.metadataSuggestions || [],
    timingScore,
    timingAnalysis: raw.timingAnalysis || "",
    optimalPostingTime: raw.optimalPostingTime || "Tuesday 6PM",
    top3Fixes,
    predictedScoreAfterFixes: Math.min(
      100,
      Math.max(viralScore, Number(raw.predictedScoreAfterFixes) || viralScore),
    ),
    confidence,
    scoringProfileVersion: profileVersion,
    retentionCurve,
  };
}

export async function scoreWithMedia(input: {
  title: string;
  description: string;
  platform: string;
  contentType: string;
  media: MediaContext;
  historyCount?: number;
}): Promise<AnalysisResultV2> {
  const profile = resolveScoringProfile(input.platform, input.contentType);
  const hasMedia = !!(input.media.fileUrl || input.media.frames.length);
  const confidence = estimateConfidence({
    historyCount: input.historyCount ?? 0,
    hasMedia,
    descriptionLength: (input.description || "").length + (input.media.transcript?.text.length ?? 0),
  });

  let frameNotes = "";
  if (input.media.frames.length) {
    frameNotes = await describeFramesForPrompt(input.media.frames);
  }

  const descriptionWithVision = frameNotes
    ? `${input.description}\n\n[Frame vision notes]\n${frameNotes}`
    : input.description;

  const prompt = buildPrompt({
    title: input.title || "Untitled",
    description: descriptionWithVision || "No description provided",
    platform: input.platform || "general",
    contentType: input.contentType || "video",
    profileFocus: profile.focus,
    profileVersion: profile.version,
    hookWindowSeconds: profile.hookWindowSeconds,
    media: input.media,
  });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a viral content expert. Always respond with valid JSON only, no markdown or extra text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(clean) as Partial<AnalysisResultV2>;

  return clampResult(
    parsed,
    profile.version,
    confidence,
    input.title || "Untitled",
    input.description || "",
    input.platform || "youtube",
    input.media.durationSeconds ?? input.media.transcript?.durationSeconds,
  );
}

/**
 * Full media-aware pipeline: ingest → frames → whisper → thumbnail → score → persist hooks.
 */
export async function runMediaAnalysisPipeline(input: {
  title: string;
  description: string;
  platform: string;
  contentType: string;
  fileUrl?: string | null;
  historyCount?: number;
  onStage?: StageListener;
  persist: (result: AnalysisResultV2, media: MediaContext) => Promise<void>;
}): Promise<{ result: AnalysisResultV2; media: MediaContext }> {
  const media: MediaContext = {
    fileUrl: input.fileUrl,
    frames: [],
    transcript: null,
    durationSeconds: null,
    thumbnailDataUrl: null,
  };

  let tempPath: string | null = null;
  let framesDir: string | null = null;
  let result!: AnalysisResultV2;

  const hasMedia = !!input.fileUrl;

  try {
    await runAnalysisPipeline({
      hasMedia,
      onStage: input.onStage,
      workers: {
        ingest: async () => {
          if (!input.fileUrl) return;
          const { buffer, ext } = await loadMediaBuffer(input.fileUrl);
          tempPath = await writeTempMedia(buffer, ext);
          const probe = await probeMedia(tempPath);
          media.durationSeconds = probe.durationSeconds;
          media.probeNotes = [
            probe.format && `format=${probe.format}`,
            probe.width && probe.height && `${probe.width}x${probe.height}`,
            probe.hasAudio ? "audio=yes" : "audio=no",
          ]
            .filter(Boolean)
            .join(", ");
        },
        frames: async () => {
          if (!tempPath) return;
          const { frames, workDir } = await extractFrames(tempPath, {
            fps: 1,
            maxFrames: 20,
          });
          framesDir = workDir;
          media.frames = frames;
          if (frames[0]) media.thumbnailDataUrl = frames[0].dataUrl;
        },
        transcribe: async () => {
          if (!tempPath) return;
          const wav = await extractAudioWav(tempPath);
          media.transcript = await transcribeAudio(wav);
          if (
            media.durationSeconds == null &&
            media.transcript.durationSeconds != null
          ) {
            media.durationSeconds = media.transcript.durationSeconds;
          }
        },
        thumbnail: async () => {
          // Thumbnail already taken from first frame; nothing extra required
          if (!media.thumbnailDataUrl && media.frames[0]) {
            media.thumbnailDataUrl = media.frames[0].dataUrl;
          }
        },
        runScore: async () => {
          // Merge transcript into description context for scoring
          const desc = media.transcript?.text
            ? `${input.description}\n\n[Transcript]\n${media.transcript.text}`
            : input.description;
          result = await scoreWithMedia({
            title: input.title,
            description: desc,
            platform: input.platform,
            contentType: input.contentType,
            media,
            historyCount: input.historyCount,
          });
        },
        suggestions: async () => {
          // Fixes already produced in score step
        },
        persist: async () => {
          await input.persist(result, media);
        },
      },
    });
  } finally {
    await cleanupFile(tempPath);
    await cleanupDir(framesDir);
  }

  return { result, media };
}

export type { FixSuggestion, AnalysisResultV2, StageListener };
