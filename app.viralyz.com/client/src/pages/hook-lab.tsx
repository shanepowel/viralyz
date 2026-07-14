import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Copy, Check, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import { BrandVoiceToggle } from "@/components/brand-voice-toggle";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HookVariant {
  text: string;
  style: string;
  score: number;
  reasoning: string;
}

interface HookResult {
  id: string;
  hooks: HookVariant[];
  bestHookIndex: number;
  bestHookExplanation: string;
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin"];

export default function HookLab() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<HookResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [prefillNote, setPrefillNote] = useState<string | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("topic");
    const p = params.get("platform");
    const from = params.get("from");
    const src = params.get("source");
    if (t) setTopic(t);
    if (p && PLATFORMS.includes(p)) setPlatform(p);
    if (src) setSource(src);
    if (from === "swipe" && t) {
      setPrefillNote("Remixing from swipe file — adapt the wording, then generate hooks for your voice.");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/hook-lab/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, audience, useBrandVoice, source }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<HookResult>;
    },
    onSuccess: (data) => setResult(data),
    onError: () => toast({ title: "Generation failed", description: "Please try again", variant: "destructive" }),
  });

  const copyHook = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Create"
          title="Hook Lab"
          description="Generate 10 scroll-stopping hook variants in seconds. Pick the winner."
        />
        {prefillNote && (
          <div className="card-base p-4 mb-6 text-meta text-amber-200 border-amber-500/20" data-testid="banner-prefill">
            {prefillNote}
          </div>
        )}

        <div className="card-base card-pop p-6 space-y-4 mb-8">
          <div>
            <label className="text-eyebrow mb-2 block">What's your content about?</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How I built a $10K/month side hustle while working full-time"
              className="bg-white/[0.04] border-white/[0.08] text-white"
              rows={3}
              data-testid="input-topic"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/40"
                        : "bg-white/[0.025] text-slate-400 border-white/[0.06] hover:text-white hover:border-white/[0.12]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-eyebrow mb-2 block">Audience (optional)</label>
              <Input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. early-career devs, busy moms"
                className="bg-white/[0.04] border-white/[0.08] text-white"
                data-testid="input-audience"
              />
            </div>
          </div>
          <BrandVoiceToggle enabled={useBrandVoice} onChange={setUseBrandVoice} />
          <Button
            onClick={() => mutation.mutate()}
            disabled={!topic.trim() || mutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500"
            data-testid="button-generate-hooks"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Crafting hooks…</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" />Generate 10 Hooks</>
            )}
          </Button>
        </div>

        {!result && !mutation.isPending && (
          <EmptyState
            icon={Sparkles}
            title="Your 10 hook variants will appear here"
            description="Each hook is scored 0–100 on viral potential. The top pick is highlighted."
          />
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="card-base card-pop p-6 border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl score-bg-emerald flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-eyebrow mb-1.5 text-emerald-300">Top pick</div>
                  <p className="text-white text-lg font-medium mb-2" data-testid="text-best-hook">
                    "{result.hooks[result.bestHookIndex]?.text}"
                  </p>
                  <p className="text-sm text-slate-400">{result.bestHookExplanation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {result.hooks.map((hook, idx) => {
                const tone = scoreTone(hook.score);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "card-base card-hover p-5",
                      idx === result.bestHookIndex && "border-emerald-500/40"
                    )}
                    data-testid={`card-hook-${idx}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-slate-300 capitalize">
                          {hook.style}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold tabular-nums score-bg-${tone}`} data-testid={`text-score-${idx}`}>
                          {hook.score}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHook(hook.text, idx)}
                        className="text-slate-400 hover:text-white"
                        data-testid={`button-copy-${idx}`}
                      >
                        {copiedIdx === idx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-white text-base mb-2 leading-relaxed">"{hook.text}"</p>
                    <p className="text-sm text-slate-500">{hook.reasoning}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
