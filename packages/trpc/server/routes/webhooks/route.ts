// packages/trpc/server/routes/webhooks/route.ts
import { z } from "zod";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { planMiddleware } from "../../middleware/plan.middleware";
import { WebhookRepository } from "./repository";
import { randomBytes } from "node:crypto";
import { logAudit } from "../../utils/audit";

const TAGS = ["Webhooks"];

const webhookRepo = new WebhookRepository();

const webhookOutputSchema = z.object({
  id:        z.string().uuid(),
  formId:    z.string().uuid().nullable(),
  url:       z.string().url(),
  events:    z.array(z.string()),
  isActive:  z.boolean(),
  createdAt: z.string().datetime(),
});

export const webhooksRouter = router({
  list: protectedProcedure
    .use(planMiddleware("hasWebhooks"))
    .meta({ openapi: { method: "GET", path: "/webhooks", tags: TAGS, summary: "List webhooks" } })
    .input(z.undefined())
    .output(z.object({ webhooks: z.array(webhookOutputSchema) }))
    .query(async ({ ctx }) => {
      return webhookRepo.listForUser(ctx.user!.id);
    }),

  create: protectedProcedure
    .use(planMiddleware("hasWebhooks"))
    .meta({ openapi: { method: "POST", path: "/webhooks", tags: TAGS, summary: "Create a webhook" } })
    .input(z.object({
      formId: z.string().uuid().optional(),
      url:    z.string().url("Invalid webhook URL"),
      events: z.array(
        z.enum(["form.response.created", "form.published", "form.unpublished"])
      ).min(1, "Select at least one event"),
    }))
    .output(webhookOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const secret = randomBytes(32).toString("hex");
      const wh = await webhookRepo.create({ ...input, userId: ctx.user!.id, secret });
      await logAudit({ userId: ctx.user!.id, action: "webhook.create", entityType: "webhook", entityId: wh.id });
      return wh;
    }),

  delete: protectedProcedure
    .use(planMiddleware("hasWebhooks"))
    .meta({ openapi: { method: "DELETE", path: "/webhooks/{id}", tags: TAGS, summary: "Delete a webhook" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await webhookRepo.delete(input.id, ctx.user!.id);
      await logAudit({ userId: ctx.user!.id, action: "webhook.delete", entityType: "webhook", entityId: input.id });
      return { success: true };
    }),

  test: protectedProcedure
    .use(planMiddleware("hasWebhooks"))
    .meta({ openapi: { method: "POST", path: "/webhooks/{id}/test", tags: TAGS, summary: "Send a test webhook event" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean(), statusCode: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      return webhookRepo.test(input.id, ctx.user!.id);
    }),
});
