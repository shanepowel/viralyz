import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles, Repeat, Copy, Calendar as CalendarIcon, AlertTriangle,
  CheckCircle2, Info, Loader2, Mic2, ArrowRight, X, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CalendarSlotPicker } from "@/components/CalendarSlotPicker";

type Platform = "tiktok" | "reels" | "shorts" | "instagram" | "twitter" | "threads" | "linkedin" | "youtube";

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "reels", label: "Reels", icon: "📸" },
  { id: "shorts", label: "Shorts", icon: "▶️" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "twitter", label: "X / Twitter", icon: "𝕏" },
  { id: "threads", label: "Threads", icon: "@" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "youtube", label: "YouTube", icon: "🎬" },
];

interface LintFlag {
  level: "warn" | "info" | "error";
  category: string;
  message: string;
}

interface Variant {
  id: string;
  runId: string;
  platform: string;
  text: string;
  hashtags: string[] | null;
  viralScore: number | null;
  scoreBreakdown: { hook: number; visual: number; structure: number; metadata: number; timing: number } | null;
  platformNote: string | null;
  lintFlags: LintFlag[] | null;
  status: string;
  scheduledAnalysisId: string | null;
  createdAt: string;
}

interface RepurposeRun {
  id: string;
  sourceText: string;
  brandVoiceUsed: boolean;
  createdAt: string;
  variants: Variant[];
}

interface BrandVoiceProfile { id: string; name: string; isDefault: boolean }

