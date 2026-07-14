import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import path from "node:path";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  useLocalObjectStorage,
  createLocalUploadTarget,
  saveLocalUpload,
  serveLocalObject,
  resolveLocalDiskPath,
  getUploadRoot,
} from "../../lib/localObjectStorage";

/**
 * Register object storage routes for file uploads.
 * Uses local disk when USE_LOCAL_STORAGE=true or PRIVATE_OBJECT_DIR is unset.
 */
export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      if (useLocalObjectStorage()) {
        const target = await createLocalUploadTarget(name);
        return res.json({
          uploadURL: target.uploadURL,
          objectPath: target.objectPath,
          metadata: { name, size, contentType },
          storage: "local",
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
        storage: "gcs",
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  /**
   * Local PUT upload — receives raw body bytes.
   * Path: /api/uploads/local/:filename  (filename = uuid.ext)
   */
  app.put(
    "/api/uploads/local/:filename",
    express.raw({ type: "*/*", limit: "512mb" }),
    async (req: Request, res: Response) => {
      try {
        const filename = path.basename(req.params.filename);
        if (!filename || filename.includes("..")) {
          return res.status(400).json({ error: "Invalid filename" });
        }
        const diskPath = path.join(getUploadRoot(), filename);
        const body = Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from(req.body || []);
        if (!body.length) {
          return res.status(400).json({ error: "Empty upload body" });
        }
        await saveLocalUpload(diskPath, body);
        res.status(200).json({ ok: true, objectPath: `/objects/uploads/${filename}` });
      } catch (error) {
        console.error("Local upload failed:", error);
        res.status(500).json({ error: "Failed to save upload" });
      }
    },
  );

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      if (useLocalObjectStorage()) {
        const served = await serveLocalObject(req.path, res);
        if (served) return;
        return res.status(404).json({ error: "Object not found" });
      }

      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      // Fallback: try local even if GCS failed
      if (await serveLocalObject(req.path, res)) return;
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
