// apps/api/src/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV:             z.enum(["development", "production", "test"]).default("development"),
  PORT:                 z.coerce.number().default(8000),
  BASE_URL:             z.string().default("http://localhost:8000"),
  CORS_ORIGIN:          z.string().default("http://localhost:3000"),

  DATABASE_URL:         z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL:            z.string().default("redis://localhost:6379"),

  IP_HASH_SECRET:       z.string().min(32).default("change_this_secret_must_be_32_chars_min"),

  // Email (Resend — free tier 3000/month)
  RESEND_API_KEY:       z.string().optional(),
  EMAIL_FROM:           z.string().email().default("noreply@scribbleforms.dev"),

  // Cloudinary (free tier)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY:    z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Frontend URL for OAuth redirects
  WEB_URL:              z.string().default("http://localhost:3000"),
});

function createEnv(raw: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = createEnv(process.env);
