import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Trend {
  id: string;
  topic: string;
  category: string;
  hashtags: string[] | null;
  description: string | null;
  momentum: number | null;
  estimatedReach: string | null;
  bestFormat: string | null;
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin"];

const CATEGORY_TONE: Record<string, string> = {
  format: "bg-cyan-500/15 text-[var(--score-90)] border-cyan-500/25",
  topic: "bg-purple-500/15 text-purple-700 border-purple-500/25",
  challenge: "bg-amber-500/15 text-[var(--score-50)] border-amber-500/25",
  narrative: "bg-rose-500/15 text-destructive border-rose-500/25",
  audio: "bg-emerald-500/15 text-[var(--score-90)] border-emerald-500/25",
  debate: "bg-indigo-500/15 text-primary border-indigo-500/25",
};

export default function Trends() {
  const [platform, setPlatform] = useState("tiktok");
  const [niche, setNiche] = useState("general");
  const [nicheInput, setNicheInput] = useState("");

  const { data: trends, isLoading, refetch, isFetching } = useQuery<Trend[]>({
    queryKey: [`/api/trends?platform=${platform}&niche=${niche}`],
    queryFn: async () => {
      const res = await fetch(`/api/trends?platform=${platform}&niche=${niche}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const applyNiche = () => {
    const n = nicheInput.trim().toLowerCase();
    if (n) setNiche(n);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          eyebrow="Discover"
          title="Trend Radar"
          description="Catch trending topics, formats, and angles before they peak."
        />

        <div className="card-base card-pop p-6 space-y-4 mb-8">
          <div>
            <label className="text-eyebrow mb-2 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  data-testid={`button-platform-${p}`}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium capitalize transition-colors border",
                    platform === p
                      ? "bg-cyan-500/20 text-cyan-700 border-cyan-500/40"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-[var(--border-strong)]"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-eyebrow mb-2 block">Niche</label>
            <div className="flex gap-2">
              <Input
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder={`Current: ${niche}. Try "fitness", "tech", "fashion"…`}
                className="bg-secondary border-border text-foreground"
                onKeyDown={(e) => e.key === "Enter" && applyNiche()}
                data-testid="input-niche"
              />
              <Button onClick={applyNiche} className="bg-cyan-600 hover:bg-cyan-500" data-testid="button-set-niche">
                Set niche
              </Button>
            </div>
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-muted-foreground">Scanning the algorithm…</p>
          </div>
        ) : !trends || trends.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No trends loaded yet"
            description="Pick a platform and niche, then scan to see what's heating up."
            action={
              <Button onClick={() => refetch()} className="bg-cyan-600 hover:bg-cyan-500">
                Scan now
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, idx) => {
              const tone = scoreTone(trend.momentum);
              return (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  className="card-base card-hover p-5"
                  data-testid={`card-trend-${idx}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium border capitalize",
                        CATEGORY_TONE[trend.category] || "bg-secondary text-muted-foreground border-border"
                      )}
                    >
                      {trend.category}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md score-bg-${tone}`}>
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-sm font-bold tabular-nums">{trend.momentum ?? "—"}</span>
                    </div>
                  </div>
                  <h3 className="text-h3 text-foreground mb-2 leading-tight">{trend.topic}</h3>
                  {trend.description && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{trend.description}</p>
                  )}
                  <div className="space-y-1.5 mb-4 text-sm">
                    {trend.bestFormat && (
                      <div className="flex items-start gap-2">
                        <span className="text-meta">Best format:</span>
                        <span className="text-muted-foreground">{trend.bestFormat}</span>
                      </div>
                    )}
                    {trend.estimatedReach && (
                      <div className="flex items-start gap-2">
                        <span className="text-meta">Reach potential:</span>
                        <span className="text-[var(--score-90)] font-medium">{trend.estimatedReach}</span>
                      </div>
                    )}
                  </div>
                  {trend.hashtags && trend.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {trend.hashtags.slice(0, 6).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-secondary border border-border text-muted-foreground rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link href={`/hook-lab?topic=${encodeURIComponent(trend.topic)}`}>
                    <Button size="sm" variant="ghost" className="text-[var(--score-90)] hover:text-cyan-800 px-2" data-testid={`button-create-${idx}`}>
                      Create with this trend <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
