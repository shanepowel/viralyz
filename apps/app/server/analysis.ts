import { openai } from "./lib/openai";
import { db } from "./db";
import { contentAnalyses, analysisHistory, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface AnalysisResult {
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
  top3Fixes: Array<{ issue: string; fix: string; predictedImpact: number }>;
  predictedScoreAfterFixes: number;
}

const ANALYSIS_PROMPT = `You are an expert content analyst for social media. Analyze the following content and provide a detailed viral score breakdown.

Content Details:
- Title: {title}
- Description: {description}
- Platform: {platform}
- Content Type: {contentType}

Analyze this content and provide scores out of 20 for each category. Be specific and actionable in your suggestions.

Respond in this exact JSON format:
{
  "viralScore": <total score out of 100>,
  "hookScore": <score out of 20 - how attention-grabbing is the opening>,
  "hookAnalysis": "<detailed analysis of the hook/opening>",
  "hookSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "visualScore": <score out of 20 - visual appeal and thumbnail potential>,
  "visualAnalysis": "<detailed analysis of visual elements>",
  "visualSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "structureScore": <score out of 20 - content pacing and structure>,
  "structureAnalysis": "<detailed analysis of content structure>",
  "structureSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "metadataScore": <score out of 20 - title, description, hashtags optimization>,
  "metadataAnalysis": "<detailed analysis of metadata>",
  "metadataSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "timingScore": <score out of 20 - posting time optimization>,
  "timingAnalysis": "<analysis of timing considerations>",
  "optimalPostingTime": "<recommended day and time to post, e.g., 'Tuesday 6PM EST'>",
  "top3Fixes": [
    {"issue": "<main issue>", "fix": "<specific actionable fix>", "predictedImpact": <points this could add>},
    {"issue": "<second issue>", "fix": "<specific actionable fix>", "predictedImpact": <points this could add>},
    {"issue": "<third issue>", "fix": "<specific actionable fix>", "predictedImpact": <points this could add>}
  ],
  "predictedScoreAfterFixes": <projected score if all fixes are applied>
}

Be honest but constructive. Scores should reflect real-world viral potential. Most content scores between 40-70.`;

export async function analyzeContent(
  title: string,
  description: string,
  platform: string,
  contentType: string
): Promise<AnalysisResult> {
  const prompt = ANALYSIS_PROMPT
    .replace("{title}", title || "Untitled")
    .replace("{description}", description || "No description provided")
    .replace("{platform}", platform || "general")
    .replace("{contentType}", contentType || "video");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a viral content expert. Always respond with valid JSON only, no markdown or extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleanContent) as AnalysisResult;
    
    // Ensure all scores are within bounds
    result.viralScore = Math.min(100, Math.max(0, result.viralScore));
    result.hookScore = Math.min(20, Math.max(0, result.hookScore));
    result.visualScore = Math.min(20, Math.max(0, result.visualScore));
    result.structureScore = Math.min(20, Math.max(0, result.structureScore));
    result.metadataScore = Math.min(20, Math.max(0, result.metadataScore));
    result.timingScore = Math.min(20, Math.max(0, result.timingScore));
    
    return result;
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze content");
  }
}

export async function saveAnalysis(
  userId: string,
  title: string,
  description: string,
  platform: string,
  contentType: string,
  result: AnalysisResult
) {
  const [analysis] = await db.insert(contentAnalyses).values({
    userId,
    title,
    description,
    targetPlatform: platform,
    contentType,
    viralScore: result.viralScore,
    hookScore: result.hookScore,
    visualScore: result.visualScore,
    structureScore: result.structureScore,
    metadataScore: result.metadataScore,
    timingScore: result.timingScore,
    analysisResults: result,
    suggestions: result.top3Fixes,
    status: "analyzed",
  }).returning();

  return analysis;
}

export async function getRecentAnalyses(userId: string, limit: number = 10) {
  return db.select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId))
    .orderBy(desc(contentAnalyses.createdAt))
    .limit(limit);
}

export async function getAllAnalyses(userId: string) {
  return db.select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId))
    .orderBy(desc(contentAnalyses.createdAt));
}

export async function getAnalysis(id: string, userId: string) {
  const [analysis] = await db.select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.id, id));
  
  if (analysis && analysis.userId !== userId) {
    return null;
  }
  
  return analysis;
}

export async function getUserStats(userId: string) {
  const analyses = await db.select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId));
  
  if (analyses.length === 0) {
    return { avgScore: 0, totalAnalyses: 0, improvement: 0 };
  }
  
  const avgScore = Math.round(
    analyses.reduce((sum, a) => sum + (a.viralScore || 0), 0) / analyses.length
  );
  
  return {
    avgScore,
    totalAnalyses: analyses.length,
    improvement: 15, // TODO: Calculate actual improvement
  };
}

export async function decrementUserCredits(userId: string, amount = 1) {
  const cost = Math.max(1, Math.round(amount));
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return false;

  const currentCredits = user.creditsRemaining ?? 10;
  if (currentCredits <= 0) return false;

  await db.update(users)
    .set({ creditsRemaining: Math.max(0, currentCredits - cost) })
    .where(eq(users.id, userId));

  return true;
}
