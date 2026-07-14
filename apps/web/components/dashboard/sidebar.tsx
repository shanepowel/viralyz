import Link from "next/link";
import {
  APP_NAME,
  TOOLS,
  getPublicAppPath,
  getPublicAppUrl,
} from "@repo/config";
import {
  FileText,
  Hash,
  Image,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Radar,
  Settings,
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

export function DashboardSidebar() {
  const home = getPublicAppUrl();
  const settings = getPublicAppPath("/settings");

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border-subtle)] px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] bg-[var(--accent)] text-sm font-semibold text-white">
            V
          </div>
          <span className="text-display font-semibold">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <a
          href={home}
          className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </a>

        <div className="pt-4">
          <p className="text-micro mb-2 px-3 text-[var(--text-tertiary)]">
            Tools
          </p>
          {TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon as keyof typeof iconMap] ?? TrendingUp;
            return (
              <a
                key={tool.id}
                href={getPublicAppPath(tool.href)}
                className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tool.name}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-4">
        <a
          href={settings}
          className="flex items-center gap-3 rounded-[var(--r-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <Settings className="h-4 w-4" />
          Settings
        </a>
      </div>
    </aside>
  );
}
