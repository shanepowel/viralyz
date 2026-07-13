import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, insertCommentSchema, insertTribePostSchema, type InsertSwipePost } from "@shared/schema";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerAutopilotRoutes } from "./autopilot-routes";
import { registerIntelligenceRoutes } from "./intelligence-routes";
import {
  analyzeContent,
  analyzeWithPipeline,
  saveAnalysis,
  reanalyzeContent,
  getAnalysisHistory,
  getRecentAnalyses,
  getAllAnalyses,
  getAnalysis,
  getUserStats,
  decrementUserCredits,
  countAnalysesForUser,
  PIPELINE_STAGES,
} from "./analysis";
import { getAnalysisJob, createAnalysisJob } from "./analysis-jobs";
import {
  enqueueLocalAnalysisJob,
  inngestFunctions,
} from "./inngest/functions";
import { inngest, isInngestConfigured, ANALYSIS_EVENT } from "./inngest/client";
import { serve } from "inngest/express";
import { generateHooks, rewriteCaption, generateTrends, generateIdeas, repurposeForPlatforms } from "./ai-tools";
import { lintCaption } from "./lint";
import { extractBrandVoice, generateThumbnailIdeas, renderThumbnail } from "./ai-vision";
import {
  createNotification,
  listNotifications,
  unreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  listBrandVoiceProfiles,
  getBrandVoiceProfile,
  getDefaultBrandVoice,
  createBrandVoiceProfile,
  updateBrandVoiceProfile,
  deleteBrandVoiceProfile,
  listThumbnails,
  createThumbnail,
  deleteThumbnail,
  getScheduledAnalyses,
  setAnalysisSchedule,
  recordAnalysisActuals,
  setAnalysisStatus,
  getBoardItems,
  BOARD_STATUSES,
  globalSearch,
  setOnboarding,
  listSwipePosts,
  getSwipePost,
  listSavedSwipes,
  saveSwipe,
  unsaveSwipe,
  createSwipePost,
  listSwipeFacets,
  createRepurposeRun,
  listRepurposeRuns,
  getRepurposeVariant,
  scheduleRepurposeVariant,
  saveRepurposeVariantAsDraft,
  setEmailDigestsEnabled,
  getWeeklyDigestPayload,
} from "./storage-extras";
import { sendEmail, renderWelcomeEmail, renderWeeklyDigestEmail } from "./email";
import { runWeeklyDigestJob } from "./scheduler";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, isPaypalEnabled } from "./paypal";
import { computeHeatmap, ensureBaselineSeeded, normalizeNiche, normalizePlatform, PLATFORMS } from "./insights";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = (req.user as any).claims?.sub || (req.user as any).id;
  if (!userId) {
    return res.status(401).json({ error: "Invalid user session" });
  }
  const user = await storage.getUser(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // setupAuth also registers /api/auth/user (and login/logout for the active mode)
  await setupAuth(app);
  registerObjectStorageRoutes(app);
  registerAutopilotRoutes(app);
  registerIntelligenceRoutes(app);

  // Inngest serve endpoint (cloud or `npx inngest-cli dev`)
  app.use(
    "/api/inngest",
    serve({
      client: inngest,
      functions: inngestFunctions,
    }),
  );
  // Content Routes
  app.get("/api/content", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const contentList = type 
        ? await storage.getContentByType(type, limit)
        : await storage.getAllContent(limit);
      
      res.json(contentList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const item = await storage.getContent(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", isAuthenticated, async (req, res) => {
    try {
      const validated = insertContentSchema.parse(req.body);
      const newContent = await storage.createContent(validated);
      res.json(newContent);
    } catch (error) {
      const validationError = fromError(error);
      res.status(400).json({ error: validationError.message });
    }
  });

  app.post("/api/content/:id/like", async (req, res) => {
    try {
      await storage.incrementContentLikes(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like content" });
    }
  });

  app.post("/api/content/:id/view", async (req, res) => {
    try {
      await storage.incrementContentViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Comments Routes
  app.get("/api/content/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByContentId(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const validated = insertCommentSchema.parse({
        ...req.body,
        userId,
      });
      const newComment = await storage.createComment(validated);
      res.json(newComment);
    } catch (error) {
      const validationError = fromError(error);
      res.status(400).json({ error: validationError.message });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      await storage.deleteComment(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Tribes Routes
  app.get("/api/tribes", async (req, res) => {
    try {
      const tribes = await storage.getAllTribes();
      res.json(tribes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tribes" });
    }
  });

  app.get("/api/tribes/:slug", async (req, res) => {
    try {
      const tribe = await storage.getTribeBySlug(req.params.slug);
      if (!tribe) {
        return res.status(404).json({ error: "Tribe not found" });
      }
      res.json(tribe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tribe" });
    }
  });

  app.get("/api/tribes/:id/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const posts = await storage.getTribePostsByTribeId(req.params.id, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/tribe-posts", async (req, res) => {
    try {
      const validated = insertTribePostSchema.parse(req.body);
      const newPost = await storage.createTribePost(validated);
      res.json(newPost);
    } catch (error) {
      const validationError = fromError(error);
      res.status(400).json({ error: validationError.message });
    }
  });

  app.post("/api/tribe-posts/:id/upvote", async (req, res) => {
    try {
      await storage.incrementTribePostUpvotes(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote post" });
    }
  });

  // Courses Routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      await storage.updateUserRole(req.params.id, role);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/content", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const content = await storage.getAllContent(100);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.delete("/api/admin/content/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteContent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // VIRALYZ 2.0 - Analysis Routes
  app.get("/api/analyze/stages", (_req, res) => {
    res.json({ stages: PIPELINE_STAGES });
  });

  app.get("/api/analyze/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const job = getAnalysisJob(req.params.id);
      if (!job || job.userId !== userId) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/analyze", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const {
        title,
        description,
        platform,
        contentType,
        hasMedia,
        stream,
        async: asyncMode,
        fileUrl,
      } = req.body;

      if (!title && !description && !fileUrl) {
        return res.status(400).json({
          error: "Please provide a title, description, or uploaded file",
        });
      }

      const historyCount = await countAnalysesForUser(userId);
      const useAsync =
        asyncMode === true || (!!fileUrl && stream !== true && asyncMode !== false);

      // Async job path (Inngest or local worker) — best for media
      if (useAsync && !stream) {
        if (isInngestConfigured()) {
          const job = createAnalysisJob(userId, {
            title: title || "Untitled Content",
            description: description || "",
            platform: platform || "youtube",
            contentType: contentType || "video",
            fileUrl: fileUrl || null,
            mode: "analyze",
          });
          await inngest.send({
            name: ANALYSIS_EVENT,
            data: {
              jobId: job.id,
              userId,
              title: job.input.title,
              description: job.input.description,
              platform: job.input.platform,
              contentType: job.input.contentType,
              fileUrl: job.input.fileUrl,
              mode: "analyze",
            },
          });
          return res.status(202).json({ jobId: job.id, status: "queued" });
        }

        const job = await enqueueLocalAnalysisJob({
          userId,
          title: title || "Untitled Content",
          description: description || "",
          platform: platform || "youtube",
          contentType: contentType || "video",
          fileUrl: fileUrl || null,
        });
        return res.status(202).json({ jobId: job.id, status: "queued" });
      }

      // SSE stream of pipeline stages
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const send = (event: string, data: unknown) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        try {
          let analysisId = "";
          const result = await analyzeWithPipeline(
            {
              title: title || "Untitled Content",
              description: description || "",
              platform: platform || "youtube",
              contentType: contentType || "video",
              hasMedia: !!(hasMedia || fileUrl),
              historyCount,
              fileUrl: fileUrl || null,
            },
            (ev) => send("stage", ev),
            async (scored, media) => {
              const analysis = await saveAnalysis(
                userId,
                title || "Untitled Content",
                description || "",
                platform || "youtube",
                contentType || "video",
                scored,
                {
                  fileUrl: fileUrl || null,
                  durationSeconds: media.durationSeconds,
                },
              );
              analysisId = analysis.id;
            },
          );
          if (!analysisId) {
            const analysis = await saveAnalysis(
              userId,
              title || "Untitled Content",
              description || "",
              platform || "youtube",
              contentType || "video",
              result,
              { fileUrl: fileUrl || null },
            );
            analysisId = analysis.id;
          }
          send("complete", { id: analysisId, ...result });
          res.end();
        } catch (error) {
          console.error("Analysis stream error:", error);
          send("error", { error: "Failed to analyze content" });
          res.end();
        }
        return;
      }

      // Sync JSON (text-only / short)
      let analysisId = "";
      const result = await analyzeWithPipeline(
        {
          title: title || "Untitled Content",
          description: description || "",
          platform: platform || "youtube",
          contentType: contentType || "video",
          hasMedia: !!(hasMedia || fileUrl),
          historyCount,
          fileUrl: fileUrl || null,
        },
        undefined,
        async (scored, media) => {
          const analysis = await saveAnalysis(
            userId,
            title || "Untitled Content",
            description || "",
            platform || "youtube",
            contentType || "video",
            scored,
            {
              fileUrl: fileUrl || null,
              durationSeconds: media.durationSeconds,
            },
          );
          analysisId = analysis.id;
        },
      );
      if (!analysisId) {
        const analysis = await saveAnalysis(
          userId,
          title || "Untitled Content",
          description || "",
          platform || "youtube",
          contentType || "video",
          result,
          { fileUrl: fileUrl || null },
        );
        analysisId = analysis.id;
      }

      res.json({
        id: analysisId,
        ...result,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  app.post("/api/analyses/:id/reanalyze", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const {
        title,
        description,
        platform,
        contentType,
        appliedFixIndexes,
        fileUrl,
        async: asyncMode,
      } = req.body;

      if (asyncMode !== false) {
        if (isInngestConfigured()) {
          const job = createAnalysisJob(userId, {
            title: title || "Untitled",
            description: description || "",
            platform: platform || "youtube",
            contentType: contentType || "video",
            fileUrl: fileUrl || null,
            mode: "reanalyze",
            analysisId: req.params.id,
            appliedFixIndexes,
          });
          await inngest.send({
            name: ANALYSIS_EVENT,
            data: {
              jobId: job.id,
              userId,
              title: job.input.title,
              description: job.input.description,
              platform: job.input.platform,
              contentType: job.input.contentType,
              fileUrl: job.input.fileUrl,
              mode: "reanalyze",
              analysisId: req.params.id,
              appliedFixIndexes,
            },
          });
          return res.status(202).json({ jobId: job.id, status: "queued" });
        }

        const job = await enqueueLocalAnalysisJob({
          userId,
          title: title || "Untitled",
          description: description || "",
          platform: platform || "youtube",
          contentType: contentType || "video",
          fileUrl: fileUrl || null,
          mode: "reanalyze",
          analysisId: req.params.id,
          appliedFixIndexes,
        });
        return res.status(202).json({ jobId: job.id, status: "queued" });
      }

      const { analysis, result, diff } = await reanalyzeContent(
        req.params.id,
        userId,
        { title, description, platform, contentType, appliedFixIndexes, fileUrl },
      );

      res.json({
        id: analysis.id,
        ...result,
        diff,
      });
    } catch (error: any) {
      console.error("Reanalyze error:", error);
      if (error?.message === "Analysis not found") {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.status(500).json({ error: "Failed to re-analyze content" });
    }
  });

  app.get("/api/analyses/:id/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const history = await getAnalysisHistory(req.params.id, userId);
      if (!history) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis history" });
    }
  });

  app.get("/api/analyses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const analyses = await getAllAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  app.get("/api/analyses/recent", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 5;
      const analyses = await getRecentAnalyses(userId, limit);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent analyses" });
    }
  });

  app.get("/api/analyses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const analysis = await getAnalysis(req.params.id, userId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const stats = await getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // PayPal Routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  app.get("/api/paypal/status", (req, res) => {
    res.json({ enabled: isPaypalEnabled() });
  });

  // Upgrade user plan after successful payment
  app.post("/api/upgrade", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const { plan } = req.body;
      await storage.updateUserPlan(userId, plan);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upgrade plan" });
    }
  });

  // Shared Links Routes
  app.post("/api/share", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const { analysisId, password, expiresInDays } = req.body;

      if (!analysisId) {
        return res.status(400).json({ error: "Analysis ID is required" });
      }

      // Verify user owns the analysis
      const analysis = await getAnalysis(analysisId, userId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Generate unique share code
      const shareCode = randomBytes(16).toString("hex");

      // Hash password if provided using bcrypt
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      // Calculate expiration date
      let expiresAt = null;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
      }

      const sharedLink = await storage.createSharedLink({
        analysisId,
        userId,
        shareCode,
        passwordHash,
        expiresAt,
        isActive: true,
      });

      res.json({
        shareCode: sharedLink.shareCode,
        shareUrl: `/share/${sharedLink.shareCode}`,
        hasPassword: !!passwordHash,
        expiresAt: sharedLink.expiresAt,
      });
    } catch (error) {
      console.error("Share link creation error:", error);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  app.get("/api/share/my-links", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const links = await storage.getSharedLinksByUser(userId);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch share links" });
    }
  });

  app.delete("/api/share/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await storage.deactivateSharedLink(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate share link" });
    }
  });

  // Community Routes
  app.get("/api/community/creators", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const creators = await storage.getCreators(userId);
      res.json(creators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creators" });
    }
  });

  app.get("/api/community/profile/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUserId = (req.user as any).claims?.sub || (req.user as any).id;
      const profile = await storage.getPublicProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      const isFollowing = await storage.isFollowing(currentUserId, req.params.userId);
      const sharedAnalyses = await storage.getUserSharedAnalyses(req.params.userId);
      res.json({ ...profile, isFollowing, sharedAnalyses });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/community/follow/:userId", isAuthenticated, async (req, res) => {
    try {
      const followerId = (req.user as any).claims?.sub || (req.user as any).id;
      const followingId = req.params.userId;
      if (followerId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }
      const already = await storage.isFollowing(followerId, followingId);
      if (already) {
        return res.status(400).json({ error: "Already following this user" });
      }
      await storage.followUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.delete("/api/community/follow/:userId", isAuthenticated, async (req, res) => {
    try {
      const followerId = (req.user as any).claims?.sub || (req.user as any).id;
      await storage.unfollowUser(followerId, req.params.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/community/followers/:userId", isAuthenticated, async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  app.get("/api/community/following/:userId", isAuthenticated, async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.userId);
      res.json(following);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  // Analysis Comments Routes
  app.get("/api/analysis-comments/:analysisId", async (req, res) => {
    try {
      const comments = await storage.getAnalysisComments(req.params.analysisId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/analysis-comments/:analysisId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Comment text is required" });
      }
      const comment = await storage.createAnalysisComment(req.params.analysisId, userId, text.trim());
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/analysis-comments/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await storage.deleteAnalysisComment(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Direct Messaging Routes
  app.get("/api/messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.post("/api/messages/conversation", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const { recipientId } = req.body;
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }
      if (userId === recipientId) {
        return res.status(400).json({ error: "Cannot message yourself" });
      }
      const conversation = await storage.getOrCreateDmConversation(userId, recipientId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/messages/:conversationId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const messages = await storage.getConversationMessages(req.params.conversationId, userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/:conversationId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Message text is required" });
      }
      const message = await storage.sendDirectMessage(req.params.conversationId, userId, text.trim());
      res.json(message);
    } catch (error: any) {
      if (error.message === "Not a participant in this conversation") {
        return res.status(403).json({ error: "Not a participant in this conversation" });
      }
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/messages/:conversationId/read", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await storage.markMessagesRead(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Public share access (no auth required)
  app.get("/api/public/share/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const result = await storage.getSharedAnalysis(code);
      
      if (!result) {
        return res.status(404).json({ error: "Share link not found or expired" });
      }

      // Check if password protected
      if (result.link.passwordHash) {
        return res.json({
          requiresPassword: true,
          title: result.analysis.title,
        });
      }

      // Increment view count
      await storage.incrementSharedLinkViews(result.link.id);

      res.json({
        requiresPassword: false,
        analysis: result.analysis,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shared content" });
    }
  });

  app.post("/api/public/share/:code/verify", async (req, res) => {
    try {
      const { code } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const result = await storage.getSharedAnalysis(code);
      
      if (!result) {
        return res.status(404).json({ error: "Share link not found or expired" });
      }

      // Verify password using bcrypt
      const passwordMatch = await bcrypt.compare(password, result.link.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Increment view count
      await storage.incrementSharedLinkViews(result.link.id);

      res.json({
        success: true,
        analysis: result.analysis,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify password" });
    }
  });

  // ============== AI Tools (Hook Lab / Caption Studio / Trends / Ideas) ==============
  const PLATFORM_ENUM = z.enum(["tiktok", "instagram", "youtube", "twitter", "linkedin"]);
  const NICHE_REGEX = /^[a-z0-9 \-_/&]{1,50}$/i;
  const nicheSchema = z.string().trim().min(1).max(50).regex(NICHE_REGEX, "Invalid niche");

  const hookLabSchema = z.object({
    topic: z.string().trim().min(3).max(500),
    platform: PLATFORM_ENUM,
    audience: z.string().trim().max(200).optional(),
    useBrandVoice: z.boolean().optional(),
    source: z.string().trim().max(80).optional(),
  });

  const captionStudioSchema = z.object({
    caption: z.string().trim().min(1).max(3000),
    platform: PLATFORM_ENUM,
    useBrandVoice: z.boolean().optional(),
    source: z.string().trim().max(80).optional(),
  });

  const trendsQuerySchema = z.object({
    platform: PLATFORM_ENUM,
    niche: nicheSchema,
  });

  const ideasGenerateSchema = z.object({
    niche: nicheSchema,
    platform: PLATFORM_ENUM,
    count: z.number().int().min(4).max(12).optional(),
    useBrandVoice: z.boolean().optional(),
  });

  const ideasSaveSchema = z.object({ saved: z.boolean() });

  const requireCredit = async (userId: string, res: Response): Promise<boolean> => {
    const ok = await decrementUserCredits(userId);
    if (!ok) {
      res.status(402).json({ error: "Out of credits. Upgrade your plan to continue." });
      return false;
    }
    return true;
  };

  // ============== Hook Lab ==============
  app.post("/api/hook-lab/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = hookLabSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const { topic, platform, audience, useBrandVoice } = parsed.data;
      const bv = useBrandVoice !== false ? await getDefaultBrandVoice(userId) : undefined;
      const result = await generateHooks(topic, platform, audience || "", bv || null);
      const saved = await storage.createHookGeneration({
        userId,
        topic,
        platform,
        audience: audience || null,
        hooks: result.hooks,
        bestHookIndex: result.bestHookIndex,
      });
      res.json({ id: saved.id, ...result });
    } catch (error) {
      console.error("Hook generation error:", error);
      res.status(500).json({ error: "Failed to generate hooks" });
    }
  });

  app.get("/api/hook-lab/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const rows = await storage.getHookGenerations(userId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // ============== Caption Studio ==============
  app.post("/api/caption-studio/rewrite", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = captionStudioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const { caption, platform, useBrandVoice } = parsed.data;
      const bv = useBrandVoice !== false ? await getDefaultBrandVoice(userId) : undefined;
      const result = await rewriteCaption(caption, platform, bv || null);
      const saved = await storage.createCaptionDraft({
        userId,
        originalCaption: caption,
        platform,
        rewrittenCaption: result.rewrittenCaption,
        hashtags: result.hashtags,
        viralScore: result.viralScore,
        improvements: result.improvements,
        variants: result.variants,
      });
      res.json({ id: saved.id, ...result });
    } catch (error) {
      console.error("Caption rewrite error:", error);
      res.status(500).json({ error: "Failed to rewrite caption" });
    }
  });

  app.get("/api/caption-studio/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const rows = await storage.getCaptionDrafts(userId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // ============== Trend Radar ==============
  app.get("/api/trends", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = trendsQuerySchema.safeParse({
        platform: (req.query.platform as string) || "tiktok",
        niche: ((req.query.niche as string) || "general").toLowerCase(),
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const { platform, niche } = parsed.data;

      // Trends are cached per platform+niche for 6 hours.
      // Cache hits do not consume credits; cache misses do.
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      const cached = await storage.getRecentTrendsByPlatformNiche(platform, niche, SIX_HOURS);
      if (cached.length >= 6) {
        return res.json(cached);
      }

      if (!(await requireCredit(userId, res))) return;
      const aiTrends = await generateTrends(platform, niche);
      const inserted = await storage.createTrendTopics(
        aiTrends.map((t) => ({
          platform,
          niche,
          topic: t.topic,
          category: t.category,
          hashtags: t.hashtags,
          description: t.description,
          momentum: t.momentum,
          estimatedReach: t.estimatedReach,
          bestFormat: t.bestFormat,
        }))
      );
      res.json(inserted);
    } catch (error) {
      console.error("Trend radar error:", error);
      res.status(500).json({ error: "Failed to load trends" });
    }
  });

  // ============== Idea Generator ==============
  app.post("/api/ideas/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = ideasGenerateSchema.safeParse({
        ...req.body,
        niche: typeof req.body?.niche === "string" ? req.body.niche.toLowerCase() : req.body?.niche,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const { niche, platform, count, useBrandVoice } = parsed.data;
      const recentTitles = await storage.getRecentAnalysisTitles(userId, 8);
      const bv = useBrandVoice ? await getDefaultBrandVoice(userId) : undefined;
      const aiIdeas = await generateIdeas(niche, platform, recentTitles.join("; "), count || 8, bv);
      const inserted = await storage.createContentIdeas(
        aiIdeas.map((i) => ({
          userId,
          niche,
          platform,
          title: i.title,
          hook: i.hook,
          outline: i.outline,
          predictedScore: i.predictedScore,
          difficulty: i.difficulty,
          saved: false,
        }))
      );
      res.json(inserted);
    } catch (error) {
      console.error("Idea generation error:", error);
      res.status(500).json({ error: "Failed to generate ideas" });
    }
  });

  app.get("/api/ideas", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const rows = await storage.getContentIdeas(userId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  app.post("/api/ideas/:id/save", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = ideasSaveSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      await storage.toggleSavedIdea(req.params.id, userId, parsed.data.saved);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update idea" });
    }
  });

  // ============== Notifications ==============
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listNotifications(userId);
      const unread = await unreadNotificationCount(userId);
      res.json({ items, unread });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await markNotificationRead(req.params.id, userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // ============== Onboarding ==============
  const onboardingSchema = z.object({
    primaryPlatform: PLATFORM_ENUM.optional(),
    primaryNiche: z.string().trim().min(1).max(50).optional(),
    goal: z.enum(["grow", "monetize", "consistency", "viral", "brand"]).optional(),
    completed: z.boolean().optional(),
  });

  app.post("/api/onboarding", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = onboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const wasCompleted = (await storage.getUser(userId))?.onboardingCompleted ?? false;
      await setOnboarding(userId, parsed.data);
      const completed = parsed.data.completed ?? true;
      if (completed) {
        await createNotification({
          userId,
          type: "welcome",
          title: "Welcome to Viralyz",
          body: "Your AI co-pilot is ready. Try analyzing your first piece of content.",
          href: "/analyze",
          meta: null,
        });
        if (!wasCompleted) {
          const u = await storage.getUser(userId);
          if (u?.email && u.emailDigests !== false) {
            sendEmail(renderWelcomeEmail({ firstName: u.firstName, email: u.email })).catch(() => {});
          }
        }
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to save onboarding" });
    }
  });

  // ============== Email / Notification Preferences ==============
  app.get("/api/notification-prefs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const u = await storage.getUser(userId);
      res.json({ emailDigests: u?.emailDigests ?? true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  const prefsSchema = z.object({ emailDigests: z.boolean() });
  app.patch("/api/notification-prefs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = prefsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: fromError(parsed.error).toString() });
      await setEmailDigestsEnabled(userId, parsed.data.emailDigests);
      res.json({ success: true, emailDigests: parsed.data.emailDigests });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.post("/api/email/test-digest", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const u = await storage.getUser(userId);
      if (!u?.email) return res.status(400).json({ error: "No email on file" });
      const payload = await getWeeklyDigestPayload(userId);
      const result = await sendEmail(
        renderWeeklyDigestEmail({
          firstName: u.firstName,
          email: u.email,
          analysisCount: payload.analysisCount,
          topAnalysis: payload.topAnalysis,
          averageScore: payload.averageScore,
          upcomingPosts: payload.upcomingPosts,
          accuracy: payload.accuracy,
        }),
      );
      // Test sends do not affect the weekly cadence (don't mark digest sent).
      res.json({ success: true, delivery: result });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed" });
    }
  });

  app.post("/api/admin/email/run-digest-job", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const result = await runWeeklyDigestJob();
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed" });
    }
  });

  // ============== Calendar / Scheduling ==============
  const scheduleSchema = z.object({
    scheduledFor: z.string().datetime().nullable(),
  });

  app.get("/api/calendar", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const from = (req.query.from as string) || new Date(Date.now() - 7 * 86400000).toISOString();
      const to = (req.query.to as string) || new Date(Date.now() + 30 * 86400000).toISOString();
      const items = await getScheduledAnalyses(userId, from, to);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch calendar" });
    }
  });

  app.post("/api/analyses/:id/schedule", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = scheduleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const date = parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null;
      const updated = await setAnalysisSchedule(req.params.id, userId, date);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  const actualsSchema = z.object({
    views: z.number().int().min(0).optional(),
    likes: z.number().int().min(0).optional(),
    comments: z.number().int().min(0).optional(),
    shares: z.number().int().min(0).optional(),
    postedAt: z.string().datetime().optional(),
  });

  app.post("/api/analyses/:id/actuals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = actualsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const updated = await recordAnalysisActuals(req.params.id, userId, {
        views: parsed.data.views,
        likes: parsed.data.likes,
        comments: parsed.data.comments,
        shares: parsed.data.shares,
        postedAt: parsed.data.postedAt ? new Date(parsed.data.postedAt) : undefined,
      });
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to record performance" });
    }
  });

  // ============== Pipeline / Board ==============
  const statusSchema = z.object({ status: z.enum(BOARD_STATUSES) });
  app.patch("/api/analyses/:id/status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const updated = await setAnalysisStatus(req.params.id, userId, parsed.data.status);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get("/api/content/board", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const platform = (req.query.platform as string | undefined) || undefined;
      const niche = (req.query.niche as string | undefined) || undefined;
      const q = (req.query.q as string | undefined) || undefined;
      const data = await getBoardItems(userId, { platform, niche, q });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch board" });
    }
  });

  const viewModeSchema = z.object({ mode: z.enum(["board", "list"]) });
  app.post("/api/user/view-mode", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = viewModeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      await storage.updateUserContentViewMode(userId, parsed.data.mode);
      res.json({ success: true, mode: parsed.data.mode });
    } catch (e) {
      res.status(500).json({ error: "Failed to update view mode" });
    }
  });

  // ============== Insights / Best-time-to-post ==============
  ensureBaselineSeeded().catch((e) => console.error("Failed to seed posting baseline:", e));

  app.get("/api/insights/heatmap", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const platform = normalizePlatform(req.query.platform as string | undefined);
      const user = await storage.getUser(userId);
      const niche = normalizeNiche((req.query.niche as string | undefined) ?? user?.primaryNiche);
      const tz = (req.query.tz as string | undefined) || (user as any)?.timezone || "UTC";
      const result = await computeHeatmap(userId, platform, niche, tz);
      res.json(result);
    } catch (e) {
      console.error("Heatmap error:", e);
      res.status(500).json({ error: "Failed to compute heatmap" });
    }
  });

  app.get("/api/insights/platforms", (_req, res) => {
    res.json({ platforms: PLATFORMS });
  });

  const tzSchema = z.object({ timezone: z.string().trim().min(1).max(64) });
  app.post("/api/user/timezone", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = tzSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      await storage.updateUserTimezone(userId, parsed.data.timezone);
      res.json({ success: true, timezone: parsed.data.timezone });
    } catch (e) {
      res.status(500).json({ error: "Failed to update timezone" });
    }
  });

  // ============== Brand Voice ==============
  const brandVoiceCreateSchema = z.object({
    name: z.string().trim().min(1).max(80),
    samples: z.array(z.string().min(1).max(5000)).min(3, "At least 3 samples required").max(10),
    isDefault: z.boolean().optional(),
  });

  app.get("/api/brand-voice", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listBrandVoiceProfiles(userId);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.post("/api/brand-voice", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = brandVoiceCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const extracted = await extractBrandVoice(parsed.data.samples);
      const created = await createBrandVoiceProfile({
        userId,
        name: parsed.data.name,
        isDefault: parsed.data.isDefault ?? true,
        samples: parsed.data.samples,
        toneSummary: extracted.toneSummary,
        vocabulary: extracted.vocabulary,
        doRules: extracted.doRules,
        dontRules: extracted.dontRules,
        signatureMoves: extracted.signatureMoves,
      });
      res.json(created);
    } catch (e) {
      console.error("Brand voice extract error:", e);
      res.status(500).json({ error: "Failed to extract brand voice" });
    }
  });

  app.patch("/api/brand-voice/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const patchSchema = z.object({
        name: z.string().trim().min(1).max(80).optional(),
        isDefault: z.boolean().optional(),
      });
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const updated = await updateBrandVoiceProfile(req.params.id, userId, parsed.data);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.delete("/api/brand-voice/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await deleteBrandVoiceProfile(req.params.id, userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // ============== Thumbnails ==============
  const thumbIdeasSchema = z.object({
    topic: z.string().trim().min(3).max(500),
    platform: PLATFORM_ENUM,
    count: z.number().int().min(1).max(4).optional(),
  });

  const thumbRenderSchema = z.object({
    prompt: z.string().trim().min(5).max(2000),
    style: z.string().trim().max(50).optional(),
    platform: PLATFORM_ENUM.optional(),
    ctrScore: z.number().int().min(0).max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  });

  app.get("/api/thumbnails", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listThumbnails(userId);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.post("/api/thumbnails/ideas", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = thumbIdeasSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const ideas = await generateThumbnailIdeas(parsed.data.topic, parsed.data.platform, parsed.data.count || 3);
      res.json(ideas);
    } catch (e) {
      console.error("Thumbnail ideas error:", e);
      res.status(500).json({ error: "Failed to generate thumbnail ideas" });
    }
  });

  app.post("/api/thumbnails/render", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = thumbRenderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;
      const buf = await renderThumbnail(parsed.data.prompt);
      const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
      const saved = await createThumbnail({
        userId,
        prompt: parsed.data.prompt,
        style: parsed.data.style || null,
        platform: parsed.data.platform || null,
        imageUrl: dataUrl,
        ctrScore: parsed.data.ctrScore ?? null,
        notes: parsed.data.notes || null,
      });
      res.json(saved);
    } catch (e) {
      console.error("Thumbnail render error:", e);
      res.status(500).json({ error: "Failed to render thumbnail" });
    }
  });

  app.delete("/api/thumbnails/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await deleteThumbnail(req.params.id, userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // ============== Global Search ==============
  app.get("/api/search", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const q = String(req.query.q || "").trim().slice(0, 200);
      if (q.length < 2) {
        return res.json({ analyses: [], hooks: [], captions: [], ideas: [] });
      }
      const results = await globalSearch(userId, q);
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ============== Swipe File ==============
  app.get("/api/swipe-file", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listSwipePosts({
        userId,
        platform: req.query.platform ? String(req.query.platform) : undefined,
        niche: req.query.niche ? String(req.query.niche) : undefined,
        hookType: req.query.hookType ? String(req.query.hookType) : undefined,
        format: req.query.format ? String(req.query.format) : undefined,
        q: req.query.q ? String(req.query.q) : undefined,
        minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
        sort:
          req.query.sort === "newest"
            ? "newest"
            : req.query.sort === "trending"
            ? "trending"
            : "score",
        savedOnly: req.query.savedOnly === "1" || req.query.savedOnly === "true",
        limit: req.query.limit ? Math.min(120, Number(req.query.limit)) : 60,
      });
      res.json(items);
    } catch (e) {
      console.error("Swipe list error:", e);
      res.status(500).json({ error: "Failed to load swipe file" });
    }
  });

  app.get("/api/swipe-file/facets", isAuthenticated, async (_req, res) => {
    try {
      const facets = await listSwipeFacets();
      res.json(facets);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.get("/api/swipe-file/saved", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listSavedSwipes(userId);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.get("/api/swipe-file/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const item = await getSwipePost(req.params.id, userId);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.post("/api/swipe-file/:id/save", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const exists = await getSwipePost(req.params.id);
      if (!exists) return res.status(404).json({ error: "Not found" });
      await saveSwipe(userId, req.params.id);
      res.json({ saved: true });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  app.delete("/api/swipe-file/:id/save", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      await unsaveSwipe(userId, req.params.id);
      res.json({ saved: false });
    } catch (e) {
      res.status(500).json({ error: "Failed" });
    }
  });

  const swipeCreateSchema = z.object({
    text: z.string().trim().min(5).max(2000),
    platform: z.string().trim().min(1).max(20),
    niche: z.string().trim().min(1).max(50),
    format: z.string().trim().max(30).optional(),
    hookType: z.string().trim().max(30).optional(),
    viralScore: z.number().int().min(0).max(100).optional(),
    scoreBreakdown: z.object({
      hook: z.number().int().min(0).max(20),
      structure: z.number().int().min(0).max(20),
      emotion: z.number().int().min(0).max(20),
      clarity: z.number().int().min(0).max(20),
      cta: z.number().int().min(0).max(20),
    }).optional(),
    whyItWorks: z.string().trim().max(2000).optional(),
    creatorHandle: z.string().trim().max(80).optional(),
    sourceUrl: z.string().trim().max(500).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  });

  app.post("/api/admin/swipe-file", isAdmin, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = swipeCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const input = parsed.data;
      let viralScore = input.viralScore;
      let scoreBreakdown = input.scoreBreakdown;
      let whyItWorks = input.whyItWorks;

      if (viralScore == null || !scoreBreakdown || !whyItWorks) {
        try {
          const analysis = await analyzeContent(
            input.text.slice(0, 120),
            input.text,
            input.platform,
            "post"
          );
          if (viralScore == null) viralScore = analysis.viralScore;
          if (!scoreBreakdown) {
            scoreBreakdown = {
              hook: analysis.hookScore,
              structure: analysis.structureScore,
              emotion: analysis.visualScore,
              clarity: analysis.metadataScore,
              cta: analysis.timingScore,
            };
          }
          if (!whyItWorks) {
            const fixes = (analysis.top3Fixes || [])
              .map((f) => f?.fix)
              .filter((f): f is string => typeof f === "string" && f.length > 0);
            whyItWorks =
              fixes.length > 0
                ? `Auto-analyzed strengths and patterns: ${fixes.slice(0, 3).join(" | ")}`
                : "Auto-analyzed by Viralyz scorer.";
          }
        } catch (err) {
          console.error("Analyzer fallback failed:", err);
          if (viralScore == null) {
            return res.status(400).json({ error: "viralScore required when analyzer unavailable" });
          }
          if (!whyItWorks) whyItWorks = "Curated entry.";
        }
      }

      const data: InsertSwipePost = {
        text: input.text,
        platform: input.platform,
        niche: input.niche,
        format: input.format ?? null,
        hookType: input.hookType ?? null,
        viralScore: viralScore!,
        scoreBreakdown: scoreBreakdown ?? null,
        whyItWorks: whyItWorks!,
        creatorHandle: input.creatorHandle ?? null,
        sourceUrl: input.sourceUrl ?? null,
        tags: input.tags ?? null,
        curatedBy: userId,
      };

      const created = await createSwipePost(data);
      res.json(created);
    } catch (e) {
      console.error("Swipe create error:", e);
      res.status(500).json({ error: "Failed to create swipe" });
    }
  });

  // ============== Cross-platform Repurposer ==============
  const REPURPOSE_PLATFORM = z.enum([
    "tiktok", "reels", "shorts", "instagram", "twitter", "x", "threads", "linkedin", "youtube",
  ]);
  const repurposeSchema = z.object({
    sourceText: z.string().trim().min(20).max(5000),
    sourceAnalysisId: z.string().trim().min(1).max(100).optional(),
    platforms: z.array(REPURPOSE_PLATFORM).min(1).max(8),
    useBrandVoice: z.boolean().optional(),
  });

  app.post("/api/repurpose", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = repurposeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      if (!(await requireCredit(userId, res))) return;

      const { sourceText, platforms, useBrandVoice, sourceAnalysisId } = parsed.data;

      let brandVoice = null;
      if (useBrandVoice !== false) {
        const bv = await getDefaultBrandVoice(userId);
        if (bv) {
          brandVoice = {
            toneSummary: bv.toneSummary,
            vocabulary: bv.vocabulary,
            doRules: bv.doRules,
            dontRules: bv.dontRules,
            signatureMoves: bv.signatureMoves,
          };
        }
      }

      const aiVariants = await repurposeForPlatforms(sourceText, platforms, brandVoice);

      const scored = await Promise.all(
        aiVariants.map(async (v) => {
          try {
            const a = await analyzeContent(
              v.text.split(/\n/)[0].slice(0, 100) || "Repurposed post",
              v.text,
              v.platform,
              "post"
            );
            return {
              ...v,
              viralScore: a.viralScore,
              scoreBreakdown: {
                hook: a.hookScore,
                visual: a.visualScore,
                structure: a.structureScore,
                metadata: a.metadataScore,
                timing: a.timingScore,
              },
            };
          } catch (err) {
            console.error(`Repurpose scoring failed for ${v.platform}:`, err);
            return {
              ...v,
              viralScore: 50,
              scoreBreakdown: { hook: 10, visual: 10, structure: 10, metadata: 10, timing: 10 },
            };
          }
        })
      );

      const variantInputs = scored.map((v) => ({
        platform: v.platform,
        text: v.text,
        hashtags: v.hashtags,
        viralScore: v.viralScore,
        scoreBreakdown: v.scoreBreakdown,
        platformNote: v.platformNote,
        lintFlags: lintCaption(v.text, v.platform, v.hashtags),
      }));

      const { run, variants } = await createRepurposeRun(userId, sourceText, variantInputs, {
        brandVoiceUsed: !!brandVoice,
        sourceAnalysisId: sourceAnalysisId ?? null,
      });

      res.json({ ...run, variants });
    } catch (e) {
      console.error("Repurpose error:", e);
      res.status(500).json({ error: "Failed to repurpose content" });
    }
  });

  app.get("/api/repurpose", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const items = await listRepurposeRuns(userId);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed to load repurpose runs" });
    }
  });

  const scheduleVariantSchema = z.object({
    scheduledFor: z.string().datetime(),
  });

  app.post("/api/repurpose/:variantId/save-draft", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const result = await saveRepurposeVariantAsDraft(req.params.variantId, userId);
      if (!result) return res.status(404).json({ error: "Variant not found" });
      res.json(result);
    } catch (e) {
      console.error("Variant save-draft error:", e);
      res.status(500).json({ error: "Failed to save draft" });
    }
  });

  app.post("/api/repurpose/:variantId/schedule", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims?.sub || (req.user as any).id;
      const parsed = scheduleVariantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).toString() });
      }
      const result = await scheduleRepurposeVariant(
        req.params.variantId,
        userId,
        new Date(parsed.data.scheduledFor)
      );
      if (!result) return res.status(404).json({ error: "Variant not found" });
      res.json(result);
    } catch (e) {
      console.error("Variant schedule error:", e);
      res.status(500).json({ error: "Failed to schedule variant" });
    }
  });

  return httpServer;
}
