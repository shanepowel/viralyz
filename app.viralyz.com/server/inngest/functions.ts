import { inngest, ANALYSIS_EVENT } from "./client";
import {
  createAnalysisJob,
  updateAnalysisJob,
} from "../analysis-jobs";
import {
  analyzeWithPipeline,
  saveAnalysis,
  reanalyzeContent,
  countAnalysesForUser,
} from "../analysis";

export { ANALYSIS_EVENT } from "./client";

/**
 * Inngest function: full analysis pipeline with step.run boundaries.
 * Event data: { jobId, userId, title, description, platform, contentType, fileUrl, mode, analysisId?, appliedFixIndexes? }
 */
export const runAnalysisFunction = inngest.createFunction(
  {
    id: "viralyz-analysis-run",
    name: "Viralyz Score Engine",
    retries: 2,
  },
  { event: ANALYSIS_EVENT },
  async ({ event, step }) => {
    const data = event.data as {
      jobId: string;
      userId: string;
      title: string;
      description: string;
      platform: string;
      contentType: string;
      fileUrl?: string | null;
      mode: "analyze" | "reanalyze";
      analysisId?: string | null;
      appliedFixIndexes?: number[];
    };

    updateAnalysisJob(data.jobId, { status: "running", progress: 0 });

    const historyCount = await step.run("count-history", async () =>
      countAnalysesForUser(data.userId),
    );

    if (data.mode === "reanalyze" && data.analysisId) {
      const { analysis, result, diff } = await step.run(
        "reanalyze",
        async () =>
          reanalyzeContent(
            data.analysisId!,
            data.userId,
            {
              title: data.title,
              description: data.description,
              platform: data.platform,
              contentType: data.contentType,
              appliedFixIndexes: data.appliedFixIndexes,
              fileUrl: data.fileUrl,
            },
            (ev) => {
              updateAnalysisJob(data.jobId, {
                progress: ev.progress,
                stage: {
                  stageId: ev.stage.id,
                  label: ev.stage.label,
                  progress: ev.progress,
                  status: ev.status,
                  detail: ev.detail,
                  at: new Date().toISOString(),
                },
              });
            },
          ),
      );

      const payload = { id: analysis.id, ...result, diff };
      updateAnalysisJob(data.jobId, {
        status: "completed",
        progress: 100,
        result: payload,
      });
      return payload;
    }

    const saved = await step.run("analyze-and-persist", async () => {
      let analysisId = "";
      const result = await analyzeWithPipeline(
        {
          title: data.title,
          description: data.description,
          platform: data.platform,
          contentType: data.contentType,
          fileUrl: data.fileUrl,
          hasMedia: !!data.fileUrl,
          historyCount,
        },
        (ev) => {
          updateAnalysisJob(data.jobId, {
            progress: ev.progress,
            stage: {
              stageId: ev.stage.id,
              label: ev.stage.label,
              progress: ev.progress,
              status: ev.status,
              detail: ev.detail,
              at: new Date().toISOString(),
            },
          });
        },
        async (scored, media) => {
          const row = await saveAnalysis(
            data.userId,
            data.title,
            data.description,
            data.platform,
            data.contentType,
            scored,
            {
              fileUrl: data.fileUrl,
              durationSeconds: media.durationSeconds,
            },
          );
          analysisId = row.id;
        },
      );

      // If persist callback didn't run (edge), save now
      if (!analysisId) {
        const row = await saveAnalysis(
          data.userId,
          data.title,
          data.description,
          data.platform,
          data.contentType,
          result,
          { fileUrl: data.fileUrl },
        );
        analysisId = row.id;
      }

      return { id: analysisId, ...result };
    });

    updateAnalysisJob(data.jobId, {
      status: "completed",
      progress: 100,
      result: saved,
    });

    return saved;
  },
);

export const inngestFunctions = [runAnalysisFunction];

/**
 * Local async runner — same pipeline as Inngest when cloud keys are absent.
 */
export async function enqueueLocalAnalysisJob(opts: {
  userId: string;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  fileUrl?: string | null;
  mode?: "analyze" | "reanalyze";
  analysisId?: string | null;
  appliedFixIndexes?: number[];
}) {
  const job = createAnalysisJob(opts.userId, {
    title: opts.title,
    description: opts.description,
    platform: opts.platform,
    contentType: opts.contentType,
    fileUrl: opts.fileUrl,
    mode: opts.mode || "analyze",
    analysisId: opts.analysisId,
    appliedFixIndexes: opts.appliedFixIndexes,
  });

  // Fire-and-forget local worker
  void (async () => {
    try {
      updateAnalysisJob(job.id, { status: "running" });
      const historyCount = await countAnalysesForUser(opts.userId);

      if (opts.mode === "reanalyze" && opts.analysisId) {
        const { analysis, result, diff } = await reanalyzeContent(
          opts.analysisId,
          opts.userId,
          {
            title: opts.title,
            description: opts.description,
            platform: opts.platform,
            contentType: opts.contentType,
            appliedFixIndexes: opts.appliedFixIndexes,
            fileUrl: opts.fileUrl,
          },
          (ev) => {
            updateAnalysisJob(job.id, {
              progress: ev.progress,
              stage: {
                stageId: ev.stage.id,
                label: ev.stage.label,
                progress: ev.progress,
                status: ev.status,
                detail: ev.detail,
                at: new Date().toISOString(),
              },
            });
          },
        );
        updateAnalysisJob(job.id, {
          status: "completed",
          progress: 100,
          result: { id: analysis.id, ...result, diff },
        });
        return;
      }

      let analysisId = "";
      const result = await analyzeWithPipeline(
        {
          title: opts.title,
          description: opts.description,
          platform: opts.platform,
          contentType: opts.contentType,
          fileUrl: opts.fileUrl,
          hasMedia: !!opts.fileUrl,
          historyCount,
        },
        (ev) => {
          updateAnalysisJob(job.id, {
            progress: ev.progress,
            stage: {
              stageId: ev.stage.id,
              label: ev.stage.label,
              progress: ev.progress,
              status: ev.status,
              detail: ev.detail,
              at: new Date().toISOString(),
            },
          });
        },
        async (scored, media) => {
          const row = await saveAnalysis(
            opts.userId,
            opts.title,
            opts.description,
            opts.platform,
            opts.contentType,
            scored,
            {
              fileUrl: opts.fileUrl,
              durationSeconds: media.durationSeconds,
            },
          );
          analysisId = row.id;
        },
      );

      if (!analysisId) {
        const row = await saveAnalysis(
          opts.userId,
          opts.title,
          opts.description,
          opts.platform,
          opts.contentType,
          result,
          { fileUrl: opts.fileUrl },
        );
        analysisId = row.id;
      }

      updateAnalysisJob(job.id, {
        status: "completed",
        progress: 100,
        result: { id: analysisId, ...result },
      });
    } catch (err) {
      console.error("[analysis-job] failed:", err);
      updateAnalysisJob(job.id, {
        status: "failed",
        error: err instanceof Error ? err.message : "Analysis failed",
      });
    }
  })();

  return job;
}

export { getAnalysisJob } from "../analysis-jobs";
