import Link from "next/link";
import { APP_NAME, TOOLS } from "@repo/config";
import {
  Calendar,
  FileText,
  Hash,
  Image,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Store,
  TrendingUp,
  UserCircle,
  Users,
  Video,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  FileText,
  Users,
  Video,
  UserCircle,
  Hash,
  Image,
  Calendar,
  MessageCircle,
  Store,
};

export function DashboardSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/[0.06] bg-card/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>

        <div className="pt-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Tools
          </p>
          {TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon as keyof typeof iconMap];
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tool.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
