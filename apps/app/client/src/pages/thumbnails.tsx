import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Image as ImageIcon, Sparkles, Trash2, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ThumbIdea {
  prompt: string;
  style: string;
  ctrScore: number;
  notes: string;
}

interface Thumbnail {
  id: string;
  prompt: string;
  style: string | null;
  platform: string | null;
  imageUrl: string;
  ctrScore: number | null;
  notes: string | null;
  createdAt: string;
}

const PLATFORMS = ["youtube", "tiktok", "instagram", "twitter", "linkedin"];

export default function Thumbnails() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [ideas, setIdeas] = useState<ThumbIdea[] | null>(null);
  const [renderingIdx, setRenderingIdx] = useState<number | null>(null);

  const { data: thumbs } = useQuery<Thumbnail[]>({
    queryKey: ["/api/thumbnails"],
    queryFn: async () => {
      const res = await fetch("/api/thumbnails");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const generateIdeas = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/thumbnails/ideas", { topic: topic.trim(), platform, count: 3 });
      return res.json() as Promise<ThumbIdea[]>;
    },
    onSuccess: (data) => setIdeas(data),
    onError: (e: any) => toast({ title: "Failed", description: e?.message || "Try again", variant: "destructive" }),
  });

  const renderOne = useMutation({
    mutationFn: async (idea: ThumbIdea & { idx: number }) => {
      setRenderingIdx(idea.idx);
      const res = await apiRequest("POST", "/api/thumbnails/render", {
        prompt: idea.prompt,
        style: idea.style,
        platform,
        ctrScore: idea.ctrScore,
        notes: idea.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/thumbnails"] });
      toast({ title: "Thumbnail ready", description: "Saved to your library." });
    },
    onError: (e: any) => toast({ title: "Render failed", description: e?.message || "Try again", variant: "destructive" }),
    onSettled: () => setRenderingIdx(null),
  });

  const del = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/thumbnails/${id}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/thumbnails"] }),
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          eyebrow="Create"
          title="Thumbnail Studio"
          description="Generate scroll-stopping thumbnails. AI brainstorms three concepts, then renders the one you pick."
        />

        <div className="card-base card-pop p-6 mb-8">
          <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's the video about? e.g. 'I tried the viral 5 AM routine for 30 days'"
              className="bg-white/[0.04] border-white/[0.08] h-11"
              data-testid="input-thumbnail-topic"
            />
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08] h-11" data-testid="select-platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => generateIdeas.mutate()}
              disabled={!topic.trim() || generateIdeas.isPending}
              className="bg-orange-600 hover:bg-orange-500 h-11"
              data-testid="button-generate-ideas"
            >
              {generateIdeas.isPending ? "Brainstorming..." : <><Sparkles className="h-4 w-4 mr-1.5" /> Brainstorm</>}
            </Button>
          </div>
        </div>

        {ideas && ideas.length > 0 && (
          <div className="mb-10">
            <h2 className="text-h2 mb-4">Concepts</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {ideas.map((idea, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="card-base p-5"
                  data-testid={`card-idea-${idx}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-eyebrow">{idea.style}</div>
                      <div className="text-h3 mt-1">Concept {idx + 1}</div>
                    </div>
                    <div className="rounded-md px-2 py-1 text-xs font-semibold tabular-nums score-bg-emerald">
                      CTR {idea.ctrScore}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-4 mb-3">{idea.prompt}</p>
                  {idea.notes && <p className="text-xs text-slate-500 mb-4 italic">{idea.notes}</p>}
                  <Button
                    onClick={() => renderOne.mutate({ ...idea, idx })}
                    disabled={renderingIdx === idx}
                    className="w-full bg-orange-600 hover:bg-orange-500"
                    data-testid={`button-render-${idx}`}
                  >
                    {renderingIdx === idx ? "Rendering..." : <><Wand2 className="h-4 w-4 mr-1.5" /> Render this (1 credit)</>}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-h2 mb-4">Your library</h2>
        {!thumbs || thumbs.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No thumbnails yet"
            description="Brainstorm concepts above, then render the one that fits."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {thumbs.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="card-base overflow-hidden group"
                data-testid={`thumb-${t.id}`}
              >
                <div className="aspect-video relative">
                  <img src={t.imageUrl} alt={t.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                    <a
                      href={t.imageUrl}
                      download={`thumbnail-${t.id}.png`}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </a>
                    <button
                      onClick={() => del.mutate(t.id)}
                      className="ml-auto bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur p-1.5 rounded-lg"
                      data-testid={`button-delete-thumb-${t.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-meta capitalize">{t.style} · {t.platform}</div>
                  <div className="text-sm line-clamp-2 mt-1">{t.prompt}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
