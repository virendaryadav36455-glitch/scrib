// packages/trpc/server/routes/themes/route.ts
import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { ThemeRepository } from "./repository";
import { cacheGet, cacheSet, cacheDel } from "@repo/redis";
import { logAudit } from "../../utils/audit";
import { FormRepository } from "../forms/repository";

const TAGS = ["Themes"];

const themeRepo = new ThemeRepository();
const formRepo  = new FormRepository();

const themeOutputSchema = z.object({
  id:         z.string().uuid(),
  name:       z.string(),
  slug:       z.string(),
  isSystem:   z.boolean(),
  category:   z.string().nullable(),
  tokensJson: z.record(z.string(), z.string()),
  colors:     z.array(z.string()),
  isActive:   z.boolean(),
  usageCount: z.number(),
  createdAt:  z.string().datetime(),
});

export const themesRouter = router({
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: "/themes", tags: TAGS, summary: "List available themes" } })
    .input(z.object({
      category:      z.string().optional(),
      search:        z.string().optional(),
      includeSystem: z.boolean().default(true),
      includeUser:   z.boolean().default(true),
    }))
    .output(z.object({ themes: z.array(themeOutputSchema) }))
    .query(async ({ input }) => {
      const cacheKey = `sf:themes:${JSON.stringify(input)}`;
      const cached   = await cacheGet<{ themes: unknown[] }>(cacheKey);
      if (cached) return cached as any;

      const result = await themeRepo.list(input);
      await cacheSet(cacheKey, result, 600);
      return result;
    }),

  applyToForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/themes/{themeId}/apply", tags: TAGS, summary: "Apply theme to a form" } })
    .input(z.object({ formId: z.string().uuid(), themeId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await themeRepo.applyToForm(input.formId, input.themeId, ctx.user!.id);

      // Invalidate public form cache
      const form = await formRepo.findById(input.formId);
      if (form?.slug) await cacheDel(`sf:form:public:${form.slug}`);

      await logAudit({
        userId:     ctx.user!.id,
        action:     "theme.apply",
        entityType: "form",
        entityId:   input.formId,
      });
      return { success: true };
    }),
});
