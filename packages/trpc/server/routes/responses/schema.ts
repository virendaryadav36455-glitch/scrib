// packages/trpc/server/routes/responses/schema.ts
import { z } from "zod";

export const submissionEnvelopeSchema = z.object({
  formVersionId: z.string().uuid(),
  answers:       z.record(z.string(), z.unknown()),
  metadata: z.object({
    timeToCompleteMs: z.number().int().positive().optional(),
    referrer:         z.string().url().optional().or(z.literal("")),
    sessionId:        z.string().max(64).optional(),
  }).optional(),
  __hp: z.literal("").optional(), // honeypot
});

export const responseListInputSchema = z.object({
  formId:    z.string().uuid(),
  cursor:    z.string().optional(),
  limit:     z.number().int().min(1).max(100).default(25),
  startDate: z.string().datetime().optional(),
  endDate:   z.string().datetime().optional(),
  search:    z.string().max(100).optional(),
});

export const responseListOutputSchema = z.object({
  responses: z.array(z.object({
    id:               z.string().uuid(),
    formId:           z.string().uuid(),
    isComplete:       z.boolean(),
    timeToCompleteMs: z.number().nullable(),
    createdAt:        z.string().datetime(),
    emailAnswer:      z.string().nullable(),
    nameAnswer:       z.string().nullable(),
  })),
  nextCursor: z.string().nullable(),
  total:      z.number(),
});

export type SubmissionEnvelope = z.infer<typeof submissionEnvelopeSchema>;
