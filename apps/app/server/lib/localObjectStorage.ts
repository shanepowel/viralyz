import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Response } from "express";

const UPLOAD_ROOT = path.resolve(
  process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), "uploads"),
);

export function useLocalObjectStorage(): boolean {
  return (
    process.env.USE_LOCAL_STORAGE === "true" ||
    !process.env.PRIVATE_OBJECT_DIR
  );
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

export async function createLocalUploadTarget(filename: string) {
  await ensureUploadDir();
  const id = randomUUID();
  const ext = path.extname(filename) || ".bin";
  const objectPath = `/objects/uploads/${id}${ext}`;
  const diskPath = path.join(UPLOAD_ROOT, `${id}${ext}`);
  const uploadURL = `/api/uploads/local/${id}${ext}`;

  return { objectPath, diskPath, uploadURL };
}

export async function saveLocalUpload(
  diskPath: string,
  data: Buffer,
): Promise<void> {
  await ensureUploadDir();
  await fs.writeFile(diskPath, data);
}

export async function serveLocalObject(
  objectPath: string,
  res: Response,
): Promise<boolean> {
  const relative = objectPath.replace(/^\/objects\//, "");
  const diskPath = path.join(UPLOAD_ROOT, relative.replace(/^uploads\//, ""));

  try {
    const file = await fs.readFile(diskPath);
    const ext = path.extname(diskPath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".mp4"
            ? "video/mp4"
            : ext === ".webm"
              ? "video/webm"
              : "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(file);
    return true;
  } catch {
    return false;
  }
}
