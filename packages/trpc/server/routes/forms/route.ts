// packages/trpc/server/routes/forms/route.ts
import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { FormService } from "./service";
import { FormRepository } from "./repository";
import {
  createFormInputSchema, updateFormInputSchema,
  formOutputSchema, formListInputSchema, formListOutputSchema,
  formDetailOutputSchema, publicFormOutputSchema,
} from "./schema";
import { domainError } from "../../errors";
import { PLAN_LIMITS } from "@repo/constants";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "@repo/redis";
import { safeEnqueue, getWebhookQueue } from "@repo/queues";
import { logAudit } from "../../utils/audit";

const TAGS = ["Forms"];

const formService = new FormService(new FormRepository());

export const formsRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms", tags: TAGS, summary: "List user forms" } })
    .input(formListInputSchema)
    .output(formListOutputSchema)
    .query(async ({ input, ctx }) => {
      return formService.listForUser(ctx.user!.id, input);
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{id}", tags: TAGS, summary: "Get form by ID" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formDetailOutputSchema)
    .query(async ({ input, ctx }) => {
      console.log("ninput id" ,input.id, "ctx user id",ctx.user!.id)
      const form = await formService.getByIdForUser(input.id, ctx.user!.id);
      console.log(form)
      if (!form) throw domainError("FORM_NOT_FOUND", "Form not found", "NOT_FOUND");
      return form;
    }),

  getPublic: publicProcedure
    .meta({ openapi: { method: "GET", path: "/forms/public/{slug}", tags: TAGS, summary: "Get public form by slug" } })
    .input(z.object({ slug: z.string().max(100), password: z.string().optional() }))
    .output(z.any()) // shape: publicFormOutputSchema | { requiresPassword: true }
    .query(async ({ input }) => {
      const cacheKey = `sf:form:public:${input.slug}`;

      if (!input.password) {
        const cached = await cacheGet<unknown>(cacheKey);
        if (cached) return cached;
      }

      const form = await formService.getPublicBySlug(input.slug, input.password);
      if (!form) throw domainError("FORM_NOT_FOUND", "This form is not available", "NOT_FOUND");

      if (!input.password && !(form as any).requiresPassword) {
        await cacheSet(cacheKey, form, 60);
      }
      return form;
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms", tags: TAGS, summary: "Create a new form" } })
    .input(createFormInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const count  = await formService.countForUser(ctx.user!.id);
      const limits = PLAN_LIMITS[ctx.user!.plan];
      if (limits.maxForms !== -1 && count >= limits.maxForms) {
        throw domainError(
          "PLAN_LIMIT_FORMS",
          `Your plan allows up to ${limits.maxForms} forms. Upgrade to create more.`,
          "FORBIDDEN"
        );
      }
      const form = await formService.create(ctx.user!.id, input);
      await logAudit({ userId: ctx.user!.id, action: "form.create", entityType: "form", entityId: form.id });
      return form;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/forms/{id}", tags: TAGS, summary: "Update a form" } })
    .input(z.object({ id: z.string().uuid(), data: updateFormInputSchema }))
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await formService.assertOwnership(input.id, ctx.user!.id);
      await cacheDel(`sf:form:public:${existing.slug}`);
      if (existing.customSlug) await cacheDel(`sf:form:public:${existing.customSlug}`);
      const form = await formService.update(input.id, input.data);
      await logAudit({ userId: ctx.user!.id, action: "form.update", entityType: "form", entityId: input.id });
      return form;
    }),

  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{id}/publish", tags: TAGS, summary: "Publish a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ versionId: z.string().uuid(), version: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await formService.assertOwnership(input.id, ctx.user!.id);
      const result = await formService.publish(input.id, ctx.user!.id);
      await logAudit({ userId: ctx.user!.id, action: "form.publish", entityType: "form", entityId: input.id });
      safeEnqueue(getWebhookQueue(), "dispatch", { formId: input.id, event: "form.published", payload: { formId: input.id } });
      await cacheDelPattern("sf:explore:*");  // add to explore cache on publish
      return result;
    }),

  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{id}/unpublish", tags: TAGS, summary: "Unpublish a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.id, ctx.user!.id);
      await formService.unpublish(input.id);
      await cacheDel(`sf:form:public:${form.slug}`);
      if (form.customSlug) await cacheDel(`sf:form:public:${form.customSlug}`);
      await cacheDelPattern("sf:explore:*");  // remove from explore cache
      await logAudit({ userId: ctx.user!.id, action: "form.unpublish", entityType: "form", entityId: input.id });
      return { success: true };
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/forms/{id}", tags: TAGS, summary: "Delete a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.id, ctx.user!.id);
      await formService.softDelete(input.id);
      await cacheDel(`sf:form:public:${form.slug}`);
      if (form.customSlug) await cacheDel(`sf:form:public:${form.customSlug}`);
      await cacheDelPattern("sf:explore:*");  // remove from explore cache
      await logAudit({ userId: ctx.user!.id, action: "form.delete", entityType: "form", entityId: input.id });
      return { success: true };
    }),

  duplicate: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{id}/duplicate", tags: TAGS, summary: "Duplicate a form" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      await formService.assertOwnership(input.id, ctx.user!.id);
      return formService.duplicate(input.id, ctx.user!.id);
    }),

  explore: publicProcedure
    .meta({ openapi: { method: "GET", path: "/forms/explore", tags: TAGS, summary: "Browse public forms" } })
    .input(z.object({
      cursor:   z.string().optional(),
      limit:    z.number().int().min(1).max(24).default(12),
      category: z.string().optional(),
    }))
    .output(z.object({ forms: z.array(z.any()), nextCursor: z.string().nullable() }))
    .query(async ({ input }) => {
      const cacheKey = `sf:explore:${JSON.stringify(input)}`;
      const cached   = await cacheGet<unknown>(cacheKey);
      if (cached) return cached as any;

      const result = await formService.getPublicExplore(input);
      await cacheSet(cacheKey, result, 120);
      return result;
    }),
});
