import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Link as LinkIcon, Sparkles, Clock, ArrowRight, Check, Loader2,
  RefreshCw, Zap, ChevronDown, Copy, Share2, Target, Repeat,
} from "lucide-react";
import { Link as WouterLink } from "wouter";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ScoreRing, scoreTone } from "@/components/ui/score-ring";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShareDialog } from "@/components/ShareDialog";
import { ScheduleAndActuals } from "@/components/ScheduleAndActuals";
import { useParams } from "wouter";
import { cn } from "@/lib/utils";

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';
type Step = 'upload' | 'analyzing' | 'results' | 'loading';

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
  top3Fixes: Array<{ issue: string; fix: string; predictedImpact: number }>;
  predictedScoreAfterFixes: number;
}

const platforms: { id: Platform; name: string; icon: string }[] = [
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'twitter', name: 'Twitter', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
];

const ANALYSIS_STEP_NAMES = [
  'Extracting frames',
  'Analyzing hook (first 3 seconds)',
  'Evaluating visual composition',
  'Checking metadata optimization',
  'Calculating optimal posting time',
];

export default function Analyze() {
  const params = useParams<{ id?: string }>();
  const analysisId = params?.id;
  const [step, setStep] = useState<Step>(analysisId ? 'loading' : 'upload');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const { data: loadedAnalysis, isLoading: isLoadingAnalysis } = useQuery<LoadedAnalysis | null>({
    queryKey: ["/api/analyses", analysisId],
    queryFn: async () => {
      const res = await fetch(`/api/analyses/${analysisId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!analysisId,
  });

  useEffect(() => {
    if (loadedAnalysis && analysisId) {
      const merged: AnalysisResult = {
        ...(loadedAnalysis.analysisResults as AnalysisResult),
        id: loadedAnalysis.id,
      };
      setResult(merged);
      setTitle(loadedAnalysis.title || '');
      setDescription(loadedAnalysis.description || '');
      if (loadedAnalysis.targetPlatform) {
        setSelectedPlatform(loadedAnalysis.targetPlatform as Platform);
      }
      setStep('results');
      setExpandedSection('Hook Strength');
    } else if (!isLoadingAnalysis && analysisId && !loadedAnalysis) {
      setStep('upload');
    }
  }, [loadedAnalysis, isLoadingAnalysis, analysisId]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('video/') || droppedFile.type.startsWith('image/'))) {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
      toast({ title: "File added", description: droppedFile.name });
    } else if (droppedFile) {
      toast({ title: "Unsupported file", description: "Please drop a video or image file", variant: "destructive" });
    }
  }, [title, toast]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const animateSteps = async () => {
        for (let i = 0; i < ANALYSIS_STEP_NAMES.length; i++) {
          setAnalysisSteps(ANALYSIS_STEP_NAMES.slice(0, i + 1));
          setAnalysisProgress((i + 1) * 20);
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      };

      let fileUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      if (file) {
        const uploadMeta = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });

        if (!uploadMeta.ok) {
          throw new Error("Failed to upload file");
        }

        const { uploadURL, objectPath } = await uploadMeta.json();
        const uploadPut = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });

        if (!uploadPut.ok) {
          throw new Error("Failed to store uploaded file");
        }

        fileUrl = objectPath;
        if (file.type.startsWith("image/")) {
          thumbnailUrl = objectPath;
        }
      }

      const [apiResult] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: title || 'Untitled Content',
            description: description || '',
            platform: selectedPlatform,
            contentType: file ? (file.type.startsWith('video/') ? 'video' : 'image') : 'video',
            fileUrl,
            thumbnailUrl,
          })
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Analysis failed');
          }
          return res.json();
        }),
        animateSteps()
      ]);
      return apiResult as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setStep('results');
      setExpandedSection('Hook Strength');
    },
    onError: () => {
      toast({ title: "Analysis failed", description: "Please try again", variant: "destructive" });
      setStep('upload');
    }
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  }, [title]);

  const handleAnalyze = () => {
    if (!file && !url && !title && !description) {
      toast({
        title: "No content provided",
        description: "Please upload a file, paste a URL, or enter content details",
        variant: "destructive"
      });
      return;
    }
    setStep('analyzing');
    setAnalysisProgress(0);
    setAnalysisSteps([]);
    analyzeMutation.mutate();
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const ScoreBar = ({ score, max = 20, label }: { score: number; max?: number; label: string }) => {
    const percentage = (score / max) * 100;
    const tone = scoreTone(score * 5);
    const fillColor: Record<string, string> = {
      emerald: "bg-emerald-400",
      indigo: "bg-orange-400",
      amber: "bg-amber-400",
      rose: "bg-rose-400",
      slate: "bg-slate-500",
    };
    const isExpanded = expandedSection === label;
    return (
      <button
        type="button"
        className="w-full text-left cursor-pointer hover:bg-white/[0.03] rounded-lg p-3 -mx-3 transition-colors"
        onClick={() => setExpandedSection(isExpanded ? null : label)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums score-bg-${tone}`}>
              {score}/{max}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", isExpanded && "rotate-180")} />
          </div>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
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

  const sections: Array<{ key: string; analysis: string; suggestions?: string[]; extra?: React.ReactNode }> = result ? [
    { key: 'Hook Strength', analysis: result.hookAnalysis, suggestions: result.hookSuggestions },
    { key: 'Visual Impact', analysis: result.visualAnalysis, suggestions: result.visualSuggestions },
    { key: 'Structure', analysis: result.structureAnalysis, suggestions: result.structureSuggestions },
    { key: 'Metadata', analysis: result.metadataAnalysis, suggestions: result.metadataSuggestions },
    { key: 'Timing', analysis: result.timingAnalysis, extra: (
      <p className="text-sm text-emerald-300">
        <Clock className="inline h-4 w-4 mr-1" />
        Optimal time: {result.optimalPostingTime}
      </p>
    ) },
  ] : [];

  const sectionScores: Record<string, number> = result ? {
    'Hook Strength': result.hookScore,
    'Visual Impact': result.visualScore,
    'Structure': result.structureScore,
    'Metadata': result.metadataScore,
    'Timing': result.timingScore,
  } : {};

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading analysis…</p>
              </div>
            </motion.div>
          )}

          {step === 'upload' && (
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
                description="Get your Viral Score in 30 seconds — across hook, visuals, structure, metadata, and timing."
              />

              <div className="card-base card-pop p-7">
                <div
                  ref={dropRef}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 text-center transition-all relative",
                    isDragging
                      ? 'border-orange-400 bg-orange-500/10 scale-[1.01]'
                      : file
                      ? 'border-emerald-500/50 bg-emerald-500/[0.04]'
                      : 'border-white/[0.10] hover:border-orange-500/40'
                  )}
                >
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    data-testid="file-input"
                  />
                  {isDragging ? (
                    <>
                      <div className="h-14 w-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Upload className="h-7 w-7 text-orange-300" />
                      </div>
                      <h3 className="text-h3 mb-1 text-orange-300">Drop it right here</h3>
                      <p className="text-slate-400 text-sm">Release to add your file</p>
                    </>
                  ) : file ? (
                    <>
                      <div className="h-14 w-14 rounded-2xl score-bg-emerald flex items-center justify-center mx-auto mb-3">
                        <Check className="h-7 w-7" />
                      </div>
                      <h3 className="text-h3 mb-1 text-emerald-300">{file.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB · Click or drop to change
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="h-14 w-14 rounded-2xl bg-orange-500/15 text-orange-300 flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-7 w-7" />
                      </div>
                      <h3 className="text-h3 mb-1 text-white">Drag & drop your file here</h3>
                      <p className="text-slate-400 text-sm">or click to browse</p>
                      <p className="text-meta mt-2">Supports: MP4, MOV, JPG, PNG (max 500MB)</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 divider-soft" />
                  <span className="text-meta">OR</span>
                  <div className="flex-1 divider-soft" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-eyebrow mb-2 block">Paste a URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=…"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      data-testid="title-input"
                    />
                  </div>

                  <div>
                    <label className="text-eyebrow mb-2 block">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's your video about?"
                      rows={3}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
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
                            "px-3.5 py-2 rounded-lg border text-sm transition-colors",
                            selectedPlatform === p.id
                              ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                              : 'bg-white/[0.025] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]'
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
                  disabled={!file && !url && !title && !description}
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-500 py-6 text-base"
                  data-testid="button-analyze-now"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
            >
              <PageHeader
                eyebrow="Working"
                title="Analyzing…"
                description="This usually takes 10–30 seconds."
              />

              <div className="card-base card-pop p-8">
                <div className="flex justify-center mb-8">
                  <ScoreRing score={analysisProgress} size={160} label="Progress" />
                </div>

                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-8">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="space-y-3">
                  {ANALYSIS_STEP_NAMES.map((stepName, i) => {
                    const isCompleted = analysisSteps.includes(stepName);
                    const isCurrent = analysisSteps.length === i + 1 && !result;
                    return (
                      <div key={stepName} className="flex items-center gap-3">
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 text-orange-400 animate-spin" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-white/[0.10]" />
                        )}
                        <span className={isCompleted ? 'text-white' : 'text-slate-500'}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && result && (
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
                description={title || 'Content analysis'}
                actions={
                  <>
                    <ShareDialog
                      analysisId={result.id}
                      analysisTitle={title || 'Content Analysis'}
                      trigger={
                        <Button variant="outline" className="border-white/[0.10] bg-white/[0.025]">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      }
                    />
                    <Button variant="outline" onClick={() => setStep('upload')} className="border-white/[0.10] bg-white/[0.025]">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New analysis
                    </Button>
                  </>
                }
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-base card-pop p-7 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />
                  <div className="text-eyebrow mb-4 flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Latest Viral Score
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ScoreRing score={result.viralScore} size={180} strokeWidth={12} />
                    <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-medium score-bg-${scoreTone(result.viralScore)}`}>
                      {result.viralScore >= 60 ? '✓' : '⚠'} {getScoreLabel(result.viralScore)}
                    </div>
                    <div className="mt-6 pt-5 divider-soft w-full">
                      <p className="text-meta">If you fix the issues below, predicted score</p>
                      <p className="text-display text-3xl text-emerald-300 mt-1.5 tabular-nums">
                        {result.predictedScoreAfterFixes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-base p-6">
                  <h3 className="text-h3 text-white mb-4">Score breakdown</h3>
                  <div className="space-y-1">
                    {sections.map((s) => (
                      <div key={s.key}>
                        <ScoreBar score={sectionScores[s.key]} label={s.key} />
                        <AnimatePresence>
                          {expandedSection === s.key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 mb-3">
                                <p className="text-sm text-slate-300 mb-3">{s.analysis}</p>
                                {s.suggestions && (
                                  <ul className="space-y-2">
                                    {s.suggestions.map((sg, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                        <Zap className="h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
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

              <div className="card-base p-6">
                <h3 className="text-h3 text-white mb-4">Top 3 fixes (do these first)</h3>
                <div className="space-y-3">
                  {result.top3Fixes.map((fix, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-start gap-4">
                      <div className="h-9 w-9 rounded-lg bg-orange-500/15 text-orange-300 flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-white">{fix.issue}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full score-bg-emerald font-medium">
                            +{fix.predictedImpact} points
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{fix.fix}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(fix.fix);
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => setStep('upload')}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 py-6"
                  data-testid="button-reanalyze"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Re-analyze with changes
                </Button>
                <WouterLink
                  href={`/repurpose?source=${encodeURIComponent((description || title || '').slice(0, 4000))}&analysisId=${result.id}`}
                >
                  <Button
                    variant="outline"
                    className="flex-1 border-white/[0.10] bg-white/[0.025] py-6"
                    data-testid="button-repurpose-from-analysis"
                  >
                    <Repeat className="h-5 w-5 mr-2" />
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
