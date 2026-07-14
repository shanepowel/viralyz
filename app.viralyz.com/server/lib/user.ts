import type { Request } from "express";

export function getUserId(req: Request): string | undefined {
  const user = req.user as
    | { id?: string; claims?: { sub?: string } }
    | undefined;

  return user?.claims?.sub ?? user?.id;
}
