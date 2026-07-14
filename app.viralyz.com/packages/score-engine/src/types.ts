/** Shared Score Engine types — Viralyz v2 Phase 2 */

export type ScoringPlatform =
  | "tiktok"
  | "youtube"
  | "youtube_shorts"
  | "instagram"
  | "instagram_reels"
  | "x"
  | "twitter"
  | "linkedin";

export type ScoreComponent =
  | "hook"
  | "visual"
  | "structure"
  | "metadata"
  | "timing";

export type PipelineStageId =
  | "ingest"
  | "frames"
  | "transcribe"
  | "thumbnail"
  | "score"
  | "suggestions"
  | "persist";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  /** 0–100 overall progress weight contribution */
  weight: number;
}

export interface FixSuggestion {
  component: ScoreComponent;
  issue: string;
  fix: string;
  predictedImpact: number;
}

export interface RetentionRiskMoment {
  atSeconds: number;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface RetentionCurve {
  /** Sampled predicted retention % at each second (0–100) */
  points: Array<{ t: number; retention: number }>;
  riskMoments: RetentionRiskMoment[];
  /** Peak drop-off second if any high/medium risk */
  primaryDropoffAt: number | null;
}

export interface ScoreDiffComponent {
  component: ScoreComponent;
  before: number;
  after: number;
  delta: number;
}

export interface ScoreDiff {
  beforeViral: number;
  afterViral: number;
  deltaViral: number;
  components: ScoreDiffComponent[];
  /** Fixes whose predictedImpact roughly matches observed component gains */
  deliveredFixes: Array<{ issue: string; predictedImpact: number; observedDelta: number }>;
}

export interface AnalysisResultV2 {
  viralScore: number;
  hookScore: number;
  hookAnalysis: string;
  hookSuggestions: string[];
  visualScore: number;
  visualAnalysis: string;
  visualSuggestions: string[];
  structureScore: number;
  structureAnalysis: string;
  structureSuggestions: string[];
  metadataScore: number;
  metadataAnalysis: string;
  metadataSuggestions: string[];
  timingScore: number;
  timingAnalysis: string;
  optimalPostingTime: string;
  top3Fixes: FixSuggestion[];
  predictedScoreAfterFixes: number;
  /** 0–1 model confidence */
  confidence: number;
  scoringProfileVersion: string;
  retentionCurve: RetentionCurve | null;
}
