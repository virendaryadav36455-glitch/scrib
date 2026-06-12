// apps/api/src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter } from "@repo/trpc/server";
import { createContext } from "./context";
import { rateLimiters } from "./middleware/rate-limit";
import { handleFormSubmit } from "./routes/submit";
import { uploadRouter } from "./routes/upload";
import { oauthRouter } from "./routes/oauth";
import { env } from "./env";

export const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // handled by frontend
}));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? (origin, callback) => {
            if (!origin) {
              return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
              return callback(null, true);
            }

            return callback(
              new Error(`CORS blocked for origin: ${origin}`)
            );
          }
        : true,

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ── Body & cookies ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Trust proxy (for correct req.ip behind Render/Railway) ─────────────────
app.set("trust proxy", 1);

// ── Request ID — every response gets a unique trace ID ─────────────────────
app.use((_req, res, next) => {
  res.setHeader("X-Request-Id", crypto.randomUUID());
  next();
});

// ── Global rate limit ──────────────────────────────────────────────────────
app.use(rateLimiters.global);

// ── OpenAPI document ───────────────────────────────────────────────────────
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title:   "ScribbleForms API",
  version: "1.0.0",
  baseUrl: `${env.BASE_URL}/api`,
  tags: [
    "Authentication", "Forms", "Fields", "Responses",
    "Analytics", "Themes", "Webhooks", "API Keys", "Health",
  ],
});

// ── Static / health ────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "ScribbleForms API", version: "1.0.0" }));
app.get("/health", (_req, res) => res.json({ status: "healthy", ts: new Date().toISOString() }));

// ── Scalar API docs ────────────────────────────────────────────────────────
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", apiReference({ url: "/openapi.json", theme: "default" } as any));

// ── OAuth routes (Express REST — not tRPC, because of redirects) ───────────
app.use(oauthRouter);

// ── File upload (Cloudinary signing) ──────────────────────────────────────
app.use(rateLimiters.upload, uploadRouter);

// ── Public form submission REST endpoint ──────────────────────────────────
// Separate from tRPC so we can apply per-slug rate limiting cleanly
app.post(
  "/f/:slug/submit",
  rateLimiters.formSubmit,
  handleFormSubmit
);

// ── tRPC — REST/OpenAPI adapter ────────────────────────────────────────────
app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router:        serverRouter,
    createContext,
    onError: ({ error, path }: { error: any; path: string | undefined }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC][${path}]`, error);
      }
    },
  } as any)
);

// ── tRPC — native adapter (for @trpc/client) ───────────────────────────────
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router:        serverRouter,
    createContext,
    onError: ({ error, path }: { error: any; path: string | undefined }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC][${path}]`, error);
      }
    },
  })
);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Route not found" }));

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[Express Error]", err);
  res.status(err.status ?? 500).json({
    code:    "INTERNAL_SERVER_ERROR",
    message: env.NODE_ENV === "production" ? "Something went wrong" : err.message,
  });
});

export default app;
