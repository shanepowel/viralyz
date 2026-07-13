import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, decimal, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// Content table (unified for Clips, Films, Stills, Flashes)
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // 'clip', 'film', 'still', 'flash'
  title: text("title"),
  description: text("description"),
  src: text("src").notNull(), // video/image URL
  thumbnail: text("thumbnail"),
  aspectRatio: varchar("aspect_ratio", { length: 10 }),
  duration: integer("duration"), // in seconds, null for stills
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentRelations = relations(content, ({ one, many }) => ({
  author: one(users, {
    fields: [content.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  likes: true,
  views: true,
  createdAt: true,
});
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => content.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  content: one(content, {
    fields: [comments.contentId],
    references: [content.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Tribes (Communities) table
export const tribes = pgTable("tribes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: text("icon"),
  banner: text("banner"),
  members: integer("members").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tribesRelations = relations(tribes, ({ many }) => ({
  posts: many(tribePosts),
}));

export const insertTribeSchema = createInsertSchema(tribes).omit({
  id: true,
  members: true,
  createdAt: true,
});
export type InsertTribe = z.infer<typeof insertTribeSchema>;
export type Tribe = typeof tribes.$inferSelect;

// Tribe Posts table
export const tribePosts = pgTable("tribe_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tribeId: varchar("tribe_id").notNull().references(() => tribes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tribePostsRelations = relations(tribePosts, ({ one }) => ({
  tribe: one(tribes, {
    fields: [tribePosts.tribeId],
    references: [tribes.id],
  }),
  author: one(users, {
    fields: [tribePosts.userId],
    references: [users.id],
  }),
}));

export const insertTribePostSchema = createInsertSchema(tribePosts).omit({
  id: true,
  upvotes: true,
  createdAt: true,
});
export type InsertTribePost = z.infer<typeof insertTribePostSchema>;
export type TribePost = typeof tribePosts.$inferSelect;

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  thumbnail: text("thumbnail"),
  level: varchar("level", { length: 20 }),
  duration: integer("duration"), // total minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  modules: many(courseModules),
}));

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course Modules table
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  lessons: many(courseLessons),
}));

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
});
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;

// Course Lessons table
export const courseLessons = pgTable("course_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => courseModules.id),
  title: text("title").notNull(),
  duration: integer("duration"), // in seconds
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
});

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [courseLessons.moduleId],
    references: [courseModules.id],
  }),
  progress: many(userProgress),
}));

export const insertCourseLessonSchema = createInsertSchema(courseLessons).omit({
  id: true,
});
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type CourseLesson = typeof courseLessons.$inferSelect;

// User Progress table
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: varchar("lesson_id").notNull().references(() => courseLessons.id),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(courseLessons, {
    fields: [userProgress.lessonId],
    references: [courseLessons.id],
  }),
}));

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Platform Accounts table (for cross-platform publishing)
export const platformAccounts = pgTable("platform_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform", { length: 20 }).notNull(), // 'youtube', 'tiktok', 'instagram', 'twitch', 'twitter'
  accountHandle: text("account_handle"),
  connected: boolean("connected").default(false).notNull(),
  connectedAt: timestamp("connected_at"),
});

export const platformAccountsRelations = relations(platformAccounts, ({ one }) => ({
  user: one(users, {
    fields: [platformAccounts.userId],
    references: [users.id],
  }),
}));

export const insertPlatformAccountSchema = createInsertSchema(platformAccounts).omit({
  id: true,
  connectedAt: true,
});
export type InsertPlatformAccount = z.infer<typeof insertPlatformAccountSchema>;
export type PlatformAccount = typeof platformAccounts.$inferSelect;

