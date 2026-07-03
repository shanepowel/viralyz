import type { Express } from "express";
import express from "express";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import {
  createLocalUploadTarget,
  saveLocalUpload,
  serveLocalObject,
  useLocalObjectStorage,
} from "../../lib/localObjectStorage";

const pendingLocalUploads = new Map<string, string>();

export function registerObjectStorageRoutes(app: Express): void {
  if (useLocalObjectStorage()) {
    registerLocalObjectStorageRoutes(app);
    return;
  }

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
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
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

function registerLocalObjectStorageRoutes(app: Express): void {
  app.post("/api/uploads/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }

      const { objectPath, diskPath, uploadURL } =
        await createLocalUploadTarget(name);
      pendingLocalUploads.set(uploadURL, diskPath);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating local upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put(
    "/api/uploads/local/:filename",
    express.raw({ type: "*/*", limit: "50mb" }),
    async (req, res) => {
      try {
        const uploadURL = `/api/uploads/local/${req.params.filename}`;
        const diskPath = pendingLocalUploads.get(uploadURL);
        if (!diskPath) {
          return res.status(404).json({ error: "Upload session not found" });
        }

        await saveLocalUpload(diskPath, Buffer.from(req.body));
        pendingLocalUploads.delete(uploadURL);
        res.status(200).json({ ok: true });
      } catch (error) {
        console.error("Local upload failed:", error);
        res.status(500).json({ error: "Upload failed" });
      }
    },
  );

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const served = await serveLocalObject(req.path, res);
    if (!served) {
      res.status(404).json({ error: "Object not found" });
    }
  });
}
