import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  useLocalObjectStorage,
  resolveLocalDiskPath,
} from "../localObjectStorage";

/**
 * Resolve an object path or absolute URL to a Buffer for media processing.
 */
export async function loadMediaBuffer(
  fileUrl: string,
): Promise<{ buffer: Buffer; ext: string }> {
  if (!fileUrl) {
    throw new Error("fileUrl is required");
  }

  // Absolute http(s) URL — fetch
  if (/^https?:\/\//i.test(fileUrl)) {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
    const ab = await res.arrayBuffer();
    const ext = guessExt(fileUrl, res.headers.get("content-type"));
    return { buffer: Buffer.from(ab), ext };
  }

  // Local object path: /objects/uploads/...
  if (fileUrl.startsWith("/objects/") && useLocalObjectStorage()) {
    const diskPath = resolveLocalDiskPath(fileUrl);
    const buffer = await readFile(diskPath);
    return { buffer, ext: path.extname(diskPath) || ".bin" };
  }

  // Relative app URL — fetch against APP_URL
  if (fileUrl.startsWith("/")) {
    const base = process.env.APP_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}${fileUrl}`);
    if (!res.ok) throw new Error(`Failed to fetch local media: ${res.status}`);
    const ab = await res.arrayBuffer();
    return {
      buffer: Buffer.from(ab),
      ext: guessExt(fileUrl, res.headers.get("content-type")),
    };
  }

  throw new Error(`Unsupported fileUrl: ${fileUrl}`);
}

function guessExt(url: string, contentType: string | null): string {
  const fromUrl = path.extname(new URL(url, "http://local").pathname);
  if (fromUrl) return fromUrl;
  if (contentType?.includes("mp4")) return ".mp4";
  if (contentType?.includes("webm")) return ".webm";
  if (contentType?.includes("quicktime")) return ".mov";
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  return ".bin";
}
