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
import { registerAuthRoutes } from "../replit_integrations/auth/routes";

export { authStorage, type IAuthStorage } from "../replit_integrations/auth/storage";

export async function setupAuth(app: Express): Promise<void> {
  if (isDevAuthEnabled()) {
    await setupDevAuth(app);
    return;
  }
  await setupReplitAuth(app);
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

export { registerAuthRoutes };
