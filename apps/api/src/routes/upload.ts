// apps/api/src/routes/upload.ts
// Uses Cloudinary free tier — no AWS needed
import { Router, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../env";

// Configure Cloudinary at module load
if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "text/csv", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadRouter = Router();

// POST /upload/sign — returns a signed upload preset for direct browser-to-Cloudinary upload
// This keeps the API server out of the upload path entirely (free tier friendly)
uploadRouter.post("/upload/sign", async (req: Request, res: Response) => {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ code: "UPLOAD_UNAVAILABLE", message: "File upload is not configured" });
  }

  const { mimeType, formId } = req.body as { mimeType: string; formId: string };

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return res.status(400).json({ code: "INVALID_FILE_TYPE", message: "File type not allowed" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = `scribbleforms/${formId}`;
  const params    = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET!);

  return res.json({
    signature,
    timestamp,
    folder,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey:    env.CLOUDINARY_API_KEY,
  });
});
