import type { RetentionCurve, RetentionRiskMoment, ScoreComponent, ScoreDiff, FixSuggestion } from "./types";

/**
 * Heuristic retention curve prediction from text/metadata signals.
 * When Whisper timestamps + frames exist, replace with model-backed curve.
 */
export function predictRetentionCurve(input: {
  platform: string;
  title: string;
  description: string;
  hookScore: number; // 0–20
  visualScore: number;
  structureScore: number;
  durationSeconds?: number | null;
}): RetentionCurve {
  const duration = Math.max(
    15,
    Math.min(90, input.durationSeconds ?? inferDuration(input.platform, input.description)),
  );

  const hookStrength = input.hookScore / 20;
  const visualStrength = input.visualScore / 20;
  const structureStrength = input.structureScore / 20;

  const points: Array<{ t: number; retention: number }> = [];
  const riskMoments: RetentionRiskMoment[] = [];

  for (let t = 0; t <= duration; t += 1) {
    const early = t <= 3 ? 1 - (1 - hookStrength) * (t / 3) * 0.45 : 1;
    const midDecay = t > 3 ? Math.exp(-(t - 3) / (12 + structureStrength * 30)) : 1;
    const visualFloor = 0.35 + visualStrength * 0.4;
    let retention = 100 * Math.max(visualFloor, early * midDecay * (0.55 + hookStrength * 0.45));
    // Soft pacing dips every ~8s if structure is weak
    if (structureStrength < 0.55 && t > 4 && t % 8 === 0) {
      retention *= 0.88;
    }
    points.push({ t, retention: Math.round(retention * 10) / 10 });
  }

  // Annotate risk moments from curve deltas
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const drop = prev.retention - curr.retention;
    if (drop >= 8) {
      riskMoments.push({
        atSeconds: curr.t,
        reason:
          curr.t <= 3
            ? `Drop-off risk at 0:${pad(curr.t)} — weak hook window`
            : `Drop-off risk at 0:${pad(curr.t)} — ${drop.toFixed(1)}pt retention cliff`,
        severity: drop >= 14 ? "high" : drop >= 10 ? "medium" : "low",
      });
    }
  }

  // Static-shot heuristic when visual score is low mid-video
  if (input.visualScore < 12 && duration >= 10) {
    const at = Math.min(duration - 1, 7);
    if (!riskMoments.some((r) => Math.abs(r.atSeconds - at) < 2)) {
      riskMoments.push({
        atSeconds: at,
        reason: `Drop-off risk at 0:${pad(at)} — likely static / low visual change`,
        severity: "medium",
      });
    }
  }

  riskMoments.sort((a, b) => a.atSeconds - b.atSeconds);
  const primary =
    riskMoments.find((r) => r.severity === "high") ??
    riskMoments.find((r) => r.severity === "medium") ??
    null;

  return {
    points,
    riskMoments: riskMoments.slice(0, 5),
    primaryDropoffAt: primary?.atSeconds ?? null,
  };
}

function inferDuration(platform: string, description: string): number {
  const p = platform.toLowerCase();
  if (p.includes("youtube") && !p.includes("short")) return 60;
  if (description.length > 800) return 45;
  if (p === "tiktok" || p.includes("reel") || p.includes("short")) return 30;
  return 25;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const COMPONENTS: ScoreComponent[] = [
  "hook",
  "visual",
  "structure",
  "metadata",
  "timing",
];

/** Build before/after diff between two analysis snapshots (component scores 0–20) */
export function buildScoreDiff(
  before: {
    viralScore: number;
    hookScore: number;
    visualScore: number;
    structureScore: number;
    metadataScore: number;
    timingScore: number;
  },
  after: {
    viralScore: number;
    hookScore: number;
    visualScore: number;
    structureScore: number;
    metadataScore: number;
    timingScore: number;
  },
  appliedFixes: FixSuggestion[] = [],
): ScoreDiff {
  const get = (r: typeof before, c: ScoreComponent) => {
    switch (c) {
      case "hook":
        return r.hookScore;
      case "visual":
        return r.visualScore;
      case "structure":
        return r.structureScore;
      case "metadata":
        return r.metadataScore;
      case "timing":
        return r.timingScore;
      default: {
        const _exhaustive: never = c;
        return _exhaustive;
      }
    }
  };

  const components = COMPONENTS.map((component) => {
    const b = get(before, component);
    const a = get(after, component);
    return { component, before: b, after: a, delta: a - b };
  });

  const deliveredFixes = appliedFixes.map((fix) => {
    const compDelta =
      components.find((c) => c.component === fix.component)?.delta ?? 0;
    return {
      issue: fix.issue,
      predictedImpact: fix.predictedImpact,
      observedDelta: Math.round(compDelta * 5), // scale 0–20 component → ~points
    };
  });

  return {
    beforeViral: before.viralScore,
    afterViral: after.viralScore,
    deltaViral: after.viralScore - before.viralScore,
    components,
    deliveredFixes,
  };
}

/** Infer FixCard component from issue text when model omits it */
export function inferFixComponent(issue: string, fix: string): ScoreComponent {
  const text = `${issue} ${fix}`.toLowerCase();
  if (/hook|open|first (line|3|three)|cold.?open|pattern.?interrupt/.test(text))
    return "hook";
  if (/thumb|visual|frame|face|contrast|color|b-?roll/.test(text)) return "visual";
  if (/pace|structure|cta|payoff|retain|mid.?roll|chapter/.test(text))
    return "structure";
  if (/title|caption|hashtag|seo|description|metadata/.test(text))
    return "metadata";
  if (/time|post|schedule|timing|hour|day/.test(text)) return "timing";
  return "hook";
}

export function normalizeFixes(
  fixes: Array<{
    issue: string;
    fix: string;
    predictedImpact: number;
    component?: ScoreComponent;
  }>,
): FixSuggestion[] {
  return fixes.slice(0, 5).map((f) => ({
    component: f.component ?? inferFixComponent(f.issue, f.fix),
    issue: f.issue,
    fix: f.fix,
    predictedImpact: Math.max(0, Math.min(25, Math.round(f.predictedImpact))),
  }));
}

/** Confidence from sample size + niche calibration stub */
export function estimateConfidence(opts: {
  historyCount: number;
  hasMedia: boolean;
  descriptionLength: number;
}): number {
  const historyFactor = Math.min(1, opts.historyCount / 20) * 0.45;
  const mediaFactor = opts.hasMedia ? 0.25 : 0.1;
  const textFactor = Math.min(1, opts.descriptionLength / 400) * 0.3;
  return Math.round(Math.min(0.95, 0.2 + historyFactor + mediaFactor + textFactor) * 100) / 100;
}
