import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ScoreRing } from "@repo/ui/score-ring";
import { Panel } from "@repo/ui/panel";
import { StatCard } from "@repo/ui/stat-card";
import { StatusChip, type StatusChipTone } from "@repo/ui/status-chip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

type MissionRun = {
  id: string;
  status: string;
  finalText: string | null;
  predictedScore: number | null;
  actualImpressions: number | null;
  createdAt: string;
};

type AutopilotState = {
  paused: boolean;
  awaitingApproval: number;
  recentRuns: MissionRun[];
};

type DemoRow = {
  id: string;
  title: string;
  platform: string;
  duration: string;
  score: number;
  status: StatusChipTone;
  statusLabel: string;
  predicted: string;
  thumb: string;
  href: string;
};

/** Pattern-library demo rows when the account has no scored content yet. */
const DEMO_ROWS: DemoRow[] = [
  {
    id: "demo-1",
    title: "Kitchen hacks pt.3",
    platform: "TikTok",
    duration: "0:42",
    score: 87,
    status: "draft",
    statusLabel: "Draft",
    predicted: "210K predicted",
    thumb: "linear-gradient(135deg,#F2994A,#EB5757)",
    href: "/analyze",
  },
  {
    id: "demo-2",
    title: "5 minute pasta, honestly",
    platform: "Reels",
    duration: "0:38",
    score: 91,
    status: "tracking",
    statusLabel: "Tracking",
    predicted: "312K vs 260K predicted ▲",
    thumb: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    href: "/content",
  },
  {
    id: "demo-3",
    title: "Q&A: your cooking fails",
    platform: "TikTok",
    duration: "1:04",
    score: 72,
    status: "scheduled",
    statusLabel: "Scheduled",
    predicted: "95K predicted",
    thumb: "linear-gradient(135deg,#56CCF2,#2F80ED)",
    href: "/calendar",
  },
  {
    id: "demo-4",
    title: "Behind the scenes, market run",
    platform: "YouTube",
    duration: "8:12",
    score: 58,
    status: "posted",
    statusLabel: "Posted",
    predicted: "23K vs 45K predicted ▼",
    thumb: "linear-gradient(135deg,#27AE60,#145A32)",
    href: "/analytics",
  },
];

