import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  MessageSquare,
  Zap,
  Radar,
  Calendar,
  Image as ImageIcon,
  Search,
  User as UserIcon,
  Activity,
  Sparkles,
  PenLine,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationBell } from "@/components/NotificationBell";

function LogoMark() {
  return (
    <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[17px] font-bold tracking-tight text-[var(--ink)]">
      <span
        className="inline-block h-5 w-5 rounded-full border-[3px] border-[var(--violet)] border-t-[var(--score-90)] -rotate-45"
        aria-hidden
      />
      Viralyz
    </span>
  );
}

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
};
type NavSection = { title: string | null; items: NavItem[] };

/** Journey map: Create → Grow → Earn (reference: docs/design/APP_SKIN.md) */
const sidebarSections: NavSection[] = [
  {
    title: null,
    items: [
      { icon: Home, label: "Home", href: "/" },
      { icon: FolderOpen, label: "Library", href: "/content", badge: undefined },
    ],
  },
  {
    title: "Create",
    items: [
      { icon: Zap, label: "Hook Lab", href: "/hook-lab" },
      { icon: PenLine, label: "Script Doctor", href: "/caption-studio" },
      { icon: ImageIcon, label: "Thumbnails", href: "/thumbnails" },
      { icon: MessageSquare, label: "Captions", href: "/caption-studio" },
    ],
  },
  {
    title: "Grow",
    items: [
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: Radar, label: "Trends", href: "/trends" },
      { icon: Activity, label: "Competitors", href: "/competitors" },
    ],
  },
  {
    title: "Earn",
    items: [
      { icon: LayoutTemplate, label: "Media Kit", href: "/settings" },
      { icon: MessageSquare, label: "Engage", href: "/messages" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
];

const mobileNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Sparkles, label: "Score", href: "/analyze" },
  { icon: FolderOpen, label: "Library", href: "/content" },
  { icon: Calendar, label: "Plan", href: "/calendar" },
  { icon: BarChart3, label: "Earn", href: "/analytics" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Creator",
  team: "Team",
  creator: "Creator",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "paper");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, []);

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
  const first = user?.firstName || user?.email?.split("@")[0] || "Creator";
  const initials = (
    user?.firstName?.[0] ??
    user?.email?.[0] ??
    "U"
  ).toUpperCase();
  const sparkHeights = [5, 7, 6, 9, 11, 14];

  const profileMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--tint)] transition-colors hover:border-[var(--line-strong)]"
          aria-label="Profile menu"
          data-testid="button-profile-menu"
        >
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--violet-deep)]">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-[var(--line)] bg-[var(--card)] text-[var(--ink)]"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-medium">{first}</span>
          {user?.email && (
            <span className="truncate text-xs font-normal text-[var(--ink-3)]">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--line)]" />
        <Link href={user?.id ? `/profile/${user.id}` : "/settings"}>
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
            <UserIcon className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer" data-testid="menu-billing">
            <CreditCard className="mr-2 h-4 w-4" /> Plans &amp; billing
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-[var(--line)]" />
        <DropdownMenuItem
          className="cursor-pointer text-[var(--score-30)] focus:text-[var(--score-30)]"
          onClick={() => logout()}
          data-testid="menu-logout"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      className="flex min-h-screen bg-[var(--paper)] text-[var(--ink)]"
      data-theme="paper"
    >
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[var(--line)] bg-[var(--card)] px-3.5 py-5 lg:flex">
        <Link href="/">
          <div className="mb-4 cursor-pointer px-2.5" data-testid="link-logo">
            <LogoMark />
          </div>
        </Link>

        <Link href="/analyze">
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--violet)] px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:bg-[var(--violet-deep)] hover:shadow-[var(--shadow-modal)]"
            data-testid="button-score-content"
          >
            <Sparkles className="h-4 w-4" />
            Score content
          </button>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto pb-2">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {section.title && (
                <div className="px-2.5 pb-1.5 pt-3.5 font-[family-name:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={`${item.href}-${item.label}`} href={item.href}>
                    <div
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-[var(--r-sm)] border-l-[2.5px] border-transparent px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                        isActive
                          ? "border-l-[var(--violet)] bg-[var(--violet-soft)] font-semibold text-[var(--violet-deep)]"
                          : "text-[var(--ink-2)] hover:bg-[var(--tint)] hover:text-[var(--ink)]",
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon
                        className={cn(
                          "h-[17px] w-[17px] shrink-0 opacity-75",
                          isActive && "opacity-100",
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-[var(--tint)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink-3)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-[var(--line)] px-2.5 pt-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2994A] to-[#EB5757] font-[family-name:var(--font-display)] text-[13px] font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold leading-tight">
                {first}
              </div>
              <div
                className="mt-0.5 flex h-3.5 items-end gap-0.5"
                aria-hidden
                title="Your momentum"
              >
                {sparkHeights.map((h, i) => (
                  <i
                    key={i}
                    className={cn(
                      "w-1 rounded-sm",
                      i >= 3 ? "bg-[var(--score-90)]" : "bg-[var(--line-strong)]",
                    )}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
            <Link href="/settings">
              <Settings className="h-[15px] w-[15px] shrink-0 text-[var(--ink-3)] hover:text-[var(--ink)]" />
            </Link>
          </div>
          <div className="px-0 pt-2.5 text-[10.5px] text-[var(--ink-3)]">
            A Digiteq Holdings company
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[232px]">
        <header className="sticky top-0 z-20 hidden items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] px-9 py-3.5 backdrop-blur-xl lg:flex">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex max-w-md flex-1 items-center gap-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-left text-[var(--ink-3)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink-2)]"
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-sm">Search anything…</span>
            <span className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px]">
              {isMac ? "⌘" : "Ctrl"}K
            </span>
          </button>
          <div className="flex-1" />
          <span
            className="rounded-full border border-[var(--line)] bg-[var(--card)] px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--ink-2)]"
            data-testid="chip-credits"
          >
            {planLabel} plan ·{" "}
            <b className="text-[var(--violet-deep)]">
              {plan === "free" ? `${credits} credits` : "unlimited scores"}
            </b>
          </span>
          <NotificationBell />
          {profileMenu}
        </header>

        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between gap-2 px-4">
            <Link href="/">
              <div className="cursor-pointer">
                <LogoMark />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/analyze">
                <button
                  type="button"
                  className="rounded-full bg-[var(--violet)] px-3 py-1.5 text-[12px] font-semibold text-white"
                  data-testid="button-score-content-mobile"
                >
                  Score
                </button>
              </Link>
              <NotificationBell />
              {profileMenu}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] px-4 pb-24 pt-0 sm:px-6 lg:max-w-[1160px] lg:px-9 lg:pb-12">
          {children}
        </main>
      </div>

      <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around py-1.5">
          {mobileNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "text-[var(--violet-deep)]"
                      : "text-[var(--ink-3)]",
                  )}
                >
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
