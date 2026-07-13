import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, ArrowRight, Sparkles, Zap, Wand2, Lightbulb, Radar, Calendar,
  Image as ImageIcon, Mic2, Bookmark, Repeat, Clock,
  Linkedin, Plus, ShieldAlert, ChevronRight, Activity, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { ScoreRing } from "@/components/ui/score-ring";
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

const createTools = [
  { icon: Zap, title: "Hook Lab", href: "/hook-lab", blurb: "Ten openings, each scored" },
  { icon: Wand2, title: "Captions", href: "/caption-studio", blurb: "Platform-ready copy" },
  { icon: Lightbulb, title: "Ideas", href: "/ideas", blurb: "When you're stuck" },
  { icon: ImageIcon, title: "Thumbnails", href: "/thumbnails", blurb: "Readable at feed size" },
  { icon: Radar, title: "Trends", href: "/trends", blurb: "Rising vs fading" },
  { icon: Calendar, title: "Calendar", href: "/calendar", blurb: "Best posting slots" },
  { icon: Bookmark, title: "Swipe file", href: "/swipe-file", blurb: "Save what works" },
  { icon: Mic2, title: "Brand voice", href: "/brand-voice", blurb: "Stay consistent" },
];

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  awaiting_approval: { label: "Needs you", tone: "bg-[rgba(217,149,11,0.12)] text-[#a87208] border-[rgba(217,149,11,0.3)]" },
  approved: { label: "Approved", tone: "bg-[rgba(15,169,104,0.12)] text-[#0b8a55] border-[rgba(15,169,104,0.3)]" },
  posting: { label: "Posting", tone: "bg-[rgba(108,76,241,0.1)] text-[var(--accent-hover)] border-[rgba(108,76,241,0.25)]" },
  posted: { label: "Posted", tone: "bg-[rgba(15,169,104,0.12)] text-[#0b8a55] border-[rgba(15,169,104,0.3)]" },
  complete: { label: "Complete", tone: "bg-[rgba(15,169,104,0.12)] text-[#0b8a55] border-[rgba(15,169,104,0.3)]" },
  running: { label: "Drafting", tone: "bg-[rgba(108,76,241,0.1)] text-[var(--accent-hover)] border-[rgba(108,76,241,0.25)]" },
  pending: { label: "Queued", tone: "bg-secondary text-muted-foreground border-border" },
  failed: { label: "Failed", tone: "bg-[rgba(222,78,78,0.12)] text-[#c43d3d] border-[rgba(222,78,78,0.3)]" },
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
  const credits = user?.creditsRemaining ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          eyebrow={`${greeting}, ${name}`}
          title="What are you posting next?"
          description="Score a draft before it goes live. Every fix shows how many points it is worth."
          actions={
            <Button asChild className="gap-2 rounded-full" data-testid="button-score-home">
              <Link href="/analyze">
                <Upload className="h-4 w-4" /> Score content
              </Link>
            </Button>
          }
        />

        {/* Primary job card */}
        <Link href="/analyze" className="block group" data-testid="card-score-primary">
          <div className="relative overflow-hidden rounded-[22px] border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)] transition-all group-hover:shadow-[var(--shadow-pop)] group-hover:border-[var(--border-strong)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,76,241,0.1),transparent_55%)]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(108,76,241,0.12)] text-primary shrink-0">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-eyebrow text-primary mb-2">Primary</div>
                <h2 className="text-h2 mb-1">Score your content free</h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Drop in a video or paste a caption. In under 30 seconds you get a score out of 100 and exactly what to fix.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{credits} left</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-[var(--accent-hover)] transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {autopilot?.paused && (
          <div className="rounded-[16px] border border-[rgba(222,78,78,0.3)] bg-[rgba(222,78,78,0.08)] p-3 text-sm text-[#c43d3d] flex items-center gap-2" data-testid="banner-paused">
            <ShieldAlert className="h-4 w-4" /> Autopilot is paused.
            <Link href="/autopilot" className="ml-auto underline hover:opacity-80">Resume</Link>
          </div>
        )}

        {/* Waiting on you — only when relevant */}
        {awaiting.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-h2 inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--score-50)]" /> Waiting on you
              </h2>
              <Link href="/autopilot" className="text-sm text-primary hover:text-[var(--accent-hover)]">
                Open queue <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {awaiting.slice(0, 3).map((r) => {
                const m = missions.find((mm) => mm.id === r.missionId);
                return (
                  <Link
                    key={r.id}
                    href="/autopilot"
                    className="card-base p-4 hover:border-[rgba(217,149,11,0.35)] transition-all flex items-start gap-4 cursor-pointer"
                    data-testid={`approval-quick-${r.id}`}
                  >
                    <ScoreRing score={r.predictedScore || 0} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Linkedin className="h-3 w-3" />
                        <span className="truncate">{m?.name || "Mission"}</span>
                        <span>·</span>
                        <span>{r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : "TBD"}</span>
                      </div>
                      <div className="text-sm text-foreground line-clamp-2">{r.finalText}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1.5 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary row: autopilot + linkedin + competitors */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/autopilot" className="card-base card-hover p-5 block md:col-span-2" data-testid="card-agent-status">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-11 w-11 rounded-[12px] flex items-center justify-center shrink-0",
                  autopilot?.paused ? "bg-secondary" : "bg-[rgba(108,76,241,0.12)] text-primary",
                )}>
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-eyebrow">Autopilot</div>
                  <div className="text-h3 leading-tight">
                    {autopilot?.paused
                      ? "Paused"
                      : (autopilot?.activeMissions ? `Running ${autopilot.activeMissions} mission${autopilot.activeMissions === 1 ? "" : "s"}` : "Standing by")}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-[12px] bg-secondary/80 border border-border p-3 text-center">
                <div className="text-xl font-bold font-mono text-[var(--score-50)]">{autopilot?.awaitingApproval || 0}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-mono">Awaiting</div>
              </div>
              <div className="rounded-[12px] bg-secondary/80 border border-border p-3 text-center">
                <div className="text-xl font-bold font-mono text-primary">{autopilot?.activeMissions || 0}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-mono">Active</div>
              </div>
              <div className="rounded-[12px] bg-secondary/80 border border-border p-3 text-center">
                <div className="text-xl font-bold font-mono text-[var(--score-90)]">
                  {autopilot?.recentRuns?.filter((r) => r.status === "posted" || r.status === "complete").length || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-mono">Posted</div>
              </div>
            </div>
          </Link>

          <div className="card-base p-5 space-y-4" data-testid="card-linkedin">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[12px] bg-[#0077B5]/12 flex items-center justify-center">
                <Linkedin className="h-5 w-5 text-[#0A85C7]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-eyebrow">LinkedIn</div>
                <div className="text-sm font-semibold truncate">
                  {linkedin?.connected ? (linkedin.account?.displayName || "Connected") : linkedin?.configured ? "Not connected" : "Not configured"}
                </div>
              </div>
            </div>
            {!linkedin?.connected && linkedin?.configured && (
              <Button asChild size="sm" className="w-full rounded-full bg-[#0077B5] hover:bg-[#006399] text-white border-0">
                <a href="/api/linkedin/connect">Connect</a>
              </Button>
            )}
            {intelCompetitors.length > 0 && (
              <Link href="/intelligence" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground pt-1 border-t border-border">
                <Activity className="h-4 w-4 text-primary" />
                <span className="flex-1">{intelSignalCount} competitor posts tracked</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {missions.length === 0 && (
          <div className="card-base p-6 sm:p-8" data-testid="empty-state-no-missions">
            <div className="text-eyebrow text-primary mb-2">Optional</div>
            <h3 className="text-h2 mb-2">Or let Autopilot draft for you</h3>
            <p className="text-muted-foreground mb-4 max-w-lg text-sm">
              Set a mission once. The agent drafts, you approve, it posts. Scoring still runs on every draft.
            </p>
            <Button asChild variant="outline" className="gap-2 rounded-full">
              <Link href="/autopilot"><Bot className="h-4 w-4" /> Set up Autopilot</Link>
            </Button>
          </div>
        )}

        {autopilot && autopilot.recentRuns.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-h2">Recent activity</h2>
            <div className="card-base p-2">
              {autopilot.recentRuns.slice(0, 6).map((r) => {
                const s = STATUS_LABEL[r.status] || { label: r.status, tone: "bg-secondary text-muted-foreground border-border" };
                return (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-secondary/80 text-sm">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border w-24 justify-center", s.tone)}>{s.label}</span>
                    <span className="flex-1 truncate text-foreground/80">{r.finalText?.slice(0, 80) || <span className="text-muted-foreground italic">(drafting…)</span>}</span>
                    {r.predictedScore != null && <span className="text-xs font-mono text-muted-foreground">{r.predictedScore}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h2 className="text-h2">Create tools</h2>
            <p className="text-sm text-muted-foreground">Every tool feeds your Viral Score.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {createTools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="card-base card-hover p-4 flex flex-col items-start gap-2 cursor-pointer"
                data-testid={`tool-${t.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <t.icon className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
