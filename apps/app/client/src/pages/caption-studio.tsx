import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, Copy, Check, Loader2, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import { BrandVoiceToggle } from "@/components/brand-voice-toggle";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CaptionResult {
  id: string;
  rewrittenCaption: string;
  hashtags: string[];
  viralScore: number;
  improvements: string[];
  variants: Array<{ tone: string; caption: string }>;
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin"];

export default function CaptionStudio() {
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [prefillNote, setPrefillNote] = useState<string | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("caption");
    const p = params.get("platform");
    const from = params.get("from");
    const src = params.get("source");
    if (c) setCaption(c);
    if (p && PLATFORMS.includes(p)) setPlatform(p);
    if (src) setSource(src);
    if (from === "swipe" && c) {
      setPrefillNote("Remixing from swipe file — adapt the wording, then rewrite for your voice.");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/caption-studio/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, useBrandVoice, source }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<CaptionResult>;
    },
    onSuccess: (data) => setResult(data),
    onError: () => toast({ title: "Rewrite failed", description: "Please try again", variant: "destructive" }),
  });

  const doCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Create"
          title="Caption Studio"
          description="Paste your caption. AI rewrites it for virality with hashtags and tone variants."
        />

        {prefillNote && (
          <div className="card-base p-4 mb-6 text-meta text-[var(--score-50)] border-amber-500/20" data-testid="banner-prefill">
            {prefillNote}
          </div>
        )}

        <div className="card-base card-pop p-6 space-y-4 mb-8">
          <div>
            <label className="text-eyebrow mb-2 block">Your draft caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Paste your caption here…"
              className="bg-secondary border-border text-foreground"
              rows={5}
              data-testid="input-caption"
            />
            <div className="text-meta mt-1.5">{caption.length} characters</div>
          </div>
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
                      ? "bg-rose-500/20 text-destructive border-rose-500/40"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-[var(--border-strong)]"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <BrandVoiceToggle enabled={useBrandVoice} onChange={setUseBrandVoice} />
          <Button
            onClick={() => mutation.mutate()}
            disabled={!caption.trim() || mutation.isPending}
            className="w-full bg-rose-600 hover:bg-rose-500"
            data-testid="button-rewrite"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Rewriting…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Rewrite for virality</>
            )}
          </Button>
        </div>

        {!result && !mutation.isPending && (
          <EmptyState
            icon={Wand2}
            title="Your rewritten caption will appear here"
            description="With viral score, strategic hashtags, and three alternate-tone variants."
          />
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="card-base card-pop p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-eyebrow mb-1">Rewritten caption</div>
                  <h3 className="text-h3 text-foreground">Optimised for {platform}</h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ScoreRing score={result.viralScore} size={88} strokeWidth={8} label="Viral" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => doCopy(result.rewrittenCaption, "main")}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-copy-main"
                  >
                    {copied === "main" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="rounded-xl bg-secondary border border-border p-4 mb-4 whitespace-pre-wrap text-foreground leading-relaxed" data-testid="text-rewritten-caption">
                {result.rewrittenCaption}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-eyebrow">Hashtags</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => doCopy(result.hashtags.join(" "), "hashtags")}
                  className="text-muted-foreground hover:text-foreground ml-auto h-7"
                >
                  {copied === "hashtags" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-secondary border border-border text-muted-foreground rounded-md text-sm" data-testid={`tag-${i}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="card-base p-6">
              <h3 className="text-h3 text-foreground mb-4">What changed</h3>
              <ul className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-emerald-400 mt-1">→</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-h3 text-foreground mb-3">Tone variants</h3>
              <div className="space-y-3">
                {result.variants.map((v, i) => (
                  <div key={i} className="card-base card-hover p-5" data-testid={`variant-${i}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize text-eyebrow text-primary">{v.tone}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => doCopy(v.caption, `variant-${i}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === `variant-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{v.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
