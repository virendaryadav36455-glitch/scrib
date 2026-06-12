// packages/trpc/server/routes/fields/schema.ts
import { z } from "zod";

export const fieldTypeEnum = z.enum([
  "short_text", "long_text", "email", "number", "date", "phone",
  "single_select", "multi_select", "checkbox", "rating",
  "file_upload", "divider", "section_title"
]);

export const conditionSchema = z.object({
  show:  z.boolean(),
  logic: z.enum(["and", "or"]),
  rules: z.array(z.object({
    fieldId:  z.string().uuid(),
    operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "is_empty", "is_not_empty"]),
    value:    z.union([z.string(), z.number(), z.boolean()]),
  })),
});

export const createFieldInputSchema = z.object({
  type:        fieldTypeEnum,
  label:       z.string().min(1, "Label is required").max(500),
  description: z.string().max(1000).optional(),
  placeholder: z.string().max(255).optional(),
  helpText:    z.string().max(500).optional(),
  required:    z.boolean().default(false),
  order:       z.number().int().min(0),
  config:      z.record(z.string(), z.unknown()).optional(),
  conditions:  conditionSchema.optional(),
});

export const fieldOutputSchema = z.object({
  id:          z.string().uuid(),
  formId:      z.string().uuid(),
  type:        fieldTypeEnum,
  label:       z.string(),
  description: z.string().nullable(),
  placeholder: z.string().nullable(),
  helpText:    z.string().nullable(),
  required:    z.boolean(),
  order:       z.number(),
  config:      z.record(z.string(), z.unknown()).nullable(),
  conditions:  z.any().nullable(),
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),
});

export const reorderFieldsInputSchema = z.object({
  formId: z.string().uuid(),
  fields: z.array(z.object({ id: z.string().uuid(), order: z.number().int().min(0) })),
});

export type CreateFieldInput = z.infer<typeof createFieldInputSchema>;