function formatTodaySub() {
  const d = new Date();
  const day = d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `${day} · your audience peaks at 6pm today`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: autopilot } = useQuery<AutopilotState>({
    queryKey: ["/api/autopilot/state"],
    refetchInterval: 30_000,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const name =
    user?.firstName || user?.email?.split("@")[0] || "creator";

  const awaiting = autopilot?.recentRuns?.filter(
    (r) => r.status === "awaiting_approval",
  );
  const liveRows: DemoRow[] =
    awaiting && awaiting.length > 0
      ? awaiting.slice(0, 4).map((r) => ({
          id: r.id,
          title: r.finalText?.slice(0, 48) || "Draft ready for review",
          platform: "LinkedIn",
          duration: "",
          score: r.predictedScore ?? 0,
          status: "draft" as const,
          statusLabel: "Needs you",
          predicted:
            r.predictedScore != null
              ? `Score ${r.predictedScore}`
              : "Awaiting score",
          thumb: "linear-gradient(135deg,#6C4CF1,#5638D6)",
          href: "/autopilot",
        }))
      : DEMO_ROWS;

  const monthScore = 76;
  const accuracy = 82;

  return (
    <DashboardLayout>
      <div className="pb-8 pt-6">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--ink)]">
              {greeting}, {name}
            </h1>
            <p className="mt-0.5 text-[13px] text-[var(--ink-3)]">
              {formatTodaySub()}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/settings">
              <button
                type="button"
                className="rounded-full border-[1.5px] border-[var(--line-strong)] bg-[var(--card)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
                data-testid="button-connect-platform"
              >
                Connect platform
              </button>
            </Link>
          </div>
        </div>

        {/* Exactly four above-fold signals: two stats + NBA (spans 2) */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Your score this month"
            value={monthScore}
            delta={{ value: "8", direction: "up" }}
            footnote="Average across 12 posts"
            sparkline={[8, 11, 9, 14, 17, 22]}
          />
          <StatCard
            label="Predictions right"
            value={`${accuracy}%`}
            delta={{ value: "5", direction: "up" }}
            footnote={
              <>
                Based on your last 34 posts ·{" "}
                <Link
                  href="/analytics"
                  className="text-[var(--violet-deep)] hover:underline"
                >
                  how we work this out
                </Link>
              </>
            }
          />
          <StatCard
            variant="nba"
            label="Next best thing to do"
            value=""
            className="sm:col-span-2"
          >
            <div className="relative z-[1]">
              <p className="mb-3 font-[family-name:var(--font-display)] text-[17px] font-semibold leading-snug text-white">
                &ldquo;Kitchen hacks pt.3&rdquo; scored 87 but is not scheduled.
                Tonight at 6pm is your best slot this week.
              </p>
              <Link href="/calendar">
                <button
                  type="button"
                  className="rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[var(--violet-deep)] transition-transform hover:-translate-y-px"
                  data-testid="button-nba-schedule"
                >
                  Schedule it for 6pm
                </button>
              </Link>
            </div>
          </StatCard>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
          <Panel
            title="Recent scores"
            action={
              <Link
                href="/content"
                className="text-[12.5px] font-semibold text-[var(--violet-deep)]"
              >
                View library
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Content", "Score", "Status", "Predicted vs real"].map(
                      (h) => (
                        <th
                          key={h}
                          className="border-b border-[var(--line)] px-5 py-2.5 text-left font-[family-name:var(--font-mono)] text-[9.5px] font-medium uppercase tracking-[0.09em] text-[var(--ink-3)]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {liveRows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-[var(--tint)]"
                    >
                      <td className="border-b border-[var(--line)] px-5 py-3">
                        <Link href={row.href}>
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-11 shrink-0 rounded-[7px]"
                              style={{ background: row.thumb }}
                            />
                            <div>
                              <div className="text-[13px] font-semibold text-[var(--ink)]">
                                {row.title}
                              </div>
                              <div className="text-[11px] text-[var(--ink-3)]">
                                {row.platform}
                                {row.duration ? ` · ${row.duration}` : ""}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="border-b border-[var(--line)] px-5 py-3">
                        <ScoreRing score={row.score} size={34} animate={false} />
                      </td>
                      <td className="border-b border-[var(--line)] px-5 py-3">
                        <StatusChip tone={row.status}>
                          {row.statusLabel}
                        </StatusChip>
                      </td>
                      <td className="border-b border-[var(--line)] px-5 py-3 font-[family-name:var(--font-mono)] text-[12px] text-[var(--ink)]">
                        {row.predicted.includes("vs") ? (
                          <>
                            {row.predicted.split(" vs ")[0]}{" "}
                            <span className="text-[10.5px] text-[var(--ink-3)]">
                              vs {row.predicted.split(" vs ")[1]}
                            </span>
                          </>
                        ) : (
                          <>
                            {row.predicted.replace(" predicted", "")}{" "}
                            <span className="text-[10.5px] text-[var(--ink-3)]">
                              predicted
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel
              title="What works for you"
              action={
                <Link
                  href="/analytics"
                  className="text-[12.5px] font-semibold text-[var(--violet-deep)]"
                >
                  Analytics
                </Link>
              }
            >
              <div className="space-y-0 px-5 py-2">
                {[
                  {
                    icon: "?",
                    title: "Questions in your first line",
                    body: "do 2.1 times better than statements.",
                    note: "Based on your last 34 posts",
                  },
                  {
                    icon: "◷",
                    title: "Tuesday and Thursday, 6pm",
                    body: "are your strongest slots.",
                    note: "From your real results",
                  },
                  {
                    icon: "▭",
                    title: "40 to 60 second videos",
                    body: "hold your viewers best.",
                    note: "Longer ones lose people at the midpoint",
                  },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="flex gap-3 border-b border-[var(--line)] py-2.5 last:border-0"
                  >
                    <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-[var(--score-90-soft)] text-[12px] font-bold text-[var(--score-90)]">
                      {row.icon}
                    </div>
                    <div className="text-[13px] text-[var(--ink-2)]">
                      <b className="text-[var(--ink)]">{row.title}</b> {row.body}
                      <span className="mt-0.5 block text-[11px] text-[var(--ink-3)]">
                        {row.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="Your media kit"
              action={
                <Link
                  href="/settings"
                  className="text-[12.5px] font-semibold text-[var(--violet-deep)]"
                >
                  Open
                </Link>
              }
            >
              <div className="px-5 py-4">
                {[
                  ["Kit views this week", "142"],
                  ["Package orders", "2 new"],
                  ["Verified sync", "2h ago"],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between py-1.5 text-[13px] text-[var(--ink-2)]"
                  >
                    <span>{label}</span>
                    <b
                      className={
                        val === "2h ago"
                          ? "font-[family-name:var(--font-mono)] text-[var(--score-90)]"
                          : "font-[family-name:var(--font-mono)] text-[var(--ink)]"
                      }
                    >
                      {val}
                    </b>
                  </div>
                ))}
                <Link href="/settings">
                  <button
                    type="button"
                    className="mt-2.5 w-full rounded-full border-[1.5px] border-[var(--line-strong)] bg-[var(--card)] py-2 text-[13px] font-semibold hover:border-[var(--ink)]"
                  >
                    View orders
                  </button>
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
