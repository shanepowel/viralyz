import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Sparkles, Zap, Wand2, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

interface SearchResults {
  analyses: Array<{ id: string; title: string | null; viralScore: number | null; platform: string | null }>;
  hooks: Array<{ id: string; topic: string; platform: string }>;
  captions: Array<{ id: string; original: string; platform: string; viralScore: number | null }>;
  ideas: Array<{ id: string; title: string; platform: string; predictedScore: number | null; saved: boolean }>;
}

function useQueryParam(name: string) {
  const [location] = useLocation();
  const u = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  return u.get(name) || "";
}

export default function SearchPage() {
  const initialQ = useQueryParam("q");
  const [q, setQ] = useState(initialQ);

  useEffect(() => setQ(initialQ), [initialQ]);

  const { data, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", q],
    queryFn: async () => {
      if (q.trim().length < 2) return { analyses: [], hooks: [], captions: [], ideas: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return { analyses: [], hooks: [], captions: [], ideas: [] };
      return res.json();
    },
    enabled: q.trim().length >= 2,
  });

  const total =
    (data?.analyses.length || 0) +
    (data?.hooks.length || 0) +
    (data?.captions.length || 0) +
    (data?.ideas.length || 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader eyebrow="Library" title="Search" description="Find any analysis, hook, caption, or idea you've created." />

        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your content..."
            className="bg-white/[0.04] border-white/[0.08] h-12 pl-11 text-base"
            autoFocus
            data-testid="input-search"
          />
        </div>

        {q.trim().length < 2 ? (
          <EmptyState icon={SearchIcon} title="Start typing" description="Search across analyses, hooks, captions, and ideas." />
        ) : isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : total === 0 ? (
          <EmptyState icon={SearchIcon} title="No matches" description={`Nothing found for "${q}".`} />
        ) : (
          <div className="space-y-8">
            {data!.analyses.length > 0 && (
              <Section title="Analyses" icon={Sparkles}>
                {data!.analyses.map((a) => (
                  <Link key={a.id} href={`/analyze/${a.id}`}>
                    <ResultRow title={a.title || "Untitled"} meta={a.platform} score={a.viralScore} testId={`result-analysis-${a.id}`} />
                  </Link>
                ))}
              </Section>
            )}
            {data!.ideas.length > 0 && (
              <Section title="Ideas" icon={Lightbulb}>
                {data!.ideas.map((i) => (
                  <Link key={i.id} href="/ideas">
                    <ResultRow title={i.title} meta={i.platform} score={i.predictedScore} testId={`result-idea-${i.id}`} />
                  </Link>
                ))}
              </Section>
            )}
            {data!.hooks.length > 0 && (
              <Section title="Hooks" icon={Zap}>
                {data!.hooks.map((h) => (
                  <Link key={h.id} href="/hook-lab">
                    <ResultRow title={h.topic} meta={h.platform} testId={`result-hook-${h.id}`} />
                  </Link>
                ))}
              </Section>
            )}
            {data!.captions.length > 0 && (
              <Section title="Captions" icon={Wand2}>
                {data!.captions.map((c) => (
                  <Link key={c.id} href="/caption-studio">
                    <ResultRow title={c.original} meta={c.platform} score={c.viralScore} testId={`result-caption-${c.id}`} />
                  </Link>
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-orange-300" />
        <h2 className="text-h3">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ResultRow({ title, meta, score, testId }: { title: string; meta?: string | null; score?: number | null; testId?: string }) {
  return (
    <div className="card-base card-hover p-4 cursor-pointer flex items-center gap-3" data-testid={testId}>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {meta && <div className="text-meta capitalize mt-0.5">{meta}</div>}
      </div>
      {typeof score === "number" && (
        <span className="rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums score-bg-indigo">{score}</span>
      )}
    </div>
  );
}
