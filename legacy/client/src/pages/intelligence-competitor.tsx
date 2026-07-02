import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, RefreshCw, Loader2, TrendingUp, TrendingDown, Minus,
  Mail, Rss, Twitter, Linkedin, ExternalLink, Activity, Trash2,
  Briefcase, DollarSign, Mic, Sparkles, Link2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type Theme = { title: string; summary: string; postIds: string[] };
type Amplifier = { name: string; title?: string; reach: number };
type Digest = {
  id: string;
  weekStart: string;
  themes: Theme[] | null;
  amplifiers: Amplifier[] | null;
  qualifiedEngagement: number;
  rawEngagement: number;
  postsThisWeek: number;
  trailingAvgPosts: string | null;
  velocityChangePct: number | null;
  generatedAt: string;
};
type Post = {
  id: string;
  source: string;
  url: string | null;
  author: string | null;
  title: string | null;
  text: string | null;
  publishedAt: string | null;
  rawLikes: number | null;
  rawComments: number | null;
  rawReposts: number | null;
  qualifiedEngagement: number | null;
  engagers?: Array<{ name: string; title?: string; qualified?: boolean }> | null;
};
type Competitor = {
  id: string;
  name: string;
  websiteUrl: string | null;
  blogRssUrl: string | null;
  xHandle: string | null;
  linkedinCompanyUrl: string | null;
  jobBoardUrl: string | null;
  fundingRssUrl: string | null;
  execNames: string[] | null;
  emailDigestEnabled: boolean;
  lastRefreshedAt: string | null;
};
type DigestResponse = { competitor: Competitor; digest: Digest; posts: Post[] };
type DetailResponse = { competitor: Competitor; digests: Digest[] };

type HiringSignal = { id: string; source: string; title: string; url: string | null; location: string | null; department: string | null; isGtmRole: boolean; postedAt: string | null };
type FundingSignal = { id: string; title: string; url: string | null; amount: string | null; publishedAt: string | null };
type PodcastSignal = { id: string; guest: string | null; showName: string | null; episodeTitle: string; url: string | null; publishedAt: string | null };
type Correlation = { id: string; signalType: string; signalId: string | null; headline: string; explanation: string; confidence: number; relatedThemes: string[] | null };
type SignalsResponse = {
  competitor: Competitor;
  hiring: HiringSignal[];
  funding: FundingSignal[];
  podcasts: PodcastSignal[];
  correlations: Correlation[];
};

function fmtDate(s: string | null): string {
  if (!s) return "n/a";
  try { return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return s; }
}

function SourceIcon({ source }: { source: string }) {
  if (source === "rss") return <Rss className="h-3.5 w-3.5 text-amber-700" />;
  if (source === "x") return <Twitter className="h-3.5 w-3.5 text-stone-700" />;
  if (source === "linkedin") return <Linkedin className="h-3.5 w-3.5 text-[#0A85C7]" />;
  return null;
}

function VelocityRow({ pct, posts, trailing }: { pct: number | null; posts: number; trailing: string | null }) {
  const Icon = pct == null ? Minus : pct > 5 ? TrendingUp : pct < -5 ? TrendingDown : Minus;
  const tone = pct == null ? "text-stone-500"
    : pct > 5 ? "text-emerald-700"
    : pct < -5 ? "text-rose-700"
    : "text-stone-600";
  const trailNum = trailing ? parseFloat(trailing) : 0;
  return (
    <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-wider text-stone-500">Velocity</div>
        <div className="text-lg font-semibold text-stone-900">{posts} posts this week</div>
        <div className="text-xs text-stone-500">trailing 4w avg: {trailNum.toFixed(1)}</div>
      </div>
      <div className={cn("inline-flex items-center gap-1.5 text-lg font-bold", tone)}>
        <Icon className="h-5 w-5" />
        {pct == null ? "n/a" : `${pct > 0 ? "+" : ""}${pct}%`}
      </div>
    </div>
  );
}

function ConfidenceBadge({ pct }: { pct: number }) {
  const tone = pct >= 70 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : pct >= 40 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-stone-600 bg-stone-100 border-stone-200";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", tone)}>
      {pct}% confidence
    </span>
  );
}

function SignalTypeIcon({ type }: { type: string }) {
  if (type === "hiring") return <Briefcase className="h-4 w-4 text-indigo-600" />;
  if (type === "funding") return <DollarSign className="h-4 w-4 text-emerald-600" />;
  if (type === "podcast") return <Mic className="h-4 w-4 text-rose-600" />;
  return <Link2 className="h-4 w-4 text-stone-500" />;
}

