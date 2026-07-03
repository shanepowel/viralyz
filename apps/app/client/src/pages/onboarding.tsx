import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Check, TrendingUp, Calendar, Crown, Megaphone, Linkedin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", color: "from-pink-500 to-rose-500" },
  { value: "instagram", label: "Instagram", color: "from-amber-500 to-orange-400" },
  { value: "youtube", label: "YouTube", color: "from-red-500 to-orange-500" },
  { value: "twitter", label: "X / Twitter", color: "from-slate-400 to-slate-200" },
  { value: "linkedin", label: "LinkedIn", color: "from-sky-500 to-blue-500" },
  { value: "twitch", label: "Twitch", color: "from-amber-500 to-orange-500" },
];

const GOALS = [
  { value: "grow", label: "Grow my audience", icon: TrendingUp },
  { value: "viral", label: "Go viral", icon: Sparkles },
  { value: "consistency", label: "Post more consistently", icon: Calendar },
  { value: "monetize", label: "Monetize my content", icon: Crown },
  { value: "brand", label: "Build a brand", icon: Megaphone },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/onboarding", {
        primaryPlatform: platform,
        primaryNiche: niche.trim().toLowerCase(),
        goal,
        completed: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      setLocation("/");
    },
  });

  // Step 4 (optional): "Connect LinkedIn now or skip" so the agent can
  // start posting immediately. We poll the LinkedIn status so the green
  // "Connected" state appears as soon as the OAuth popup completes.
  const linkedin = useQuery<{ connected: boolean; configured: boolean; profileName?: string }>({
    queryKey: ["/api/linkedin/status"],
    enabled: step === 3,
    refetchInterval: step === 3 ? 3000 : false,
  });

  const canNext =
    (step === 0 && !!platform) ||
    (step === 1 && niche.trim().length >= 2) ||
    (step === 2 && !!goal) ||
    step === 3;

  const next = () => {
    if (step < 3) setStep(step + 1);
    else save.mutate();
  };

  return (
    <div className="min-h-screen bg-background aurora-bg flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <ViralyzWordmark size={32} variant="dark" />
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i <= step ? "w-8 bg-orange-400" : "w-4 bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-base card-pop p-8"
            >
              <div className="text-eyebrow mb-3">Step 1 of 4</div>
              <h1 className="text-h1 mb-2">Where do you create?</h1>
              <p className="text-slate-400 mb-6">We tune analyses, hooks, and timing to your main platform.</p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      platform === p.value
                        ? "border-orange-400 bg-orange-500/10"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    )}
                    data-testid={`button-platform-${p.value}`}
                  >
                    <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br mb-2", p.color)} />
                    <div className="font-semibold">{p.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-base card-pop p-8"
            >
              <div className="text-eyebrow mb-3">Step 2 of 4</div>
              <h1 className="text-h1 mb-2">What's your niche?</h1>
              <p className="text-slate-400 mb-6">Be specific — "personal finance for Gen Z" beats "money".</p>
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. fitness, fintech, food vlogs..."
                className="bg-white/[0.04] border-white/[0.08] text-base h-12"
                data-testid="input-niche"
                autoFocus
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {["fitness", "fashion", "tech", "food", "travel", "comedy", "finance", "education"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.16] text-slate-300"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-base card-pop p-8"
            >
              <div className="text-eyebrow mb-3">Step 3 of 4</div>
              <h1 className="text-h1 mb-2">What's your main goal?</h1>
              <p className="text-slate-400 mb-6">We'll prioritize the right tools and notifications.</p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                      goal === g.value
                        ? "border-orange-400 bg-orange-500/10"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    )}
                    data-testid={`button-goal-${g.value}`}
                  >
                    <div className="h-9 w-9 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <g.icon className="h-4 w-4 text-orange-300" />
                    </div>
                    <span className="font-medium flex-1">{g.label}</span>
                    {goal === g.value && <Check className="h-4 w-4 text-orange-300" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-base card-pop p-8"
            >
              <div className="text-eyebrow mb-3">Step 4 of 4 · Optional</div>
              <h1 className="text-h1 mb-2">Connect LinkedIn</h1>
              <p className="text-slate-400 mb-6">
                Hook up LinkedIn now and the agent can post for you the moment
                you approve a draft. You can always do this later from Settings.
              </p>
              {!linkedin.data?.configured ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/90" data-testid="text-linkedin-not-configured">
                  LinkedIn isn't configured on this server yet. Skip this step
                  for now — you can connect anytime from Settings once it's set
                  up.
                </div>
              ) : linkedin.data?.connected ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3" data-testid="status-linkedin-connected">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-100">Connected</div>
                    <div className="text-xs text-emerald-200/70">
                      {linkedin.data.profileName ? `Posting as ${linkedin.data.profileName}.` : "The agent can now publish on your behalf."}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/api/linkedin/connect"
                  className="block"
                  data-testid="link-connect-linkedin"
                >
                  <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20 p-4 flex items-center gap-3 transition-all">
                    <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <Linkedin className="h-5 w-5 text-sky-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Connect LinkedIn</div>
                      <div className="text-xs text-slate-400">OAuth — we only request post + profile scopes.</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </a>
              )}
              <p className="text-xs text-slate-500 mt-4">
                v0 always pauses for your approval before publishing. Nothing posts silently.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} data-testid="button-back">
              Back
            </Button>
          ) : (
            <button
              onClick={async () => {
                await apiRequest("POST", "/api/onboarding", { completed: true });
                qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
                setLocation("/");
              }}
              className="text-sm text-slate-400 hover:text-white"
              data-testid="button-skip"
            >
              Skip for now
            </button>
          )}
          <Button
            onClick={next}
            disabled={!canNext || save.isPending}
            className="bg-orange-600 hover:bg-orange-500"
            data-testid="button-next"
          >
            {save.isPending
              ? "Saving…"
              : step === 3
                ? (linkedin.data?.connected ? "Get started" : "Skip & finish")
                : "Continue"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
