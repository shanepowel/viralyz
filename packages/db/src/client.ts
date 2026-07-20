import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

/** Neon HTTP Drizzle client for serverless (Vercel / Next route handlers). */
export function createDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}
