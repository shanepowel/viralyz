import type { Express, RequestHandler } from "express";
import { authStorage } from "../replit_integrations/auth/storage";
import { isDevAuthEnabled, isAuthenticated as devIsAuthenticated } from "./devAuth";
import { isAuthenticated as replitIsAuthenticated } from "../replit_integrations/auth/replitAuth";

function resolveIsAuthenticated(): RequestHandler {
  return isDevAuthEnabled() ? devIsAuthenticated : replitIsAuthenticated;
}

export function registerAuthRoutes(app: Express): void {
  const isAuthenticated = resolveIsAuthenticated();

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId =
        req.user?.claims?.sub ||
        req.user?.id ||
        req.session?.userId;

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
