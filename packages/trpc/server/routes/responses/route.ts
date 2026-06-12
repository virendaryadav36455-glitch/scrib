// packages/trpc/server/routes/responses/route.ts
import { z } from "zod";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { ResponseRepository } from "./repository";
import { FormService } from "../forms/service";
import { FormRepository } from "../forms/repository";
import { responseListInputSchema, responseListOutputSchema } from "./schema";
import { domainError } from "../../errors";
import { safeEnqueue, getExportQueue } from "@repo/queues";
import { logAudit } from "../../utils/audit";

const TAGS = ["Responses"];

const responseRepo = new ResponseRepository();
const formService  = new FormService(new FormRepository());

export const responsesRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/responses", tags: TAGS, summary: "List form responses" } })
    .input(responseListInputSchema)
    .output(responseListOutputSchema)
    .query(async ({ input, ctx }) => {
      await formService.assertOwnership(input.formId, ctx.user!.id);
      return responseRepo.listForForm(input);
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/responses/{responseId}", tags: TAGS, summary: "Get a single response with answers" } })
    .input(z.object({ responseId: z.string().uuid() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      const response = await responseRepo.getWithAnswers(input.responseId, ctx.user!.id);
      if (!response) throw domainError("NOT_FOUND", "Response not found", "NOT_FOUND");
      return response;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/responses/{responseId}", tags: TAGS, summary: "Delete a response" } })
    .input(z.object({ responseId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await responseRepo.delete(input.responseId, ctx.user!.id);
      await logAudit({ userId: ctx.user!.id, action: "response.delete", entityType: "response", entityId: input.responseId });
      return { success: true };
    }),

  exportResponses: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/responses/export", tags: TAGS, summary: "Export responses as CSV or JSON" } })
    .input(z.object({
      formId: z.string().uuid(),
      format: z.enum(["csv", "json"]).default("csv"),
    }))
    .output(z.object({ exportJobId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await formService.assertOwnership(input.formId, ctx.user!.id);
      const jobId = await responseRepo.createExportJob(input.formId, ctx.user!.id, input.format);
      safeEnqueue(getExportQueue(), "export", {
        exportJobId: jobId,
        formId:      input.formId,
        format:      input.format,
        userId:      ctx.user!.id,
        userEmail:   ctx.user!.email,
      });
      return { exportJobId: jobId };
    }),

  getExportStatus: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/export/{exportJobId}/status", tags: TAGS, summary: "Get export job status" } })
    .input(z.object({ exportJobId: z.string().uuid() }))
    .output(z.object({
      status:  z.enum(["pending", "processing", "done", "failed"]),
      fileUrl: z.string().nullable(),
    }))
    .query(async ({ input }) => {
      const exportJobId = responseRepo.getExportStatus(input.exportJobId);
      return exportJobId
    }),
});
