import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, ArrowRight, Sparkles, Zap, Wand2, Lightbulb, Radar, Calendar,
  Image as ImageIcon, Mic2, Bookmark, Repeat, CheckCircle2, Clock,
  Linkedin, Plus, Pause, Play, ShieldAlert, ChevronRight, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Mission = {
  id: string;
  name: string;
  status: string;
  cadence: string;
  postsPerWeek: number;
  nextRunAt: string | null;
};

type MissionRun = {
  id: string;
  missionId: string;
  status: string;
  finalText: string | null;
  predictedScore: number | null;
  scheduledFor: string | null;
  postedAt: string | null;
  actualImpressions: number | null;
  createdAt: string;
};

type AutopilotState = {
  paused: boolean;
  linkedinConfigured: boolean;
  missions: number;
  activeMissions: number;
  awaitingApproval: number;
  recentRuns: MissionRun[];
};

type LinkedInStatus = {
  configured: boolean;
  connected: boolean;
  account: { displayName: string | null } | null;
};

const manualTools = [
  { icon: Zap, title: "Hook Lab", href: "/hook-lab" },
  { icon: Wand2, title: "Caption Studio", href: "/caption-studio" },
  { icon: Lightbulb, title: "Ideas", href: "/ideas" },
  { icon: ImageIcon, title: "Thumbnails", href: "/thumbnails" },
  { icon: Radar, title: "Trends", href: "/trends" },
  { icon: Bookmark, title: "Swipe File", href: "/swipe-file" },
  { icon: Repeat, title: "Repurpose", href: "/repurpose" },
  { icon: Mic2, title: "Brand Voice", href: "/brand-voice" },
];

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  awaiting_approval: { label: "Needs you", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  approved: { label: "Approved", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  posting: { label: "Posting", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  posted: { label: "Posted", tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  complete: { label: "Complete", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  running: { label: "Drafting", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  pending: { label: "Queued", tone: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  failed: { label: "Failed", tone: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: autopilot } = useQuery<AutopilotState>({
    queryKey: ["/api/autopilot/state"],
    refetchInterval: 30_000,
  });
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ["/api/missions"],
  });
  const { data: linkedin } = useQuery<LinkedInStatus>({ queryKey: ["/api/linkedin/status"] });
  const { data: intel } = useQuery<{ competitors: Array<{ id: string; name: string; latestDigest: { postsThisWeek: number; qualifiedEngagement: number } | null }> }>({
    queryKey: ["/api/intelligence/competitors"],
  });
  const intelCompetitors = intel?.competitors ?? [];
  const intelSignalCount = intelCompetitors.reduce((sum, c) => sum + (c.latestDigest?.postsThisWeek ?? 0), 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const name = user?.firstName || (user?.email?.split("@")[0]) || "creator";
  const awaiting = autopilot?.recentRuns?.filter((r) => r.status === "awaiting_approval") || [];
  const activeMissions = missions.filter((m) => m.status === "active");

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <PageHeader
          eyebrow={`${greeting}, ${name}`}
          title={
            <span className="inline-flex items-center gap-3">
              <Bot className="h-7 w-7 text-orange-300" />
              Mission Control
            </span>
          }
          description="Here's what your agent is working on right now."
          actions={
            <Button asChild className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-0 shadow-[0_0_24px_-8px_rgba(245, 158, 11,0.6)]" data-testid="button-new-mission-dash">
              <Link href="/autopilot"><Plus className="h-4 w-4" /> New mission</Link>
            </Button>
          }
        />

        {autopilot?.paused && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200 flex items-center gap-2" data-testid="banner-paused">
            <ShieldAlert className="h-4 w-4" /> Autopilot is paused.
            <Link href="/autopilot" className="ml-auto underline hover:text-rose-100">Resume</Link>
          </div>
        )}

        {/* Top row: agent status + LinkedIn */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/autopilot" className="card-pop p-5 block hover:border-orange-500/40 transition-all md:col-span-2" data-testid="card-agent-status">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_24px_-4px_rgba(245, 158, 11,0.5)]",
                    autopilot?.paused
                      ? "bg-slate-700"
                      : "bg-gradient-to-br from-orange-500 to-amber-500",
                  )}>
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-eyebrow text-slate-500">Your agent</div>
                    <div className="text-h2 leading-tight">
                      {autopilot?.paused
                        ? "Paused"
                        : (activeMissions.length > 0 ? `Running ${activeMissions.length} mission${activeMissions.length === 1 ? "" : "s"}` : "Standing by")}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <div className="text-2xl font-bold text-amber-300">{autopilot?.awaitingApproval || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Awaiting you</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <div className="text-2xl font-bold text-orange-300">{autopilot?.activeMissions || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Active missions</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-300">{autopilot?.recentRuns?.filter((r) => r.status === "posted" || r.status === "complete").length || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Recently posted</div>
                </div>
              </div>
          </Link>

          <div className="card-base p-5" data-testid="card-linkedin">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#0077B5]/15 flex items-center justify-center">
                <Linkedin className="h-5 w-5 text-[#0A85C7]" />
              </div>
              <div className="flex-1">
                <div className="text-eyebrow text-slate-500">LinkedIn</div>
                <div className="text-sm font-semibold">
                  {linkedin?.connected ? "Connected" : linkedin?.configured ? "Not connected" : "Not configured"}
                </div>
              </div>
            </div>
            {linkedin?.connected ? (
              <div className="text-xs text-slate-400 truncate">{linkedin.account?.displayName}</div>
            ) : linkedin?.configured ? (
              <Button asChild size="sm" className="w-full bg-[#0077B5] hover:bg-[#006399] text-white border-0">
                <a href="/api/linkedin/connect">Connect</a>
              </Button>
            ) : (
              <p className="text-xs text-slate-500">Ask the admin to set LinkedIn keys.</p>
            )}
          </div>
        </div>

        {/* Approval queue spotlight */}
        {awaiting.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-h2 inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400 animate-pulse" /> Waiting on you
              </h2>
              <Link href="/autopilot" className="text-sm text-orange-300 hover:text-orange-200">Open queue <ArrowRight className="inline h-3.5 w-3.5" /></Link>
            </div>
            <div className="space-y-2">
              {awaiting.slice(0, 3).map((r) => {
                const m = missions.find((mm) => mm.id === r.missionId);
                return (
                  <Link key={r.id} href="/autopilot" className="card-base p-4 hover:border-amber-500/30 transition-all flex items-start gap-4 cursor-pointer" data-testid={`approval-quick-${r.id}`}>
                    <ScoreRing score={r.predictedScore || 0} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Linkedin className="h-3 w-3" />
                        <span className="truncate">{m?.name || "Mission"}</span>
                        <span>·</span>
                        <span>{r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : "TBD"}</span>
                      </div>
                      <div className="text-sm text-slate-200 line-clamp-2">{r.finalText}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 mt-1.5 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Competitive Pulse mini-card */}
        {intelCompetitors.length > 0 && (
          <Link href="/intelligence" className="block">
            <div className="card-base p-4 hover:border-[#E85D3B]/40 transition-all flex items-center gap-4 cursor-pointer" data-testid="card-intel-pulse">
              <div className="h-10 w-10 rounded-lg bg-[#E85D3B]/15 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-[#E85D3B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-eyebrow text-slate-500">Competitive Pulse</div>
                <div className="text-sm text-slate-200">
                  <span className="font-semibold text-white">{intelSignalCount}</span> competitor posts in the latest digest across {intelCompetitors.length} tracked
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </div>
          </Link>
        )}

        {/* Empty state if no missions yet */}
        {missions.length === 0 && (
          <div className="card-pop p-8" data-testid="empty-state-no-missions">
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="text-eyebrow text-amber-300 mb-2">Get started in 60 seconds</div>
                <h3 className="text-h2 mb-2">Launch your first mission</h3>
                <p className="text-slate-400 mb-4">Tell the agent your audience, niche, and goal. It'll draft the first post within minutes — you just approve.</p>
                <Button asChild className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                  <Link href="/autopilot"><Bot className="h-4 w-4" /> Launch a mission</Link>
                </Button>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center shadow-[0_0_60px_-12px_rgba(245, 158, 11,0.4)]">
                  <Bot className="h-16 w-16 text-orange-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent runs */}
        {autopilot && autopilot.recentRuns.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-h2">Recent activity</h2>
            <div className="card-base p-2">
              {autopilot.recentRuns.slice(0, 6).map((r) => {
                const s = STATUS_LABEL[r.status] || { label: r.status, tone: "bg-slate-500/15 text-slate-300 border-slate-500/30" };
                return (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] text-sm">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border w-24 justify-center", s.tone)}>{s.label}</span>
                    <span className="flex-1 truncate text-slate-300">{r.finalText?.slice(0, 80) || <span className="text-slate-500 italic">(drafting…)</span>}</span>
                    {r.predictedScore != null && <span className="text-xs text-slate-400">{r.predictedScore}</span>}
                    {r.actualImpressions != null && <span className="text-xs text-cyan-300">{r.actualImpressions.toLocaleString()} views</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual mode */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-h2">Manual mode</h2>
              <p className="text-sm text-slate-500">When you want to drive yourself.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {manualTools.map((t) => (
              <Link key={t.href} href={t.href} className="card-base p-4 hover:border-orange-500/30 transition-all flex flex-col items-start gap-2 cursor-pointer" data-testid={`tool-${t.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <t.icon className="h-5 w-5 text-orange-300" />
                <div className="text-sm font-medium">{t.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
