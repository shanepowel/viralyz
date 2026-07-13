import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sparkles, Zap, Wand2, Lightbulb, Radar, FolderOpen, BarChart3,
  Calendar, Mic2, Image, Search, Users, Settings, MessageSquare, Plus,
  Home, Bookmark, Repeat,
} from "lucide-react";

interface SearchResults {
  analyses: Array<{ id: string; title: string | null; viralScore: number | null; platform: string | null }>;
  hooks: Array<{ id: string; topic: string; platform: string }>;
  captions: Array<{ id: string; original: string; platform: string; viralScore: number | null }>;
  ideas: Array<{ id: string; title: string; platform: string; predictedScore: number | null }>;
}

const QUICK_NAV: Array<{ icon: any; label: string; href: string; keywords: string }> = [
  { icon: Home, label: "Dashboard", href: "/", keywords: "home overview start" },
  { icon: Sparkles, label: "Analyze", href: "/analyze", keywords: "analyze score viral check" },
  { icon: Zap, label: "Hook Lab", href: "/hook-lab", keywords: "hook lab opening" },
  { icon: Wand2, label: "Caption Studio", href: "/caption-studio", keywords: "caption rewrite hashtags" },
  { icon: Lightbulb, label: "Idea Generator", href: "/ideas", keywords: "ideas brainstorm" },
  { icon: Radar, label: "Trend Radar", href: "/trends", keywords: "trends trending hot" },
  { icon: Bookmark, label: "Swipe File", href: "/swipe-file", keywords: "swipe library viral inspiration remix" },
  { icon: Repeat, label: "Repurpose", href: "/repurpose", keywords: "repurpose cross platform variants tiktok reels shorts twitter linkedin threads" },
  { icon: Mic2, label: "Brand Voice", href: "/brand-voice", keywords: "tone voice style" },
  { icon: Image, label: "Thumbnail Studio", href: "/thumbnails", keywords: "thumbnail cover art" },
  { icon: Calendar, label: "Calendar", href: "/calendar", keywords: "calendar schedule plan" },
  { icon: FolderOpen, label: "My Content", href: "/content", keywords: "library content drafts" },
  { icon: BarChart3, label: "Analytics", href: "/analytics", keywords: "analytics performance metrics" },
  { icon: Users, label: "Community", href: "/community", keywords: "community creators" },
  { icon: MessageSquare, label: "Messages", href: "/messages", keywords: "dm direct messages" },
  { icon: Settings, label: "Settings", href: "/settings", keywords: "settings billing plan" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [q, setQ] = useState("");

  const { data: results } = useQuery<SearchResults>({
    queryKey: ["/api/search", q],
    queryFn: async () => {
      if (q.trim().length < 2) {
        return { analyses: [], hooks: [], captions: [], ideas: [] };
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return { analyses: [], hooks: [], captions: [], ideas: [] };
      return res.json();
    },
    enabled: open && q.trim().length >= 2,
  });

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const go = (href: string) => {
    onOpenChange(false);
    setLocation(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search content, jump to a tool..."
        value={q}
        onValueChange={setQ}
        data-testid="input-command-search"
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/analyze")} data-testid="cmd-quick-analyze">
            <Plus className="h-4 w-4 mr-2 text-primary" />
            New analysis
          </CommandItem>
          <CommandItem onSelect={() => go("/hook-lab")}>
            <Zap className="h-4 w-4 mr-2 text-primary" />
            Generate hooks
          </CommandItem>
          <CommandItem onSelect={() => go("/ideas")}>
            <Lightbulb className="h-4 w-4 mr-2 text-[var(--score-50)]" />
            Brainstorm ideas
          </CommandItem>
          <CommandItem onSelect={() => go("/thumbnails")}>
            <Image className="h-4 w-4 mr-2 text-pink-400" />
            Make thumbnails
          </CommandItem>
          <CommandItem onSelect={() => go("/repurpose")}>
            <Repeat className="h-4 w-4 mr-2 text-emerald-400" />
            Repurpose for other platforms
          </CommandItem>
        </CommandGroup>

        {results && (results.analyses.length + results.hooks.length + results.captions.length + results.ideas.length > 0) && (
          <>
            <CommandSeparator />
            {results.analyses.length > 0 && (
              <CommandGroup heading="Analyses">
                {results.analyses.map((a) => (
                  <CommandItem key={a.id} onSelect={() => go(`/analyze/${a.id}`)} value={`analysis-${a.id} ${a.title || ""}`}>
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <span className="flex-1 truncate">{a.title || "Untitled"}</span>
                    {typeof a.viralScore === "number" && (
                      <span className="text-xs text-muted-foreground ml-2">{a.viralScore}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.ideas.length > 0 && (
              <CommandGroup heading="Ideas">
                {results.ideas.map((i) => (
                  <CommandItem key={i.id} onSelect={() => go("/ideas")} value={`idea-${i.id} ${i.title}`}>
                    <Lightbulb className="h-4 w-4 mr-2 text-[var(--score-50)]" />
                    <span className="flex-1 truncate">{i.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.hooks.length > 0 && (
              <CommandGroup heading="Hooks">
                {results.hooks.map((h) => (
                  <CommandItem key={h.id} onSelect={() => go("/hook-lab")} value={`hook-${h.id} ${h.topic}`}>
                    <Zap className="h-4 w-4 mr-2 text-primary" />
                    <span className="flex-1 truncate">{h.topic}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.captions.length > 0 && (
              <CommandGroup heading="Captions">
                {results.captions.map((c) => (
                  <CommandItem key={c.id} onSelect={() => go("/caption-studio")} value={`caption-${c.id} ${c.original}`}>
                    <Wand2 className="h-4 w-4 mr-2 text-pink-400" />
                    <span className="flex-1 truncate">{c.original}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {QUICK_NAV.map((n) => (
            <CommandItem key={n.href} onSelect={() => go(n.href)} value={`nav-${n.label} ${n.keywords}`}>
              <n.icon className="h-4 w-4 mr-2 text-muted-foreground" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
