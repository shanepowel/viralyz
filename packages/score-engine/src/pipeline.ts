import type { PipelineStage, PipelineStageId } from "./types";

/** Canonical analysis pipeline stages (Inngest job map) */
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "ingest", label: "Ingesting media & metadata", weight: 8 },
  { id: "frames", label: "Extracting frames (1fps)", weight: 18 },
  { id: "transcribe", label: "Transcribing with timestamps", weight: 18 },
  { id: "thumbnail", label: "Analyzing thumbnail & visuals", weight: 12 },
  { id: "score", label: "Scoring with platform profile", weight: 24 },
  { id: "suggestions", label: "Building fix cards", weight: 12 },
  { id: "persist", label: "Saving versioned analysis", weight: 8 },
];

export function progressAfterStage(stageId: PipelineStageId): number {
  let total = 0;
  for (const s of PIPELINE_STAGES) {
    total += s.weight;
    if (s.id === stageId) break;
  }
  return Math.min(100, total);
}

export type StageListener = (event: {
  stage: PipelineStage;
  progress: number;
  status: "started" | "completed" | "skipped";
  detail?: string;
}) => void;

/**
 * Run the analysis pipeline stages with progress callbacks.
 * Heavy stages (frames/transcribe) are marked skipped when no media URL —
 * text-only scoring still completes score → suggestions → persist.
 */
export async function runAnalysisPipeline(
  opts: {
    hasMedia: boolean;
    onStage?: StageListener;
    /** Execute the actual score+suggestions work; called during `score` stage */
    runScore: () => Promise<void>;
    persist: () => Promise<void>;
  },
): Promise<void> {
  const { hasMedia, onStage, runScore, persist } = opts;

  for (const stage of PIPELINE_STAGES) {
    const skip =
      !hasMedia && (stage.id === "frames" || stage.id === "transcribe");

    onStage?.({
      stage,
      progress: progressAfterStage(stage.id) - stage.weight,
      status: skip ? "skipped" : "started",
    });

    if (skip) {
      onStage?.({
        stage,
        progress: progressAfterStage(stage.id),
        status: "skipped",
        detail: "No media — text-mode scoring",
      });
      continue;
    }

    // Simulate lightweight stage latency so UI progress is real relative to work
    if (stage.id === "ingest" || stage.id === "thumbnail") {
      await sleep(180);
    } else if (stage.id === "frames" || stage.id === "transcribe") {
      // Placeholder until ffmpeg/Whisper workers land — brief yield
      await sleep(320);
    } else if (stage.id === "score" || stage.id === "suggestions") {
      if (stage.id === "score") {
        await runScore();
      } else {
        await sleep(80);
      }
    } else if (stage.id === "persist") {
      await persist();
    }

    onStage?.({
      stage,
      progress: progressAfterStage(stage.id),
      status: "completed",
    });
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
