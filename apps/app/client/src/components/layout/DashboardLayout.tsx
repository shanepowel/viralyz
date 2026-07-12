import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, Sparkles, FolderOpen, BarChart3, Users, Settings,
  LogOut, CreditCard, Plus, MessageSquare,
  Wand2, Radar, Lightbulb, Zap, Calendar, Mic2, Image as ImageIcon, Clock,
  Search, User as UserIcon, Bookmark, Repeat, Bot, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationBell } from "@/components/NotificationBell";

function ViralyzMark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="rounded-lg bg-[#E85D3B] flex items-center justify-center shadow-[0_0_18px_-6px_rgba(232,93,59,0.65)]"
        style={{ width: size, height: size }}
      >
        <span className="bg-white rounded-sm" style={{ width: size * 0.36, height: size * 0.36 }} />
      </span>
      <span className="font-semibold text-lg tracking-tight text-white">Viralyz</span>
    </span>
  );
}

type NavItem = { icon: any; label: string; href: string; badge?: string };
type NavSection = { title: string | null; items: NavItem[] };

const sidebarSections: NavSection[] = [
  {
    title: null,
    items: [
      { icon: Home, label: "Mission Control", href: "/" },
      { icon: Bot, label: "Autopilot", href: "/autopilot", badge: "NEW" },
    ],
  },
  {
    title: "Competitive Intelligence",
    items: [
      { icon: Activity, label: "Pulse", href: "/intelligence", badge: "NEW" },
    ],
  },
  {
    title: "Manual mode",
    items: [
      { icon: Sparkles, label: "Analyze", href: "/analyze" },
      { icon: Zap, label: "Hook Lab", href: "/hook-lab" },
      { icon: Wand2, label: "Caption Studio", href: "/caption-studio" },
      { icon: Lightbulb, label: "Idea Generator", href: "/ideas" },
      { icon: ImageIcon, label: "Thumbnails", href: "/thumbnails" },
      { icon: Radar, label: "Trend Radar", href: "/trends" },
      { icon: Bookmark, label: "Swipe File", href: "/swipe-file" },
      { icon: Repeat, label: "Repurpose", href: "/repurpose" },
    ],
  },
  {
    title: "Plan & measure",
    items: [
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: Clock, label: "Best Time", href: "/insights" },
      { icon: FolderOpen, label: "My Content", href: "/content" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: Mic2, label: "Brand Voice", href: "/brand-voice" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: Users, label: "Community", href: "/community" },
      { icon: MessageSquare, label: "Messages", href: "/messages" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

const mobileNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Sparkles, label: "Analyze", href: "/analyze" },
  { icon: Bot, label: "Autopilot", href: "/autopilot" },
  { icon: Activity, label: "Pulse", href: "/intelligence" },
  { icon: BarChart3, label: "Stats", href: "/analytics" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const PLAN_LABEL: Record<string, string> = { free: "Free", pro: "Pro", team: "Team" };
const PLAN_TONE: Record<string, string> = {
  free: "bg-slate-500/15 text-slate-300 border-slate-400/20",
  pro: "bg-indigo-500/15 text-indigo-200 border-indigo-400/30",
  team: "bg-amber-500/15 text-amber-200 border-amber-400/30",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const credits = user?.creditsRemaining ?? 0;
  const plan = (user?.plan ?? "free") as string;
  const planLabel = PLAN_LABEL[plan] ?? "Free";
  const planTone = PLAN_TONE[plan] ?? PLAN_TONE.free;
  const initials = (user?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  const profileMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-9 w-9 rounded-full overflow-hidden border border-white/10 bg-white/[0.04] hover:border-white/20 transition-colors flex items-center justify-center"
          aria-label="Profile menu"
          data-testid="button-profile-menu"
        >
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-indigo-300">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-white/10 bg-slate-950">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium text-sm truncate">{user?.firstName || user?.email || "User"}</span>
          {user?.email && <span className="text-xs text-slate-500 truncate font-normal">{user.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.06]" />
        <Link href={user?.id ? `/profile/${user.id}` : "/settings"}>
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
            <UserIcon className="h-4 w-4 mr-2" /> Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-billing">
            <CreditCard className="h-4 w-4 mr-2" /> Plans &amp; billing
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-white/[0.06]" />
        <DropdownMenuItem
          className="cursor-pointer text-rose-300 focus:text-rose-200"
          onClick={() => logout()}
          data-testid="menu-logout"
        >
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background text-white flex aurora-bg">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 bg-black/30 backdrop-blur-md border-r border-white/[0.06] z-30">
        <div className="px-5 py-5">
          <Link href="/">
            <div className="inline-flex items-center cursor-pointer" data-testid="link-logo">
              <ViralyzMark size={32} />
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-2">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150",
                        isActive
                          ? "bg-white/[0.06] text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-indigo-300")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                          {item.badge}
                        </span>
                      )}
                      {isActive && !item.badge && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <Link href="/settings">
            <div className="card-base card-hover p-3 cursor-pointer" data-testid="card-credits-sidebar">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">Credits</span>
                <span className="text-xs font-semibold text-indigo-300 tabular-nums">{credits} left</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, credits * 10)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center text-[11px] text-slate-400">
                <CreditCard className="h-3 w-3 mr-1" />
                {plan === "pro" ? "Pro plan" : plan === "team" ? "Team plan" : "Upgrade plan"}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60 min-w-0">
        {/* Top bar (desktop) */}
        <header className="hidden lg:flex sticky top-0 z-20 h-14 items-center gap-3 px-6 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex-1 max-w-md flex items-center gap-3 px-3 py-2 rounded-lg text-left bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-slate-400 hover:text-slate-200"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm flex-1">Search anything…</span>
            <span className="kbd-pill">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="kbd-pill">K</span>
          </button>
          <div className="flex-1" />
          <Link href="/settings">
            <div
              className="hidden xl:flex items-center gap-2 px-3 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.12] cursor-pointer transition-colors"
              data-testid="chip-credits"
              title="Credits remaining"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span className="text-xs font-semibold tabular-nums text-slate-200">{credits}</span>
              <span className="text-[11px] text-slate-500">credits</span>
            </div>
          </Link>
          <Link href="/settings">
            <span
              className={cn(
                "inline-flex items-center px-2.5 h-9 rounded-full border text-[11px] font-semibold uppercase tracking-wide cursor-pointer",
                planTone
              )}
              data-testid="badge-plan"
            >
              {planLabel}
            </span>
          </Link>
          <Link href="/analyze">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" data-testid="button-new-analysis">
              <Plus className="h-4 w-4 mr-1.5" /> New analysis
            </Button>
          </Link>
          <NotificationBell />
          {profileMenu}
        </header>

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 h-14 gap-2">
            <Link href="/">
              <div className="cursor-pointer">
                <ViralyzMark size={26} />
              </div>
            </Link>
            <Link href="/settings" className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-white/[0.04] border border-white/[0.08]" data-testid="chip-credits-mobile">
                <Sparkles className="h-3 w-3 text-indigo-300" />
                <span className="text-[11px] font-semibold tabular-nums text-slate-200">{credits}</span>
                <span className={cn("ml-1 inline-flex items-center px-1.5 h-5 rounded-full border text-[9px] font-semibold uppercase tracking-wide", planTone)}>
                  {planLabel}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setPaletteOpen(true)}
              className="h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-300"
              data-testid="button-search-mobile"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <NotificationBell />
            {profileMenu}
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/85 backdrop-blur-xl border-t border-white/[0.06] safe-area-pb">
        <div className="flex items-center justify-around py-1.5">
          {mobileNavItems.map((item) => {
            const isActive = location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-white" : "text-slate-500"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive && "text-indigo-300")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
