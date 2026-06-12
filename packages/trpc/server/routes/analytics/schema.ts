// packages/trpc/server/routes/analytics/schema.ts
import { z } from "zod";

export const trackEventInputSchema = z.object({
  formId:    z.string().uuid(),
  eventType: z.enum(["form_view", "form_start", "field_focus", "field_blur", "field_skip", "form_submit", "form_abandon"]),
  fieldId:   z.string().uuid().optional(),
  sessionId: z.string().max(64).optional(),
  metadata:  z.record(z.string(), z.unknown()).optional(),
});

export const formStatsInputSchema = z.object({
  formId:      z.string().uuid(),
  startDate:   z.string().datetime(),
  endDate:     z.string().datetime(),
  granularity: z.enum(["day", "week", "month"]).default("day"),
});

export const formStatsOutputSchema = z.object({
  totalResponses:       z.number(),
  completionRate:       z.number(),
  avgTimeToCompleteMs:  z.number(),
  totalViews:           z.number(),
  dropOffRate:          z.number(),
  responsesOverTime:    z.array(z.object({ date: z.string(), count: z.number() })),
  deviceBreakdown:      z.object({ mobile: z.number(), desktop: z.number(), tablet: z.number(), other: z.number() }),
  topSources:           z.array(z.object({ source: z.string(), count: z.number(), percentage: z.number() })),
  responsesByDayOfWeek: z.array(z.object({ day: z.string(), count: z.number() })),
  completionFunnel:     z.array(z.object({ stage: z.string(), count: z.number() })),
  fieldDropOff: z.array(z.object({
    fieldId:     z.string(),
    fieldLabel:  z.string(),
    fieldOrder:  z.number(),
    dropOffRate: z.number(),
    avgTimeMs:   z.number(),
  })),
  previousPeriod: z.object({
    totalResponses:      z.number(),
    completionRate:      z.number(),
    totalViews:          z.number(),
    avgTimeToCompleteMs: z.number(),
  }),
});
