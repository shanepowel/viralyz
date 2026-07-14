import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bell, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery<{ items: NotificationItem[]; unread: number }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { items: [], unread: 0 };
      return res.json();
    },
    refetchInterval: 60000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all", {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const unread = data?.unread || 0;
  const items = data?.items || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-300 hover:text-white"
          data-testid="button-notifications"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="font-semibold text-sm">Notifications</div>
          {unread > 0 && (
            <button
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
              onClick={() => markAll.mutate()}
              data-testid="button-mark-all-read"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {items.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="h-10 w-10 rounded-xl bg-white/[0.04] mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-sm text-slate-400">You're all caught up.</div>
            </div>
          ) : (
            <div className="py-1">
              {items.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors",
                      n.readAt ? "opacity-70" : "bg-indigo-500/[0.04]",
                      "hover:bg-white/[0.04]"
                    )}
                    onClick={() => !n.readAt && markRead.mutate(n.id)}
                    data-testid={`notification-${n.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", n.readAt ? "bg-transparent" : "bg-indigo-400")} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white">{n.title}</div>
                        {n.body && <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</div>}
                        <div className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                );
                return n.href ? (
                  <Link key={n.id} href={n.href}>
                    <div onClick={() => setOpen(false)}>{inner}</div>
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