// VIRALYZ 2.0 - Content Analyses table
export const contentAnalyses = pgTable("content_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  title: text("title"),
  description: text("description"),
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: integer("duration_seconds"),
  targetPlatform: varchar("target_platform", { length: 20 }),
  viralScore: integer("viral_score"),
  hookScore: integer("hook_score"),
  visualScore: integer("visual_score"),
  structureScore: integer("structure_score"),
  metadataScore: integer("metadata_score"),
  timingScore: integer("timing_score"),
  analysisResults: jsonb("analysis_results"),
  suggestions: jsonb("suggestions"),
  status: varchar("status", { length: 20 }).default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  actualViews: integer("actual_views"),
  actualLikes: integer("actual_likes"),
  actualComments: integer("actual_comments"),
  actualShares: integer("actual_shares"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contentAnalysesRelations = relations(contentAnalyses, ({ one, many }) => ({
  user: one(users, {
    fields: [contentAnalyses.userId],
    references: [users.id],
  }),
  history: many(analysisHistory),
}));

export const insertContentAnalysisSchema = createInsertSchema(contentAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContentAnalysis = z.infer<typeof insertContentAnalysisSchema>;
export type ContentAnalysis = typeof contentAnalyses.$inferSelect;

// Analysis History table (for re-analysis tracking)
export const analysisHistory = pgTable("analysis_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => contentAnalyses.id),
  viralScore: integer("viral_score"),
  analysisResults: jsonb("analysis_results"),
  suggestions: jsonb("suggestions"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const analysisHistoryRelations = relations(analysisHistory, ({ one }) => ({
  content: one(contentAnalyses, {
    fields: [analysisHistory.contentId],
    references: [contentAnalyses.id],
  }),
}));

export const insertAnalysisHistorySchema = createInsertSchema(analysisHistory).omit({
  id: true,
  analyzedAt: true,
});
export type InsertAnalysisHistory = z.infer<typeof insertAnalysisHistorySchema>;
export type AnalysisHistory = typeof analysisHistory.$inferSelect;

// User Models table (learned preferences)
export const userModels = pgTable("user_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform", { length: 20 }).notNull(),
  bestPostingTimes: jsonb("best_posting_times"),
  topPerformingHooks: jsonb("top_performing_hooks"),
  optimalVideoLength: integer("optimal_video_length"),
  bestHashtags: jsonb("best_hashtags"),
  audiencePreferences: jsonb("audience_preferences"),
  predictionAccuracy: decimal("prediction_accuracy", { precision: 5, scale: 4 }),
  totalPredictions: integer("total_predictions").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userModelsRelations = relations(userModels, ({ one }) => ({
  user: one(users, {
    fields: [userModels.userId],
    references: [users.id],
  }),
}));

export const insertUserModelSchema = createInsertSchema(userModels).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserModel = z.infer<typeof insertUserModelSchema>;
export type UserModel = typeof userModels.$inferSelect;

// Tracked Competitors table
export const trackedCompetitors = pgTable("tracked_competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform", { length: 20 }).notNull(),
  competitorUsername: varchar("competitor_username", { length: 255 }).notNull(),
  competitorUrl: text("competitor_url"),
  followerCount: integer("follower_count"),
  lastScrapedAt: timestamp("last_scraped_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trackedCompetitorsRelations = relations(trackedCompetitors, ({ one, many }) => ({
  user: one(users, {
    fields: [trackedCompetitors.userId],
    references: [users.id],
  }),
  content: many(competitorContent),
}));

export const insertTrackedCompetitorSchema = createInsertSchema(trackedCompetitors).omit({
  id: true,
  lastScrapedAt: true,
  createdAt: true,
});
export type InsertTrackedCompetitor = z.infer<typeof insertTrackedCompetitorSchema>;
export type TrackedCompetitor = typeof trackedCompetitors.$inferSelect;

// Competitor Content table
export const competitorContent = pgTable("competitor_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => trackedCompetitors.id),
  platformContentId: varchar("platform_content_id", { length: 255 }),
  contentType: varchar("content_type", { length: 20 }),
  title: text("title"),
  thumbnailUrl: text("thumbnail_url"),
  views: integer("views"),
  likes: integer("likes"),
  comments: integer("comments"),
  postedAt: timestamp("posted_at"),
  viralScore: integer("viral_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorContentRelations = relations(competitorContent, ({ one }) => ({
  competitor: one(trackedCompetitors, {
    fields: [competitorContent.competitorId],
    references: [trackedCompetitors.id],
  }),
}));

export const insertCompetitorContentSchema = createInsertSchema(competitorContent).omit({
  id: true,
  createdAt: true,
});
export type InsertCompetitorContent = z.infer<typeof insertCompetitorContentSchema>;
export type CompetitorContent = typeof competitorContent.$inferSelect;

// Conversations table (for AI chat)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table (for AI chat)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Shared Links table for public file sharing with optional password protection
export const sharedLinks = pgTable("shared_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").notNull().references(() => contentAnalyses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  shareCode: varchar("share_code", { length: 32 }).notNull().unique(),
  passwordHash: text("password_hash"),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  analysis: one(contentAnalyses, {
    fields: [sharedLinks.analysisId],
    references: [contentAnalyses.id],
  }),
  owner: one(users, {
    fields: [sharedLinks.userId],
    references: [users.id],
  }),
}));

