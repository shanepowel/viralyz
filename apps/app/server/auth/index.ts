import type { Express, RequestHandler } from "express";
import {
  isDevAuthEnabled,
  setupDevAuth,
  isAuthenticated as devIsAuthenticated,
  getSession as devGetSession,
} from "./devAuth";
import {
  setupAuth as setupReplitAuth,
  isAuthenticated as replitIsAuthenticated,
  getSession as replitGetSession,
} from "../replit_integrations/auth/replitAuth";
import { authStorage } from "../replit_integrations/auth/storage";

export { authStorage, type IAuthStorage } from "../replit_integrations/auth/storage";

export async function setupAuth(app: Express): Promise<void> {
  if (isDevAuthEnabled()) {
    console.log("[auth] Using local DEV auth (AUTH_MODE=dev or no REPL_ID)");
    await setupDevAuth(app);
  } else {
    console.log("[auth] Using Replit OIDC auth");
    await setupReplitAuth(app);
  }
  registerAuthRoutes(app);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (isDevAuthEnabled()) {
    return devIsAuthenticated(req, res, next);
  }
  return replitIsAuthenticated(req, res, next);
};

export function getSession() {
  return isDevAuthEnabled() ? devGetSession() : replitGetSession();
}

/** Current-user endpoint — always uses the active auth mode's guard. */
export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
