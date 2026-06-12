// packages/trpc/server/routes/health/route.ts
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const healthRouter = router({
  check: publicProcedure
    .meta({ openapi: { method: "GET", path: "/health", tags: ["Health"], summary: "Health check" } })
    .input(z.undefined())
    .output(z.object({
      status:  z.literal("healthy"),
      version: z.string(),
      ts:      z.string(),
    }))
    .query(() => ({
      status:  "healthy" as const,
      version: "1.0.0",
      ts:      new Date().toISOString(),
    })),
});
