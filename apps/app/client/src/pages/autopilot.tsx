import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Plus, Play, Pause, CheckCircle2, XCircle, Clock, Linkedin,
  Sparkles, AlertCircle, ChevronRight, Loader2, ShieldAlert, Zap,
  ChevronDown, Lightbulb, Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing, scoreTone } from "@/components/ui/score-ring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Mission = {
  id: string;
  name: string;
  brief: string;
  platform: string;
  cadence: string;
  postsPerWeek: number;
  approvalMode: string;
  useBrandVoice: boolean;
  status: string;
  goalMetric: string | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
};

type Idea = { title: string; hook?: string; outline?: string[] };
type MissionRun = {
  proposedIdeas?: Idea[] | null;
  id: string;
  missionId: string;
  status: string;
  finalText: string | null;
  finalHashtags: string[] | null;
  predictedScore: number | null;
  scheduledFor: string | null;
  postedAt: string | null;
  externalPostUrl: string | null;
  actualImpressions: number | null;
  actualLikes: number | null;
  actualComments: number | null;
  rejectReason: string | null;
  error: string | null;
  createdAt: string;
};

type AccuracySummary = {
  generatedAt: string;
  windowDays: number;
  sampleSize: number;
  perPlatform: { platform: string; samples: number; mae: number }[];
  topLearnings: string[];
};

