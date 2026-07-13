import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Link as LinkIcon, Sparkles, Clock, ArrowRight, Check, Loader2,
  RefreshCw, Zap, ChevronDown, Share2, Target, Repeat, History,
} from "lucide-react";
import { Link as WouterLink, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ScoreRing, scoreTone } from "@/components/ui/score-ring";
import { FixCard, type FixComponent } from "@repo/ui/fix-card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShareDialog } from "@/components/ShareDialog";
import { ScheduleAndActuals } from "@/components/ScheduleAndActuals";
import { AnalysisReveal } from "@/components/AnalysisReveal";
import { ScoreDiffPanel } from "@/components/ScoreDiffPanel";
import { RetentionCurveChart } from "@/components/RetentionCurveChart";
import { useParams } from "wouter";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import type { RetentionCurve, ScoreDiff, FixSuggestion } from "@repo/score-engine";
import { PIPELINE_STAGES } from "@repo/score-engine";

type Platform = "youtube" | "tiktok" | "instagram" | "twitter" | "linkedin";
type Step = "upload" | "analyzing" | "results" | "loading";

interface LoadedAnalysis {
  id: string;
  title?: string | null;
  description?: string | null;
  targetPlatform?: string | null;
  scheduledFor?: string | null;
  postedAt?: string | null;
  status?: string | null;
  actualViews?: number | null;
  actualLikes?: number | null;
  actualComments?: number | null;
  actualShares?: number | null;
  viralScore?: number | null;
  hookScore?: number | null;
  visualScore?: number | null;
  structureScore?: number | null;
  metadataScore?: number | null;
  timingScore?: number | null;
  analysisResults?: Partial<AnalysisResult> | null;
}

interface AnalysisResult {
  id: string;
  viralScore: number;
  hookScore: number;
  hookAnalysis: string;
  hookSuggestions: string[];
  visualScore: number;
  visualAnalysis: string;
  visualSuggestions: string[];
  structureScore: number;
  structureAnalysis: string;
  structureSuggestions: string[];
  metadataScore: number;
  metadataAnalysis: string;
  metadataSuggestions: string[];
  timingScore: number;
  timingAnalysis: string;
  optimalPostingTime: string;
  top3Fixes: FixSuggestion[];
  predictedScoreAfterFixes: number;
  confidence?: number;
  scoringProfileVersion?: string;
  retentionCurve?: RetentionCurve | null;
  diff?: ScoreDiff;
}

