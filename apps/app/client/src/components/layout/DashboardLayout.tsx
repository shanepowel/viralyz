import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, Sparkles, FolderOpen, BarChart3, Users, Settings,
  LogOut, CreditCard, Plus, MessageSquare, Zap,
  Wand2, Radar, Lightbulb, Calendar, Mic2, Image as ImageIcon, Clock,
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
  const ring = Math.round(size * 0.7);
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="rounded-full border-[3px] border-primary border-t-[var(--score-90)] -rotate-45 shrink-0"
        style={{ width: ring, height: ring }}
        aria-hidden
      />
      <span className="font-display font-bold text-lg tracking-tight text-foreground">
        Viralyz
      </span>
    </span>
  );
}

type NavItem = { icon: typeof Home; label: string; href: string; badge?: string };
type NavSection = { title: string | null; items: NavItem[] };

/** Score-first IA — one primary job, then create / grow / prove */
const sidebarSections: NavSection[] = [
  {
    title: null,
    items: [
      { icon: Home, label: "Home", href: "/" },
      { icon: Sparkles, label: "Score content", href: "/analyze" },
    ],
  },
  {
    title: "Create",
    items: [
      { icon: Zap, label: "Hook Lab", href: "/hook-lab" },
      { icon: Wand2, label: "Caption Studio", href: "/caption-studio" },
      { icon: Lightbulb, label: "Ideas", href: "/ideas" },
      { icon: ImageIcon, label: "Thumbnails", href: "/thumbnails" },
      { icon: Mic2, label: "Brand Voice", href: "/brand-voice" },
    ],
  },
  {
    title: "Grow",
    items: [
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: Radar, label: "Trends", href: "/trends" },
      { icon: Clock, label: "Best time", href: "/insights" },
      { icon: Activity, label: "Competitors", href: "/intelligence" },
      { icon: Bot, label: "Autopilot", href: "/autopilot" },
    ],
  },
  {
    title: "Prove",
    items: [
      { icon: FolderOpen, label: "My content", href: "/content" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: Bookmark, label: "Swipe file", href: "/swipe-file" },
      { icon: Repeat, label: "Repurpose", href: "/repurpose" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Users, label: "Community", href: "/community" },
      { icon: MessageSquare, label: "Messages", href: "/messages" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

const mobileNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Sparkles, label: "Score", href: "/analyze" },
  { icon: Lightbulb, label: "Ideas", href: "/ideas" },
  { icon: Calendar, label: "Plan", href: "/calendar" },
  { icon: Settings, label: "More", href: "/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const PLAN_LABEL: Record<string, string> = { free: "Free", pro: "Creator", team: "Studio" };
const PLAN_TONE: Record<string, string> = {
  free: "bg-secondary text-muted-foreground border-border",
  pro: "bg-[rgba(108,76,241,0.1)] text-[var(--accent-hover)] border-[rgba(108,76,241,0.25)]",
  team: "bg-[rgba(15,169,104,0.1)] text-[var(--score-90)] border-[rgba(15,169,104,0.25)]",
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
          className="h-9 w-9 rounded-full overflow-hidden border border-border bg-secondary hover:border-[var(--border-strong)] transition-colors flex items-center justify-center"
          aria-label="Profile menu"
          data-testid="button-profile-menu"
        >
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-primary">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium text-sm truncate">{user?.firstName || user?.email || "User"}</span>
          {user?.email && <span className="text-xs text-muted-foreground truncate font-normal">{user.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => logout()}
          data-testid="menu-logout"
        >
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex aurora-bg">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <aside className="hidden lg:flex w-[260px] flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-30">
        <div className="px-5 py-5">
          <Link href="/">
            <div className="inline-flex items-center cursor-pointer" data-testid="link-logo">
              <ViralyzMark size={32} />
            </div>
          </Link>
        </div>

        <div className="px-3 mb-3">
          <Link href="/analyze">
            <Button className="w-full justify-center gap-2 rounded-full" data-testid="button-score-sidebar">
              <Plus className="h-4 w-4" /> Score content
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-2">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {section.title && (
                <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground font-mono">
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
                        "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium cursor-pointer transition-colors duration-150",
                        isActive
                          ? "bg-[rgba(108,76,241,0.1)] text-[var(--accent-hover)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Link href="/settings">
            <div className="rounded-[16px] border border-border bg-secondary/60 p-3 cursor-pointer hover:border-[var(--border-strong)] transition-colors" data-testid="card-credits-sidebar">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Scores left</span>
                <span className="text-xs font-semibold text-primary tabular-nums font-mono">{credits}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, credits * 10)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
                <CreditCard className="h-3 w-3 mr-1" />
                {plan === "pro" || plan === "creator" ? "Creator plan" : plan === "team" ? "Studio plan" : "Free plan · Upgrade"}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[260px] min-w-0">
        <header className="hidden lg:flex sticky top-0 z-20 h-14 items-center gap-3 px-6 border-b border-border bg-background/85 backdrop-blur-xl">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex-1 max-w-md flex items-center gap-3 px-3 py-2 rounded-[10px] text-left bg-card border border-border hover:border-[var(--border-strong)] transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm flex-1">Search tools, content…</span>
            <span className="kbd-pill">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="kbd-pill">K</span>
          </button>
          <div className="flex-1" />
          <Link href="/settings">
            <div
              className="hidden xl:flex items-center gap-2 px-3 h-9 rounded-full bg-card border border-border hover:border-[var(--border-strong)] cursor-pointer transition-colors"
              data-testid="chip-credits"
              title="Scores remaining"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold tabular-nums font-mono">{credits}</span>
              <span className="text-[11px] text-muted-foreground">left</span>
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
            <Button size="sm" className="rounded-full" data-testid="button-new-analysis">
              <Plus className="h-4 w-4 mr-1.5" /> Score
            </Button>
          </Link>
          <NotificationBell />
          {profileMenu}
        </header>

        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 gap-2">
            <Link href="/">
              <div className="cursor-pointer">
                <ViralyzMark size={26} />
              </div>
            </Link>
            <Link href="/analyze">
              <Button size="sm" className="rounded-full h-8 px-3" data-testid="button-score-mobile">
                <Plus className="h-3.5 w-3.5 mr-1" /> Score
              </Button>
            </Link>
            <button
              onClick={() => setPaletteOpen(true)}
              className="h-9 w-9 rounded-[10px] bg-secondary flex items-center justify-center text-muted-foreground"
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

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-1.5">
          {mobileNavItems.map((item) => {
            const isActive = location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-[10px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className="h-5 w-5" />
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
