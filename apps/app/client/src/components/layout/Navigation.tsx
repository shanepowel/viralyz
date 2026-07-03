import { Link, useLocation } from "wouter";
import { Home, Compass, PlusSquare, User, Film, GraduationCap, Users, LogOut, Sparkles, Wand2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ViralyzWordmark } from "@/components/ViralyzWordmark";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const baseNavItems = [
    { icon: Home, label: "Home", href: "/", description: "Your personalized feed" },
    { icon: Compass, label: "Discover", href: "/discover", description: "Explore trending content" },
    { icon: Wand2, label: "Studio", href: "/studio", primary: true, description: "Content Studio" },
    { icon: Film, label: "Films", href: "/films", description: "Long-form video content" },
    { icon: GraduationCap, label: "Learn", href: "/learning", description: "Courses & tutorials" },
    { icon: Users, label: "Tribes", href: "/community", description: "Your communities" },
    { icon: User, label: "Profile", href: "/profile", description: "Your profile & settings" },
  ];

  const navItems = (user as any)?.role === 'admin' 
    ? [...baseNavItems, { icon: Shield, label: "Admin", href: "/admin", description: "Admin dashboard" }]
    : baseNavItems;

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden safe-area-pb">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <div
                className={cn(
                  "relative flex flex-col items-center gap-0.5 transition-all px-2 py-1.5 rounded-xl min-w-[44px]",
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:scale-95",
                  item.primary && "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 px-3"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {location === item.href && !item.primary && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute -top-2 w-6 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    item.primary && "h-5 w-5"
                  )}
                />
                <span className={cn(
                  "text-[9px] font-medium truncate max-w-[40px]",
                  item.primary && "text-[8px]",
                  location === item.href && !item.primary && "font-bold"
                )}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-sidebar px-6 py-8 md:flex fixed h-full">
        <Link href="/">
          <div className="mb-10 flex items-center gap-2 px-2 cursor-pointer hover:opacity-90 transition-opacity">
            <ViralyzWordmark size={28} variant="light" />
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Tooltip key={item.label} delayDuration={300}>
              <TooltipTrigger asChild>
                <div>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/5 group cursor-pointer",
                        location === item.href
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "text-muted-foreground hover:text-foreground",
                          item.primary && "mt-4 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/25"
                      )}
                    >
                      {location === item.href && !item.primary && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn("h-5 w-5", location === item.href && !item.primary && "text-primary")} />
                      <span>{item.label}</span>
                      {location === item.href && !item.primary && (
                        <Sparkles className="h-3 w-3 text-primary/60 ml-auto" />
                      )}
                    </div>
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-white/10">
                <p className="text-sm">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="mt-auto space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.firstName || 'User'} className="h-10 w-10 rounded-full" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{user?.firstName || 'User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email || '@user'}</span>
              </div>
            </div>
          </div>
          <a href="/api/logout" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </div>
      </aside>
    </>
  );
}