function AccuracySection() {
  const { data, isLoading } = useQuery<AccuracySummary>({
    queryKey: ["/api/autopilot/accuracy"],
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000,
  });
  if (isLoading) {
    return (
      <div className="card-base p-5 text-sm text-slate-400" data-testid="card-accuracy-loading">
        Crunching the agent's prediction accuracy…
      </div>
    );
  }
  if (!data || data.sampleSize === 0) {
    return (
      <div className="card-base p-5" data-testid="card-accuracy-empty">
        <h2 className="text-h2 mb-1">Prediction accuracy</h2>
        <p className="text-sm text-slate-400">
          The agent will start showing how accurate its viral-score predictions
          are once a few posts have been measured.
        </p>
      </div>
    );
  }
  return (
    <div className="card-base p-5 space-y-4" data-testid="card-accuracy">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-h2">Prediction accuracy</h2>
          <p className="text-meta text-slate-500">
            Last 7 days · {data.sampleSize} measured post{data.sampleSize === 1 ? "" : "s"}
          </p>
        </div>
        <span className="text-eyebrow text-slate-500">
          Updated {new Date(data.generatedAt).toLocaleDateString()}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.perPlatform.length === 0 && (
          <div className="text-sm text-slate-400 sm:col-span-3">
            No measured runs yet — give the agent a few cycles.
          </div>
        )}
        {data.perPlatform.map((p) => (
          <div
            key={p.platform}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
            data-testid={`stat-mae-${p.platform}`}
          >
            <div className="text-eyebrow text-slate-500 capitalize">{p.platform}</div>
            <div className="text-2xl font-semibold text-white">±{p.mae}</div>
            <div className="text-meta text-slate-500">MAE · {p.samples} sample{p.samples === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>
      {data.topLearnings.length > 0 && (
        <div>
          <div className="text-eyebrow text-slate-500 mb-2">What the agent learned</div>
          <ol className="space-y-2">
            {data.topLearnings.map((s, i) => (
              <li
                key={i}
                className="text-sm text-slate-200 rounded-md border border-orange-500/20 bg-orange-500/5 p-3"
                data-testid={`text-learning-${i}`}
              >
                <span className="text-orange-300 font-medium mr-2">#{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

type AutopilotState = {
  paused: boolean;
  linkedinConfigured: boolean;
  xConfigured: boolean;
  threadsConfigured: boolean;
  instagramConfigured: boolean;
  missions: number;
  activeMissions: number;
  awaitingApproval: number;
  recentRuns: MissionRun[];
};

type ConnectionStatus = {
  configured: boolean;
  connected: boolean;
  profileName?: string | null;
  account: { displayName: string | null; profileUrl: string | null; connectedAt: string } | null;
};
// Back-compat alias used by older call sites.
type LinkedInStatus = ConnectionStatus;

type PlatformId = "linkedin" | "x" | "threads" | "instagram";

const PLATFORM_LABEL: Record<PlatformId, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  threads: "Threads",
  instagram: "Instagram",
};

const PLATFORM_CHAR_LIMIT: Record<PlatformId, number> = {
  linkedin: 3000,
  x: 280,
  threads: 500,
  instagram: 2200,
};

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: "Queued", tone: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  running: { label: "Drafting", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  awaiting_idea: { label: "Pick angle", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  awaiting_approval: { label: "Needs you", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  approved: { label: "Approved", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Rejected", tone: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  posting: { label: "Posting", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  posted: { label: "Posted", tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  measuring: { label: "Measuring", tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  complete: { label: "Complete", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  failed: { label: "Failed", tone: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_LABEL[status] || { label: status, tone: "bg-slate-500/15 text-slate-300 border-slate-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", s.tone)} data-testid={`status-${status}`}>
      {s.label}
    </span>
  );
}

const TONE_PRESETS = [
  { value: "authoritative", label: "Authoritative" },
  { value: "playful", label: "Playful" },
  { value: "story", label: "Storyteller" },
  { value: "contrarian", label: "Contrarian" },
  { value: "data", label: "Data-driven" },
];

function NewMissionDialog({ onCreated }: { onCreated: (missionId?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brief: "",
    goal: "",
    inspirationLinksRaw: "",
    tonePreset: "authoritative",
    brandVoiceProfileId: "" as string,
    cadence: "weekdays",
    postsPerWeek: 3,
    approvalMode: "review",
    useBrandVoice: true,
    platform: "linkedin" as PlatformId,
  });
  // Surface the connected social account for the chosen platform so the user
  // knows exactly which identity the agent will post as before launch.
  const connStatus = useQuery<ConnectionStatus>({
    queryKey: [`/api/${form.platform}/status`],
    enabled: open,
  });
  const voices = useQuery<any[]>({
    queryKey: ["/api/brand-voice"],
    enabled: open,
  });
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: async () => {
      const inspirationLinks = form.inspirationLinksRaw
        .split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 10);
      const body = {
        name: form.name,
        brief: form.brief,
        goal: form.goal || null,
        inspirationLinks,
        tonePreset: form.tonePreset,
        brandVoiceProfileId: form.brandVoiceProfileId || null,
        cadence: form.cadence,
        postsPerWeek: form.postsPerWeek,
        approvalMode: form.approvalMode,
        useBrandVoice: form.useBrandVoice,
        platform: form.platform,
      };
      const res = await apiRequest("POST", "/api/missions", body);
      return res.json();
    },
    onSuccess: (mission: any) => {
      toast({ title: "Mission launched", description: "Your agent is drafting the first post now." });
      setOpen(false);
      setForm({ name: "", brief: "", goal: "", inspirationLinksRaw: "", tonePreset: "authoritative", brandVoiceProfileId: "", cadence: "weekdays", postsPerWeek: 3, approvalMode: "review", useBrandVoice: true, platform: "linkedin" });
      // Hand the new mission id back so the parent can deep-link the user
      // straight into the run inspector instead of leaving them on the list.
      onCreated(mission?.id);
    },
    onError: (e: any) => toast({ title: "Couldn't create", description: String(e?.message || e), variant: "destructive" }),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-mission" className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-0 shadow-[0_0_24px_-8px_rgba(245, 158, 11,0.6)]">
          <Plus className="h-4 w-4" /> New mission
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-slate-950 max-w-lg">
        <DialogHeader>
          <DialogTitle>Launch a new mission</DialogTitle>
          <DialogDescription>Tell the agent what to post about. It handles the rest.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as PlatformId })}>
              <SelectTrigger data-testid="select-mission-platform" className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PLATFORM_LABEL) as PlatformId[]).map((p) => (
                  <SelectItem key={p} value={p} data-testid={`option-platform-${p}`}>
                    {PLATFORM_LABEL[p]} <span className="text-slate-500 text-xs">· {PLATFORM_CHAR_LIMIT[p]} char cap{p === "instagram" ? " · auto image" : ""}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 mt-1">The agent tailors hooks, length, and hashtags to this platform.</p>
          </div>
          <div>
            <Label htmlFor="m-name">Mission name</Label>
            <Input id="m-name" data-testid="input-mission-name" placeholder="Engineering thought leadership"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label htmlFor="m-brief">Brief</Label>
            <Textarea id="m-brief" data-testid="input-mission-brief"
              placeholder="Build an audience of senior engineers and EMs around scaling distributed systems and team leadership."
              value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })}
              className="bg-white/5 border-white/10 min-h-[100px]" />
          </div>
          <div>
            <Label htmlFor="m-goal">Goal (one sentence)</Label>
            <Input id="m-goal" data-testid="input-mission-goal"
              placeholder="Reach 5,000 senior-engineer followers in 90 days."
              value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="bg-white/5 border-white/10" />
            <p className="text-[11px] text-slate-500 mt-1">The agent uses this as the north star in every prompt and critique.</p>
          </div>
          <div>
            <Label htmlFor="m-inspo">Inspiration links (optional)</Label>
            <Textarea id="m-inspo" data-testid="input-mission-inspiration"
              placeholder="https://linkedin.com/in/...&#10;@some-handle&#10;https://example.com/great-post"
              value={form.inspirationLinksRaw} onChange={(e) => setForm({ ...form, inspirationLinksRaw: e.target.value })}
              className="bg-white/5 border-white/10 min-h-[60px]" />
            <p className="text-[11px] text-slate-500 mt-1">One per line. The agent studies tone and structure (not copy).</p>
          </div>
          <div>
            <Label>Tone preset</Label>
            <Select value={form.brandVoiceProfileId || form.tonePreset} onValueChange={(v) => {
              const isProfile = (voices.data || []).some((p: any) => p.id === v);
              setForm({ ...form, brandVoiceProfileId: isProfile ? v : "", tonePreset: isProfile ? "" : v });
            }}>
              <SelectTrigger data-testid="select-tone-preset" className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(voices.data && voices.data.length > 0) && (
                  <>
                    {voices.data.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>From your brand voice — {p.name || "default"}</SelectItem>
                    ))}
                  </>
                )}
                {TONE_PRESETS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Viralyz</Label>
              <Select value={form.cadence} onValueChange={(v) => setForm({ ...form, cadence: v })}>
                <SelectTrigger data-testid="select-cadence" className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posts / week</Label>
              <Input type="number" min={1} max={7} value={form.postsPerWeek}
                data-testid="input-posts-per-week"
                onChange={(e) => setForm({ ...form, postsPerWeek: parseInt(e.target.value) || 3 })}
                className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <Label>Approval mode</Label>
            <Select value={form.approvalMode} onValueChange={(v) => setForm({ ...form, approvalMode: v })}>
              <SelectTrigger data-testid="select-approval-mode" className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="review">Review every post (recommended)</SelectItem>
                <SelectItem value="auto">Auto-approve after delay</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 mt-1">
              {form.approvalMode === "auto"
                ? "v0 always pauses here. Nothing is posted until you click Approve."
                : "Every draft waits for your explicit click before it posts."}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div>
              <div className="text-sm font-medium">Use my brand voice</div>
              <div className="text-xs text-slate-400">Weave in your tone and signature moves.</div>
            </div>
            <Switch checked={form.useBrandVoice} onCheckedChange={(v) => setForm({ ...form, useBrandVoice: v })} data-testid="switch-brand-voice" />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300 flex items-center gap-2" data-testid={`text-${form.platform}-account`}>
            <span className="h-2 w-2 rounded-full" style={{ background: connStatus.data?.connected ? "#34d399" : "#f87171" }} />
            {connStatus.data?.connected ? (
              <span>Posting as <span className="font-medium text-white">{connStatus.data?.profileName || connStatus.data?.account?.displayName || `your ${PLATFORM_LABEL[form.platform]} account`}</span></span>
            ) : connStatus.data?.configured ? (
              <span>{PLATFORM_LABEL[form.platform]} isn't connected yet — the agent will draft, but you'll need to connect before approving.</span>
            ) : (
              <span>{PLATFORM_LABEL[form.platform]} isn't configured on the server. Drafts will still generate; publishing is disabled.</span>
            )}
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90 flex gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <span>v0 always pauses for your approval before posting. The agent never publishes silently.</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button data-testid="button-create-mission" onClick={() => create.mutate()}
            disabled={!form.name || !form.brief || create.isPending}
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Launch mission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toLocalDateTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function IdeaSelectionCard({ run, mission, onChange }: { run: MissionRun; mission?: Mission; onChange: () => void }) {
  const { toast } = useToast();
  const ideas: Idea[] = run.proposedIdeas ?? [];
  const [picking, setPicking] = useState<number | null>(null);
  const select = useMutation({
    mutationFn: async (index: number) => {
      const res = await apiRequest("POST", `/api/runs/${run.id}/select-idea`, { index });
      return res.json();
    },
    onSuccess: () => { toast({ title: "Drafting", description: "The agent is writing your post now." }); onChange(); },
    onError: (e: any) => toast({ title: "Couldn't pick that idea", description: String(e?.message || e), variant: "destructive" }),
  });
  const regen = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/runs/${run.id}/regenerate`, { feedback: "Show me different angles" });
      return res.json();
    },
    onSuccess: () => { toast({ title: "Regenerating", description: "Fresh ideas coming up." }); onChange(); },
  });
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card-pop p-5 space-y-4 border-amber-500/20"
      data-testid={`idea-gate-${run.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <div className="text-eyebrow text-amber-300 mb-1">Pick the angle · Gate 1 of 2</div>
          <div className="text-h3">Which idea should I draft?</div>
          <p className="text-sm text-slate-400">Mission: {mission?.name || "LinkedIn"}. Pick one and I'll write it up for your approval.</p>
        </div>
      </div>
      {ideas.length === 0 ? (
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Generating ideas…
        </div>
      ) : (
        <div className="grid gap-2">
          {ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => { setPicking(i); select.mutate(i); }}
              disabled={select.isPending}
              data-testid={`button-pick-idea-${run.id}-${i}`}
              className="text-left rounded-lg border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/[0.04] p-3 transition-all disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 pt-1 w-8">#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-100 mb-1">{idea.title}</div>
                  {idea.hook && <div className="text-xs text-slate-400 line-clamp-2">"{idea.hook}"</div>}
                </div>
                {picking === i && select.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-300" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-white/[0.05]"
          onClick={() => regen.mutate()} disabled={regen.isPending} data-testid={`button-regen-ideas-${run.id}`}>
          {regen.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
          Show me different ideas
        </Button>
      </div>
    </motion.div>
  );
}

type IdeaOutput = { title: string; hook?: string };
type IdeateStepOutput = { count?: number; titles?: string[]; ideas?: IdeaOutput[] };
type HookCandidate = { text: string; style?: string; score?: number; reasoning?: string };
type HooksStepOutput = {
  hookText?: string; score?: number; count?: number;
  bestHookIndex?: number; bestHookExplanation?: string;
  candidates?: HookCandidate[];
};
type ScoreBreakdown = { hook?: number; visual?: number; structure?: number; metadata?: number; timing?: number };
type ScoreStepOutput = { viralScore?: number; breakdown?: ScoreBreakdown };
type CritiqueStepOutput = { critique?: string; refinedText?: string };

type WhyStep = {
  id: string;
  kind: string;
  status: string;
  output: unknown;
};

type WhyRun = MissionRun & { selectedIdeaIndex?: number | null };

function findStepOutput<T>(steps: WhyStep[], kind: string): T | undefined {
  const step = steps.find((s) => s.kind === kind);
  if (!step || typeof step.output !== "object" || step.output === null) return undefined;
  return step.output as T;
}

function WhyThisDraft({ runId }: { runId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery<{ run: WhyRun; steps: WhyStep[] }>({
    queryKey: [`/api/runs/${runId}`],
    enabled: open,
  });
  const steps = data?.steps ?? [];
  const ideateOut = findStepOutput<IdeateStepOutput>(steps, "ideate");
  const hooksOut = findStepOutput<HooksStepOutput>(steps, "hooks");
  const scoreOut = findStepOutput<ScoreStepOutput>(steps, "score");
  const critiqueOut = findStepOutput<CritiqueStepOutput>(steps, "critique");

  const ideas: IdeaOutput[] = ideateOut?.ideas ?? [];
  const candidates: HookCandidate[] = hooksOut?.candidates ?? [];
  const bestHookIndex = hooksOut?.bestHookIndex;
  const bestHookExplanation = hooksOut?.bestHookExplanation;
  const breakdown = scoreOut?.breakdown;
  const viralScore = scoreOut?.viralScore;
  const critiqueText = critiqueOut?.critique;
  const selectedIdeaIndex = data?.run?.selectedIdeaIndex ?? null;

  return (
    <div className="rounded-lg border border-orange-500/20 bg-orange-500/[0.03]" data-testid={`why-this-draft-${runId}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-orange-200 hover:bg-orange-500/[0.06] rounded-lg transition-colors"
        data-testid={`button-why-${runId}`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Why this draft?</span>
        <span className="text-[10px] text-slate-500 font-normal">— see the angles, hooks &amp; score the agent considered</span>
        <ChevronDown className={cn("h-3.5 w-3.5 ml-auto transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 text-xs">
          {isLoading && (
            <div className="text-slate-400 inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading the agent's thinking…
            </div>
          )}
          {!isLoading && ideas.length > 0 && (
            <div data-testid={`why-ideas-${runId}`}>
              <div className="text-eyebrow text-slate-500 mb-1.5 inline-flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3" /> Trending angles considered ({ideas.length})
              </div>
              <ul className="space-y-1">
                {ideas.map((idea, i) => {
                  const picked = i === selectedIdeaIndex;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rounded border px-2 py-1.5",
                        picked
                          ? "border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-100"
                          : "border-white/[0.06] bg-white/[0.02] text-slate-300"
                      )}
                      data-testid={`why-idea-${runId}-${i}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-slate-500 pt-0.5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{idea.title}</div>
                          {idea.hook && <div className="text-[11px] text-slate-400 mt-0.5">"{idea.hook}"</div>}
                        </div>
                        {picked && <span className="text-[9px] uppercase tracking-wider text-emerald-300">Picked</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {!isLoading && candidates.length > 0 && (
            <div data-testid={`why-hooks-${runId}`}>
              <div className="text-eyebrow text-slate-500 mb-1.5 inline-flex items-center gap-1.5">
                <Target className="h-3 w-3" /> Candidate hooks ({candidates.length})
              </div>
              <ul className="space-y-1">
                {candidates.map((h, i) => {
                  const picked = i === bestHookIndex;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rounded border px-2 py-1.5",
                        picked
                          ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                          : "border-white/[0.06] bg-white/[0.02]"
                      )}
                      data-testid={`why-hook-${runId}-${i}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          "text-[10px] font-semibold w-7 text-right pt-0.5",
                          (h.score ?? 0) >= 80 ? "text-emerald-300" : (h.score ?? 0) >= 60 ? "text-orange-300" : "text-slate-400"
                        )}>{h.score ?? "—"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-100">"{h.text}"</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {h.style && <span className="capitalize">{h.style}</span>}
                            {h.reasoning && <span> · {h.reasoning}</span>}
                          </div>
                        </div>
                        {picked && <span className="text-[9px] uppercase tracking-wider text-emerald-300 pt-0.5">Picked</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {bestHookExplanation && (
                <p className="mt-1.5 text-[11px] text-emerald-200/80 italic" data-testid={`why-hook-explanation-${runId}`}>
                  Why this hook beat the others: {bestHookExplanation}
                </p>
              )}
            </div>
          )}
          {!isLoading && breakdown && (
            <div data-testid={`why-score-${runId}`}>
              <div className="text-eyebrow text-slate-500 mb-1.5 inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Analysis breakdown
                {viralScore != null && <span className="text-orange-300">· predicted {viralScore}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {Object.entries(breakdown).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-center"
                    data-testid={`why-score-${runId}-${k}`}
                  >
                    <div className={cn(
                      "text-sm font-semibold",
                      (v ?? 0) >= 80 ? "text-emerald-300" : (v ?? 0) >= 60 ? "text-orange-300" : "text-slate-300"
                    )}>{v}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isLoading && critiqueText && (
            <div data-testid={`why-critique-${runId}`}>
              <div className="text-eyebrow text-slate-500 mb-1.5">Self-critique</div>
              <p className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-slate-300 italic">{critiqueText}</p>
            </div>
          )}
          {!isLoading && ideas.length === 0 && candidates.length === 0 && !breakdown && (
            <div className="text-slate-500 italic">The agent didn't record reasoning for this draft.</div>
          )}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ run, mission, onChange }: { run: MissionRun; mission?: Mission; onChange: () => void }) {
  const { toast } = useToast();
  const [text, setText] = useState(run.finalText || "");
  const [editing, setEditing] = useState(false);
  const initialSchedule = run.scheduledFor ? toLocalDateTimeInput(new Date(run.scheduledFor)) : "";
  const [scheduledFor, setScheduledFor] = useState<string>(initialSchedule);
  const [feedback, setFeedback] = useState("");
  const [showRegen, setShowRegen] = useState(false);

  const approve = useMutation({
    mutationFn: async () => {
      const body: any = {};
      if (editing) body.finalText = text;
      if (scheduledFor && scheduledFor !== initialSchedule) {
        body.scheduledFor = new Date(scheduledFor).toISOString();
      }
      const res = await apiRequest("POST", `/api/runs/${run.id}/approve`, body);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Approved", description: "Your post is queued for the chosen slot." });
      onChange();
    },
    onError: (e: any) => toast({ title: "Couldn't approve", description: String(e?.message || e), variant: "destructive" }),
  });
  const regenerate = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/runs/${run.id}/reject`, { regenerate: true, reason: feedback || "Try a different angle" });
      return res.json();
    },
    onSuccess: () => { toast({ title: "Regenerating", description: "Fresh ideas coming up." }); setShowRegen(false); onChange(); },
  });
  const reject = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/runs/${run.id}/reject`, { reason: feedback || "Not on brand" });
    },
    onSuccess: () => { toast({ title: "Rejected" }); setShowRegen(false); onChange(); },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card-pop p-5 space-y-4 border-amber-500/20"
      data-testid={`approval-${run.id}`}
    >
      <div className="flex items-start gap-4">
        <ScoreRing score={run.predictedScore || 0} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Linkedin className="h-3.5 w-3.5" />
            <span className="truncate">{mission?.name || "LinkedIn mission"}</span>
          </div>
          <div className="text-h3 mb-2">Sign off · Gate 2 of 2</div>
          {editing ? (
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="bg-white/5 border-white/10 min-h-[180px] text-sm" data-testid={`textarea-edit-${run.id}`} />
          ) : (
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-sm whitespace-pre-wrap text-slate-200" data-testid={`text-draft-${run.id}`}>
              {run.finalText}
            </div>
          )}
          {run.finalHashtags && run.finalHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {run.finalHashtags.map((t, i) => (
                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300">{t.startsWith("#") ? t : `#${t}`}</span>
              ))}
            </div>
          )}
          <div className="mt-3 grid sm:grid-cols-[auto_1fr] items-center gap-2 text-xs">
            <label className="text-slate-400 inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Post at
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              data-testid={`input-schedule-${run.id}`}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-slate-100"
            />
          </div>
        </div>
      </div>

      <WhyThisDraft runId={run.id} />

      {showRegen && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2" data-testid={`regen-panel-${run.id}`}>
          <div className="text-xs text-amber-200">Tell the agent what to do differently:</div>
          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="e.g. punchier hook, less salesy, focus on the data point"
            className="bg-white/5 border-white/10 min-h-[80px] text-sm" data-testid={`textarea-feedback-${run.id}`} />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowRegen(false)}>Cancel</Button>
            <div className="flex-1" />
            <Button size="sm" variant="ghost" className="text-rose-300" onClick={() => reject.mutate()} disabled={reject.isPending} data-testid={`button-reject-only-${run.id}`}>
              Reject only
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
              onClick={() => regenerate.mutate()} disabled={regenerate.isPending} data-testid={`button-regenerate-${run.id}`}>
              {regenerate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
              Regenerate with feedback
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/[0.05]"
          data-testid={`button-edit-${run.id}`} onClick={() => setEditing(!editing)}>
          {editing ? "Cancel edit" : "Edit text"}
        </Button>
        <Button variant="ghost" size="sm" className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
          data-testid={`button-reject-${run.id}`} onClick={() => setShowRegen(true)}>
          <XCircle className="h-4 w-4 mr-1.5" /> Reject / regenerate
        </Button>
        <div className="flex-1" />
        <Button data-testid={`button-approve-${run.id}`} onClick={() => approve.mutate()} disabled={approve.isPending}
          className="gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
          {approve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve & schedule
        </Button>
      </div>
    </motion.div>
  );
}

function RunRow({ run }: { run: MissionRun }) {
  const [, navigate] = useLocation();
  return (
    <button
      type="button"
      onClick={() => navigate(`/autopilot/${run.missionId}`)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-sm text-left"
      data-testid={`run-row-${run.id}`}
      title="Open the full step trail for this run"
    >
      <StatusPill status={run.status} />
      <div className="flex-1 truncate text-slate-300">{run.finalText?.slice(0, 80) || <span className="text-slate-500 italic">(drafting…)</span>}</div>
      {run.predictedScore != null && <span className="text-xs text-slate-400">{run.predictedScore}</span>}
      {run.actualImpressions != null && <span className="text-xs text-cyan-300">{run.actualImpressions.toLocaleString()} views</span>}
      <span className="text-[10px] text-slate-500 w-20 text-right">{new Date(run.createdAt).toLocaleDateString()}</span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
    </button>
  );
}

function MissionCard({ mission, onChange }: { mission: Mission; onChange: () => void }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const toggle = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/missions/${mission.id}`, { status: mission.status === "active" ? "paused" : "active" });
    },
    onSuccess: onChange,
  });
  const remove = useMutation({
    mutationFn: async () => { await apiRequest("DELETE", `/api/missions/${mission.id}`); },
    onSuccess: () => { toast({ title: "Mission archived" }); onChange(); },
  });
  return (
    <div className="card-base p-4 hover:border-orange-500/30 transition-all cursor-pointer" data-testid={`mission-card-${mission.id}`} onClick={() => navigate(`/autopilot/${mission.id}`)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Linkedin className="h-3.5 w-3.5 text-orange-300" />
            <span className="text-eyebrow text-slate-500">{mission.cadence} · {mission.postsPerWeek}/week</span>
            {mission.status === "paused" && <Badge className="bg-slate-700 text-slate-200 text-[9px]">Paused</Badge>}
          </div>
          <div className="text-h3 truncate">{mission.name}</div>
          <p className="text-sm text-slate-400 line-clamp-2 mt-1">{mission.brief}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggle.mutate(); }} data-testid={`button-toggle-${mission.id}`}>
            {mission.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-white/[0.04]">
        {mission.useBrandVoice && <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Brand voice</span>}
        {mission.nextRunAt && <span>Next: {new Date(mission.nextRunAt).toLocaleDateString()}</span>}
        <span className="ml-auto inline-flex items-center text-orange-300">Open <ChevronRight className="h-3 w-3" /></span>
      </div>
    </div>
  );
}

function PlatformStatusCard({ platform, status }: { platform: PlatformId; status: ConnectionStatus }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const label = PLATFORM_LABEL[platform];
  const disconnect = useMutation({
    mutationFn: async () => { await apiRequest("POST", `/api/${platform}/disconnect`, {}); },
    onSuccess: () => { toast({ title: `${label} disconnected` }); qc.invalidateQueries({ queryKey: [`/api/${platform}/status`] }); },
  });
  if (!status.configured) {
    return (
      <div className="card-base p-4 border-amber-500/20" data-testid={`${platform}-not-configured`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">{label} not configured</div>
            <p className="text-sm text-slate-400 mt-1">Server keys are missing. Until then, missions can still draft for {label} and you can copy posts manually.</p>
          </div>
        </div>
      </div>
    );
  }
  if (!status.connected) {
    return (
      <div className="card-base p-4 border-orange-500/20" data-testid={`${platform}-connect`}>
        <div className="flex items-center gap-3">
          <Linkedin className="h-5 w-5 text-orange-300" />
          <div className="flex-1">
            <div className="font-medium">Connect your {label}</div>
            <p className="text-sm text-slate-400">Authorize Viralyz to publish on your behalf.</p>
          </div>
          <Button data-testid={`button-connect-${platform}`} asChild className="bg-orange-600 hover:bg-orange-500 text-white border-0">
            <a href={`/api/${platform}/connect`}>Connect</a>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="card-base p-4 border-emerald-500/20" data-testid={`${platform}-connected`}>
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <div className="flex-1">
          <div className="font-medium">{label} connected</div>
          <p className="text-sm text-slate-400">Posting as <span className="text-slate-200">{status.profileName || status.account?.displayName || "your account"}</span></p>
        </div>
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-rose-300" onClick={() => disconnect.mutate()} data-testid={`button-disconnect-${platform}`}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}

type StepRow = {
  id: string; runId: string; ord: number; kind: string; status: string;
  toolCall?: string | null; input?: any; output?: any; error?: string | null;
  reasoning?: string | null; tokenCost?: number; creditCost?: number;
  startedAt?: string | null; finishedAt?: string | null;
};

function StepCard({ step }: { step: StepRow }) {
  const [open, setOpen] = useState(false);
  const tone = step.status === "failed"
    ? "border-rose-500/30 bg-rose-500/[0.04]"
    : step.kind.startsWith("await")
      ? "border-amber-500/30 bg-amber-500/[0.04]"
      : "border-white/10 bg-white/[0.02]";
  const dur = step.startedAt && step.finishedAt
    ? Math.max(0, new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime())
    : null;
  return (
    <div className={`rounded-lg border ${tone} p-3`} data-testid={`step-${step.id}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left flex items-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 w-10">#{step.ord}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-100">{step.kind}{step.toolCall ? <span className="text-slate-500"> · {step.toolCall}</span> : null}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
            <span>{step.status}</span>
            {dur !== null && <span>· {dur}ms</span>}
            {!!step.tokenCost && <span className="text-orange-300">· ~{step.tokenCost} tok</span>}
            {!!step.creditCost && <span className="text-amber-300">· {step.creditCost} cr</span>}
            {step.error && <span className="text-rose-300">· {step.error.slice(0, 60)}</span>}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-[11px]">
          {step.reasoning && (
            <div className="rounded bg-orange-500/[0.06] border border-orange-500/20 p-2 text-slate-200" data-testid={`step-reasoning-${step.id}`}>
              <span className="text-orange-300">reasoning:</span> {step.reasoning}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-2">
            <pre className="rounded bg-black/40 border border-white/[0.06] p-2 overflow-auto max-h-48 text-slate-300" data-testid={`step-input-${step.id}`}>
              <span className="text-slate-500">input:</span>{"\n"}{step.input ? JSON.stringify(step.input, null, 2) : "—"}
            </pre>
            <pre className="rounded bg-black/40 border border-white/[0.06] p-2 overflow-auto max-h-48 text-slate-300" data-testid={`step-output-${step.id}`}>
              <span className="text-slate-500">output:</span>{"\n"}{step.output ? JSON.stringify(step.output, null, 2) : "—"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function RunInspector({ runId, mission, onChange }: { runId: string; mission?: Mission; onChange: () => void }) {
  const { toast } = useToast();
  const { data, refetch } = useQuery<{ run: MissionRun; steps: StepRow[] }>({
    queryKey: [`/api/runs/${runId}`],
    refetchInterval: (q) => {
      const r = q.state.data?.run;
      if (!r) return 4000;
      const live = ["pending","pending_draft","running","posting","measuring","awaiting_idea","awaiting_approval","approved"].includes(r.status);
      return live ? 4000 : false;
    },
  });
  const ctl = useMutation({
    mutationFn: async (action: "pause" | "resume" | "cancel") => {
      await apiRequest("POST", `/api/runs/${runId}/${action}`, {});
      return action;
    },
    onSuccess: (action) => { toast({ title: `Run ${action}d` }); refetch(); onChange(); },
    onError: (e: any) => toast({ title: "Couldn't update run", description: String(e?.message || e), variant: "destructive" }),
  });
  if (!data) return <div className="card-base p-4 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading run…</div>;
  const { run, steps } = data;
  const refresh = () => { refetch(); onChange(); };
  const tokens = steps.reduce((a, s) => a + (s.tokenCost || 0), 0);
  const credits = steps.reduce((a, s) => a + (s.creditCost || 0), 0);
  const terminal = ["posted","complete","cancelled","rejected","failed"].includes(run.status);
  return (
    <div className="card-base p-4 space-y-3" data-testid={`run-inspector-${runId}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill status={run.status} />
        <div className="text-xs text-slate-400">Run · {new Date(run.createdAt).toLocaleString()}</div>
        {run.predictedScore != null && <div className="text-xs text-orange-300">predicted {run.predictedScore}</div>}
        {run.actualImpressions != null && <div className="text-xs text-cyan-300">{run.actualImpressions.toLocaleString()} views</div>}
        {tokens > 0 && <div className="text-xs text-orange-300" data-testid={`run-tokens-${runId}`}>~{tokens.toLocaleString()} tok</div>}
        {credits > 0 && <div className="text-xs text-amber-300" data-testid={`run-credits-${runId}`}>{credits} cr</div>}
        <div className="flex-1" />
        {!terminal && run.status !== "paused" && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-300" onClick={() => ctl.mutate("pause")} disabled={ctl.isPending} data-testid={`button-pause-run-${runId}`}>
            <Pause className="h-3.5 w-3.5 mr-1" /> Pause
          </Button>
        )}
        {run.status === "paused" && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-300" onClick={() => ctl.mutate("resume")} disabled={ctl.isPending} data-testid={`button-resume-run-${runId}`}>
            <Play className="h-3.5 w-3.5 mr-1" /> Resume
          </Button>
        )}
        {!terminal && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-rose-300" onClick={() => ctl.mutate("cancel")} disabled={ctl.isPending} data-testid={`button-cancel-run-${runId}`}>
            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        )}
      </div>
      {run.status === "awaiting_idea" && (
        <IdeaSelectionCard run={run} mission={mission} onChange={refresh} />
      )}
      {run.status === "awaiting_approval" && (
        <ApprovalCard run={run} mission={mission} onChange={refresh} />
      )}
      <div className="space-y-1.5" data-testid={`run-timeline-${runId}`}>
        <div className="text-eyebrow text-slate-500">Agent timeline · {steps.length} step{steps.length === 1 ? "" : "s"}</div>
        {steps.length === 0 ? (
          <div className="text-xs text-slate-500 italic">No steps yet — the agent is warming up.</div>
        ) : (
          steps.map((s) => <StepCard key={s.id} step={s} />)
        )}
      </div>
    </div>
  );
}

function MissionInspectorPage({ missionId, onBack }: { missionId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: mission } = useQuery<Mission[], Error, Mission | undefined>({
    queryKey: [`/api/missions`],
    select: (rows) => rows.find((m) => m.id === missionId),
  });
  const { data: runs = [], refetch: refetchRuns } = useQuery<MissionRun[]>({
    queryKey: [`/api/missions/${missionId}/runs`],
    refetchInterval: 6_000,
  });
  const { data: cost } = useQuery<{ runs: number; steps: number; tokens: number; credits: number }>({
    queryKey: [`/api/missions/${missionId}/cost`],
    refetchInterval: 10_000,
  });
  const refresh = () => { refetchRuns(); qc.invalidateQueries({ queryKey: ["/api/autopilot/state"] }); qc.invalidateQueries({ queryKey: [`/api/missions/${missionId}/cost`] }); };
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <button onClick={onBack} data-testid="button-back-missions" className="text-sm text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to mission control
        </button>
        <PageHeader
          eyebrow="Mission"
          title={
            <span className="inline-flex items-center gap-2">
              <Bot className="h-6 w-6 text-orange-300" /> {mission?.name || "Mission"}
            </span>
          }
          description={mission?.brief}
        />
        {cost && (cost.runs > 0) && (
          <div className="grid grid-cols-4 gap-3 text-center" data-testid="mission-cost-summary">
            <div className="card-base p-3"><div className="text-h3 text-slate-100">{cost.runs}</div><div className="text-meta">Runs</div></div>
            <div className="card-base p-3"><div className="text-h3 text-slate-100">{cost.steps}</div><div className="text-meta">Steps</div></div>
            <div className="card-base p-3"><div className="text-h3 text-orange-300">~{cost.tokens.toLocaleString()}</div><div className="text-meta">Tokens</div></div>
            <div className="card-base p-3"><div className="text-h3 text-amber-300">{cost.credits}</div><div className="text-meta">Credits</div></div>
          </div>
        )}
        <div className="space-y-3">
          <h2 className="text-h2">Runs · live timeline</h2>
          {runs.length === 0 ? (
            <EmptyState icon={Zap} title="No runs yet" description="The agent will draft the first run within minutes." />
          ) : (
            <div className="space-y-3">
              {runs.map((r) => (
                <RunInspector key={r.id} runId={r.id} mission={mission} onChange={refresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AutopilotPage() {
  const params = useParams<{ missionId?: string }>();
  const [, navigate] = useLocation();
  if (params.missionId) {
    return <MissionInspectorPage missionId={params.missionId} onBack={() => navigate("/autopilot")} />;
  }
  return <AutopilotHomePage />;
}

function AutopilotHomePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: state, refetch: refetchState } = useQuery<AutopilotState>({
    queryKey: ["/api/autopilot/state"],
    refetchInterval: 15_000,
  });
  const { data: missionsList = [], refetch: refetchMissions } = useQuery<Mission[]>({
    queryKey: ["/api/missions"],
  });
  const { data: linkedin } = useQuery<ConnectionStatus>({ queryKey: ["/api/linkedin/status"] });
  const { data: xStatus } = useQuery<ConnectionStatus>({ queryKey: ["/api/x/status"] });
  const { data: threads } = useQuery<ConnectionStatus>({ queryKey: ["/api/threads/status"] });
  const { data: instagram } = useQuery<ConnectionStatus>({ queryKey: ["/api/instagram/status"] });

  const refresh = () => {
    refetchState();
    refetchMissions();
    qc.invalidateQueries({ queryKey: ["/api/autopilot/state"] });
  };

  const togglePause = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/autopilot/pause", { paused: !state?.paused });
    },
    onSuccess: () => { refetchState(); toast({ title: state?.paused ? "Autopilot resumed" : "Autopilot paused" }); },
  });

  const awaitingApproval = state?.recentRuns?.filter((r) => r.status === "awaiting_approval") || [];
  const awaitingIdea = state?.recentRuns?.filter((r) => r.status === "awaiting_idea") || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <PageHeader
          eyebrow="Autopilot · v0"
          title={
            <span className="inline-flex items-center gap-3">
              <Bot className="h-7 w-7 text-orange-300" />
              Your autonomous growth agent
            </span>
          }
          description="Set a mission. The agent ideates, drafts, scores, and schedules. You approve. It learns from every post."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-white/10",
                  state?.paused && "border-rose-500/30 text-rose-300"
                )}
                onClick={() => togglePause.mutate()}
                data-testid="button-killswitch"
              >
                {state?.paused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause all</>}
              </Button>
              <NewMissionDialog onCreated={(id) => { refresh(); if (id) navigate(`/autopilot/${id}`); }} />
            </div>
          }
        />

        {state?.paused && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200 flex items-center gap-2" data-testid="banner-paused">
            <ShieldAlert className="h-4 w-4" /> Autopilot is paused. No drafting, no posting, no measuring until you resume.
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3" data-testid="platform-status-grid">
          {linkedin && <PlatformStatusCard platform="linkedin" status={linkedin} />}
          {xStatus && <PlatformStatusCard platform="x" status={xStatus} />}
          {threads && <PlatformStatusCard platform="threads" status={threads} />}
          {instagram && <PlatformStatusCard platform="instagram" status={instagram} />}
        </div>

        {/* Approval queue — the main thing */}
        {awaitingIdea.length > 0 && (
          <section className="space-y-3" data-testid="section-awaiting-idea">
            <div className="flex items-center justify-between">
              <h2 className="text-h2">Pick the angle</h2>
              <span className="text-meta text-amber-300">{awaitingIdea.length} ready to choose</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {awaitingIdea.map((r) => (
                <IdeaSelectionCard key={r.id} run={r} mission={missionsList.find((m) => m.id === r.missionId)} onChange={refresh} />
              ))}
            </div>
          </section>
        )}

        {awaitingApproval.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-h2">Approval queue</h2>
              <span className="text-meta text-amber-300">{awaitingApproval.length} waiting</span>
            </div>
            <AnimatePresence>
              {awaitingApproval.map((r) => (
                <ApprovalCard key={r.id} run={r} mission={missionsList.find((m) => m.id === r.missionId)} onChange={refresh} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Missions */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-h2">Missions</h2>
            <span className="text-meta text-slate-500">{state?.activeMissions || 0} active</span>
          </div>
          {missionsList.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No missions yet"
              description="Launch a mission and watch the agent work. It’ll draft your first post within minutes."
              action={<NewMissionDialog onCreated={(id) => { refresh(); if (id) navigate(`/autopilot/${id}`); }} />}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {missionsList.map((m) => <MissionCard key={m.id} mission={m} onChange={refresh} />)}
            </div>
          )}
        </div>

        {/* Prediction accuracy + weekly learnings */}
        <AccuracySection />

        {/* Recent activity */}
        {state && state.recentRuns.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-h2">Recent runs</h2>
            <div className="card-base p-2 space-y-0.5">
              {state.recentRuns.map((r) => <RunRow key={r.id} run={r} />)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
