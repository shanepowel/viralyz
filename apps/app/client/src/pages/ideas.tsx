import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Loader2, Bookmark, BookmarkCheck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import { BrandVoiceToggle } from "@/components/brand-voice-toggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Idea {
  id: string;
  title: string;
  hook: string | null;
  outline: string[] | null;
  predictedScore: number | null;
  difficulty: string | null;
  saved: boolean;
  niche: string;
  platform: string;
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin"];

const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-emerald-500/15 text-[var(--score-90)] border-emerald-500/25",
  medium: "bg-amber-500/15 text-[var(--score-50)] border-amber-500/25",
  hard: "bg-rose-500/15 text-destructive border-rose-500/25",
};

export default function Ideas() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const queryClient = useQueryClient();

  const { data: ideas } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
    queryFn: async () => {
      const res = await fetch("/api/ideas");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim().toLowerCase(), platform, count: 8, useBrandVoice }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/ideas"] }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      await fetch(`/api/ideas/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/ideas"] }),
  });

  const visibleIdeas = (ideas || []).filter((i) => (filter === "saved" ? i.saved : true));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          eyebrow="Create"
          title="Idea Generator"
          description="Stop staring at a blank page. AI brainstorms your next 8 viral ideas."
        />

        <div className="card-base card-pop p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-eyebrow mb-2 block">Your niche</label>
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. fitness, productivity, finance, beauty"
                className="bg-secondary border-border text-foreground"
                data-testid="input-niche"
              />
            </div>
            <div>
              <label className="text-eyebrow mb-2 block">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-10 bg-secondary border border-border rounded-md text-foreground px-3 capitalize"
                data-testid="select-platform"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p} className="capitalize bg-card">{p}</option>
                ))}
              </select>
            </div>
          </div>
          <BrandVoiceToggle enabled={useBrandVoice} onChange={setUseBrandVoice} />
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!niche.trim() || generateMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-500"
            data-testid="button-generate-ideas"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Brainstorming…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate 8 ideas</>
            )}
          </Button>
        </div>

        {ideas && ideas.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="filter-all"
            >
              All ({ideas.length})
            </button>
            <button
              onClick={() => setFilter("saved")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === "saved" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="filter-saved"
            >
              Saved ({ideas.filter((i) => i.saved).length})
            </button>
          </div>
        )}

        {visibleIdeas.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No ideas yet"
            description="Set your niche and platform above, then generate 8 fresh ideas with predicted scores."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleIdeas.map((idea, idx) => {
              const tone = scoreTone(idea.predictedScore);
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.025, ease: [0.22, 1, 0.36, 1] }}
                  className="card-base card-hover p-5 flex flex-col"
                  data-testid={`card-idea-${idx}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {idea.difficulty && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium border capitalize",
                            DIFFICULTY_TONE[idea.difficulty] || "bg-secondary text-muted-foreground border-border"
                          )}
                        >
                          {idea.difficulty}
                        </span>
                      )}
                      <span className="text-meta capitalize">{idea.platform} · {idea.niche}</span>
                    </div>
                    <button
                      onClick={() => saveMutation.mutate({ id: idea.id, saved: !idea.saved })}
                      className="text-muted-foreground hover:text-[var(--score-50)] transition-colors"
                      data-testid={`button-save-${idx}`}
                    >
                      {idea.saved ? (
                        <BookmarkCheck className="h-5 w-5 text-[var(--score-50)]" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-h3 text-foreground mb-2 leading-tight">{idea.title}</h3>
                  {idea.hook && (
                    <p className="text-sm text-muted-foreground italic mb-3 leading-relaxed">"{idea.hook}"</p>
                  )}
                  {idea.outline && idea.outline.length > 0 && (
                    <ul className="space-y-1 mb-4 text-sm text-muted-foreground flex-1">
                      {idea.outline.slice(0, 5).map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[var(--score-50)] mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 divider-soft">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-base font-bold tabular-nums score-bg-${tone}`}>
                        {idea.predictedScore ?? "—"}
                      </span>
                      <span className="text-meta">Predicted</span>
                    </div>
                    <Link href={`/hook-lab?topic=${encodeURIComponent(idea.title)}`}>
                      <Button size="sm" variant="ghost" className="text-[var(--score-50)] hover:text-[var(--score-50)]" data-testid={`button-develop-${idx}`}>
                        Develop <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
