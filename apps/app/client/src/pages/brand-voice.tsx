import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Mic2, Plus, Trash2, Sparkles, Star, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BrandVoiceProfile {
  id: string;
  name: string;
  isDefault: boolean;
  toneSummary: string | null;
  vocabulary: string[] | null;
  doRules: string[] | null;
  dontRules: string[] | null;
  signatureMoves: string[] | null;
  createdAt: string;
}

export default function BrandVoice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [samples, setSamples] = useState<string[]>([""]);

  const { data: profiles, isLoading } = useQuery<BrandVoiceProfile[]>({
    queryKey: ["/api/brand-voice"],
    queryFn: async () => {
      const res = await fetch("/api/brand-voice");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/brand-voice", {
        name: name.trim(),
        samples: samples.map((s) => s.trim()).filter(Boolean),
        isDefault: !profiles || profiles.length === 0,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Brand voice created", description: "Your tone profile is ready." });
      qc.invalidateQueries({ queryKey: ["/api/brand-voice"] });
      setOpen(false);
      setName("");
      setSamples([""]);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.message || "Try again", variant: "destructive" }),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/brand-voice/${id}`, { isDefault: true });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/brand-voice"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/brand-voice/${id}`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/brand-voice"] }),
  });

  const validSamples = samples.map((s) => s.trim()).filter(Boolean);
  const canSave = name.trim().length > 0 && validSamples.length >= 3 && validSamples.length <= 10;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Plan"
          title="Brand Voice"
          description="Train Viralyz on your past posts so every AI suggestion sounds like you."
          actions={
            <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500" data-testid="button-add-voice">
              <Plus className="h-4 w-4 mr-1.5" /> New voice
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[0, 1].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : !profiles || profiles.length === 0 ? (
          <EmptyState
            icon={Mic2}
            title="No brand voice yet"
            description="Paste 3-5 of your best posts and we'll capture your tone, vocabulary, and signature moves."
            action={
              <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
                <Plus className="h-4 w-4 mr-1.5" /> Train your voice
              </Button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {profiles.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="card-base p-5"
                data-testid={`card-voice-${p.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-h3">{p.name}</h3>
                      {p.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> Default
                        </span>
                      )}
                    </div>
                    <div className="text-meta mt-1">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!p.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefault.mutate(p.id)}
                        data-testid={`button-set-default-${p.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" /> Set default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => del.mutate(p.id)}
                      data-testid={`button-delete-${p.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </div>

                {p.toneSummary && <p className="text-sm text-slate-300 mb-4">{p.toneSummary}</p>}

                {p.signatureMoves && p.signatureMoves.length > 0 && (
                  <div className="mb-3">
                    <div className="text-eyebrow mb-1.5">Signature moves</div>
                    <ul className="space-y-1">
                      {p.signatureMoves.slice(0, 3).map((m, i) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-2">
                          <Sparkles className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" /> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {p.doRules && p.doRules.length > 0 && (
                    <div>
                      <div className="text-eyebrow text-emerald-400 mb-1.5">Do</div>
                      <ul className="space-y-0.5">
                        {p.doRules.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-[11px] text-slate-300">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.dontRules && p.dontRules.length > 0 && (
                    <div>
                      <div className="text-eyebrow text-rose-400 mb-1.5">Don't</div>
                      <ul className="space-y-0.5">
                        {p.dontRules.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-[11px] text-slate-300">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle>Train your brand voice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-eyebrow block mb-1.5">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My TikTok voice"
                className="bg-white/[0.04] border-white/[0.08]"
                data-testid="input-voice-name"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-eyebrow">Sample posts ({validSamples.length}/3–10 required)</label>
                <button
                  className="text-xs text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
                  onClick={() => setSamples([...samples, ""])}
                  disabled={samples.length >= 10}
                >
                  + Add sample
                </button>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {samples.map((s, i) => (
                  <div key={i} className="relative">
                    <Textarea
                      value={s}
                      onChange={(e) => setSamples(samples.map((x, idx) => (idx === i ? e.target.value : x)))}
                      placeholder={i === 0 ? "Paste a recent post that sounds like you..." : "Another sample..."}
                      className="bg-white/[0.04] border-white/[0.08] min-h-[100px] pr-10"
                      data-testid={`textarea-sample-${i}`}
                    />
                    {samples.length > 1 && (
                      <button
                        onClick={() => setSamples(samples.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 h-6 w-6 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06]"
                        aria-label="Remove sample"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() => create.mutate()}
              disabled={!canSave || create.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500"
              data-testid="button-save-voice"
            >
              {create.isPending
                ? "Analyzing your voice..."
                : validSamples.length < 3
                  ? `Add ${3 - validSamples.length} more sample${3 - validSamples.length === 1 ? "" : "s"}`
                  : "Train brand voice (1 credit)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