function WhyNowSection({
  data, competitor, refreshing, onRefresh,
}: {
  data?: SignalsResponse;
  competitor: Competitor;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const correlations = data?.correlations ?? [];
  const hiring = data?.hiring ?? [];
  const funding = data?.funding ?? [];
  const podcasts = data?.podcasts ?? [];
  const totalSignals = hiring.length + funding.length + podcasts.length;
  const hasSources = !!(competitor.jobBoardUrl || competitor.fundingRssUrl);

  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-6" data-testid="section-why-now">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E85D3B]" /> Why now? Correlated signals
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Hiring, funding, and podcast signals cross-referenced against the last 4 weeks of themes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="border-stone-300"
          data-testid="button-refresh-signals"
        >
          {refreshing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          Refresh signals
        </Button>
      </div>

      {correlations.length > 0 ? (
        <div className="space-y-3">
          {correlations.map((c) => (
            <div key={c.id} className="rounded-xl border border-stone-200 bg-white p-4" data-testid={`correlation-${c.id}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><SignalTypeIcon type={c.signalType} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="font-semibold text-stone-900">{c.headline}</div>
                    <ConfidenceBadge pct={c.confidence} />
                  </div>
                  <div className="text-sm text-stone-600 mt-1 leading-relaxed">{c.explanation}</div>
                  {c.relatedThemes && c.relatedThemes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.relatedThemes.map((t, i) => (
                        <span key={i} className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] text-amber-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-5 text-center text-sm text-stone-600" data-testid="text-no-correlations">
          {!hasSources && podcasts.length === 0 && totalSignals === 0
            ? "Add a job board URL, funding RSS feed, or exec names when editing this competitor to start correlating external signals."
            : totalSignals === 0
              ? "No external signals ingested yet. Try Refresh signals."
              : "Signals ingested, but no strong correlations to recent themes yet. We only surface high-confidence links."}
        </div>
      )}

      {/* Raw signals ledger */}
      {totalSignals > 0 && (
        <div className="mt-5 grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4" data-testid="panel-hiring-signals">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
              <Briefcase className="h-4 w-4 text-indigo-600" /> Hiring <span className="text-stone-400 font-normal">({hiring.length})</span>
            </div>
            {hiring.length === 0 ? (
              <div className="text-xs text-stone-500 italic">None detected.</div>
            ) : (
              <ul className="space-y-2">
                {hiring.slice(0, 6).map((h) => (
                  <li key={h.id} className="text-xs" data-testid={`hiring-${h.id}`}>
                    <a href={h.url || "#"} target="_blank" rel="noreferrer" className="text-stone-800 hover:text-[#E85D3B] font-medium">
                      {h.title}
                    </a>
                    {h.isGtmRole && <span className="ml-1 inline-flex items-center rounded bg-indigo-50 border border-indigo-200 px-1 py-0 text-[10px] text-indigo-700">GTM</span>}
                    <div className="text-stone-500">{[h.department, h.location].filter(Boolean).join(" · ")}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4" data-testid="panel-funding-signals">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Funding <span className="text-stone-400 font-normal">({funding.length})</span>
            </div>
            {funding.length === 0 ? (
              <div className="text-xs text-stone-500 italic">None detected.</div>
            ) : (
              <ul className="space-y-2">
                {funding.slice(0, 6).map((f) => (
                  <li key={f.id} className="text-xs" data-testid={`funding-${f.id}`}>
                    <a href={f.url || "#"} target="_blank" rel="noreferrer" className="text-stone-800 hover:text-[#E85D3B] font-medium line-clamp-2">
                      {f.title}
                    </a>
                    <div className="text-stone-500">{[f.amount, fmtDate(f.publishedAt)].filter(Boolean).join(" · ")}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4" data-testid="panel-podcast-signals">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
              <Mic className="h-4 w-4 text-rose-600" /> Podcasts <span className="text-stone-400 font-normal">({podcasts.length})</span>
            </div>
            {podcasts.length === 0 ? (
              <div className="text-xs text-stone-500 italic">None detected.</div>
            ) : (
              <ul className="space-y-2">
                {podcasts.slice(0, 6).map((p) => (
                  <li key={p.id} className="text-xs" data-testid={`podcast-${p.id}`}>
                    <a href={p.url || "#"} target="_blank" rel="noreferrer" className="text-stone-800 hover:text-[#E85D3B] font-medium line-clamp-2">
                      {p.episodeTitle}
                    </a>
                    <div className="text-stone-500">{[p.guest, p.showName].filter(Boolean).join(" · ")}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntelligenceCompetitorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const qc = useQueryClient();
  const [emailOn, setEmailOn] = useState<boolean | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const { data: detail } = useQuery<DetailResponse>({
    queryKey: [`/api/intelligence/competitors/${id}`],
    enabled: !!id,
  });
  const digestUrl = selectedWeek
    ? `/api/intelligence/competitors/${id}/digest?week=${encodeURIComponent(selectedWeek)}`
    : `/api/intelligence/competitors/${id}/digest`;
  const { data: digestData, refetch: refetchDigest } = useQuery<DigestResponse>({
    queryKey: [digestUrl],
    enabled: !!id,
  });
  const { data: signalsData, refetch: refetchSignals } = useQuery<SignalsResponse>({
    queryKey: [`/api/intelligence/competitors/${id}/signals`],
    enabled: !!id,
  });

  const refresh = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/intelligence/competitors/${id}/refresh`, {});
      return res.json();
    },
    onSuccess: (r: any) => {
      toast({ title: "Refreshed", description: `Ingested ${r.ingested} posts. Digest updated.` });
      refetchDigest();
      qc.invalidateQueries({ queryKey: [`/api/intelligence/competitors/${id}`] });
      qc.invalidateQueries({ queryKey: ["/api/intelligence/competitors"] });
    },
    onError: (e: any) => toast({ title: "Refresh failed", description: e?.message || "Try again later", variant: "destructive" }),
  });

  const toggleEmail = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("PATCH", `/api/intelligence/competitors/${id}/notifications`, { emailDigestEnabled: enabled });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/intelligence/competitors/${id}`] }),
  });

  const refreshSignals = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/intelligence/competitors/${id}/signals/refresh`, {});
      return res.json();
    },
    onSuccess: (r: any) => {
      const n = (r?.counts?.hiring || 0) + (r?.counts?.funding || 0) + (r?.counts?.podcast || 0);
      toast({ title: "Signals refreshed", description: `${n} signals · ${r?.correlations?.length || 0} correlations found.` });
      refetchSignals();
    },
    onError: (e: any) => toast({ title: "Signal refresh failed", description: e?.message || "Try again later", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/intelligence/competitors/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Removed" });
      window.location.href = "/intelligence";
    },
  });

  const c = digestData?.competitor || detail?.competitor;
  const d = digestData?.digest;
  const posts = digestData?.posts || [];
  const emailEnabled = emailOn ?? c?.emailDigestEnabled ?? true;

  if (!c) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto p-6 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Cream/persimmon hero */}
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/60 via-stone-50 to-white p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <Link href="/intelligence" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 mb-2">
                <ArrowLeft className="h-3 w-3" /> All competitors
              </Link>
              <div className="flex items-center gap-3 mb-1">
                <Activity className="h-6 w-6 text-[#E85D3B]" />
                <h1 className="text-3xl font-bold text-stone-900" data-testid="text-competitor-name">{c.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                {c.blogRssUrl && <span className="inline-flex items-center gap-1"><Rss className="h-3 w-3" /> RSS</span>}
                {c.xHandle && <span className="inline-flex items-center gap-1"><Twitter className="h-3 w-3" /> @{c.xHandle.replace(/^@/, "")}</span>}
                {c.linkedinCompanyUrl && <span className="inline-flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn</span>}
                {c.lastRefreshedAt && <span>· refreshed {fmtDate(c.lastRefreshedAt)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => refresh.mutate()}
                disabled={refresh.isPending}
                className="border-stone-300"
                data-testid="button-refresh-now"
              >
                {refresh.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
                Refresh now
              </Button>
              <Button
                variant="outline"
                onClick={() => { if (confirm("Remove this competitor?")) remove.mutate(); }}
                className="border-stone-300 text-rose-600 hover:text-rose-700"
                data-testid="button-remove-competitor"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week selector: drill into prior weekly digests */}
          {detail?.digests && detail.digests.length > 0 && (
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-stone-500">Week</span>
              <select
                value={selectedWeek ?? (d ? d.weekStart : "")}
                onChange={(e) => setSelectedWeek(e.target.value || null)}
                className="text-sm rounded-md border border-stone-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-200"
                data-testid="select-digest-week"
              >
                {detail.digests.map((dg) => (
                  <option key={dg.id} value={dg.weekStart} data-testid={`option-week-${dg.weekStart.slice(0, 10)}`}>
                    Week of {fmtDate(dg.weekStart)}
                  </option>
                ))}
              </select>
              {selectedWeek && (
                <button
                  onClick={() => setSelectedWeek(null)}
                  className="text-xs text-stone-500 hover:text-stone-700 underline"
                  data-testid="button-week-latest"
                >
                  Latest
                </button>
              )}
            </div>
          )}

          {d ? (
            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white border border-stone-200 p-4">
                <div className="text-xs uppercase tracking-wider text-stone-500">Qualified engagement</div>
                <div className="text-3xl font-bold text-emerald-700 mt-1">{d.qualifiedEngagement}</div>
                <div className="text-xs text-stone-500 mt-1">vs <span className="text-stone-700 font-medium">{d.rawEngagement.toLocaleString()}</span> raw</div>
              </div>
              <div className="rounded-xl bg-white border border-stone-200 p-4">
                <div className="text-xs uppercase tracking-wider text-stone-500">Posts this week</div>
                <div className="text-3xl font-bold text-stone-900 mt-1">{d.postsThisWeek}</div>
                <div className="text-xs text-stone-500 mt-1">week of {fmtDate(d.weekStart)}</div>
              </div>
              <VelocityRow pct={d.velocityChangePct} posts={d.postsThisWeek} trailing={d.trailingAvgPosts} />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white/60 p-5 text-center text-sm text-stone-600" data-testid="text-no-digest-week">
              No digest available for this week yet. Try Refresh now, or pick a different week.
            </div>
          )}
        </div>

        {/* Why now? Correlated signals (Module 2) */}
        <WhyNowSection
          data={signalsData}
          competitor={c}
          refreshing={refreshSignals.isPending}
          onRefresh={() => refreshSignals.mutate()}
        />

        {/* Themes */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">Themes pushed this week</h2>
            <span className="text-xs text-stone-500">Top 3 narratives across all sources</span>
          </div>
          {d?.themes && d.themes.length > 0 ? (
            <div className="space-y-3">
              {d.themes.map((t, i) => (
                <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4" data-testid={`theme-${i}`}>
                  <div className="text-base font-semibold text-stone-900">{t.title}</div>
                  <div className="text-sm text-stone-600 mt-1 leading-relaxed">{t.summary}</div>
                  {t.postIds.length > 0 && (
                    <div className="text-xs text-stone-500 mt-2">{t.postIds.length} supporting posts</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-stone-500 italic">No themes detected. Refresh sources or wait for the next ingestion.</div>
          )}
        </div>

        {/* Amplifiers */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">Top amplifiers</h2>
            <span className="text-xs text-stone-500">Employees and partners who moved the most reach</span>
          </div>
          {d?.amplifiers && d.amplifiers.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {d.amplifiers.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3" data-testid={`amplifier-${i}`}>
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-900">{a.name}</div>
                    {a.title && <div className="text-xs text-stone-500">{a.title}</div>}
                  </div>
                  <div className="text-sm font-medium text-[#E85D3B]">{a.reach.toLocaleString()} reach</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-stone-500 italic">No amplifiers detected.</div>
          )}
        </div>

        {/* Underlying posts */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Posts feeding this digest</h2>
          {posts.length === 0 ? (
            <div className="text-sm text-stone-500 italic">No posts ingested for this week yet.</div>
          ) : (
            <div className="space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3" data-testid={`post-${p.id}`}>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <SourceIcon source={p.source} />
                    <span className="uppercase tracking-wider">{p.source}</span>
                    {p.author && <span>· {p.author}</span>}
                    {p.publishedAt && <span>· {fmtDate(p.publishedAt)}</span>}
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-[#E85D3B] hover:underline">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {p.title && <div className="font-medium text-stone-900">{p.title}</div>}
                  {p.text && <div className="text-sm text-stone-700 mt-1 line-clamp-3">{p.text}</div>}
                  {(p.rawLikes != null || p.rawComments != null || p.rawReposts != null || p.qualifiedEngagement != null) && (
                    <div className="text-xs text-stone-500 mt-2 flex flex-wrap items-center gap-3">
                      {p.qualifiedEngagement != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 font-medium">
                          {p.qualifiedEngagement} qualified
                        </span>
                      )}
                      {p.rawLikes != null && <span>{p.rawLikes} likes</span>}
                      {p.rawComments != null && <span>{p.rawComments} replies</span>}
                      {p.rawReposts != null && <span>{p.rawReposts} reposts</span>}
                    </div>
                  )}
                  {p.engagers && p.engagers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-200">
                      <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Buyer-shaped engagers</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.engagers
                          .filter((e) => e.qualified)
                          .slice(0, 6)
                          .map((e, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[11px] text-emerald-800">
                              <span className="font-medium">{e.name}</span>
                              {e.title && <span className="text-emerald-700/70">· {e.title}</span>}
                            </span>
                          ))}
                        {p.engagers.filter((e) => e.qualified).length === 0 && (
                          <span className="text-[11px] text-stone-500 italic">no buyer-shaped engagers in this batch</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Settings</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-stone-500" />
              <div>
                <div className="font-medium text-stone-900">Weekly email digest</div>
                <div className="text-xs text-stone-500">Delivered Monday mornings</div>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={(v) => { setEmailOn(v); toggleEmail.mutate(v); }}
              data-testid="switch-email-digest"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
