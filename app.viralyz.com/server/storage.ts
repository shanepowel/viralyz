import {
  users,
  content,
  comments,
  tribes,
  tribePosts,
  courses,
  courseModules,
  courseLessons,
  userProgress,
  sharedLinks,
  contentAnalyses,
  follows,
  analysisComments,
  dmConversations,
  directMessages,
  hookGenerations,
  captionDrafts,
  trendTopics,
  contentIdeas,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type Comment,
  type InsertComment,
  type Tribe,
  type InsertTribe,
  type TribePost,
  type InsertTribePost,
  type Course,
  type InsertCourse,
  type SharedLink,
  type InsertSharedLink,
  type Follow,
  type AnalysisComment,
  type DmConversation,
  type DirectMessage,
  type HookGeneration,
  type InsertHookGeneration,
  type CaptionDraft,
  type InsertCaptionDraft,
  type TrendTopic,
  type InsertTrendTopic,
  type ContentIdea,
  type InsertContentIdea,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or, gt, ne, count, avg, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;

  // Content operations
  getContent(id: string): Promise<Content | undefined>;
  getAllContent(limit?: number): Promise<Content[]>;
  getContentByType(type: string, limit?: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  incrementContentLikes(id: string): Promise<void>;
  incrementContentViews(id: string): Promise<void>;

  // Comments operations
  getCommentsByContentId(contentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string, userId: string): Promise<void>;

  // Tribes operations
  getTribe(id: string): Promise<Tribe | undefined>;
  getTribeBySlug(slug: string): Promise<Tribe | undefined>;
  getAllTribes(): Promise<Tribe[]>;
  createTribe(tribe: InsertTribe): Promise<Tribe>;

  // Tribe Posts operations
  getTribePostsByTribeId(tribeId: string, limit?: number): Promise<TribePost[]>;
  createTribePost(post: InsertTribePost): Promise<TribePost>;
  incrementTribePostUpvotes(id: string): Promise<void>;

  // Courses operations
  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateUserPlan(id: string, plan: string, creditsRemaining?: number): Promise<void>;
  updateUserTimezone(id: string, timezone: string): Promise<void>;
  updateUserContentViewMode(id: string, mode: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
  deleteContent(id: string): Promise<void>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalContent: number;
    totalComments: number;
    totalTribes: number;
  }>;

  // Shared Links operations
  createSharedLink(link: InsertSharedLink): Promise<SharedLink>;
  getSharedLinkByCode(shareCode: string): Promise<SharedLink | undefined>;
  getSharedLinksByUser(userId: string): Promise<SharedLink[]>;
  incrementSharedLinkViews(id: string): Promise<void>;
  deactivateSharedLink(id: string, userId: string): Promise<void>;
  getSharedAnalysis(shareCode: string): Promise<any>;

  // Community operations
  getCreators(currentUserId?: string): Promise<any[]>;
  getPublicProfile(userId: string): Promise<any>;
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<any[]>;
  getFollowing(userId: string): Promise<any[]>;
  getFollowCounts(userId: string): Promise<{ followers: number; following: number }>;
  getUserSharedAnalyses(userId: string): Promise<any[]>;

  // Analysis Comments operations
  getAnalysisComments(analysisId: string): Promise<any[]>;
  createAnalysisComment(analysisId: string, userId: string, text: string): Promise<AnalysisComment>;
  deleteAnalysisComment(id: string, userId: string): Promise<void>;

  // Direct Messaging operations
  getOrCreateDmConversation(userId1: string, userId2: string): Promise<DmConversation>;
  getUserConversations(userId: string): Promise<any[]>;
  getConversationMessages(conversationId: string, userId: string, limit?: number): Promise<any[]>;
  sendDirectMessage(conversationId: string, senderId: string, text: string): Promise<DirectMessage>;
  markMessagesRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Content operations
  async getContent(id: string): Promise<Content | undefined> {
    const [item] = await db.select().from(content).where(eq(content.id, id));
    return item || undefined;
  }

  async getAllContent(limit: number = 50): Promise<Content[]> {
    return await db.select().from(content).orderBy(desc(content.createdAt)).limit(limit);
  }

  async getContentByType(type: string, limit: number = 50): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.type, type))
      .orderBy(desc(content.createdAt))
      .limit(limit);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [item] = await db.insert(content).values(insertContent).returning();
    return item;
  }

  async incrementContentLikes(id: string): Promise<void> {
    await db
      .update(content)
      .set({ likes: sql`${content.likes} + 1` })
      .where(eq(content.id, id));
  }

  async incrementContentViews(id: string): Promise<void> {
    await db
      .update(content)
      .set({ views: sql`${content.views} + 1` })
      .where(eq(content.id, id));
  }

  // Comments operations
  async getCommentsByContentId(contentId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.contentId, contentId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Tribes operations
  async getTribe(id: string): Promise<Tribe | undefined> {
    const [tribe] = await db.select().from(tribes).where(eq(tribes.id, id));
    return tribe || undefined;
  }

  async getTribeBySlug(slug: string): Promise<Tribe | undefined> {
    const [tribe] = await db.select().from(tribes).where(eq(tribes.slug, slug));
    return tribe || undefined;
  }

  async getAllTribes(): Promise<Tribe[]> {
    return await db.select().from(tribes).orderBy(desc(tribes.members));
  }

  async createTribe(insertTribe: InsertTribe): Promise<Tribe> {
    const [tribe] = await db.insert(tribes).values(insertTribe).returning();
    return tribe;
  }

  // Tribe Posts operations
  async getTribePostsByTribeId(tribeId: string, limit: number = 50): Promise<TribePost[]> {
    return await db
      .select()
      .from(tribePosts)
      .where(eq(tribePosts.tribeId, tribeId))
      .orderBy(desc(tribePosts.createdAt))
      .limit(limit);
  }

  async createTribePost(insertPost: InsertTribePost): Promise<TribePost> {
    const [post] = await db.insert(tribePosts).values(insertPost).returning();
    return post;
  }

  async incrementTribePostUpvotes(id: string): Promise<void> {
    await db
      .update(tribePosts)
      .set({ upvotes: sql`${tribePosts.upvotes} + 1` })
      .where(eq(tribePosts.id, id));
  }

  // Courses operations
  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, id));
  }

  async updateUserTimezone(id: string, timezone: string): Promise<void> {
    await db.update(users).set({ timezone }).where(eq(users.id, id));
  }

  async updateUserContentViewMode(id: string, mode: string): Promise<void> {
    await db.update(users).set({ contentViewMode: mode }).where(eq(users.id, id));
  }

  async updateUserPlan(id: string, plan: string, creditsRemaining?: number): Promise<void> {
    const updateData: any = { plan };
    if (creditsRemaining !== undefined) {
      updateData.creditsRemaining = creditsRemaining;
    }
    await db.update(users).set(updateData).where(eq(users.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.userId, id));
      await tx.delete(content).where(eq(content.userId, id));
      await tx.delete(users).where(eq(users.id, id));
    });
  }

  async deleteContent(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.contentId, id));
      await tx.delete(content).where(eq(content.id, id));
    });
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalContent: number;
    totalComments: number;
    totalTribes: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [contentCount] = await db.select({ count: sql<number>`count(*)` }).from(content);
    const [commentCount] = await db.select({ count: sql<number>`count(*)` }).from(comments);
    const [tribeCount] = await db.select({ count: sql<number>`count(*)` }).from(tribes);

    return {
      totalUsers: Number(userCount?.count || 0),
      totalContent: Number(contentCount?.count || 0),
      totalComments: Number(commentCount?.count || 0),
      totalTribes: Number(tribeCount?.count || 0),
    };
  }

  // Shared Links operations
  async createSharedLink(link: InsertSharedLink): Promise<SharedLink> {
    const [created] = await db.insert(sharedLinks).values(link).returning();
    return created;
  }

  async getSharedLinkByCode(shareCode: string): Promise<SharedLink | undefined> {
    const [link] = await db
      .select()
      .from(sharedLinks)
      .where(
        and(
          eq(sharedLinks.shareCode, shareCode),
          eq(sharedLinks.isActive, true)
        )
      );
    return link || undefined;
  }

  async getSharedLinksByUser(userId: string): Promise<SharedLink[]> {
    return await db
      .select()
      .from(sharedLinks)
      .where(eq(sharedLinks.userId, userId))
      .orderBy(desc(sharedLinks.createdAt));
  }

  async incrementSharedLinkViews(id: string): Promise<void> {
    await db
      .update(sharedLinks)
      .set({ viewCount: sql`${sharedLinks.viewCount} + 1` })
      .where(eq(sharedLinks.id, id));
  }

  async deactivateSharedLink(id: string, userId: string): Promise<void> {
    await db
      .update(sharedLinks)
      .set({ isActive: false })
      .where(and(eq(sharedLinks.id, id), eq(sharedLinks.userId, userId)));
  }

  async getSharedAnalysis(shareCode: string): Promise<any> {
    const [result] = await db
      .select({
        link: sharedLinks,
        analysis: contentAnalyses,
      })
      .from(sharedLinks)
      .innerJoin(contentAnalyses, eq(sharedLinks.analysisId, contentAnalyses.id))
      .where(
        and(
          eq(sharedLinks.shareCode, shareCode),
          eq(sharedLinks.isActive, true)
        )
      );
    
    if (!result) return undefined;
    
    if (result.link.expiresAt && new Date(result.link.expiresAt) < new Date()) {
      return undefined;
    }
    
    return result;
  }

  async getCreators(currentUserId?: string): Promise<any[]> {
    const creatorsRaw = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        plan: users.plan,
        createdAt: users.createdAt,
        totalAnalyses: sql<number>`COALESCE((SELECT COUNT(*) FROM content_analyses WHERE user_id = ${users.id}), 0)`,
        avgScore: sql<number>`COALESCE((SELECT ROUND(AVG(viral_score)) FROM content_analyses WHERE user_id = ${users.id} AND viral_score IS NOT NULL), 0)`,
        followerCount: sql<number>`COALESCE((SELECT COUNT(*) FROM follows WHERE following_id = ${users.id}), 0)`,
      })
      .from(users)
      .orderBy(desc(sql`COALESCE((SELECT COUNT(*) FROM content_analyses WHERE user_id = ${users.id}), 0)`))
      .limit(50);

    return creatorsRaw;
  }

  async getPublicProfile(userId: string): Promise<any> {
    const [profile] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        plan: users.plan,
        createdAt: users.createdAt,
        totalAnalyses: sql<number>`COALESCE((SELECT COUNT(*) FROM content_analyses WHERE user_id = ${users.id}), 0)`,
        avgScore: sql<number>`COALESCE((SELECT ROUND(AVG(viral_score)) FROM content_analyses WHERE user_id = ${users.id} AND viral_score IS NOT NULL), 0)`,
        followerCount: sql<number>`COALESCE((SELECT COUNT(*) FROM follows WHERE following_id = ${users.id}), 0)`,
        followingCount: sql<number>`COALESCE((SELECT COUNT(*) FROM follows WHERE follower_id = ${users.id}), 0)`,
      })
      .from(users)
      .where(eq(users.id, userId));

    return profile || undefined;
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!result;
  }

  async getFollowers(userId: string): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        plan: users.plan,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .orderBy(desc(follows.createdAt));
  }

  async getFollowing(userId: string): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        plan: users.plan,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .orderBy(desc(follows.createdAt));
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    const [followerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));
    const [followingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return {
      followers: Number(followerCount?.count || 0),
      following: Number(followingCount?.count || 0),
    };
  }

  async getUserSharedAnalyses(userId: string): Promise<any[]> {
    return await db
      .select({
        id: contentAnalyses.id,
        title: contentAnalyses.title,
        viralScore: contentAnalyses.viralScore,
        targetPlatform: contentAnalyses.targetPlatform,
        createdAt: contentAnalyses.createdAt,
        shareCode: sharedLinks.shareCode,
      })
      .from(sharedLinks)
      .innerJoin(contentAnalyses, eq(sharedLinks.analysisId, contentAnalyses.id))
      .where(and(eq(sharedLinks.userId, userId), eq(sharedLinks.isActive, true)))
      .orderBy(desc(contentAnalyses.createdAt))
      .limit(20);
  }

  async getAnalysisComments(analysisId: string): Promise<any[]> {
    return await db
      .select({
        id: analysisComments.id,
        text: analysisComments.text,
        createdAt: analysisComments.createdAt,
        userId: analysisComments.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(analysisComments)
      .innerJoin(users, eq(analysisComments.userId, users.id))
      .where(eq(analysisComments.analysisId, analysisId))
      .orderBy(desc(analysisComments.createdAt));
  }

  async createAnalysisComment(analysisId: string, userId: string, text: string): Promise<AnalysisComment> {
    const [comment] = await db
      .insert(analysisComments)
      .values({ analysisId, userId, text })
      .returning();
    return comment;
  }

  async deleteAnalysisComment(id: string, userId: string): Promise<void> {
    await db
      .delete(analysisComments)
      .where(and(eq(analysisComments.id, id), eq(analysisComments.userId, userId)));
  }

  async getOrCreateDmConversation(userId1: string, userId2: string): Promise<DmConversation> {
    const [existing] = await db
      .select()
      .from(dmConversations)
      .where(
        or(
          and(eq(dmConversations.participant1Id, userId1), eq(dmConversations.participant2Id, userId2)),
          and(eq(dmConversations.participant1Id, userId2), eq(dmConversations.participant2Id, userId1))
        )
      );
    if (existing) return existing;
    const [conv] = await db
      .insert(dmConversations)
      .values({ participant1Id: userId1, participant2Id: userId2 })
      .returning();
    return conv;
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const convos = await db
      .select()
      .from(dmConversations)
      .where(
        or(
          eq(dmConversations.participant1Id, userId),
          eq(dmConversations.participant2Id, userId)
        )
      )
      .orderBy(desc(dmConversations.lastMessageAt));

    const results = [];
    for (const conv of convos) {
      const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      const [otherUser] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, otherUserId));

      const [lastMsg] = await db
        .select()
        .from(directMessages)
        .where(eq(directMessages.conversationId, conv.id))
        .orderBy(desc(directMessages.createdAt))
        .limit(1);

      const [unreadResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(directMessages)
        .where(
          and(
            eq(directMessages.conversationId, conv.id),
            ne(directMessages.senderId, userId),
            isNull(directMessages.readAt)
          )
        );

      results.push({
        id: conv.id,
        otherUser: otherUser || null,
        lastMessage: lastMsg || null,
        unreadCount: Number(unreadResult?.count || 0),
        lastMessageAt: conv.lastMessageAt,
      });
    }
    return results;
  }

  async getConversationMessages(conversationId: string, userId: string, limit: number = 50): Promise<any[]> {
    const [conv] = await db
      .select()
      .from(dmConversations)
      .where(
        and(
          eq(dmConversations.id, conversationId),
          or(
            eq(dmConversations.participant1Id, userId),
            eq(dmConversations.participant2Id, userId)
          )
        )
      );
    if (!conv) return [];

    return await db
      .select({
        id: directMessages.id,
        text: directMessages.text,
        senderId: directMessages.senderId,
        readAt: directMessages.readAt,
        createdAt: directMessages.createdAt,
        senderFirstName: users.firstName,
        senderProfileImage: users.profileImageUrl,
      })
      .from(directMessages)
      .innerJoin(users, eq(directMessages.senderId, users.id))
      .where(eq(directMessages.conversationId, conversationId))
      .orderBy(directMessages.createdAt)
      .limit(limit);
  }

  async sendDirectMessage(conversationId: string, senderId: string, text: string): Promise<DirectMessage> {
    const [conv] = await db
      .select()
      .from(dmConversations)
      .where(
        and(
          eq(dmConversations.id, conversationId),
          or(
            eq(dmConversations.participant1Id, senderId),
            eq(dmConversations.participant2Id, senderId)
          )
        )
      );
    if (!conv) throw new Error("Not a participant in this conversation");

    const [msg] = await db
      .insert(directMessages)
      .values({ conversationId, senderId, text })
      .returning();

    await db
      .update(dmConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(dmConversations.id, conversationId));

    return msg;
  }

  async markMessagesRead(conversationId: string, userId: string): Promise<void> {
    const [conv] = await db
      .select()
      .from(dmConversations)
      .where(
        and(
          eq(dmConversations.id, conversationId),
          or(
            eq(dmConversations.participant1Id, userId),
            eq(dmConversations.participant2Id, userId)
          )
        )
      );
    if (!conv) return;

    await db
      .update(directMessages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(directMessages.conversationId, conversationId),
          ne(directMessages.senderId, userId),
          isNull(directMessages.readAt)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const convos = await db
      .select({ id: dmConversations.id })
      .from(dmConversations)
      .where(
        or(
          eq(dmConversations.participant1Id, userId),
          eq(dmConversations.participant2Id, userId)
        )
      );
    if (convos.length === 0) return 0;

    const convoIds = convos.map(c => c.id);
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(directMessages)
      .where(
        and(
          sql`${directMessages.conversationId} = ANY(${convoIds})`,
          ne(directMessages.senderId, userId),
          isNull(directMessages.readAt)
        )
      );
    return Number(result?.count || 0);
  }

  // ============== Hook Lab ==============
  async createHookGeneration(data: InsertHookGeneration): Promise<HookGeneration> {
    const [row] = await db.insert(hookGenerations).values(data).returning();
    return row;
  }

  async getHookGenerations(userId: string, limit: number = 20): Promise<HookGeneration[]> {
    return db
      .select()
      .from(hookGenerations)
      .where(eq(hookGenerations.userId, userId))
      .orderBy(desc(hookGenerations.createdAt))
      .limit(limit);
  }

  async getHookGeneration(id: string, userId: string): Promise<HookGeneration | undefined> {
    const [row] = await db
      .select()
      .from(hookGenerations)
      .where(and(eq(hookGenerations.id, id), eq(hookGenerations.userId, userId)));
    return row;
  }

  // ============== Caption Studio ==============
  async createCaptionDraft(data: InsertCaptionDraft): Promise<CaptionDraft> {
    const [row] = await db.insert(captionDrafts).values(data).returning();
    return row;
  }

  async getCaptionDrafts(userId: string, limit: number = 20): Promise<CaptionDraft[]> {
    return db
      .select()
      .from(captionDrafts)
      .where(eq(captionDrafts.userId, userId))
      .orderBy(desc(captionDrafts.createdAt))
      .limit(limit);
  }

  // ============== Trend Radar ==============
  async getRecentTrendsByPlatformNiche(
    platform: string,
    niche: string,
    sinceMs: number
  ): Promise<TrendTopic[]> {
    const cutoff = new Date(Date.now() - sinceMs);
    return db
      .select()
      .from(trendTopics)
      .where(
        and(
          eq(trendTopics.platform, platform),
          eq(trendTopics.niche, niche),
          gt(trendTopics.createdAt, cutoff)
        )
      )
      .orderBy(desc(trendTopics.momentum));
  }

  async createTrendTopics(rows: InsertTrendTopic[]): Promise<TrendTopic[]> {
    if (rows.length === 0) return [];
    return db.insert(trendTopics).values(rows).returning();
  }

  // ============== Idea Generator ==============
  async createContentIdeas(rows: InsertContentIdea[]): Promise<ContentIdea[]> {
    if (rows.length === 0) return [];
    return db.insert(contentIdeas).values(rows).returning();
  }

  async getContentIdeas(userId: string, limit: number = 50): Promise<ContentIdea[]> {
    return db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.userId, userId))
      .orderBy(desc(contentIdeas.createdAt))
      .limit(limit);
  }

  async toggleSavedIdea(id: string, userId: string, saved: boolean): Promise<void> {
    await db
      .update(contentIdeas)
      .set({ saved })
      .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)));
  }

  async getRecentAnalysisTitles(userId: string, limit: number = 10): Promise<string[]> {
    const rows = await db
      .select({ title: contentAnalyses.title })
      .from(contentAnalyses)
      .where(eq(contentAnalyses.userId, userId))
      .orderBy(desc(contentAnalyses.createdAt))
      .limit(limit);
    return rows.map((r) => r.title || "").filter(Boolean);
  }
}

export const storage = new DatabaseStorage();
