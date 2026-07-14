/**
 * Analysis job store — tracks async pipeline progress for polling/SSE.
 * Used when Inngest cloud is unavailable; Inngest steps update the same shape.
 */
import { randomUUID } from "node:crypto";
import type { AnalysisResultV2, ScoreDiff } from "@repo/score-engine";
import type { PipelineStageId } from "@repo/score-engine";

export type AnalysisJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface AnalysisJobStageEvent {
  stageId: PipelineStageId | string;
  label: string;
  progress: number;
  status: "started" | "completed" | "skipped";
  detail?: string;
  at: string;
}

export interface AnalysisJobRecord {
  id: string;
  userId: string;
  status: AnalysisJobStatus;
  progress: number;
  stages: AnalysisJobStageEvent[];
  error?: string;
  result?: AnalysisResultV2 & { id: string; diff?: ScoreDiff };
  createdAt: string;
  updatedAt: string;
  input: {
    title: string;
    description: string;
    platform: string;
    contentType: string;
    fileUrl?: string | null;
    analysisId?: string | null;
    appliedFixIndexes?: number[];
    mode: "analyze" | "reanalyze";
  };
}

const jobs = new Map<string, AnalysisJobRecord>();

export function createAnalysisJob(
  userId: string,
  input: AnalysisJobRecord["input"],
): AnalysisJobRecord {
  const now = new Date().toISOString();
  const job: AnalysisJobRecord = {
    id: randomUUID(),
    userId,
    status: "queued",
    progress: 0,
    stages: [],
    createdAt: now,
    updatedAt: now,
    input,
  };
  jobs.set(job.id, job);
  return job;
}

export function getAnalysisJob(id: string): AnalysisJobRecord | undefined {
  return jobs.get(id);
}

export function updateAnalysisJob(
  id: string,
  patch: Partial<
    Pick<AnalysisJobRecord, "status" | "progress" | "error" | "result">
  > & { stage?: AnalysisJobStageEvent },
): AnalysisJobRecord | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  if (patch.status) job.status = patch.status;
  if (typeof patch.progress === "number") job.progress = patch.progress;
  if (patch.error !== undefined) job.error = patch.error;
  if (patch.result) job.result = patch.result;
  if (patch.stage) job.stages.push(patch.stage);
  job.updatedAt = new Date().toISOString();
  return job;
}

/** Soft TTL cleanup — drop jobs older than 2h */
export function pruneAnalysisJobs() {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, job] of Array.from(jobs.entries())) {
    if (new Date(job.createdAt).getTime() < cutoff) jobs.delete(id);
  }
}
