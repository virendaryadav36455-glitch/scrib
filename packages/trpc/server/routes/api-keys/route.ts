// packages/trpc/server/routes/api-keys/route.ts
import { z } from "zod";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { planMiddleware } from "../../middleware/plan.middleware";
import { ApiKeyRepository } from "./repository";
import { logAudit } from "../../utils/audit";

const TAGS = ["API Keys"];

const apiKeyRepo = new ApiKeyRepository();

export const apiKeysRouter = router({
  list: protectedProcedure
    .use(planMiddleware("hasApiKeys"))
    .meta({ openapi: { method: "GET", path: "/api-keys", tags: TAGS, summary: "List API keys" } })
    .input(z.undefined())
    .output(z.object({
      keys: z.array(z.object({
        id:         z.string().uuid(),
        name:       z.string(),
        keyPrefix:  z.string(),
        lastUsedAt: z.string().datetime().nullable(),
        expiresAt:  z.string().datetime().nullable(),
        createdAt:  z.string().datetime(),
        revokedAt:  z.string().datetime().nullable(),
      })),
    }))
    .query(async ({ ctx }) => {
      return apiKeyRepo.listForUser(ctx.user!.id);
    }),

  create: protectedProcedure
    .use(planMiddleware("hasApiKeys"))
    .meta({ openapi: { method: "POST", path: "/api-keys", tags: TAGS, summary: "Create an API key" } })
    .input(z.object({ name: z.string().min(1).max(100) }))
    .output(z.object({
      id:        z.string().uuid(),
      name:      z.string(),
      keyPrefix: z.string(),
      fullKey:   z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const key = await apiKeyRepo.create(ctx.user!.id, input.name);
      await logAudit({ userId: ctx.user!.id, action: "api_key.create", entityType: "api_key", entityId: key.id });
      return key;
    }),

  revoke: protectedProcedure
    .use(planMiddleware("hasApiKeys"))
    .meta({ openapi: { method: "DELETE", path: "/api-keys/{id}", tags: TAGS, summary: "Revoke an API key" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await apiKeyRepo.revoke(input.id, ctx.user!.id);
      await logAudit({ userId: ctx.user!.id, action: "api_key.revoke", entityType: "api_key", entityId: input.id });
      return { success: true };
    }),
});
