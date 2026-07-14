import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, ArrowRight, TrendingUp, TrendingDown, Minus, Linkedin, Rss, Twitter, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
  velocityChangePct: number | null;
  generatedAt: string;
};
type Competitor = {
  id: string;
  name: string;
  websiteUrl: string | null;
  blogRssUrl: string | null;
  xHandle: string | null;
  linkedinCompanyUrl: string | null;
  emailDigestEnabled: boolean;
  lastRefreshedAt: string | null;
  createdAt: string;
  latestDigest: Digest | null;
};
type ListResponse = { competitors: Competitor[]; planCap: number; plan: string };

function VelocityBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-xs text-stone-500">no baseline yet</span>;
  const Icon = pct > 5 ? TrendingUp : pct < -5 ? TrendingDown : Minus;
  const tone = pct > 5 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : pct < -5 ? "text-rose-700 bg-rose-50 border-rose-200"
    : "text-stone-600 bg-stone-100 border-stone-200";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", tone)}>
      <Icon className="h-3 w-3" />
      {pct > 0 ? "+" : ""}{pct}% vs trailing 4w
    </span>
  );
}

function CompetitorCard({ c }: { c: Competitor }) {
  const d = c.latestDigest;
  return (
    <Link href={`/intelligence/${c.id}`}>
      <div className="rounded-2xl border border-stone-200 bg-white hover:border-[#E85D3B]/40 hover:shadow-[0_0_24px_-12px_rgba(232,93,59,0.4)] transition-all p-5 cursor-pointer h-full" data-testid={`card-competitor-${c.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-stone-500">Competitor</div>
            <div className="text-lg font-semibold text-stone-900 truncate">{c.name}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-stone-400 shrink-0 mt-1" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
          {c.blogRssUrl && <Rss className="h-3 w-3" />}
          {c.xHandle && <Twitter className="h-3 w-3" />}
          {c.linkedinCompanyUrl && <Linkedin className="h-3 w-3" />}
        </div>
        {d ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-2 text-center">
                <div className="text-xl font-bold text-stone-900">{d.postsThisWeek}</div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mt-0.5">posts</div>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-center">
                <div className="text-xl font-bold text-emerald-700">{d.qualifiedEngagement}</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-700 mt-0.5">qualified</div>
              </div>
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-2 text-center">
                <div className="text-xl font-bold text-stone-700">{d.rawEngagement.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mt-0.5">raw</div>
              </div>
            </div>
            <VelocityBadge pct={d.velocityChangePct} />
            {d.themes && d.themes.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Themes</div>
                <ul className="space-y-0.5">
                  {d.themes.slice(0, 3).map((t, i) => (
                    <li key={i} className="text-sm text-stone-700 line-clamp-1" data-testid={`text-theme-${c.id}-${i}`}>
                      <span className="text-[#E85D3B] mr-1">·</span>{t.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {d.amplifiers && d.amplifiers.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Amplifiers</div>
                <div className="flex flex-wrap gap-1">
                  {d.amplifiers.slice(0, 3).map((a, i) => (
                    <span key={i} className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] text-amber-800" data-testid={`text-amplifier-${c.id}-${i}`}>
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 text-sm text-stone-500 italic">First digest generating...</div>
        )}
      </div>
    </Link>
  );
}

function AddCompetitorDialog({ planCap, count, onCreated }: { planCap: number; count: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [blogRssUrl, setBlogRssUrl] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [linkedinCompanyUrl, setLinkedinCompanyUrl] = useState("");
  const [jobBoardUrl, setJobBoardUrl] = useState("");
  const [fundingRssUrl, setFundingRssUrl] = useState("");
  const [execNames, setExecNames] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const body: any = { name };
      if (websiteUrl) body.websiteUrl = websiteUrl;
      if (blogRssUrl) body.blogRssUrl = blogRssUrl;
      if (xHandle) body.xHandle = xHandle;
      if (linkedinCompanyUrl) body.linkedinCompanyUrl = linkedinCompanyUrl;
      if (jobBoardUrl) body.jobBoardUrl = jobBoardUrl;
      if (fundingRssUrl) body.fundingRssUrl = fundingRssUrl;
      const names = execNames.split(",").map((n) => n.trim()).filter(Boolean).slice(0, 5);
      if (names.length > 0) body.execNames = names;
      const res = await apiRequest("POST", "/api/intelligence/competitors", body);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Competitor added", description: "Ingesting sources now. First digest in a moment." });
      qc.invalidateQueries({ queryKey: ["/api/intelligence/competitors"] });
      setName(""); setWebsiteUrl(""); setBlogRssUrl(""); setXHandle(""); setLinkedinCompanyUrl("");
      setJobBoardUrl(""); setFundingRssUrl(""); setExecNames("");
      setOpen(false);
      onCreated();
    },
    onError: (e: any) => toast({ title: "Could not add", description: e?.message || "Something went wrong", variant: "destructive" }),
  });

  const atCap = count >= planCap;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#E85D3B] hover:bg-[#d24f30] text-white"
          disabled={atCap}
          data-testid="button-add-competitor"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add competitor
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-stone-200 text-stone-900">
        <DialogHeader>
          <DialogTitle>Track a new competitor</DialogTitle>
          <DialogDescription>Provide at least one source. We pull blog posts, public X timeline, and (best-effort) LinkedIn company posts.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="comp-name">Company name</Label>
            <Input id="comp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." data-testid="input-competitor-name" />
          </div>
          <div>
            <Label htmlFor="comp-rss">Blog RSS URL</Label>
            <Input id="comp-rss" value={blogRssUrl} onChange={(e) => setBlogRssUrl(e.target.value)} placeholder="https://acme.com/blog/feed.xml" data-testid="input-competitor-rss" />
          </div>
          <div>
            <Label htmlFor="comp-x">X handle</Label>
            <Input id="comp-x" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@acme" data-testid="input-competitor-x" />
          </div>
          <div>
            <Label htmlFor="comp-li">LinkedIn company URL</Label>
            <Input id="comp-li" value={linkedinCompanyUrl} onChange={(e) => setLinkedinCompanyUrl(e.target.value)} placeholder="https://www.linkedin.com/company/acme" data-testid="input-competitor-linkedin" />
          </div>
          <div>
            <Label htmlFor="comp-web">Website (optional)</Label>
            <Input id="comp-web" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://acme.com" data-testid="input-competitor-website" />
          </div>

          <div className="pt-2 mt-1 border-t border-stone-200">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Signal correlation (optional)</div>
            <p className="text-xs text-stone-500 mb-3">
              Explains <span className="italic">why</span> their content shifts — cross-referencing new hires, funding, and podcast appearances.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="comp-jobs">Job board URL</Label>
                <Input id="comp-jobs" value={jobBoardUrl} onChange={(e) => setJobBoardUrl(e.target.value)} placeholder="https://boards.greenhouse.io/acme" data-testid="input-competitor-jobboard" />
                <p className="text-[11px] text-stone-400 mt-1">Greenhouse, Lever, or Ashby.</p>
              </div>
              <div>
                <Label htmlFor="comp-funding">Funding / news RSS URL</Label>
                <Input id="comp-funding" value={fundingRssUrl} onChange={(e) => setFundingRssUrl(e.target.value)} placeholder="https://www.crunchbase.com/.../rss" data-testid="input-competitor-funding" />
              </div>
              <div>
                <Label htmlFor="comp-execs">Exec names for podcast search</Label>
                <Input id="comp-execs" value={execNames} onChange={(e) => setExecNames(e.target.value)} placeholder="Jane Doe, John Smith" data-testid="input-competitor-execs" />
                <p className="text-[11px] text-stone-400 mt-1">Comma-separated, up to 5.</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => create.mutate()}
            disabled={!name || (!blogRssUrl && !xHandle && !linkedinCompanyUrl) || create.isPending}
            className="bg-[#E85D3B] hover:bg-[#d24f30] text-white"
            data-testid="button-save-competitor"
          >
            {create.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Track competitor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IntelligencePage() {
  const { data, refetch } = useQuery<ListResponse>({
    queryKey: ["/api/intelligence/competitors"],
    refetchInterval: 60_000,
  });
  const competitors = data?.competitors ?? [];
  const planCap = data?.planCap ?? 1;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <PageHeader
          eyebrow="Viralyz Signal"
          title={
            <span className="inline-flex items-center gap-3">
              <Activity className="h-7 w-7 text-[#E85D3B]" />
              Competitor Pulse
            </span>
          }
          description="The Monday-morning report your CMO actually wants. Themes, amplifiers, qualified engagement, and velocity for every tracked competitor."
          actions={
            <AddCompetitorDialog
              planCap={planCap}
              count={competitors.length}
              onCreated={() => refetch()}
            />
          }
        />

        {competitors.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 to-amber-50/40 p-10">
            <EmptyState
              icon={Activity}
              title="Track your first competitor"
              description="Pulse turns blog RSS, public X timelines, and LinkedIn company posts into a weekly digest. Themes pushed, top amplifiers, qualified engagement (replies from buyer-shaped accounts, not vanity likes), and velocity vs the trailing four-week average."
              action={
                <AddCompetitorDialog
                  planCap={planCap}
                  count={0}
                  onCreated={() => refetch()}
                />
              }
            />
          </div>
        ) : (
          <>
            <div className="text-xs text-stone-500">
              Tracking {competitors.length} of {planCap} on the {data?.plan ?? "free"} plan.
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {competitors.map((c) => <CompetitorCard key={c.id} c={c} />)}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
