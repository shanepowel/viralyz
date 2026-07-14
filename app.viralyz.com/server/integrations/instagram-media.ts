/**
 * Generates a 1024x1024 image for an Instagram post via gpt-image-1 and
 * stages it in private object storage behind a short-lived signed GET URL
 * that Instagram's Graph API can fetch during container creation.
 *
 * Returns the public-fetchable URL. Throws (fail loud) if image generation
 * or storage isn't configured — callers should surface the error to the
 * approval/run UI rather than silently produce nothing.
 */
import { randomUUID } from "crypto";
import { generateImageBuffer } from "../replit_integrations/image";
import { objectStorageClient } from "../replit_integrations/object_storage/objectStorage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  if (parts.length < 3) throw new Error("invalid-object-path");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function signGetUrl(bucketName: string, objectName: string, ttlSec: number): Promise<string> {
  const res = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "GET",
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`signed-url-${res.status}`);
  const j: any = await res.json();
  return j.signed_url;
}

/**
 * Build a short, vivid image prompt from the caption. We don't need the
 * model to read the whole post — just enough to ground the image. This
 * keeps the gpt-image-1 spend predictable.
 */
function imagePromptFromCaption(caption: string): string {
  const firstLine = caption.split(/\n/).find((l) => l.trim().length > 0)?.trim() || caption.trim();
  const seed = firstLine.slice(0, 240);
  return `Editorial-style square Instagram visual that illustrates: "${seed}". Clean composition, strong focal point, modern typography optional, on-brand for a creator/founder feed. No watermark, no logos.`;
}

export async function generateInstagramMediaUrl(caption: string): Promise<string> {
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateDir) {
    throw new Error("instagram-media-storage-missing: PRIVATE_OBJECT_DIR is not configured");
  }
  const buf = await generateImageBuffer(imagePromptFromCaption(caption), "1024x1024");
  const objectId = randomUUID();
  const fullPath = `${privateDir.replace(/\/$/, "")}/autopilot/instagram/${objectId}.png`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  const file = objectStorageClient.bucket(bucketName).file(objectName);
  await file.save(buf, { contentType: "image/png", resumable: false });
  // 6h is plenty — IG fetches the URL during container creation, which we
  // do immediately before publish.
  return signGetUrl(bucketName, objectName, 6 * 3600);
}
