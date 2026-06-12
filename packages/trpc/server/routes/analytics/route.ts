// packages/trpc/server/routes/analytics/route.ts
import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { AnalyticsService } from "./service";
import { FormService } from "../forms/service";
import { FormRepository } from "../forms/repository";
import { trackEventInputSchema, formStatsInputSchema, formStatsOutputSchema } from "./schema";
import { cacheGet, cacheSet } from "@repo/redis";
import { safeEnqueue, getAnalyticsQueue } from "@repo/queues";

const TAGS = ["Analytics"];

const analyticsService = new AnalyticsService();
const formService      = new FormService(new FormRepository());

export const analyticsRouter = router({
  track: publicProcedure
    .meta({ openapi: { method: "POST", path: "/analytics/track", tags: TAGS, summary: "Track a form analytics event" } })
    .input(trackEventInputSchema)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ input }) => {
      // Queue for async processing — do not await
      safeEnqueue(getAnalyticsQueue(), "track", { type: "track_event", event: input });
      return { ok: true };
    }),

  getFormStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/analytics/forms/{formId}", tags: TAGS, summary: "Get analytics for a form" } })
    .input(formStatsInputSchema)
    .output(formStatsOutputSchema)
    .query(async ({ input, ctx }) => {
      await formService.assertOwnership(input.formId, ctx.user!.id);

      const cacheKey = `sf:form:stats:${input.formId}:${input.startDate}:${input.endDate}`;
      const cached   = await cacheGet<z.infer<typeof formStatsOutputSchema>>(cacheKey);
      if (cached) return cached;

      const stats = await analyticsService.getFormStats(input);
      await cacheSet(cacheKey, stats, 300);
      return stats;
    }),

  getDashboardSummary: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/analytics/dashboard", tags: TAGS, summary: "Get dashboard analytics summary" } })
    .input(z.undefined())
    .output(z.any())
    .query(async ({ ctx }) => {
      const cacheKey = `sf:dashboard:${ctx.user!.id}`;
      const cached   = await cacheGet<unknown>(cacheKey);
      if (cached) return cached;

      const summary = await analyticsService.getDashboardSummary(ctx.user!.id);
      await cacheSet(cacheKey, summary, 120);
      return summary;
    }),
});
