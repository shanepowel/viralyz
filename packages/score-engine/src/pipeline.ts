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

export type PipelineWorkers = {
  ingest?: () => Promise<void>;
  frames?: () => Promise<void>;
  transcribe?: () => Promise<void>;
  thumbnail?: () => Promise<void>;
  runScore: () => Promise<void>;
  suggestions?: () => Promise<void>;
  persist: () => Promise<void>;
};

/**
 * Run the analysis pipeline stages with real worker callbacks.
 * Stages without media skip frames/transcribe when hasMedia is false.
 */
export async function runAnalysisPipeline(
  opts: {
    hasMedia: boolean;
    onStage?: StageListener;
    workers: PipelineWorkers;
  },
): Promise<void> {
  const { hasMedia, onStage, workers } = opts;

  for (const stage of PIPELINE_STAGES) {
    const skip =
      !hasMedia &&
      (stage.id === "frames" ||
        stage.id === "transcribe" ||
        stage.id === "thumbnail");

    onStage?.({
      stage,
      progress: Math.max(0, progressAfterStage(stage.id) - stage.weight),
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

    try {
      switch (stage.id) {
        case "ingest":
          await workers.ingest?.();
          break;
        case "frames":
          await workers.frames?.();
          break;
        case "transcribe":
          await workers.transcribe?.();
          break;
        case "thumbnail":
          await workers.thumbnail?.();
          break;
        case "score":
          await workers.runScore();
          break;
        case "suggestions":
          await workers.suggestions?.();
          break;
        case "persist":
          await workers.persist();
          break;
        default: {
          const _exhaustive: never = stage.id;
          void _exhaustive;
        }
      }
    } catch (err) {
      // Soft-fail media stages so text scoring still completes
      if (
        stage.id === "frames" ||
        stage.id === "transcribe" ||
        stage.id === "thumbnail"
      ) {
        console.warn(`[pipeline] ${stage.id} failed, continuing:`, err);
        onStage?.({
          stage,
          progress: progressAfterStage(stage.id),
          status: "skipped",
          detail: err instanceof Error ? err.message : "stage failed",
        });
        continue;
      }
      throw err;
    }

    onStage?.({
      stage,
      progress: progressAfterStage(stage.id),
      status: "completed",
    });
  }
}
