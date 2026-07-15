import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("user"),
  plan: varchar("plan", { length: 20 }).default("free"),
  creditsRemaining: integer("credits_remaining").default(10),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  primaryPlatform: varchar("primary_platform", { length: 20 }),
  primaryNiche: varchar("primary_niche", { length: 50 }),
  goal: varchar("goal", { length: 30 }),
  timezone: varchar("timezone", { length: 64 }),
  contentViewMode: varchar("content_view_mode", { length: 10 }).default("board"),
  emailDigests: boolean("email_digests").default(true),
  lastDigestSentAt: timestamp("last_digest_sent_at"),
  autopilotPaused: boolean("autopilot_paused").default(false),
  linkedinConnectionId: varchar("linkedin_connection_id"),
  xConnectionId: varchar("x_connection_id"),
  threadsConnectionId: varchar("threads_connection_id"),
  instagramConnectionId: varchar("instagram_connection_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
