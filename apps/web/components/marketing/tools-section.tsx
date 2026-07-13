import {
  FileText,
  Hash,
  Image,
  Lightbulb,
  MessageCircle,
  Radar,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { TOOLS } from "@repo/config";

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

export function ToolsSection() {
  return (
    <section id="tools" className="scroll-mt-20 border-t border-[var(--border-subtle)] px-6 py-24 md:py-[var(--s-24)]">
      <div className="mx-auto max-w-6xl">
        <p className="text-micro mb-4 text-[var(--text-tertiary)]">Creation suite</p>
        <h2 className="text-display mb-3 max-w-2xl text-[28px] font-semibold leading-tight md:text-[40px]">
          Toolbox parity — with a spine they can&apos;t copy.
        </h2>
        <p className="mb-12 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Hook Lab, Script Doctor, Captions, Thumbnails, Trends, Competitor
          Intel, DM automation, BioPage — all reading the same Viral Score
          history.
        </p>

        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon as keyof typeof iconMap] ?? TrendingUp;
            return (
              <li key={tool.id}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] bg-[var(--accent-muted)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="text-display mb-1.5 text-lg font-semibold">
                  {tool.name}
                </h3>
                <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  {tool.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
