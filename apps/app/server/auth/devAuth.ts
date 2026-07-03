import type { Express, Request, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { authStorage } from "../replit_integrations/auth/storage";

const DEV_USER_ID = "dev-user-viralyz";
const DEV_EMAIL = "creator@viralyz.local";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      claims?: { sub?: string; email?: string };
      expires_at?: number;
    }
  }
}

function getSessionMiddleware() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "dev-viralyz-secret-change-me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

async function ensureDevUser() {
  const existing = await authStorage.getUser(DEV_USER_ID);
  if (existing) return existing;

  return authStorage.upsertUser({
    id: DEV_USER_ID,
    email: DEV_EMAIL,
    firstName: "Creator",
    lastName: "Demo",
    role: "admin",
    plan: "pro",
    creditsRemaining: 500,
    onboardingCompleted: true,
    primaryPlatform: "instagram",
    primaryNiche: "general",
    goal: "growth",
  });
}

function hydrateUser(req: Express.Request) {
  if (!req.session.userId) return;

  req.user = {
    id: req.session.userId,
    claims: { sub: req.session.userId },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
}

export function isDevAuthEnabled(): boolean {
  return process.env.AUTH_MODE === "dev" || !process.env.REPL_ID;
}

export async function setupDevAuth(app: Express): Promise<void> {
  app.set("trust proxy", 1);
  app.use(getSessionMiddleware());
  app.use((req, _res, next) => {
    hydrateUser(req);
    next();
  });

  app.get("/api/login", async (req, res) => {
    const user = await ensureDevUser();
    req.session.userId = user.id;
    hydrateUser(req);
    res.redirect(process.env.APP_URL || "/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect(process.env.APP_URL || "/");
    });
  });

  app.post("/api/dev/login", async (req, res) => {
    const email = (req.body?.email as string) || DEV_EMAIL;
    const user = await authStorage.upsertUser({
      id: email.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40) || DEV_USER_ID,
      email,
      firstName: req.body?.firstName || "Creator",
      onboardingCompleted: true,
      creditsRemaining: 100,
    });
    req.session.userId = user.id;
    hydrateUser(req);
    res.json(user);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  hydrateUser(req);
  return next();
};

export function getSession() {
  return getSessionMiddleware();
}
