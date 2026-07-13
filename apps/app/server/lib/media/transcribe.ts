import OpenAI, { toFile } from "openai";
import { openai as sharedOpenAI } from "../openai";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  language?: string;
  /** Word/segment level when available */
  segments: TranscriptSegment[];
  durationSeconds: number | null;
}

function getClient(): OpenAI {
  // Prefer shared resolver (OPENAI_API_KEY || AI_INTEGRATIONS_*)
  return sharedOpenAI;
}

/**
 * Transcribe audio/video-derived WAV with OpenAI Whisper (verbose JSON for timestamps).
 */
export async function transcribeAudio(
  wavBuffer: Buffer,
  filename = "audio.wav",
): Promise<TranscriptResult> {
  const client = getClient();
  const file = await toFile(wavBuffer, filename);

  // Prefer whisper-1 for verbose timestamps; fall back to gpt-4o-mini-transcribe
  try {
    const response = await client.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const raw = response as unknown as {
      text?: string;
      language?: string;
      duration?: number;
      segments?: Array<{ start: number; end: number; text: string }>;
    };

    return {
      text: raw.text || "",
      language: raw.language,
      durationSeconds: raw.duration ?? null,
      segments: (raw.segments || []).map((s) => ({
        start: s.start,
        end: s.end,
        text: s.text,
      })),
    };
  } catch (err) {
    console.warn(
      "[transcribe] whisper-1 failed, falling back to gpt-4o-mini-transcribe:",
      err,
    );
    const response = await client.audio.transcriptions.create({
      file: await toFile(wavBuffer, filename),
      model: "gpt-4o-mini-transcribe",
    });
    return {
      text: response.text || "",
      segments: [],
      durationSeconds: null,
    };
  }
}
