import Link from "next/link";
import { TOOLS } from "@repo/config";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@repo/ui/score-ring";
import {
  ArrowRight,
  FileText,
  Hash,
  Image,
  Lightbulb,
  MessageCircle,
  Plus,
  Radar,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  Zap,
  FileText,
  Hash,
  Image,
  Lightbulb,
  Radar,
  Users,
  MessageCircle,
  Store,
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl font-semibold">Welcome back</h1>
          <p className="text-[var(--text-secondary)]">
            Your creator OS — pick a tool. Every analysis feeds your Viral Score
            history.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New analysis
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-micro text-[var(--text-tertiary)]">Credits</p>
          <p className="text-display mt-1 text-3xl font-semibold">10</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Free plan</p>
        </div>
        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-micro text-[var(--text-tertiary)]">Analyses</p>
          <p className="text-display mt-1 text-3xl font-semibold">0</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">This month</p>
        </div>
        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-micro text-[var(--text-tertiary)]">Competitors</p>
          <p className="text-display mt-1 text-3xl font-semibold">0</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Up to 3 on free</p>
        </div>
        <div className="flex items-center gap-4 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <ScoreRing score={null} size={64} label="Avg" animate={false} />
          <div>
            <p className="text-micro text-[var(--text-tertiary)]">Avg score</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Analyze content to unlock
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-display mb-4 text-lg font-semibold">Quick launch</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap] ?? TrendingUp;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] bg-[var(--accent-muted)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 font-semibold">{tool.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