const platforms: { id: Platform; name: string; icon: string }[] = [
  { id: "youtube", name: "YouTube", icon: "▶️" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "twitter", name: "X", icon: "𝕏" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
];

function normalizeFixes(
  fixes: Array<Partial<FixSuggestion> & { issue?: string; fix?: string }> | undefined,
): FixSuggestion[] {
  if (!fixes?.length) return [];
  return fixes.map((f) => ({
    component: (f.component as FixComponent) || "hook",
    issue: f.issue || "Improve this section",
    fix: f.fix || "",
    predictedImpact: f.predictedImpact ?? 5,
  }));
}

export default function Analyze() {
  const params = useParams<{ id?: string }>();
  const analysisId = params?.id;
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(analysisId ? "loading" : "upload");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("youtube");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [skippedFixes, setSkippedFixes] = useState<Set<number>>(new Set());
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const pendingReveal = useRef(false);

  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({
    onError: (err) =>
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      }),
  });

  const { data: loadedAnalysis, isLoading: isLoadingAnalysis } = useQuery<LoadedAnalysis | null>({
    queryKey: ["/api/analyses", analysisId],
    queryFn: async () => {
      const res = await fetch(`/api/analyses/${analysisId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!analysisId,
  });

  const { data: historyRows } = useQuery({
    queryKey: ["/api/analyses", analysisId, "history"],
    queryFn: async () => {
      const res = await fetch(`/api/analyses/${analysisId}/history`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!analysisId && showHistory,
  });

  useEffect(() => {
    if (loadedAnalysis && analysisId) {
      const raw = (loadedAnalysis.analysisResults || {}) as AnalysisResult;
      const merged: AnalysisResult = {
        ...raw,
        id: loadedAnalysis.id,
        top3Fixes: normalizeFixes(raw.top3Fixes),
        viralScore: raw.viralScore ?? loadedAnalysis.viralScore ?? 0,
        hookScore: raw.hookScore ?? loadedAnalysis.hookScore ?? 0,
        visualScore: raw.visualScore ?? loadedAnalysis.visualScore ?? 0,
        structureScore: raw.structureScore ?? loadedAnalysis.structureScore ?? 0,
        metadataScore: raw.metadataScore ?? loadedAnalysis.metadataScore ?? 0,
        timingScore: raw.timingScore ?? loadedAnalysis.timingScore ?? 0,
      };
      setResult(merged);
      setTitle(loadedAnalysis.title || "");
      setDescription(loadedAnalysis.description || "");
      if (loadedAnalysis.targetPlatform) {
        setSelectedPlatform(loadedAnalysis.targetPlatform as Platform);
      }
      setStep("results");
      setExpandedSection("Hook Strength");
    } else if (!isLoadingAnalysis && analysisId && !loadedAnalysis) {
      setStep("upload");
    }
  }, [loadedAnalysis, isLoadingAnalysis, analysisId]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node))
      setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile &&
        (droppedFile.type.startsWith("video/") ||
          droppedFile.type.startsWith("image/"))
      ) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        toast({ title: "Uploading…", description: droppedFile.name });
        const uploaded = await uploadFile(droppedFile);
        if (uploaded) {
          setFileUrl(uploaded.objectPath);
          toast({ title: "File ready", description: droppedFile.name });
        }
      } else if (droppedFile) {
        toast({
          title: "Unsupported file",
          description: "Please drop a video or image file",
          variant: "destructive",
        });
      }
    },
    [title, toast, uploadFile],
  );

  const pollJob = async (jobId: string): Promise<AnalysisResult> => {
    for (;;) {
      const res = await fetch(`/api/analyze/jobs/${jobId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to poll analysis job");
      const job = await res.json();
      setAnalysisProgress(job.progress ?? 0);
      if (Array.isArray(job.stages)) {
        const completed = job.stages
          .filter(
            (s: { status: string }) =>
              s.status === "completed" || s.status === "skipped",
          )
          .map((s: { stageId: string }) => s.stageId);
        setCompletedStages(completed);
        const last = job.stages[job.stages.length - 1];
        if (last) setCurrentStage(last.stageId);
      }
      if (job.status === "completed" && job.result) {
        return job.result as AnalysisResult;
      }
      if (job.status === "failed") {
        throw new Error(job.error || "Analysis failed");
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  const runAnalyzeRequest = async (body: Record<string, unknown>) => {
    setAnalysisProgress(0);
    setCompletedStages([]);
    setCurrentStage(PIPELINE_STAGES[0]?.id ?? null);

    // Media → async job (ffmpeg + whisper); text-only can SSE
    const hasFile = !!body.fileUrl;
    if (hasFile) {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...body, async: true, stream: false }),
      });
      if (res.status === 202) {
        const { jobId } = await res.json();
        return pollJob(jobId);
      }
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Analysis failed");
      }
      return res.json() as Promise<AnalysisResult>;
    }

    // Text-only: SSE for live stages
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...body, stream: true, async: false }),
    });

    if (
      !res.ok ||
      !res.body ||
      !res.headers.get("content-type")?.includes("text/event-stream")
    ) {
      const jsonRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...body, stream: false, async: false }),
      });
      if (!jsonRes.ok) {
        const error = await jsonRes.json();
        throw new Error(error.error || "Analysis failed");
      }
      for (const s of PIPELINE_STAGES) {
        setCurrentStage(s.id);
        setCompletedStages((prev) => [...prev, s.id]);
        setAnalysisProgress(
          PIPELINE_STAGES.slice(0, PIPELINE_STAGES.indexOf(s) + 1).reduce(
            (a, x) => a + x.weight,
            0,
          ),
        );
        await new Promise((r) => setTimeout(r, 80));
      }
      return jsonRes.json() as Promise<AnalysisResult>;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: AnalysisResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const lines = part.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));
        if (!eventLine || !dataLine) continue;
        const event = eventLine.replace("event:", "").trim();
        const data = JSON.parse(dataLine.replace("data:", "").trim());
        if (event === "stage") {
          setCurrentStage(data.stage?.id ?? null);
          setAnalysisProgress(data.progress ?? 0);
          if (data.status === "completed" || data.status === "skipped") {
            setCompletedStages((prev) =>
              prev.includes(data.stage.id) ? prev : [...prev, data.stage.id],
            );
          }
        } else if (event === "complete") {
          finalResult = data as AnalysisResult;
        } else if (event === "error") {
          throw new Error(data.error || "Analysis failed");
        }
      }
    }

    if (!finalResult) throw new Error("Analysis stream ended without result");
    return finalResult;
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      let objectPath = fileUrl;
      if (file && !objectPath) {
        setUploadProgress(10);
        const uploaded = await uploadFile(file);
        if (!uploaded) throw new Error("Upload failed");
        objectPath = uploaded.objectPath;
        setFileUrl(objectPath);
        setUploadProgress(100);
      }

      const data = await runAnalyzeRequest({
        title: title || "Untitled Content",
        description: description || "",
        platform: selectedPlatform,
        contentType: file
          ? file.type.startsWith("video/")
            ? "video"
            : "image"
          : "video",
        hasMedia: !!(objectPath || url),
        fileUrl: objectPath || null,
      });
      return {
        ...data,
        top3Fixes: normalizeFixes(data.top3Fixes),
      } as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setSkippedFixes(new Set());
      setAppliedFixes(new Set());
      pendingReveal.current = true;
      setShowReveal(true);
      if (data.id) setLocation(`/analyze/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Please try again",
        variant: "destructive",
      });
      setStep("upload");
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      if (!result?.id) throw new Error("No analysis");
      setStep("analyzing");
      setAnalysisProgress(0);
      setCompletedStages([]);
      const res = await fetch(`/api/analyses/${result.id}/reanalyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title || "Untitled Content",
          description,
          platform: selectedPlatform,
          appliedFixIndexes: Array.from(appliedFixes),
          fileUrl: fileUrl || null,
          async: true,
        }),
      });
      if (res.status === 202) {
        const { jobId } = await res.json();
        const data = await pollJob(jobId);
        return {
          ...data,
          top3Fixes: normalizeFixes(data.top3Fixes),
        } as AnalysisResult;
      }
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Re-analyze failed");
      }
      const data = await res.json();
      return {
        ...data,
        top3Fixes: normalizeFixes(data.top3Fixes),
      } as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      pendingReveal.current = true;
      setShowReveal(true);
      toast({
        title: "Re-scored",
        description:
          data.diff != null
            ? `${data.diff.deltaViral >= 0 ? "+" : ""}${data.diff.deltaViral} pts vs previous`
            : "Updated analysis saved",
      });
    },
    onError: () => {
      toast({
        title: "Re-analyze failed",
        description: "Please try again",
        variant: "destructive",
      });
      setStep("results");
    },
  });

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setFileUrl(null);
        if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        toast({ title: "Uploading…", description: selectedFile.name });
        const uploaded = await uploadFile(selectedFile);
        if (uploaded) {
          setFileUrl(uploaded.objectPath);
          toast({ title: "File ready", description: selectedFile.name });
        }
      }
    },
    [title, toast, uploadFile],
  );

  const handleAnalyze = () => {
    if (!file && !url && !title && !description) {
      toast({
        title: "No content provided",
        description: "Please upload a file, paste a URL, or enter content details",
        variant: "destructive",
      });
      return;
    }
    setStep("analyzing");
    analyzeMutation.mutate();
  };

  const applyFix = (index: number, fix: FixSuggestion) => {
    const addition = `\n\n[Applied fix — ${fix.component}]: ${fix.fix}`;
    setDescription((d) => (d.includes(fix.fix) ? d : `${d}${addition}`.trim()));
    setAppliedFixes((prev) => new Set(prev).add(index));
    toast({
      title: "Fix applied to draft",
      description: "Re-analyze to measure impact",
    });
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const ScoreBar = ({
    score,
    max = 20,
    label,
  }: {
    score: number;
    max?: number;
    label: string;
  }) => {
    const percentage = (score / max) * 100;
    const tone = scoreTone(score * 5);
    const fillColor: Record<string, string> = {
      emerald: "bg-emerald-400",
      lime: "bg-lime-400",
      indigo: "bg-lime-400",
      amber: "bg-amber-400",
      rose: "bg-rose-400",
      slate: "bg-slate-500",
    };
    const isExpanded = expandedSection === label;
    return (
      <button
        type="button"
        className="w-full cursor-pointer rounded-lg p-3 text-left transition-colors hover:bg-white/[0.03] -mx-3"
        onClick={() => setExpandedSection(isExpanded ? null : label)}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold tabular-nums score-bg-${tone}`}
            >
              {score}/{max}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-500 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={`h-full ${fillColor[tone]}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </button>
    );
  };

  const sections: Array<{
    key: string;
    analysis: string;
    suggestions?: string[];
    extra?: React.ReactNode;
  }> = result
    ? [
        {
          key: "Hook Strength",
          analysis: result.hookAnalysis,
          suggestions: result.hookSuggestions,
        },
        {
          key: "Visual Impact",
          analysis: result.visualAnalysis,
          suggestions: result.visualSuggestions,
        },
        {
          key: "Structure",
          analysis: result.structureAnalysis,
          suggestions: result.structureSuggestions,
        },
        {
          key: "Metadata",
          analysis: result.metadataAnalysis,
          suggestions: result.metadataSuggestions,
        },
        {
          key: "Timing",
          analysis: result.timingAnalysis,
          extra: (
            <p className="text-sm text-emerald-300">
              <Clock className="mr-1 inline h-4 w-4" />
              Optimal time: {result.optimalPostingTime}
            </p>
          ),
        },
      ]
    : [];

  const sectionScores: Record<string, number> = result
    ? {
        "Hook Strength": result.hookScore,
        "Visual Impact": result.visualScore,
        Structure: result.structureScore,
        Metadata: result.metadataScore,
        Timing: result.timingScore,
      }
    : {};

  return (
    <DashboardLayout>
      {result && (
        <AnalysisReveal
          open={showReveal}
          score={result.viralScore}
          components={{
            hook: result.hookScore,
            visual: result.visualScore,
            structure: result.structureScore,
            metadata: result.metadataScore,
            timing: result.timingScore,
          }}
          onComplete={() => {
            setShowReveal(false);
            setStep("results");
            setExpandedSection("Hook Strength");
            pendingReveal.current = false;
          }}
        />
      )}

      <div className="mx-auto max-w-5xl">
        <AnimatePresence mode="wait">
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[var(--accent,#7C5CFF)]" />
                <p className="text-slate-400">Loading analysis…</p>
              </div>
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
            >
              <PageHeader
                eyebrow="Pre-publish"
                title="Analyze content"
                description="Get your Viral Score in 30 seconds — platform-tuned across hook, visuals, structure, metadata, and timing."
              />

              <div className="card-base card-pop p-7">
                <div
                  ref={dropRef}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    "relative rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                    isDragging
                      ? "scale-[1.01] border-[var(--accent)] bg-[var(--accent-muted)]"
                      : file
                        ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                        : "border-white/[0.10] hover:border-[var(--accent)]/40",
                  )}
                >
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    data-testid="file-input"
                  />
                  {isDragging ? (
                    <>
                      <div className="mx-auto mb-3 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                        <Upload className="h-7 w-7 text-[var(--accent)]" />
                      </div>
                      <h3 className="text-h3 mb-1 text-[var(--accent-hover)]">
                        Drop it right here
                      </h3>
                      <p className="text-sm text-slate-400">Release to add your file</p>
                    </>
                  ) : file ? (
                    <>
                      <div className="score-bg-emerald mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl">
                        <Check className="h-7 w-7" />
                      </div>
                      <h3 className="text-h3 mb-1 text-emerald-300">{file.name}</h3>
                      <p className="text-sm text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB · Click or drop to change
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
                        <Upload className="h-7 w-7" />
                      </div>
                      <h3 className="text-h3 mb-1 text-white">Drag & drop your file here</h3>
                      <p className="text-sm text-slate-400">or click to browse</p>
                      <p className="text-meta mt-2">Supports: MP4, MOV, JPG, PNG (max 500MB)</p>
                    </>
                  )}
                </div>

                <div className="my-6 flex items-center gap-4">
                  <div className="divider-soft flex-1" />
                  <span className="text-meta">OR</span>
                  <div className="divider-soft flex-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-eyebrow mb-2 block">Paste a URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=…"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        data-testid="url-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-eyebrow mb-2 block">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My awesome video…"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                      data-testid="title-input"
                    />
                  </div>

                  <div>
                    <label className="text-eyebrow mb-2 block">Description / script</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's your video about? Paste your script for better scoring."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                      data-testid="description-input"
                    />
                  </div>

                  <div>
                    <label className="text-eyebrow mb-2 block">Target platform</label>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={cn(
                            "rounded-lg border px-3.5 py-2 text-sm transition-colors",
                            selectedPlatform === p.id
                              ? "border-[var(--accent)]/40 bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                              : "border-white/[0.06] bg-white/[0.025] text-slate-400 hover:border-white/[0.12] hover:text-white",
                          )}
                          data-testid={`platform-${p.id}`}
                        >
                          <span className="mr-1.5">{p.icon}</span>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={
                    isUploading ||
                    (!file && !fileUrl && !url && !title && !description)
                  }
                  className="mt-6 w-full bg-[var(--accent)] py-6 text-base hover:bg-[var(--accent-hover)]"
                  data-testid="button-analyze-now"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isUploading ? "Uploading…" : "Analyze Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
            >
              <PageHeader
                eyebrow="Pipeline"
                title="Analyzing…"
                description="Real stage progress from the score engine."
              />

              <div className="card-base card-pop p-8">
                <div className="mb-8 flex justify-center">
                  <ScoreRing score={analysisProgress} size={160} label="Progress" />
                </div>

                <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--score-90)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="space-y-3">
                  {PIPELINE_STAGES.map((s) => {
                    const isCompleted = completedStages.includes(s.id);
                    const isCurrent = currentStage === s.id && !isCompleted;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-white/[0.10]" />
                        )}
                        <span className={isCompleted || isCurrent ? "text-white" : "text-slate-500"}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <PageHeader
                eyebrow="Result"
                title="Your Viral Score"
                description={title || "Content analysis"}
                actions={
                  <>
                    <ShareDialog
                      analysisId={result.id}
                      analysisTitle={title || "Content Analysis"}
                      trigger={
                        <Button
                          variant="outline"
                          className="border-white/[0.10] bg-white/[0.025]"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowHistory((v) => !v)}
                      className="border-white/[0.10] bg-white/[0.025]"
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep("upload");
                        setResult(null);
                        setLocation("/analyze");
                      }}
                      className="border-white/[0.10] bg-white/[0.025]"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New analysis
                    </Button>
                  </>
                }
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="card-base card-pop relative overflow-hidden p-7">
                  <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--accent)]/10 blur-3xl" />
                  <div className="text-eyebrow mb-4 flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Latest Viral Score
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ScoreRing score={result.viralScore} size={180} strokeWidth={12} />
                    <div
                      className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium score-bg-${scoreTone(result.viralScore)}`}
                    >
                      {result.viralScore >= 60 ? "✓" : "⚠"}{" "}
                      {getScoreLabel(result.viralScore)}
                    </div>
                    {(result.confidence != null || result.scoringProfileVersion) && (
                      <p className="mt-3 font-mono text-[11px] text-slate-500">
                        {result.scoringProfileVersion && (
                          <span>{result.scoringProfileVersion}</span>
                        )}
                        {result.confidence != null && (
                          <span>
                            {result.scoringProfileVersion ? " · " : ""}
                            {Math.round(result.confidence * 100)}% confidence
                          </span>
                        )}
                      </p>
                    )}
                    <div className="divider-soft mt-6 w-full pt-5">
                      <p className="text-meta">If you fix the issues below, predicted score</p>
                      <p className="text-display mt-1.5 text-3xl tabular-nums text-emerald-300">
                        {result.predictedScoreAfterFixes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-base p-6">
                  <h3 className="text-h3 mb-4 text-white">Score breakdown</h3>
                  <div className="space-y-1">
                    {sections.map((s) => (
                      <div key={s.key}>
                        <ScoreBar score={sectionScores[s.key] ?? 0} label={s.key} />
                        <AnimatePresence>
                          {expandedSection === s.key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                                <p className="mb-3 text-sm text-slate-300">{s.analysis}</p>
                                {s.suggestions && (
                                  <ul className="space-y-2">
                                    {s.suggestions.map((sg, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-slate-400"
                                      >
                                        <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                                        {sg}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {s.extra}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.diff && <ScoreDiffPanel diff={result.diff} />}

              {result.retentionCurve && (
                <RetentionCurveChart curve={result.retentionCurve} />
              )}

              <div>
                <h3 className="text-h3 mb-4 text-white">Top fixes (do these first)</h3>
                <div className="space-y-3">
                  {result.top3Fixes
                    .map((fix, i) => ({ fix, i }))
                    .filter(({ i }) => !skippedFixes.has(i))
                    .map(({ fix, i }) => (
                      <FixCard
                        key={`${fix.component}-${i}`}
                        component={fix.component}
                        title={fix.component.toUpperCase()}
                        predictedImpact={fix.predictedImpact}
                        diagnosis={fix.issue}
                        suggestion={fix.fix}
                        busy={reanalyzeMutation.isPending}
                        onApply={() => applyFix(i, fix)}
                        onGenerateMore={() => {
                          toast({
                            title: "Generating variants",
                            description: "Hook Lab / Script Doctor coming next — copied fix for now",
                          });
                          navigator.clipboard.writeText(fix.fix);
                        }}
                        onSkip={() =>
                          setSkippedFixes((prev) => new Set(prev).add(i))
                        }
                      />
                    ))}
                  {result.top3Fixes.every((_, i) => skippedFixes.has(i)) && (
                    <p className="text-sm text-slate-500">All fixes skipped.</p>
                  )}
                </div>
                {appliedFixes.size > 0 && (
                  <p className="mt-3 text-sm text-[var(--score-90)]">
                    {appliedFixes.size} fix{appliedFixes.size > 1 ? "es" : ""} applied to
                    draft — hit Re-analyze to measure impact.
                  </p>
                )}
              </div>

              {showHistory && (
                <div className="card-base p-5">
                  <h3 className="text-h3 mb-3 text-white">Analysis history</h3>
                  {!historyRows?.length ? (
                    <p className="text-sm text-slate-500">No prior versions yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(historyRows as Array<{ id: string; viralScore: number | null; analyzedAt: string }>).map(
                        (row, idx) => (
                          <li
                            key={row.id}
                            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm"
                          >
                            <span className="text-slate-400">
                              v{(historyRows as unknown[]).length - idx}
                              {idx === 0 ? " (latest snapshot)" : ""}
                            </span>
                            <span className="font-mono tabular-nums text-white">
                              {row.viralScore ?? "—"}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              {row.analyzedAt
                                ? new Date(row.analyzedAt).toLocaleString()
                                : ""}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              )}

              <ScheduleAndActuals
                analysisId={result.id}
                predictedScore={result.predictedScoreAfterFixes ?? result.viralScore}
                initialScheduledFor={loadedAnalysis?.scheduledFor ?? null}
                initialPostedAt={loadedAnalysis?.postedAt ?? null}
                initialStatus={loadedAnalysis?.status ?? null}
                initialActuals={{
                  views: loadedAnalysis?.actualViews ?? null,
                  likes: loadedAnalysis?.actualLikes ?? null,
                  comments: loadedAnalysis?.actualComments ?? null,
                  shares: loadedAnalysis?.actualShares ?? null,
                }}
              />

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => reanalyzeMutation.mutate()}
                  disabled={reanalyzeMutation.isPending || !result.id}
                  className="flex-1 bg-[var(--accent)] py-6 hover:bg-[var(--accent-hover)]"
                  data-testid="button-reanalyze"
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-5 w-5",
                      reanalyzeMutation.isPending && "animate-spin",
                    )}
                  />
                  Re-analyze with changes
                </Button>
                <WouterLink
                  href={`/repurpose?source=${encodeURIComponent((description || title || "").slice(0, 4000))}&analysisId=${result.id}`}
                >
                  <Button
                    variant="outline"
                    className="flex-1 border-white/[0.10] bg-white/[0.025] py-6"
                    data-testid="button-repurpose-from-analysis"
                  >
                    <Repeat className="mr-2 h-5 w-5" />
                    Repurpose for other platforms
                  </Button>
                </WouterLink>
                <Button
                  variant="outline"
                  className="flex-1 border-white/[0.10] bg-white/[0.025] py-6"
                  data-testid="button-save-draft"
                >
                  Save Draft
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
