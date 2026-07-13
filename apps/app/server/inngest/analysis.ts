/**
 * Inngest function map for the Score Engine pipeline.
 *
 * Today analysis runs in-process via `analyzeWithPipeline` (SSE stages).
 * When INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY are set, mount these handlers
 * at POST /api/inngest and emit `viralyz/analysis.requested` from /api/analyze.
 *
 * Job graph (matches packages/score-engine PIPELINE_STAGES):
 *   ingest → parallel(frames, transcribe, thumbnail) → score → suggestions → persist
 */
import { PIPELINE_STAGES } from "@repo/score-engine";

export const ANALYSIS_EVENT = "viralyz/analysis.requested" as const;

export function getInngestAnalysisJobs() {
  return PIPELINE_STAGES.map((s) => ({
    id: `analysis/${s.id}`,
    name: s.label,
    weight: s.weight,
  }));
}

export function isInngestConfigured() {
  return Boolean(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY);
}