export const insertSharedLinkSchema = createInsertSchema(sharedLinks).omit({
  id: true,
  viewCount: true,
  createdAt: true,
});
export type InsertSharedLink = z.infer<typeof insertSharedLinkSchema>;
export type SharedLink = typeof sharedLinks.$inferSelect;

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export const analysisComments = pgTable("analysis_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").notNull().references(() => contentAnalyses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analysisCommentsRelations = relations(analysisComments, ({ one }) => ({
  analysis: one(contentAnalyses, {
    fields: [analysisComments.analysisId],
    references: [contentAnalyses.id],
  }),
  author: one(users, {
    fields: [analysisComments.userId],
    references: [users.id],
  }),
}));

export const insertAnalysisCommentSchema = createInsertSchema(analysisComments).omit({
  id: true,
  createdAt: true,
});
export type InsertAnalysisComment = z.infer<typeof insertAnalysisCommentSchema>;
export type AnalysisComment = typeof analysisComments.$inferSelect;

export const dmConversations = pgTable("dm_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dmConversationsRelations = relations(dmConversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [dmConversations.participant1Id],
    references: [users.id],
    relationName: "dmParticipant1",
  }),
  participant2: one(users, {
    fields: [dmConversations.participant2Id],
    references: [users.id],
    relationName: "dmParticipant2",
  }),
  messages: many(directMessages),
}));

export type DmConversation = typeof dmConversations.$inferSelect;

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => dmConversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  conversation: one(dmConversations, {
    fields: [directMessages.conversationId],
    references: [dmConversations.id],
  }),
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
}));

export type DirectMessage = typeof directMessages.$inferSelect;

