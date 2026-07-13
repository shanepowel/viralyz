import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, CheckCircle2, BarChart3, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScheduleAndActualsProps {
  analysisId: string;
  predictedScore: number;
  initialScheduledFor?: string | null;
  initialPostedAt?: string | null;
  initialActuals?: {
    views?: number | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
  };
  initialStatus?: string | null;
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeActualScore(a: { views?: number; likes?: number; comments?: number; shares?: number }) {
  const views = a.views || 0;
  const likes = a.likes || 0;
  const comments = a.comments || 0;
  const shares = a.shares || 0;
  if (views === 0 && likes === 0 && comments === 0 && shares === 0) return 0;
  const engagement = views > 0 ? ((likes + comments * 2 + shares * 3) / views) * 100 : 0;
  const reach = Math.log10(views + 1) * 12;
  const raw = engagement * 4 + reach;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function ScheduleAndActuals({
  analysisId,
  predictedScore,
  initialScheduledFor,
  initialPostedAt,
  initialActuals,
  initialStatus,
}: ScheduleAndActualsProps) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [scheduledFor, setScheduledFor] = useState<string>(toLocalInputValue(initialScheduledFor));
  const [savedScheduledFor, setSavedScheduledFor] = useState<string | null>(initialScheduledFor || null);
  const [status, setStatus] = useState<string>(initialStatus || "draft");

  const [views, setViews] = useState<string>(initialActuals?.views?.toString() ?? "");
  const [likes, setLikes] = useState<string>(initialActuals?.likes?.toString() ?? "");
  const [comments, setComments] = useState<string>(initialActuals?.comments?.toString() ?? "");
  const [shares, setShares] = useState<string>(initialActuals?.shares?.toString() ?? "");
  const [postedAt, setPostedAt] = useState<string | null>(initialPostedAt || null);

  useEffect(() => {
    setScheduledFor(toLocalInputValue(initialScheduledFor));
    setSavedScheduledFor(initialScheduledFor || null);
  }, [initialScheduledFor]);

  useEffect(() => {
    setStatus(initialStatus || "draft");
  }, [initialStatus]);

  useEffect(() => {
    setViews(initialActuals?.views?.toString() ?? "");
    setLikes(initialActuals?.likes?.toString() ?? "");
    setComments(initialActuals?.comments?.toString() ?? "");
    setShares(initialActuals?.shares?.toString() ?? "");
    setPostedAt(initialPostedAt || null);
  }, [initialActuals, initialPostedAt]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["/api/analyses"] });
    qc.invalidateQueries({ queryKey: ["/api/analyses/recent"] });
    qc.invalidateQueries({ queryKey: ["/api/calendar"] });
    qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
  };

  const scheduleMutation = useMutation({
    mutationFn: async (iso: string | null) => {
      const res = await apiRequest("POST", `/api/analyses/${analysisId}/schedule`, { scheduledFor: iso });
      return res.json();
    },
    onSuccess: (data, variables) => {
      setSavedScheduledFor(variables);
      setStatus(variables ? "scheduled" : "draft");
      invalidateAll();
      toast({
        title: variables ? "Scheduled" : "Schedule cleared",
        description: variables ? "It will appear on your calendar." : "Removed from the calendar.",
      });
    },
    onError: () => {
      toast({ title: "Couldn't save schedule", description: "Please try again.", variant: "destructive" });
    },
  });

  const actualsMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, number | string> = {};
      if (views !== "") body.views = Math.max(0, parseInt(views, 10) || 0);
      if (likes !== "") body.likes = Math.max(0, parseInt(likes, 10) || 0);
      if (comments !== "") body.comments = Math.max(0, parseInt(comments, 10) || 0);
      if (shares !== "") body.shares = Math.max(0, parseInt(shares, 10) || 0);
      body.postedAt = (postedAt ? new Date(postedAt) : new Date()).toISOString();
      const res = await apiRequest("POST", `/api/analyses/${analysisId}/actuals`, body);
      return res.json();
    },
    onSuccess: (data) => {
      setStatus("posted");
      if (data?.postedAt) setPostedAt(data.postedAt);
      invalidateAll();
      toast({ title: "Actuals saved", description: "Prediction vs. reality updated." });
    },
    onError: () => {
      toast({ title: "Couldn't save actuals", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSchedule = () => {
    if (!scheduledFor) {
      toast({ title: "Pick a date", description: "Choose when you'll post this.", variant: "destructive" });
      return;
    }
    const iso = new Date(scheduledFor).toISOString();
    scheduleMutation.mutate(iso);
  };

  const handleClearSchedule = () => {
    setScheduledFor("");
    scheduleMutation.mutate(null);
  };

  const actualScore = useMemo(
    () =>
      computeActualScore({
        views: parseInt(views, 10) || 0,
        likes: parseInt(likes, 10) || 0,
        comments: parseInt(comments, 10) || 0,
        shares: parseInt(shares, 10) || 0,
      }),
    [views, likes, comments, shares]
  );

  const hasActuals = views !== "" || likes !== "" || comments !== "" || shares !== "";
  const showVsReality = status === "posted" && hasActuals;
  const delta = actualScore - predictedScore;
  const accuracy = Math.max(0, 100 - Math.abs(delta));

  const inputCls =
    "w-full bg-secondary border border-border rounded-lg py-2 px-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  return (
    <div className="bg-secondary border border-border rounded-2xl p-6 space-y-6" data-testid="schedule-and-actuals">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Schedule this post</h3>
          </div>
          {savedScheduledFor && (
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-primary" data-testid="badge-status">
              {status === "posted" ? "Posted" : "Scheduled"}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className={`${inputCls} flex-1`}
            data-testid="input-scheduled-for"
          />
          <Button
            onClick={handleSchedule}
            disabled={scheduleMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
            data-testid="button-schedule"
          >
            {scheduleMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {savedScheduledFor ? "Update" : "Schedule"}
          </Button>
          {savedScheduledFor && (
            <Button
              variant="outline"
              onClick={handleClearSchedule}
              disabled={scheduleMutation.isPending}
              className="border-border"
              data-testid="button-clear-schedule"
            >
              Clear
            </Button>
          )}
        </div>

        {savedScheduledFor && (
          <p className="text-xs text-muted-foreground mt-2" data-testid="text-scheduled-summary">
            Posting on {new Date(savedScheduledFor).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      {savedScheduledFor && (
        <div className="border-t border-border/60 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold">Mark as posted & log results</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Views</label>
              <input
                type="number"
                min="0"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                placeholder="0"
                className={inputCls}
                data-testid="input-actual-views"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Likes</label>
              <input
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="0"
                className={inputCls}
                data-testid="input-actual-likes"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Comments</label>
              <input
                type="number"
                min="0"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="0"
                className={inputCls}
                data-testid="input-actual-comments"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Shares</label>
              <input
                type="number"
                min="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                className={inputCls}
                data-testid="input-actual-shares"
              />
            </div>
          </div>

          <Button
            onClick={() => actualsMutation.mutate()}
            disabled={actualsMutation.isPending || !hasActuals}
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="button-save-actuals"
          >
            {actualsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {status === "posted" ? "Update actuals" : "Mark as posted"}
          </Button>

          {showVsReality && (
            <div className="mt-5 bg-secondary/40 border border-border/50 rounded-xl p-4" data-testid="card-prediction-vs-reality">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Prediction vs. Reality</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Predicted</div>
                  <div className="text-2xl font-bold text-primary" data-testid="text-predicted-score">
                    {predictedScore}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Actual</div>
                  <div className="text-2xl font-bold text-emerald-400" data-testid="text-actual-score">
                    {actualScore}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                  <div
                    className={`text-2xl font-bold ${
                      accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-[var(--score-50)]" : "text-red-400"
                    }`}
                    data-testid="text-accuracy"
                  >
                    {accuracy}%
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {delta > 0
                  ? `Outperformed prediction by ${delta} points 🎉`
                  : delta < 0
                  ? `Underperformed by ${Math.abs(delta)} points`
                  : "Right on the money"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
