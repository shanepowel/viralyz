/**
 * Viralyz content-graph schema (v2.0)
 *
 * Additive tables that extend the existing product schema in apps/app.
 * These are the spine for Score Engine → Media Kit → Marketplace.
 *
 * Note: `users` / `content_analyses` already exist in apps/app/shared.
 * New tables reference users by varchar id without FK to keep packages/db
 * portable; apps/app adds FK constraints when integrating.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Connected social accounts (extends platform_accounts conceptually) */
export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    platform: varchar("platform", { length: 20 }).notNull(),
    platformUserId: varchar("platform_user_id"),
    username: varchar("username", { length: 100 }),
    accessTokenEnc: text("access_token_enc"),
    refreshTokenEnc: text("refresh_token_enc"),
    followerCount: integer("follower_count").default(0),
    verifiedAt: timestamp("verified_at"),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("social_accounts_user_idx").on(t.userId),
    uniqueIndex("social_accounts_platform_user_uidx").on(
      t.userId,
      t.platform,
      t.platformUserId,
    ),
  ],
);

/**
 * Content graph node — drafts → analyzed → scheduled → posted → tracked
 * Coexists with legacy `content_analyses`; new flows write here.
 */
export const contentItems = pgTable(
  "content_items",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    type: varchar("type", { length: 20 }).notNull(), // video|image|carousel|text|article
    targetPlatform: varchar("target_platform", { length: 20 }),
    title: text("title"),
    description: text("description"),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    // draft|analyzed|scheduled|posted|tracking|archived
    scheduledFor: timestamp("scheduled_for"),
    postedAt: timestamp("posted_at"),
    platformPostId: varchar("platform_post_id"),
    legacyAnalysisId: varchar("legacy_analysis_id"), // backfill link
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("content_items_user_idx").on(t.userId),
    index("content_items_status_idx").on(t.status),
    index("content_items_platform_post_idx").on(t.platformPostId),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 20 }).notNull(), // video|thumbnail|caption|script|frame
    url: text("url").notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("assets_content_idx").on(t.contentId)],
);

/** Versioned Viral Score analyses */
export const analyses = pgTable(
  "analyses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    scoringProfileVersion: varchar("scoring_profile_version", { length: 40 }),
    viralScore: integer("viral_score"),
    hook: integer("hook"),
    visual: integer("visual"),
    structure: integer("structure"),
    metadata: integer("metadata"),
    timing: integer("timing"),
    confidence: real("confidence"),
    results: jsonb("results"),
    suggestions: jsonb("suggestions"),
    retentionCurve: jsonb("retention_curve"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("analyses_content_idx").on(t.contentId),
    uniqueIndex("analyses_content_version_uidx").on(t.contentId, t.version),
  ],
);

export const performance = pgTable(
  "performance",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    syncedAt: timestamp("synced_at").defaultNow().notNull(),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
    watchTimeAvg: real("watch_time_avg"),
    retentionCurve: jsonb("retention_curve"),
    engagementRate: real("engagement_rate"),
  },
  (t) => [index("performance_content_idx").on(t.contentId)],
);

export const audienceModels = pgTable(
  "audience_models",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    platform: varchar("platform", { length: 20 }).notNull(),
    bestTimes: jsonb("best_times"),
    hookStyles: jsonb("hook_styles"),
    optimalLength: integer("optimal_length"),
    formatPerformance: jsonb("format_performance"),
    predictionAccuracy: real("prediction_accuracy"),
    sampleSize: integer("sample_size").default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("audience_models_user_platform_uidx").on(t.userId, t.platform),
  ],
);

export const competitors = pgTable(
  "competitors_v2",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    platform: varchar("platform", { length: 20 }).notNull(),
    username: varchar("username", { length: 100 }).notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
    lastScrapedAt: timestamp("last_scraped_at"),
  },
  (t) => [
    index("competitors_v2_user_idx").on(t.userId),
    uniqueIndex("competitors_v2_user_platform_user_uidx").on(
      t.userId,
      t.platform,
      t.username,
    ),
  ],
);

export const competitorPosts = pgTable(
  "competitor_posts_v2",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    competitorId: varchar("competitor_id")
      .notNull()
      .references(() => competitors.id, { onDelete: "cascade" }),
    platformPostId: varchar("platform_post_id"),
    title: text("title"),
    thumbnailUrl: text("thumbnail_url"),
    metrics: jsonb("metrics"),
    ourScore: integer("our_score"),
    ourAnalysis: jsonb("our_analysis"),
    postedAt: timestamp("posted_at"),
  },
  (t) => [index("competitor_posts_v2_competitor_idx").on(t.competitorId)],
);

export const trends = pgTable(
  "trends",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    niche: varchar("niche", { length: 80 }),
    platform: varchar("platform", { length: 20 }).notNull(),
    kind: varchar("kind", { length: 20 }).notNull(), // format|sound|topic|hashtag
    label: text("label").notNull(),
    growthPct: real("growth_pct"),
    lifecycle: varchar("lifecycle", { length: 20 }), // emerging|peaking|declining
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
  },
  (t) => [
    index("trends_niche_platform_idx").on(t.niche, t.platform),
    index("trends_lifecycle_idx").on(t.lifecycle),
  ],
);

export const dmFlows = pgTable("engage_dm_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  socialAccountId: varchar("social_account_id").references(() => socialAccounts.id),
  triggerPostId: varchar("trigger_post_id"),
  keywords: jsonb("keywords").$type<string[]>(),
  template: text("template"),
  active: boolean("active").default(true),
  stats: jsonb("stats"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dmConversations = pgTable("engage_dm_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flowId: varchar("flow_id")
    .notNull()
    .references(() => dmFlows.id, { onDelete: "cascade" }),
  platformUser: varchar("platform_user"),
  status: varchar("status", { length: 20 }).default("open"),
  messages: jsonb("messages"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const biopages = pgTable(
  "biopages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    handle: varchar("handle", { length: 64 }).notNull(),
    theme: varchar("theme", { length: 40 }).default("signal"),
    blocks: jsonb("blocks"),
    published: boolean("published").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("biopages_handle_uidx").on(t.handle)],
);

export const biopageEvents = pgTable(
  "biopage_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    biopageId: varchar("biopage_id")
      .notNull()
      .references(() => biopages.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 20 }).notNull(), // view|click|capture|tip
    blockId: varchar("block_id"),
    referrer: text("referrer"),
    ts: timestamp("ts").defaultNow().notNull(),
  },
  (t) => [
    index("biopage_events_biopage_idx").on(t.biopageId),
    index("biopage_events_ts_idx").on(t.ts),
  ],
);

export const mediaKits = pgTable(
  "media_kits",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    sections: jsonb("sections"),
    rateCard: jsonb("rate_card"),
    verified: boolean("verified").default(false),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("media_kits_slug_uidx").on(t.slug)],
);

/** Horizon 3 — feature-flag UI; tables created now */
export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkOrgId: varchar("clerk_org_id"),
  name: varchar("name", { length: 120 }).notNull(),
  website: text("website"),
  industry: varchar("industry", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id")
    .notNull()
    .references(() => brands.id),
  brief: jsonb("brief"),
  budgetRange: jsonb("budget_range"),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignOffers = pgTable("campaign_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id").notNull(),
  terms: jsonb("terms"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliverables = pgTable("deliverables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id")
    .notNull()
    .references(() => campaignOffers.id, { onDelete: "cascade" }),
  contentId: varchar("content_id").references(() => contentItems.id),
  milestone: varchar("milestone", { length: 40 }),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
});