// Hook Lab - AI-generated hook variants
export const hookGenerations = pgTable("hook_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  audience: text("audience"),
  hooks: jsonb("hooks").notNull(),
  bestHookIndex: integer("best_hook_index"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHookGenerationSchema = createInsertSchema(hookGenerations).omit({
  id: true,
  createdAt: true,
});
export type InsertHookGeneration = z.infer<typeof insertHookGenerationSchema>;
export type HookGeneration = typeof hookGenerations.$inferSelect;

// Caption Studio - AI-rewritten captions with platform variants
export const captionDrafts = pgTable("caption_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalCaption: text("original_caption").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  rewrittenCaption: text("rewritten_caption"),
  hashtags: text("hashtags").array(),
  viralScore: integer("viral_score"),
  improvements: jsonb("improvements"),
  variants: jsonb("variants"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCaptionDraftSchema = createInsertSchema(captionDrafts).omit({
  id: true,
  createdAt: true,
});
export type InsertCaptionDraft = z.infer<typeof insertCaptionDraftSchema>;
export type CaptionDraft = typeof captionDrafts.$inferSelect;

// Trend Radar - AI-detected trending topics per platform/niche
export const trendTopics = pgTable("trend_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform", { length: 20 }).notNull(),
  niche: varchar("niche", { length: 50 }).notNull(),
  topic: text("topic").notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  hashtags: text("hashtags").array(),
  description: text("description"),
  momentum: integer("momentum"),
  estimatedReach: text("estimated_reach"),
  bestFormat: text("best_format"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrendTopicSchema = createInsertSchema(trendTopics).omit({
  id: true,
  createdAt: true,
});
export type InsertTrendTopic = z.infer<typeof insertTrendTopicSchema>;
export type TrendTopic = typeof trendTopics.$inferSelect;

// Idea Generator - AI-generated content ideas
export const contentIdeas = pgTable("content_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  niche: varchar("niche", { length: 50 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  title: text("title").notNull(),
  hook: text("hook"),
  outline: jsonb("outline"),
  predictedScore: integer("predicted_score"),
  difficulty: varchar("difficulty", { length: 20 }),
  saved: boolean("saved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentIdeaSchema = createInsertSchema(contentIdeas).omit({
  id: true,
  createdAt: true,
});
export type InsertContentIdea = z.infer<typeof insertContentIdeaSchema>;
export type ContentIdea = typeof contentIdeas.$inferSelect;

// Notifications - in-app notification center
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 30 }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  meta: jsonb("meta"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  readAt: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Brand Voice Profiles - learned tone/voice for AI personalization
export const brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  samples: jsonb("samples").$type<string[]>(),
  toneSummary: text("tone_summary"),
  vocabulary: jsonb("vocabulary").$type<string[]>(),
  doRules: jsonb("do_rules").$type<string[]>(),
  dontRules: jsonb("dont_rules").$type<string[]>(),
  signatureMoves: jsonb("signature_moves").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;
export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;

// Thumbnails - AI-generated cover image variants
export const thumbnails = pgTable("thumbnails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 30 }),
  platform: varchar("platform", { length: 20 }),
  imageUrl: text("image_url").notNull(),
  ctrScore: integer("ctr_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThumbnailSchema = createInsertSchema(thumbnails).omit({
  id: true,
  createdAt: true,
});
export type InsertThumbnail = z.infer<typeof insertThumbnailSchema>;
export type Thumbnail = typeof thumbnails.$inferSelect;

// Swipe File - curated library of high-performing posts
export const swipePosts = pgTable("swipe_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  niche: varchar("niche", { length: 50 }).notNull(),
  format: varchar("format", { length: 30 }),
  hookType: varchar("hook_type", { length: 30 }),
  viralScore: integer("viral_score").notNull(),
  scoreBreakdown: jsonb("score_breakdown").$type<{
    hook: number;
    structure: number;
    emotion: number;
    clarity: number;
    cta: number;
  }>(),
  whyItWorks: text("why_it_works").notNull(),
  creatorHandle: varchar("creator_handle", { length: 80 }),
  sourceUrl: text("source_url"),
  tags: text("tags").array(),
  curatedBy: varchar("curated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSwipePostSchema = createInsertSchema(swipePosts).omit({
  id: true,
  createdAt: true,
});
export type InsertSwipePost = z.infer<typeof insertSwipePostSchema>;
export type SwipePost = typeof swipePosts.$inferSelect;

export const userSwipeSaves = pgTable("user_swipe_saves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  swipeId: varchar("swipe_id").notNull().references(() => swipePosts.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserSwipeSave = typeof userSwipeSaves.$inferSelect;

// Cross-platform Repurposer
export const repurposeRuns = pgTable("repurpose_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceText: text("source_text").notNull(),
  sourceAnalysisId: varchar("source_analysis_id"),
  brandVoiceUsed: boolean("brand_voice_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RepurposeRun = typeof repurposeRuns.$inferSelect;

export interface LintFlag {
  level: "warn" | "info" | "error";
  category: "banned" | "length" | "hashtags" | "ai-tells" | "readability";
  message: string;
}

export const repurposeVariants = pgTable("repurpose_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull().references(() => repurposeRuns.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 20 }).notNull(),
  text: text("text").notNull(),
  hashtags: text("hashtags").array(),
  viralScore: integer("viral_score"),
  scoreBreakdown: jsonb("score_breakdown").$type<{
    hook: number;
    visual: number;
    structure: number;
    metadata: number;
    timing: number;
  }>(),
  platformNote: text("platform_note"),
  lintFlags: jsonb("lint_flags").$type<LintFlag[]>(),
  status: varchar("status", { length: 20 }).default("ready").notNull(),
  scheduledAnalysisId: varchar("scheduled_analysis_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RepurposeVariant = typeof repurposeVariants.$inferSelect;

// Best-time-to-post baseline (per platform x niche x dow x hour)
export const postingSlotsBaseline = pgTable("posting_slots_baseline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform", { length: 20 }).notNull(),
  niche: varchar("niche", { length: 50 }).notNull(),
  dow: integer("dow").notNull(),
  hour: integer("hour").notNull(),
  score: integer("score").notNull(),
});

export type PostingSlotBaseline = typeof postingSlotsBaseline.$inferSelect;

// ============== AUTOPILOT v0 ==============
export const socialConnections = pgTable("social_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 30 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  displayName: text("display_name"),
  profileUrl: text("profile_url"),
  scope: text("scope"),
  accessTokenCipher: text("access_token_cipher"),
  refreshTokenCipher: text("refresh_token_cipher"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;

export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brief: text("brief").notNull(),
  platform: varchar("platform", { length: 20 }).notNull().default("linkedin"),
  cadence: varchar("cadence", { length: 20 }).notNull().default("weekdays"),
  postsPerWeek: integer("posts_per_week").default(3).notNull(),
  approvalMode: varchar("approval_mode", { length: 20 }).notNull().default("review"),
  useBrandVoice: boolean("use_brand_voice").default(true).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  goalMetric: varchar("goal_metric", { length: 30 }),
  goalTarget: integer("goal_target"),
  // One-line "what success looks like" sentence — used as a north star in
  // every prompt and shown back to the user on every approval card.
  goal: text("goal"),
  // Optional inspiration links (urls or @handles) the agent can study before
  // ideating. Stored as a string array; empty by default.
  inspirationLinks: text("inspiration_links").array().default(sql`'{}'::text[]`).notNull(),
  // Tone preset chosen from the user's brand voice profiles, or one of the
  // built-in presets ("authoritative", "playful", "story", …).
  tonePreset: varchar("tone_preset", { length: 40 }),
  brandVoiceProfileId: varchar("brand_voice_profile_id"),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;
export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true, createdAt: true, updatedAt: true, lastRunAt: true, nextRunAt: true, userId: true,
});

export type ProposedIdea = {
  title: string;
  hook: string;
  outline: string[];
  predictedScore: number;
  difficulty: string;
};

export type LearningSignals = {
  hookText?: string | null;
  hashtags?: string[] | null;
  ideaIndex?: number | null;
  regenerated?: boolean;
  cadenceHourUTC?: number | null;
  likes?: number | null;
  comments?: number | null;
  impressions?: number | null;
  impressionsSource?: "linkedin" | "estimate" | null;
  clicks?: number | null;
};

export const missionRuns = pgTable("mission_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  missionId: varchar("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  rejectReason: text("reject_reason"),
  regenerationFeedback: text("regeneration_feedback"),
  parentRunId: varchar("parent_run_id"),
  proposedIdeas: jsonb("proposed_ideas").$type<ProposedIdea[]>(),
  selectedIdeaIndex: integer("selected_idea_index"),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  measureAt: timestamp("measure_at"),
  externalPostUrn: text("external_post_urn"),
  externalPostUrl: text("external_post_url"),
  contentAnalysisId: varchar("content_analysis_id"),
  predictedScore: integer("predicted_score"),
  actualImpressions: integer("actual_impressions"),
  actualLikes: integer("actual_likes"),
  actualComments: integer("actual_comments"),
  actualShares: integer("actual_shares"),
  finalText: text("final_text"),
  finalHashtags: text("final_hashtags").array(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type MissionRun = typeof missionRuns.$inferSelect;

export const missionSteps = pgTable("mission_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull().references(() => missionRuns.id, { onDelete: "cascade" }),
  ord: integer("ord").notNull(),
  kind: varchar("kind", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  input: jsonb("input"),
  output: jsonb("output"),
  toolCall: text("tool_call"),
  reasoning: text("reasoning"),
  tokenCost: integer("token_cost").default(0).notNull(),
  creditCost: integer("credit_cost").default(0).notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MissionStep = typeof missionSteps.$inferSelect;

export const missionAudit = pgTable("mission_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: varchar("mission_id").references(() => missions.id, { onDelete: "set null" }),
  runId: varchar("run_id").references(() => missionRuns.id, { onDelete: "set null" }),
  event: varchar("event", { length: 60 }).notNull(),
  meta: jsonb("meta"),
  at: timestamp("at").defaultNow().notNull(),
});
export type MissionAudit = typeof missionAudit.$inferSelect;

// Per-approval-gate record. The agent inserts a row each time it pauses
// at a human approval gate; the `decidedAt` / `decision` columns are filled
// when the user approves or rejects. Lets us build "time-to-approve"
// dashboards without scanning mission_steps.
export const missionApprovals = pgTable("mission_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: varchar("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  runId: varchar("run_id").notNull().references(() => missionRuns.id, { onDelete: "cascade" }),
  gate: varchar("gate", { length: 30 }).notNull().default("draft"),
  decision: varchar("decision", { length: 20 }),
  decidedBy: varchar("decided_by"),
  decidedAt: timestamp("decided_at"),
  feedback: text("feedback"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MissionApproval = typeof missionApprovals.$inferSelect;

// Final artifacts produced by a run (the post text, hashtags, optional
// image URL, and provider id once published). One artifact per published
// run; older drafts are kept in mission_steps for transparency.
export const missionArtifacts = pgTable("mission_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: varchar("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  runId: varchar("run_id").notNull().references(() => missionRuns.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 30 }).notNull().default("post"),
  platform: varchar("platform", { length: 20 }).notNull(),
  text: text("text"),
  hashtags: text("hashtags").array(),
  mediaUrl: text("media_url"),
  externalId: text("external_id"),
  externalUrl: text("external_url"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MissionArtifact = typeof missionArtifacts.$inferSelect;

export const learningEvents = pgTable("learning_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  runId: varchar("run_id").references(() => missionRuns.id, { onDelete: "cascade" }),
  missionStepId: varchar("mission_step_id"),
  platform: varchar("platform", { length: 20 }).notNull(),
  predictedScore: integer("predicted_score"),
  actualImpressions: integer("actual_impressions"),
  actualEngagement: integer("actual_engagement"),
  actualNormalizedScore: integer("actual_normalized_score"),
  errorMagnitude: integer("error_magnitude"),
  signals: jsonb("signals").$type<LearningSignals>(),
  reasoning: text("reasoning"),
  insight: text("insight"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type LearningEvent = typeof learningEvents.$inferSelect;

// ============ Competitive Intelligence (Module 1: Pulse) ============
// New tables namespaced `intel*` so they don't collide with the legacy
// trackedCompetitors / competitorContent tables used by the old creator
// product. The intelligence module ingests from blog RSS, X public reads,
// and (best-effort) a connected user's LinkedIn token to read company
// posts, then synthesises a weekly digest per competitor.
export const intelCompetitors = pgTable("intel_competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  websiteUrl: text("website_url"),
  blogRssUrl: text("blog_rss_url"),
  xHandle: varchar("x_handle", { length: 64 }),
  linkedinCompanyUrl: text("linkedin_company_url"),
  // Module 2 (Signal Correlation) source hints. A public job-board URL
  // (Greenhouse / Lever / Ashby), a funding/news RSS feed (e.g. Crunchbase),
  // and a list of exec names to search for podcast appearances. All optional
  // and best-effort — adapters degrade to [] when absent or unreachable.
  jobBoardUrl: text("job_board_url"),
  fundingRssUrl: text("funding_rss_url"),
  execNames: text("exec_names").array(),
  emailDigestEnabled: boolean("email_digest_enabled").default(true).notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertIntelCompetitorSchema = createInsertSchema(intelCompetitors).omit({
  id: true, lastRefreshedAt: true, createdAt: true,
});
export type InsertIntelCompetitor = z.infer<typeof insertIntelCompetitorSchema>;
export type IntelCompetitor = typeof intelCompetitors.$inferSelect;

export const intelCompetitorPosts = pgTable("intel_competitor_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 20 }).notNull(), // 'rss' | 'x' | 'linkedin'
  externalId: varchar("external_id", { length: 255 }).notNull(),
  url: text("url"),
  author: varchar("author", { length: 160 }),
  title: text("title"),
  text: text("text"),
  publishedAt: timestamp("published_at"),
  rawLikes: integer("raw_likes"),
  rawComments: integer("raw_comments"),
  rawReposts: integer("raw_reposts"),
  rawImpressions: integer("raw_impressions"),
  qualifiedEngagement: integer("qualified_engagement"),
  engagers: jsonb("engagers").$type<Array<{ name: string; title?: string; company?: string; qualified?: boolean }>>(),
  ingestedAt: timestamp("ingested_at").defaultNow().notNull(),
}, (t) => ({
  competitorSourceExternalUniq: uniqueIndex("intel_post_competitor_source_external_uniq").on(
    t.competitorId, t.source, t.externalId,
  ),
}));
export type IntelCompetitorPost = typeof intelCompetitorPosts.$inferSelect;

export const intelCompetitorDigests = pgTable("intel_competitor_digests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(), // Monday 00:00 UTC of the ISO week
  themes: jsonb("themes").$type<Array<{ title: string; summary: string; postIds: string[] }>>(),
  amplifiers: jsonb("amplifiers").$type<Array<{ name: string; title?: string; reach: number }>>(),
  qualifiedEngagement: integer("qualified_engagement").default(0).notNull(),
  rawEngagement: integer("raw_engagement").default(0).notNull(),
  postsThisWeek: integer("posts_this_week").default(0).notNull(),
  trailingAvgPosts: decimal("trailing_avg_posts", { precision: 6, scale: 2 }),
  velocityChangePct: integer("velocity_change_pct"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (t) => ({
  competitorWeekUniq: uniqueIndex("intel_digest_competitor_week_uniq").on(t.competitorId, t.weekStart),
}));
export type IntelCompetitorDigest = typeof intelCompetitorDigests.$inferSelect;

// ============ Competitive Intelligence (Module 2: Signal Correlation) ============
// External signals that help explain WHY a competitor's content shifted:
// new (GTM/marketing) hires, funding events, and exec podcast appearances.
// Each row is per-competitor with a source URL + detected timestamp. All
// three ingest adapters are best-effort and degrade silently to [].

export const intelHiringSignals = pgTable("intel_hiring_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 20 }).notNull(), // 'greenhouse' | 'lever' | 'ashby'
  externalId: varchar("external_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  url: text("url"),
  location: varchar("location", { length: 200 }),
  department: varchar("department", { length: 160 }),
  isGtmRole: boolean("is_gtm_role").default(false).notNull(),
  postedAt: timestamp("posted_at"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (t) => ({
  hiringUniq: uniqueIndex("intel_hiring_competitor_source_external_uniq").on(t.competitorId, t.source, t.externalId),
}));
export type IntelHiringSignal = typeof intelHiringSignals.$inferSelect;

export const intelFundingSignals = pgTable("intel_funding_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  url: text("url"),
  amount: varchar("amount", { length: 80 }),
  publishedAt: timestamp("published_at"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (t) => ({
  fundingUniq: uniqueIndex("intel_funding_competitor_external_uniq").on(t.competitorId, t.externalId),
}));
export type IntelFundingSignal = typeof intelFundingSignals.$inferSelect;

export const intelPodcastSignals = pgTable("intel_podcast_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  guest: varchar("guest", { length: 200 }),
  showName: varchar("show_name", { length: 300 }),
  episodeTitle: text("episode_title").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (t) => ({
  podcastUniq: uniqueIndex("intel_podcast_competitor_external_uniq").on(t.competitorId, t.externalId),
}));
export type IntelPodcastSignal = typeof intelPodcastSignals.$inferSelect;

// gpt-4o-synthesised correlations tying an external signal to recent Pulse
// themes. Regenerated on each correlate run (old rows for a competitor are
// cleared first), so no unique index is needed.
export const intelSignalCorrelations = pgTable("intel_signal_correlations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitorId: varchar("competitor_id").notNull().references(() => intelCompetitors.id, { onDelete: "cascade" }),
  signalType: varchar("signal_type", { length: 20 }).notNull(), // 'hiring' | 'funding' | 'podcast'
  signalId: varchar("signal_id"),
  headline: text("headline").notNull(),
  explanation: text("explanation").notNull(),
  confidence: integer("confidence").default(0).notNull(), // 0-100
  relatedThemes: text("related_themes").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type IntelSignalCorrelation = typeof intelSignalCorrelations.$inferSelect;

// ─── Content graph (v2.0) — additive tables; source of truth also in packages/db ───
export {
  socialAccounts,
  contentItems,
  assets,
  analyses,
  performance,
  audienceModels,
  competitors as competitorsV2,
  competitorPosts as competitorPostsV2,
  trends,
  dmFlows,
  dmConversations,
  biopages,
  biopageEvents,
  mediaKits,
  brands,
  campaigns,
  campaignOffers,
  deliverables,
} from "./content-graph";

