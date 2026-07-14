import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark, BookmarkCheck, Search, Sparkles, Copy, Check, ExternalLink,
  Zap, Wand2, TrendingUp, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing, scoreTone } from "@/components/ui/score-ring";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface Swipe {
  id: string;
  text: string;
  platform: string;
  niche: string;
  format: string | null;
  hookType: string | null;
  viralScore: number;
  scoreBreakdown: { hook: number; structure: number; emotion: number; clarity: number; cta: number } | null;
  whyItWorks: string;
  creatorHandle: string | null;
  sourceUrl: string | null;
  tags: string[] | null;
  saved?: boolean;
}

interface Facets {
  platforms: string[];
  niches: string[];
  hookTypes: string[];
  formats: string[];
}

const PLATFORM_TONES: Record<string, string> = {
  tiktok: "bg-pink-500/15 text-pink-300 border-pink-400/30",
  instagram: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  youtube: "bg-red-500/15 text-red-300 border-red-400/30",
  twitter: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  linkedin: "bg-blue-500/15 text-blue-300 border-blue-400/30",
};

export default function SwipeFile() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [niche, setNiche] = useState<string>("all");
  const [hookType, setHookType] = useState<string>("all");
  const [sort, setSort] = useState<"score" | "newest" | "trending">("score");
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeSwipe, setActiveSwipe] = useState<Swipe | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const userNiche = (user as { primaryNiche?: string | null } | null | undefined)?.primaryNiche;

  const { data: facets } = useQuery<Facets>({
    queryKey: ["/api/swipe-file/facets"],
    queryFn: async () => {
      const res = await fetch("/api/swipe-file/facets");
      if (!res.ok) return { platforms: [], niches: [], hookTypes: [], formats: [] };
      return res.json();
    },
  });

  const queryKey = useMemo(
    () => ["/api/swipe-file", { q, platform, niche, hookType, sort, savedOnly }],
    [q, platform, niche, hookType, sort, savedOnly]
  );

  const { data: swipes, isLoading } = useQuery<Swipe[]>({
    queryKey,
    queryFn: async () => {
      if (savedOnly) {
        const res = await fetch("/api/swipe-file/saved");
        if (!res.ok) return [];
        const all: Swipe[] = await res.json();
        const needle = q.trim().toLowerCase();
        return all.filter((s) => {
          if (platform !== "all" && s.platform !== platform) return false;
          if (niche !== "all" && s.niche !== niche) return false;
          if (hookType !== "all" && s.hookType !== hookType) return false;
          if (needle.length >= 2) {
            return (
              s.text.toLowerCase().includes(needle) ||
              s.whyItWorks.toLowerCase().includes(needle)
            );
          }
          return true;
        });
      }
      const params = new URLSearchParams();
      if (q.trim().length >= 2) params.set("q", q.trim());
      if (platform !== "all") params.set("platform", platform);
      if (niche !== "all") params.set("niche", niche);
      if (hookType !== "all") params.set("hookType", hookType);
      params.set("sort", sort);
      const res = await fetch(`/api/swipe-file?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      const res = await fetch(`/api/swipe-file/${id}/save`, {
        method: saved ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: async ({ id, saved }) => {
      await qc.cancelQueries({ queryKey: ["/api/swipe-file"] });
      const prev = qc.getQueriesData<Swipe[]>({ queryKey: ["/api/swipe-file"] });
      qc.setQueriesData<Swipe[] | undefined>({ queryKey: ["/api/swipe-file"] }, (old) =>
        old ? old.map((s) => (s.id === id ? { ...s, saved: !saved } : s)) : old
      );
      setActiveSwipe((cur) => (cur && cur.id === id ? { ...cur, saved: !saved } : cur));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast({ title: "Couldn't update", variant: "destructive" });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["/api/swipe-file"] });
    },
  });

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const remixHookHref = (s: Swipe) =>
    `/hook-lab?topic=${encodeURIComponent(s.text)}&platform=${encodeURIComponent(s.platform)}&from=swipe&source=swipe-${s.id}`;
  const remixCaptionHref = (s: Swipe) =>
    `/caption-studio?caption=${encodeURIComponent(s.text)}&platform=${encodeURIComponent(s.platform)}&from=swipe&source=swipe-${s.id}`;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {!userNiche && (
          <div className="card-base p-4 mb-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 flex items-center justify-between gap-3" data-testid="banner-set-niche">
            <div>
              <div className="text-sm font-semibold text-amber-200">Tell us your niche to personalize this swipe file</div>
              <div className="text-xs text-slate-400">We'll surface the most relevant viral posts for your audience.</div>
            </div>
            <Link href="/onboarding">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-900" data-testid="button-set-niche">
                Set niche
              </Button>
            </Link>
          </div>
        )}
        <PageHeader
          eyebrow="Swipe file"
          title="Steal viral structures, not words"
          description="A curated library of high-performing posts. See the score, learn why it works, then remix into your voice."
          actions={
            <Button
              variant={savedOnly ? "default" : "outline"}
              onClick={() => setSavedOnly((v) => !v)}
              className={cn(
                savedOnly
                  ? "bg-indigo-600 hover:bg-indigo-500"
                  : "border-white/10 hover:bg-white/[0.04]"
              )}
              data-testid="button-saved-toggle"
            >
              {savedOnly ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
              {savedOnly ? "Showing saved" : "My saves"}
            </Button>
          }
        />

        {/* Filters */}
        <div className="card-base p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search hooks, topics, or why-it-works…"
                className="pl-9 bg-white/[0.03] border-white/10"
                data-testid="input-swipe-search"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "score" | "newest" | "trending")}
              className="h-9 rounded-md bg-white/[0.03] border border-white/10 px-2 text-sm text-slate-200"
              data-testid="select-sort"
            >
              <option value="score">Highest score</option>
              <option value="trending">Trending this week</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Filter className="h-3 w-3 text-slate-500 mr-1" />
            <FilterChips
              label="Platform"
              value={platform}
              options={facets?.platforms || []}
              onChange={setPlatform}
              testId="filter-platform"
            />
            <FilterChips
              label="Niche"
              value={niche}
              options={facets?.niches || []}
              onChange={setNiche}
              testId="filter-niche"
            />
            <FilterChips
              label="Hook"
              value={hookType}
              options={facets?.hookTypes || []}
              onChange={setHookType}
              testId="filter-hook"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : !swipes || swipes.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={savedOnly ? "No saved swipes yet" : "No matches"}
            description={
              savedOnly
                ? "Tap the bookmark on any swipe to save it here for later."
                : "Try a different platform, niche, or search term."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {swipes.map((s, idx) => {
              const tone = scoreTone(s.viralScore);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                  whileHover={{ y: -3 }}
                  className="card-base card-hover p-5 cursor-pointer flex flex-col"
                  onClick={() => setActiveSwipe(s)}
                  data-testid={`card-swipe-${s.id}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wide",
                          PLATFORM_TONES[s.platform] || "bg-slate-500/15 text-slate-300 border-slate-400/20"
                        )}
                      >
                        {s.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] capitalize text-slate-300">
                        {s.niche}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveMutation.mutate({ id: s.id, saved: !!s.saved });
                      }}
                      className="text-slate-400 hover:text-indigo-300 transition-colors p-1 -m-1"
                      data-testid={`button-save-${s.id}`}
                      aria-label={s.saved ? "Unsave" : "Save"}
                    >
                      {s.saved ? (
                        <BookmarkCheck className="h-4 w-4 text-indigo-300 fill-indigo-300/30" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-white text-[15px] font-medium leading-snug mb-3 line-clamp-4">
                    "{s.text}"
                  </p>

                  <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3 italic" data-testid={`text-why-${s.id}`}>
                    <span className="text-indigo-300 not-italic font-semibold">Why it works · </span>
                    {s.whyItWorks}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-bold tabular-nums",
                          `score-bg-${tone}`
                        )}
                        data-testid={`text-score-${s.id}`}
                      >
                        {s.viralScore}
                      </span>
                      {s.hookType && (
                        <span className="text-[11px] text-slate-400 capitalize truncate">
                          {s.hookType.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(s.text, s.id);
                        }}
                        data-testid={`button-copy-${s.id}`}
                      >
                        {copiedId === s.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detail Drawer */}
        <AnimatePresence>
          {activeSwipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setActiveSwipe(null)}
              data-testid="modal-swipe-detail"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="card-base card-pop max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 rounded-t-3xl sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wide",
                        PLATFORM_TONES[activeSwipe.platform] || "bg-slate-500/15 text-slate-300 border-slate-400/20"
                      )}
                    >
                      {activeSwipe.platform}
                    </span>
                    <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] capitalize text-slate-300">
                      {activeSwipe.niche}
                    </span>
                    {activeSwipe.hookType && (
                      <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] capitalize text-slate-300">
                        {activeSwipe.hookType.replace(/_/g, " ")} hook
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveSwipe(null)}
                    className="text-slate-400 hover:text-white text-2xl leading-none"
                    data-testid="button-close-detail"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-start gap-5 mb-5">
                  <ScoreRing score={activeSwipe.viralScore} size={108} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-lg font-medium leading-snug mb-2">
                      "{activeSwipe.text}"
                    </p>
                    {activeSwipe.creatorHandle && (
                      <div className="text-meta">By {activeSwipe.creatorHandle}</div>
                    )}
                  </div>
                </div>

                {activeSwipe.scoreBreakdown && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {(["hook", "structure", "emotion", "clarity", "cta"] as const).map((k) => (
                      <div key={k} className="text-center card-base p-2">
                        <div className="text-meta capitalize">{k}</div>
                        <div className="text-base font-bold tabular-nums text-white">
                          {activeSwipe.scoreBreakdown![k]}<span className="text-xs text-slate-500">/20</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
                  <div className="card-base p-2">
                    <div className="text-meta">Hook length</div>
                    <div className="text-sm font-semibold text-white">
                      {activeSwipe.text.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                  <div className="card-base p-2">
                    <div className="text-meta">Retention move</div>
                    <div className="text-sm font-semibold text-white capitalize truncate">
                      {activeSwipe.format ? activeSwipe.format.replace(/_/g, " ") : "—"}
                    </div>
                  </div>
                  <div className="card-base p-2">
                    <div className="text-meta">Hook style</div>
                    <div className="text-sm font-semibold text-white capitalize truncate">
                      {activeSwipe.hookType ? activeSwipe.hookType.replace(/_/g, " ") : "—"}
                    </div>
                  </div>
                </div>

                <div className="card-base p-4 mb-5 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                  <div className="text-eyebrow mb-1 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> Why it works
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{activeSwipe.whyItWorks}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <Button
                    onClick={() => saveMutation.mutate({ id: activeSwipe.id, saved: !!activeSwipe.saved })}
                    variant="outline"
                    className="border-white/10 hover:bg-white/[0.04]"
                    data-testid="button-save-detail"
                  >
                    {activeSwipe.saved ? (
                      <><BookmarkCheck className="h-4 w-4 mr-1.5 text-indigo-300" /> Saved</>
                    ) : (
                      <><Bookmark className="h-4 w-4 mr-1.5" /> Save</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/[0.04]"
                    onClick={() => copy(activeSwipe.text, activeSwipe.id + "-detail")}
                  >
                    {copiedId === activeSwipe.id + "-detail" ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                    Copy
                  </Button>
                  {activeSwipe.sourceUrl && (
                    <a href={activeSwipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-white/10 hover:bg-white/[0.04]">
                        <ExternalLink className="h-4 w-4 mr-1.5" /> Source
                      </Button>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link href={remixHookHref(activeSwipe)}>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500" data-testid="button-remix-hook">
                      <Zap className="h-4 w-4 mr-1.5" /> Remix in Hook Lab
                    </Button>
                  </Link>
                  <Link href={remixCaptionHref(activeSwipe)}>
                    <Button className="w-full bg-pink-600 hover:bg-pink-500" data-testid="button-remix-caption">
                      <Wand2 className="h-4 w-4 mr-1.5" /> Remix as Caption
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

function FilterChips({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  testId: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 mr-2">
      <span className="text-slate-500 mr-1">{label}:</span>
      <button
        onClick={() => onChange("all")}
        className={cn(
          "px-2 py-1 rounded-md border transition-colors",
          value === "all"
            ? "bg-indigo-500/15 text-indigo-200 border-indigo-400/30"
            : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white"
        )}
        data-testid={`${testId}-all`}
      >
        all
      </button>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "px-2 py-1 rounded-md border capitalize transition-colors",
            value === o
              ? "bg-indigo-500/15 text-indigo-200 border-indigo-400/30"
              : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white"
          )}
          data-testid={`${testId}-${o}`}
        >
          {o.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