function parseQuery(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export default function RepurposePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const initial = parseQuery();

  const [sourceText, setSourceText] = useState(initial.get("source") || "");
  const [sourceAnalysisId, setSourceAnalysisId] = useState<string | null>(initial.get("analysisId"));
  const [selected, setSelected] = useState<Set<Platform>>(
    () => new Set<Platform>(["tiktok", "twitter", "linkedin"])
  );
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const [activeRun, setActiveRun] = useState<RepurposeRun | null>(null);
  const [scheduling, setScheduling] = useState<Variant | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const { data: brandVoices } = useQuery<BrandVoiceProfile[]>({
    queryKey: ["/api/brand-voice"],
    queryFn: async () => {
      const res = await fetch("/api/brand-voice");
      if (!res.ok) return [];
      return res.json();
    },
  });
  const hasDefaultBV = (brandVoices ?? []).some((b) => b.isDefault);

  const { data: runs, isLoading: loadingRuns } = useQuery<RepurposeRun[]>({
    queryKey: ["/api/repurpose"],
    queryFn: async () => {
      const res = await fetch("/api/repurpose");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const repurposeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sourceText: sourceText.trim(),
          sourceAnalysisId: sourceAnalysisId ?? undefined,
          platforms: Array.from(selected),
          useBrandVoice: useBrandVoice && hasDefaultBV,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to repurpose");
      }
      return res.json() as Promise<RepurposeRun>;
    },
    onSuccess: (data) => {
      setActiveRun(data);
      qc.invalidateQueries({ queryKey: ["/api/repurpose"] });
      toast({ title: "Repurposed", description: `${data.variants.length} variants ready.` });
    },
    onError: (e: any) => {
      toast({ title: "Couldn't repurpose", description: e?.message || "Try again", variant: "destructive" });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const res = await fetch(`/api/repurpose/${variantId}/save-draft`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save draft");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/repurpose"] });
      qc.invalidateQueries({ queryKey: ["/api/analyses/recent"] });
      toast({ title: "Saved to Drafts" });
    },
    onError: (e: any) => {
      toast({ title: "Couldn't save draft", description: e?.message || "Try again", variant: "destructive" });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ variantId, when }: { variantId: string; when: string }) => {
      const res = await fetch(`/api/repurpose/${variantId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scheduledFor: new Date(when).toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to schedule");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/calendar"] });
      qc.invalidateQueries({ queryKey: ["/api/repurpose"] });
      toast({
        title: "Scheduled",
        description: "Opening your calendar…",
      });
      setScheduling(null);
      const id = data?.analysis?.id;
      setLocation(id ? `/calendar?highlight=${id}` : "/calendar");
    },
    onError: (e: any) => {
      toast({ title: "Couldn't schedule", description: e?.message || "Try again", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!scheduling) setScheduleDate("");
  }, [scheduling]);

  const togglePlatform = (p: Platform) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  const variants = activeRun?.variants ?? [];
  const canSubmit = sourceText.trim().length >= 20 && selected.size > 0 && !repurposeMutation.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Create"
          title="Cross-platform Repurposer"
          description="Paste one post. Get a platform-tuned variant for each network — scored, linted, and ready to schedule."
        />

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card-base p-5 space-y-5"
          >
            <div>
              <label className="text-eyebrow mb-2 block">Source post</label>
              <textarea
                value={sourceText}
                onChange={(e) => { setSourceText(e.target.value); setSourceAnalysisId(null); }}
                rows={6}
                placeholder="Paste your draft caption, script, or post here…"
                className="w-full bg-secondary/80 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                data-testid="input-source-text"
              />
              <div className="text-meta mt-1 flex items-center justify-between">
                <span>{sourceText.length} chars (min 20)</span>
                {sourceAnalysisId && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Sparkles className="h-3 w-3" /> From analysis · prefilled
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-eyebrow mb-2 block">Target platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const on = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm transition-colors",
                        on
                          ? "bg-indigo-500/20 border-indigo-400/50 text-primary"
                          : "bg-secondary/80 border-border text-muted-foreground hover:border-border"
                      )}
                      data-testid={`chip-platform-${p.id}`}
                    >
                      <span className="mr-1.5">{p.icon}</span>{p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label
                className={cn(
                  "inline-flex items-center gap-2 text-sm",
                  hasDefaultBV ? "text-foreground cursor-pointer" : "text-muted-foreground cursor-not-allowed"
                )}
                title={hasDefaultBV ? "" : "Set a default Brand Voice profile to enable"}
              >
                <input
                  type="checkbox"
                  checked={useBrandVoice && hasDefaultBV}
                  onChange={(e) => setUseBrandVoice(e.target.checked)}
                  disabled={!hasDefaultBV}
                  className="h-4 w-4 rounded border-border bg-secondary"
                  data-testid="checkbox-use-brand-voice"
                />
                <Mic2 className="h-4 w-4" />
                Use my Brand Voice
                {!hasDefaultBV && (
                  <Link href="/brand-voice">
                    <span className="text-primary underline ml-1">Set up</span>
                  </Link>
                )}
              </label>

              <Button
                onClick={() => repurposeMutation.mutate()}
                disabled={!canSubmit}
                className="bg-indigo-600 hover:bg-indigo-500"
                data-testid="button-repurpose"
              >
                {repurposeMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Repurposing…</>
                ) : (
                  <><Repeat className="h-4 w-4 mr-1.5" />Repurpose for {selected.size} {selected.size === 1 ? "platform" : "platforms"}</>
                )}
              </Button>
            </div>

            {!activeRun && !repurposeMutation.isPending && (
              <EmptyState
                icon={Repeat}
                title="One post in, many variants out"
                description="Each variant is rewritten to match how content performs on its target platform — and scored independently."
              />
            )}

            {variants.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {variants.map((v) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    onCopy={() => {
                      const tags = (v.hashtags ?? []).join(" ");
                      navigator.clipboard.writeText(tags ? `${v.text}\n\n${tags}` : v.text);
                      toast({ title: "Copied" });
                    }}
                    onSchedule={() => setScheduling(v)}
                    onSaveDraft={() => saveDraftMutation.mutate(v.id)}
                    savingDraft={saveDraftMutation.isPending && saveDraftMutation.variables === v.id}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="space-y-4"
          >
            <div className="card-base p-5">
              <h3 className="text-h3 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Why use this
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />Each variant is independently scored, not blindly rewritten.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />Pre-publish lint catches risky words, length, and AI tells.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />Schedule directly to your calendar in one click.</li>
              </ul>
            </div>

            <div className="card-base p-5">
              <h3 className="text-h3 mb-3">Recent runs</h3>
              {loadingRuns ? (
                <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
              ) : !runs || runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No runs yet.</p>
              ) : (
                <div className="space-y-2">
                  {runs.slice(0, 6).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setActiveRun(r); setSourceText(r.sourceText); }}
                      className="w-full text-left card-base card-hover p-3"
                      data-testid={`run-${r.id}`}
                    >
                      <div className="text-meta mb-1">
                        {new Date(r.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        {" · "}{r.variants.length} variants
                      </div>
                      <div className="text-sm line-clamp-2">{r.sourceText}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={!!scheduling} onOpenChange={(o) => !o && setScheduling(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Schedule {scheduling?.platform} variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">{scheduling?.text}</p>
            {scheduling && (
              <CalendarSlotPicker
                platform={scheduling.platform}
                value={scheduleDate}
                onChange={setScheduleDate}
              />
            )}
            <div>
              <label className="text-eyebrow mb-1 block">Custom time</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-secondary/80 border border-border rounded-lg p-2 text-sm text-foreground"
                data-testid="input-schedule-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setScheduling(null)}>
              <X className="h-4 w-4 mr-1.5" />Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              disabled={!scheduleDate || scheduleMutation.isPending}
              onClick={() => scheduling && scheduleMutation.mutate({ variantId: scheduling.id, when: scheduleDate })}
              data-testid="button-confirm-schedule"
            >
              <CalendarIcon className="h-4 w-4 mr-1.5" />Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function VariantCard({
  variant, onCopy, onSchedule, onSaveDraft, savingDraft,
}: { variant: Variant; onCopy: () => void; onSchedule: () => void; onSaveDraft: () => void; savingDraft: boolean }) {
  const tone = scoreTone(variant.viralScore);
  const errorFlags = (variant.lintFlags ?? []).filter((f) => f.level === "error");
  const warnFlags = (variant.lintFlags ?? []).filter((f) => f.level === "warn");
  const infoFlags = (variant.lintFlags ?? []).filter((f) => f.level === "info");
  const scheduled = variant.status === "scheduled";
  const draftSaved = variant.status === "draft";

  return (
    <div className="card-base p-4 flex flex-col gap-3" data-testid={`variant-${variant.platform}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{variant.platform}</span>
          {scheduled && (
            <span className="text-[10px] uppercase tracking-wide bg-emerald-500/15 text-[var(--score-90)] border border-emerald-500/30 rounded-full px-2 py-0.5">
              scheduled
            </span>
          )}
          {draftSaved && (
            <span className="text-[10px] uppercase tracking-wide bg-indigo-500/15 text-primary border border-indigo-500/30 rounded-full px-2 py-0.5">
              draft
            </span>
          )}
        </div>
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold tabular-nums", `score-bg-${tone}`)}>
          {variant.viralScore ?? "—"}
        </span>
      </div>

      <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed line-clamp-[10]">{variant.text}</p>

      {variant.hashtags && variant.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {variant.hashtags.map((h, i) => (
            <span key={i} className="text-[11px] text-primary bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5">
              {h}
            </span>
          ))}
        </div>
      )}

      {variant.platformNote && (
        <div className="text-xs text-muted-foreground italic border-l-2 border-indigo-500/40 pl-2">
          Platform-tuned because: {variant.platformNote}
        </div>
      )}

      {(errorFlags.length + warnFlags.length + infoFlags.length) > 0 && (
        <div className="space-y-1">
          {errorFlags.map((f, i) => (
            <div key={`e${i}`} className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{f.message}
            </div>
          ))}
          {warnFlags.map((f, i) => (
            <div key={`w${i}`} className="flex items-start gap-1.5 text-xs text-[var(--score-50)]">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{f.message}
            </div>
          ))}
          {infoFlags.map((f, i) => (
            <div key={`i${i}`} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />{f.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 mt-auto flex-wrap">
        <Button size="sm" variant="outline" className="border-border" onClick={onCopy} data-testid={`button-copy-${variant.platform}`}>
          <Copy className="h-3.5 w-3.5 mr-1.5" />Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-border"
          onClick={onSaveDraft}
          disabled={scheduled || draftSaved || savingDraft}
          data-testid={`button-save-draft-${variant.platform}`}
        >
          {savingDraft ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {draftSaved ? "Saved" : "Save draft"}
        </Button>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500"
          onClick={onSchedule}
          disabled={scheduled}
          title={errorFlags.length > 0 ? "Heads up: this variant has lint errors" : undefined}
          data-testid={`button-schedule-${variant.platform}`}
        >
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          {scheduled ? "Scheduled" : "Schedule"}
        </Button>
        {variant.scheduledAnalysisId && (
          <Link href={`/analyze/${variant.scheduledAnalysisId}`}>
            <Button size="sm" variant="ghost" className="text-primary">
              Open <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
