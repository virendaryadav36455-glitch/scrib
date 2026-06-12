// packages/trpc/server/routes/fields/route.ts
import { z } from "zod";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { FieldRepository } from "./repository";
import { FormService } from "../forms/service";
import { FormRepository } from "../forms/repository";
import { createFieldInputSchema, fieldOutputSchema, reorderFieldsInputSchema } from "./schema";
import { cacheDel } from "@repo/redis";
import { logAudit } from "../../utils/audit";
import {PLAN_LIMITS} from "@repo/constants";
import db from "@repo/database";
import { fieldsTable } from "@repo/database";
import { eq, count } from "drizzle-orm";
import { domainError } from "../../errors";

const TAGS = ["Fields"];

const fieldRepo  = new FieldRepository();
const formService = new FormService(new FormRepository());

export const fieldsRouter = router({
  addField: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/fields", tags: TAGS, summary: "Add a field to a form" } })
    .input(z.object({ formId: z.string().uuid(), field: createFieldInputSchema }))
    .output(fieldOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.formId, ctx.user!.id);

      // Enforce plan field limit
      const limits = PLAN_LIMITS[ctx.user!.plan];
      if (limits.maxFieldsPerForm !== -1) {
        const countResult = await db
          .select({ fieldCount: count() })
          .from(fieldsTable)
          .where(eq(fieldsTable.formId, input.formId));
        const currentCount = Number(countResult[0]?.fieldCount ?? 0);
        if (currentCount >= limits.maxFieldsPerForm) {
          throw domainError(
            "PLAN_FEATURE_LOCKED",
            `Your plan allows up to ${limits.maxFieldsPerForm} fields per form. Upgrade to add more.`,
            "FORBIDDEN"
          );
        }
      }

      const field = await fieldRepo.addField(input.formId, input.field);
      // Invalidate public cache when form is published
      if (form.status === "published") await cacheDel(`sf:form:public:${form.slug}`);
      await logAudit({ userId: ctx.user!.id, action: "field.create", entityType: "field", entityId: field.id });
      return field;
    }),

  updateField: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/forms/{formId}/fields/{fieldId}", tags: TAGS, summary: "Update a field" } })
    .input(z.object({
      formId:  z.string().uuid(),
      fieldId: z.string().uuid(),
      data:    createFieldInputSchema.partial(),
    }))
    .output(fieldOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.formId, ctx.user!.id);
      const field = await fieldRepo.updateField(input.fieldId, input.data);
      if (form.status === "published") await cacheDel(`sf:form:public:${form.slug}`);
      await logAudit({ userId: ctx.user!.id, action: "field.update", entityType: "field", entityId: input.fieldId });
      return field;
    }),

  deleteField: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/forms/{formId}/fields/{fieldId}", tags: TAGS, summary: "Delete a field" } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.formId, ctx.user!.id);
      await fieldRepo.deleteField(input.fieldId);
      if (form.status === "published") await cacheDel(`sf:form:public:${form.slug}`);
      await logAudit({ userId: ctx.user!.id, action: "field.delete", entityType: "field", entityId: input.fieldId });
      return { success: true };
    }),

  reorder: protectedProcedure
    .meta({ openapi: { method: "PUT", path: "/forms/{formId}/fields/reorder", tags: TAGS, summary: "Reorder form fields" } })
    .input(reorderFieldsInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formService.assertOwnership(input.formId, ctx.user!.id);
      await fieldRepo.reorderFields(input.fields);
      if (form.status === "published") await cacheDel(`sf:form:public:${form.slug}`);
      return { success: true };
    }),

  duplicate: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/fields/{fieldId}/duplicate", tags: TAGS, summary: "Duplicate a field" } })
    .input(z.object({ formId: z.string().uuid(), fieldId: z.string().uuid() }))
    .output(fieldOutputSchema)
    .mutation(async ({ input, ctx }) => {
      await formService.assertOwnership(input.formId, ctx.user!.id);
      return fieldRepo.duplicateField(input.fieldId);
    }),
});
