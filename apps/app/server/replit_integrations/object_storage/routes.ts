import type { Express, Request, Response } from "express";
import express from "express";
import path from "node:path";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  useLocalObjectStorage,
  createLocalUploadTarget,
  saveLocalUpload,
  serveLocalObject,
} from "../../lib/localObjectStorage";

/**
 * Register object storage routes for file uploads.
 *
 * Uses local disk storage when PRIVATE_OBJECT_DIR is unset (default for
 * Render/Railway/local dev). Falls back to Replit/GCS presigned URLs when
 * PRIVATE_OBJECT_DIR is configured.
 */
export function registerObjectStorageRoutes(app: Express): void {
  if (useLocalObjectStorage()) {
    registerLocalObjectStorageRoutes(app);
    return;
  }

  registerCloudObjectStorageRoutes(app);
}

function registerLocalObjectStorageRoutes(app: Express): void {
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      const target = await createLocalUploadTarget(name);

      res.json({
        uploadURL: target.uploadURL,
        objectPath: target.objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating local upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put(
    "/api/uploads/local/:filename",
    express.raw({ type: "*/*", limit: "500mb" }),
    async (req: Request, res: Response) => {
      try {
        const filename = req.params.filename;
        if (!filename || filename.includes("..")) {
          return res.status(400).json({ error: "Invalid filename" });
        }

        const uploadRoot = path.resolve(
          process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), "uploads"),
        );
        const diskPath = path.join(uploadRoot, filename);
        const body = req.body;
        const data = Buffer.isBuffer(body)
          ? body
          : typeof body === "string"
            ? Buffer.from(body)
            : null;

        if (!data || data.length === 0) {
          return res.status(400).json({ error: "Empty upload body" });
        }

        await saveLocalUpload(diskPath, data);
        res.status(200).json({ success: true });
      } catch (error) {
        console.error("Local upload error:", error);
        res.status(500).json({ error: "Failed to save upload" });
      }
    },
  );

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const served = await serveLocalObject(req.path, res);
    if (!served) {
      return res.status(404).json({ error: "Object not found" });
    }
  });
}

function registerCloudObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
