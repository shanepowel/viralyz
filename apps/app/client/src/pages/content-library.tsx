import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search, Plus, Eye, TrendingUp, MoreVertical, Trash2, ExternalLink,
  AlertTriangle, Loader2, LayoutGrid, List as ListIcon, Lightbulb,
  PenLine, CheckCircle2, CalendarClock, BarChart3, Sparkles, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CalendarSlotPicker } from "@/components/CalendarSlotPicker";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor,
  useDraggable, useDroppable, useSensor, useSensors,
} from "@dnd-kit/core";

type BoardStatus = "idea" | "draft" | "ready" | "scheduled" | "posted";

interface BoardItem {
  id: string;
  title: string | null;
  thumbnailUrl: string | null;
  viralScore: number | null;
  targetPlatform: string | null;
  status: string | null;
  boardStatus: BoardStatus;
  scheduledFor: string | null;
  postedAt: string | null;
  actualViews: number | null;
  actualLikes: number | null;
  actualComments: number | null;
  actualShares: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BoardResponse {
  items: BoardItem[];
  counts: Record<BoardStatus, number>;
}

const PLATFORM_FILTERS = ["all", "youtube", "tiktok", "instagram", "twitter", "linkedin", "threads"];
const NICHE_FILTERS = ["all", "fitness", "finance", "tech", "lifestyle", "education", "comedy", "beauty", "food"];

const COLUMNS: { id: BoardStatus; label: string; icon: typeof Lightbulb; tone: string; hint: string }[] = [
  { id: "idea",      label: "Idea",      icon: Lightbulb,     tone: "from-amber-500/15 to-amber-500/[0.02] border-amber-500/20", hint: "Capture sparks" },
  { id: "draft",     label: "Draft",     icon: PenLine,       tone: "from-slate-500/15 to-slate-500/[0.02] border-slate-400/20", hint: "Write & analyze" },
  { id: "ready",     label: "Ready",     icon: CheckCircle2,  tone: "from-indigo-500/15 to-indigo-500/[0.02] border-indigo-500/20", hint: "Approved to ship" },
  { id: "scheduled", label: "Scheduled", icon: CalendarClock, tone: "from-cyan-500/15 to-cyan-500/[0.02] border-cyan-500/20", hint: "On the calendar" },
  { id: "posted",    label: "Posted",    icon: BarChart3,     tone: "from-emerald-500/15 to-emerald-500/[0.02] border-emerald-500/20", hint: "Predicted vs actual" },
];

function fmtCount(n: number): string { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`; }
function statusLabel(s: BoardStatus): string { return COLUMNS.find((c) => c.id === s)?.label || s; }

function nextRoundedHour(offsetHours = 24): string {
  const d = new Date(Date.now() + offsetHours * 3600_000);
  d.setMinutes(0, 0, 0);
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function ContentLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const initialMode = (typeof window !== "undefined" && localStorage.getItem("content-view-mode")) ||
    (user as { contentViewMode?: string | null } | null | undefined)?.contentViewMode || "board";
  const [view, setView] = useState<"board" | "list">(initialMode === "list" ? "list" : "board");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<BoardItem | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<BoardItem | null>(null);
  const [scheduleAt, setScheduleAt] = useState<string>(nextRoundedHour(24));
  const [actualsTarget, setActualsTarget] = useState<BoardItem | null>(null);
  const [actuals, setActuals] = useState({ views: "", likes: "", comments: "", shares: "" });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    const remoteMode = (user as { contentViewMode?: string | null } | null | undefined)?.contentViewMode;
    if (remoteMode === "board" || remoteMode === "list") {
      const local = localStorage.getItem("content-view-mode");
      if (!local) setView(remoteMode);
    }
  }, [user]);

  const boardKey = ["/api/content/board", platformFilter, nicheFilter, search] as const;
  const { data: board, isLoading } = useQuery<BoardResponse>({
    queryKey: boardKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (nicheFilter !== "all") params.set("niche", nicheFilter);
      if (search.trim()) params.set("q", search.trim());
      const r = await fetch(`/api/content/board?${params.toString()}`);
      if (!r.ok) return { items: [], counts: { idea: 0, draft: 0, ready: 0, scheduled: 0, posted: 0 } };
      return r.json();
    },
  });

  const items = board?.items ?? [];
  const counts = board?.counts ?? { idea: 0, draft: 0, ready: 0, scheduled: 0, posted: 0 };

  const itemsByCol = useMemo(() => {
    const map: Record<BoardStatus, BoardItem[]> = { idea: [], draft: [], ready: [], scheduled: [], posted: [] };
    items.forEach((it) => { map[it.boardStatus].push(it); });
    return map;
  }, [items]);

  const setStatus = useMutation({
    mutationFn: async (vars: { id: string; status: BoardStatus }) => {
      const r = await apiRequest("PATCH", `/api/analyses/${vars.id}/status`, { status: vars.status });
      return r.json();
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["/api/content/board"] });
      const prev = queryClient.getQueryData<BoardResponse>(boardKey);
      if (prev) {
        const counts = { ...prev.counts };
        const items = prev.items.map((it) => {
          if (it.id !== vars.id) return it;
          counts[it.boardStatus] = Math.max(0, counts[it.boardStatus] - 1);
          counts[vars.status] = (counts[vars.status] || 0) + 1;
          return { ...it, boardStatus: vars.status, status: vars.status };
        });
        queryClient.setQueryData(boardKey, { items, counts });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(boardKey, ctx.prev);
      toast({ title: "Couldn't move card", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/board"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (vars: { id: string; iso: string }) => {
      const r = await apiRequest("POST", `/api/analyses/${vars.id}/schedule`, { scheduledFor: vars.iso });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/board"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({ title: "Scheduled" });
      setScheduleTarget(null);
    },
    onError: () => toast({ title: "Failed to schedule", variant: "destructive" }),
  });

  const actualsMutation = useMutation({
    mutationFn: async (vars: { id: string; body: Record<string, number | string> }) => {
      const r = await apiRequest("POST", `/api/analyses/${vars.id}/actuals`, vars.body);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/board"] });
      toast({ title: "Performance saved" });
      setActualsTarget(null);
      setActuals({ views: "", likes: "", comments: "", shares: "" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/board"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: "Deleted" });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const persistViewMutation = useMutation({
    mutationFn: async (mode: "board" | "list") => {
      await apiRequest("POST", "/api/user/view-mode", { mode });
    },
  });

  const switchView = (mode: "board" | "list") => {
    setView(mode);
    localStorage.setItem("content-view-mode", mode);
    persistViewMutation.mutate(mode);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const draggedItem = items.find((i) => i.id === activeDragId) || null;

  const onDragStart = (e: DragStartEvent) => setActiveDragId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const id = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    const target = COLUMNS.find((c) => c.id === overId)?.id;
    const card = items.find((i) => i.id === id);
    if (!target || !card || card.boardStatus === target) return;

    if (target === "scheduled") {
      setScheduleTarget(card);
      setScheduleAt(card.scheduledFor ? card.scheduledFor.slice(0, 16) : nextRoundedHour(24));
      return;
    }
    if (target === "posted") {
      setActualsTarget(card);
      setActuals({
        views: card.actualViews?.toString() ?? "",
        likes: card.actualLikes?.toString() ?? "",
        comments: card.actualComments?.toString() ?? "",
        shares: card.actualShares?.toString() ?? "",
      });
      return;
    }
    setStatus.mutate({ id: card.id, status: target });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <PageHeader
          eyebrow="Pipeline"
          title="My content"
          description="From spark to scheduled to shipped — drag cards to move stages and log how they performed."
          actions={
            <div className="flex items-center gap-2">
              <div className="bg-secondary border border-border rounded-lg p-0.5 flex" data-testid="view-toggle">
                <button
                  onClick={() => switchView("board")}
                  className={cn("px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors",
                    view === "board" ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground")}
                  data-testid="button-view-board"
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Board
                </button>
                <button
                  onClick={() => switchView("list")}
                  className={cn("px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors",
                    view === "list" ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground")}
                  data-testid="button-view-list"
                >
                  <ListIcon className="h-3.5 w-3.5" /> List
                </button>
              </div>
              <Link href="/analyze">
                <Button className="bg-indigo-600 hover:bg-indigo-500" data-testid="button-new-analysis">
                  <Plus className="h-4 w-4 mr-1.5" /> New
                </Button>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-3 mb-4 flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description..."
              className="pl-9 bg-secondary/80 border-border"
              data-testid="input-search"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-eyebrow self-center mr-1">Platform</span>
              {PLATFORM_FILTERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                    platformFilter === p
                      ? "bg-indigo-500/20 border-indigo-400/40 text-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-white/[0.05]"
                  )}
                  data-testid={`filter-platform-${p}`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-eyebrow self-center mr-1">Niche</span>
              {NICHE_FILTERS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNicheFilter(n)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                    nicheFilter === n
                      ? "bg-purple-500/20 border-purple-400/40 text-purple-700"
                      : "bg-card border-border text-muted-foreground hover:bg-white/[0.05]"
                  )}
                  data-testid={`filter-niche-${n}`}
                >
                  {n === "all" ? "All" : n}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {view === "board" ? (
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3" data-testid="kanban-board">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  col={col}
                  count={counts[col.id]}
                  items={itemsByCol[col.id]}
                  loading={isLoading}
                  onDelete={(it) => setDeleteTarget(it)}
                  onSchedule={(it) => {
                    setScheduleTarget(it);
                    setScheduleAt(it.scheduledFor ? it.scheduledFor.slice(0, 16) : nextRoundedHour(24));
                  }}
                  onActuals={(it) => {
                    setActualsTarget(it);
                    setActuals({
                      views: it.actualViews?.toString() ?? "",
                      likes: it.actualLikes?.toString() ?? "",
                      comments: it.actualComments?.toString() ?? "",
                      shares: it.actualShares?.toString() ?? "",
                    });
                  }}
                />
              ))}
            </div>
            <DragOverlay>
              {draggedItem ? <Card item={draggedItem} dragging /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <ListView
            items={items}
            isLoading={isLoading}
            onDelete={(it) => setDeleteTarget(it)}
          />
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Delete this card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              "{deleteTarget?.title || "Untitled"}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-muted-foreground hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700 text-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule dialog */}
      <Dialog open={!!scheduleTarget} onOpenChange={(open) => !open && setScheduleTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-[var(--score-90)]" /> Schedule post</DialogTitle>
            <DialogDescription className="text-muted-foreground">Pick when "{scheduleTarget?.title || "Untitled"}" should go live.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {scheduleTarget && (
              <CalendarSlotPicker
                platform={(scheduleTarget.targetPlatform || "tiktok").toLowerCase()}
                value={scheduleAt}
                onChange={setScheduleAt}
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-eyebrow shrink-0">Or pick exact time</span>
              <Input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="bg-secondary/80 border-border"
                data-testid="input-schedule-at"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleTarget(null)}>Cancel</Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-500"
              disabled={!scheduleAt || scheduleMutation.isPending}
              onClick={() => {
                if (!scheduleTarget) return;
                const iso = new Date(scheduleAt).toISOString();
                scheduleMutation.mutate({ id: scheduleTarget.id, iso });
              }}
              data-testid="button-confirm-schedule"
            >
              {scheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarClock className="h-4 w-4 mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actuals dialog */}
      <Dialog open={!!actualsTarget} onOpenChange={(open) => !open && setActualsTarget(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[var(--score-90)]" /> Log post performance</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How did "{actualsTarget?.title || "Untitled"}" actually do?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {(["views", "likes", "comments", "shares"] as const).map((k) => (
              <div key={k}>
                <label className="text-eyebrow block mb-1 capitalize">{k}</label>
                <Input
                  type="number"
                  min={0}
                  value={actuals[k]}
                  onChange={(e) => setActuals((a) => ({ ...a, [k]: e.target.value }))}
                  className="bg-secondary/80 border-border"
                  data-testid={`input-actuals-${k}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActualsTarget(null)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500"
              disabled={actualsMutation.isPending}
              onClick={() => {
                if (!actualsTarget) return;
                const body: Record<string, number> = {};
                (["views", "likes", "comments", "shares"] as const).forEach((k) => {
                  const v = parseInt(actuals[k]);
                  if (!isNaN(v) && v >= 0) body[k] = v;
                });
                actualsMutation.mutate({ id: actualsTarget.id, body });
              }}
              data-testid="button-save-actuals"
            >
              {actualsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface ColumnProps {
  col: typeof COLUMNS[number];
  count: number;
  items: BoardItem[];
  loading: boolean;
  onDelete: (it: BoardItem) => void;
  onSchedule: (it: BoardItem) => void;
  onActuals: (it: BoardItem) => void;
}

function Column({ col, count, items, loading, onDelete, onSchedule, onActuals }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const Icon = col.icon;
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border bg-gradient-to-b p-2 min-h-[400px] flex flex-col transition-colors",
        col.tone,
        isOver && "ring-2 ring-indigo-400/60"
      )}
      data-testid={`column-${col.id}`}
    >
      <div className="flex items-center justify-between px-2 pt-1.5 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{col.label}</span>
          <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-white/[0.08] text-muted-foreground" data-testid={`count-${col.id}`}>
            {count}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground px-2 mb-2">{col.hint}</div>
      <div className="space-y-2 flex-1">
        {loading ? (
          <>
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Drop here
          </div>
        ) : (
          items.map((it) => (
            <DraggableCard
              key={it.id}
              item={it}
              onDelete={() => onDelete(it)}
              onSchedule={() => onSchedule(it)}
              onActuals={() => onActuals(it)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({ item, onDelete, onSchedule, onActuals }: { item: BoardItem; onDelete: () => void; onSchedule: () => void; onActuals: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="touch-none"
    >
      <Card item={item} listeners={listeners} attributes={attributes} onDelete={onDelete} onSchedule={onSchedule} onActuals={onActuals} />
    </div>
  );
}

interface CardProps {
  item: BoardItem;
  dragging?: boolean;
  listeners?: ReturnType<typeof useDraggable>["listeners"];
  attributes?: ReturnType<typeof useDraggable>["attributes"];
  onDelete?: () => void;
  onSchedule?: () => void;
  onActuals?: () => void;
}

function Card({ item, dragging, listeners, attributes, onDelete, onSchedule, onActuals }: CardProps) {
  const tone = scoreTone(item.viralScore);
  const predicted = typeof item.viralScore === "number" ? Math.round(item.viralScore * 1000) : null;
  return (
    <div
      className={cn(
        "card-base p-3 group hover:border-border transition-colors",
        dragging && "shadow-2xl ring-1 ring-indigo-400/50"
      )}
      data-testid={`card-${item.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-muted-foreground mt-0.5"
          aria-label="Drag"
          data-testid={`drag-${item.id}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <Link href={`/analyze/${item.id}`}>
            <div className="text-sm font-medium text-foreground truncate hover:text-primary cursor-pointer" data-testid={`title-${item.id}`}>
              {item.title || "Untitled"}
            </div>
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground capitalize">
            <span>{item.targetPlatform || "—"}</span>
            <span>·</span>
            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {typeof item.viralScore === "number" && (
          <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums shrink-0", `score-bg-${tone}`)}>
            {item.viralScore}
          </span>
        )}
      </div>

      {item.boardStatus === "scheduled" && item.scheduledFor && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--score-90)]">
          <CalendarClock className="h-3 w-3" />
          {new Date(item.scheduledFor).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      )}

      {item.boardStatus === "posted" && (
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="rounded bg-secondary px-1.5 py-1">
            <div className="text-muted-foreground">Predicted</div>
            <div className="font-bold text-foreground tabular-nums">{predicted != null ? fmtCount(predicted) : "—"}</div>
          </div>
          <div className="rounded bg-emerald-500/10 px-1.5 py-1 border border-emerald-400/20">
            <div className="text-[var(--score-90)]/80">Actual</div>
            <div className="font-bold text-[var(--score-90)] tabular-nums flex items-center gap-1">
              {item.actualViews != null ? fmtCount(item.actualViews) : "—"}
              {item.actualViews != null && predicted != null && item.actualViews >= predicted && (
                <TrendingUp className="h-2.5 w-2.5" />
              )}
            </div>
          </div>
        </div>
      )}

      {(onDelete || onSchedule || onActuals) && (
        <div className="mt-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-white/[0.08] text-muted-foreground" data-testid={`menu-${item.id}`}>
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <Link href={`/analyze/${item.id}`}>
                <DropdownMenuItem className="text-muted-foreground focus:bg-secondary">
                  <ExternalLink className="h-3.5 w-3.5 mr-2" /> Open
                </DropdownMenuItem>
              </Link>
              {onSchedule && (
                <DropdownMenuItem onClick={onSchedule} className="text-muted-foreground focus:bg-secondary">
                  <CalendarClock className="h-3.5 w-3.5 mr-2" /> Schedule
                </DropdownMenuItem>
              )}
              {onActuals && (
                <DropdownMenuItem onClick={onActuals} className="text-muted-foreground focus:bg-secondary">
                  <BarChart3 className="h-3.5 w-3.5 mr-2" /> Log results
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 focus:bg-secondary">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

function ListView({ items, isLoading, onDelete }: { items: BoardItem[]; isLoading: boolean; onDelete: (it: BoardItem) => void }) {
  if (isLoading) {
    return (
      <div className="card-base p-4 space-y-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No content yet"
        description="Score your first draft to start building your pipeline."
        action={<Link href="/analyze"><Button className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1.5" /> Analyze</Button></Link>}
      />
    );
  }
  return (
    <div className="card-base overflow-hidden" data-testid="list-view">
      <div className="grid grid-cols-12 gap-3 px-4 py-2 text-eyebrow border-b border-border">
        <div className="col-span-5">Content</div>
        <div className="col-span-2 text-center">Stage</div>
        <div className="col-span-1 text-center">Score</div>
        <div className="col-span-2 text-center">Predicted</div>
        <div className="col-span-2 text-center">Actual</div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {items.map((it) => {
          const tone = scoreTone(it.viralScore);
          const predicted = typeof it.viralScore === "number" ? Math.round(it.viralScore * 1000) : null;
          return (
            <div key={it.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-card" data-testid={`row-${it.id}`}>
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="h-9 w-12 rounded bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/analyze/${it.id}`}>
                    <div className="text-sm font-medium truncate hover:text-primary cursor-pointer">{it.title || "Untitled"}</div>
                  </Link>
                  <div className="text-[11px] text-muted-foreground capitalize">{it.targetPlatform || "—"} · {new Date(it.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground px-2 py-0.5 rounded bg-muted">{statusLabel(it.boardStatus)}</span>
              </div>
              <div className="col-span-1 text-center">
                {typeof it.viralScore === "number"
                  ? <span className={cn("rounded px-2 py-0.5 text-xs font-bold tabular-nums", `score-bg-${tone}`)}>{it.viralScore}</span>
                  : <span className="text-muted-foreground text-xs">—</span>}
              </div>
              <div className="col-span-2 text-center text-sm text-muted-foreground tabular-nums">{predicted != null ? fmtCount(predicted) : "—"}</div>
              <div className="col-span-2 text-center text-sm tabular-nums flex items-center justify-center gap-2">
                {it.actualViews != null ? <span className="text-[var(--score-90)] font-medium">{fmtCount(it.actualViews)}</span> : <span className="text-muted-foreground">—</span>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-white/[0.08] text-muted-foreground"><MoreVertical className="h-3.5 w-3.5" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <Link href={`/analyze/${it.id}`}>
                      <DropdownMenuItem className="text-muted-foreground focus:bg-secondary"><ExternalLink className="h-3.5 w-3.5 mr-2" /> Open</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onDelete(it)} className="text-red-400 focus:text-red-400 focus:bg-secondary">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
