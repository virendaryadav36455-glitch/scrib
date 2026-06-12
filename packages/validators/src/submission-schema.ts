// FILE: packages/validators/src/submission-schema.ts
// Zod schemas shared between frontend form renderer and backend submission handler.
// Frontend uses these to validate before sending; backend uses the same schemas to validate on receipt.
import { z } from "zod";

export const submissionEnvelopeSchema = z.object({
  formVersionId: z.string().uuid("formVersionId must be a valid UUID"),
  answers:       z.record(z.string(), z.unknown()),
  metadata: z.object({
    timeToCompleteMs: z.number().int().positive().optional(),
    referrer:         z.string().url().optional().or(z.literal("")),
    sessionId:        z.string().max(64).optional(),
  }).optional(),
  __hp: z.literal("").optional(), // honeypot — must be empty
});

export type SubmissionEnvelope = z.infer<typeof submissionEnvelopeSchema>;

/**
 * Builds a Zod validation schema for a set of active form fields.
 * Call applyConditions() first to get only the visible fields.
 */
export function buildFieldSchema(fields: Array<{
  id:       string;
  type:     string;
  required: boolean;
  config?:  Record<string, unknown> | null;
}>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "divider" || field.type === "section_title") continue;

    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        schema = z.string().email("Please enter a valid email address");
        break;

      case "number": {
        let n = z.number();
        if (field.config?.min !== undefined) n = n.min(Number(field.config.min));
        if (field.config?.max !== undefined) n = n.max(Number(field.config.max));
        schema = n;
        break;
      }

      case "rating": {
        const maxRating = Number(field.config?.max ?? 5);
        schema = z.number().int().min(1).max(maxRating);
        break;
      }

      case "checkbox":
        schema = z.boolean();
        break;

      // FIX: was z.array(z.string()) — now validates against the actual allowed options
      // so a tampered submission with invalid values is rejected by the same logic as
      // single_select. Falls back to z.array(z.string()) when no options are configured.
      case "multi_select": {
        const opts = Array.isArray(field.config?.options)
          ? (field.config!.options as any[]).map((o) =>
              String(typeof o === "object" ? (o.value ?? o.label ?? o) : o)
            )
          : [];
        schema = opts.length > 0
          ? z.array(z.enum(opts as [string, ...string[]]))
          : z.array(z.string());
        break;
      }

      case "date":
        schema = z.string().min(1, "Please select a date");
        break;

      // FIX: was mapping options as `o.value ?? o` which fails for plain string arrays
      // (our builder stores options as plain strings, not { value, label } objects).
      // Now handles both formats: plain strings AND { value } / { label } objects.
      case "single_select": {
        const opts = Array.isArray(field.config?.options)
          ? (field.config!.options as any[]).map((o) =>
              String(typeof o === "object" ? (o.value ?? o.label ?? o) : o)
            )
          : [];
        schema = opts.length > 0 ? z.enum(opts as [string, ...string[]]) : z.string();
        break;
      }

      default: {
        let s = z.string();
        if (field.config?.minLength) s = s.min(Number(field.config.minLength));
        if (field.config?.maxLength) s = s.max(Number(field.config.maxLength));
        schema = s;
      }
    }

    shape[field.id] = field.required ? schema : schema.optional().nullable();
  }

  return z.object(shape).passthrough();
}