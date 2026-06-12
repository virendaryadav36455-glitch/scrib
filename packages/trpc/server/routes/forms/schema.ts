// FILE: packages/trpc/server/routes/forms/schema.ts
import { z } from "zod";

export const createFormInputSchema = z.object({
  title:       z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  visibility:  z.enum(["public", "unlisted"]).default("public"),
  themeId:     z.string().uuid().optional(),
});

export const updateFormInputSchema = z.object({
  title:              z.string().min(1).max(255).optional(),
  description:        z.string().max(2000).optional().nullable(),
  visibility:         z.enum(["public", "unlisted"]).optional(),
  themeId:            z.string().uuid().optional().nullable(),
  customSlug:         z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional().nullable(),
  successMessage:     z.string().max(500).optional().nullable(),
  successRedirectUrl: z.string().url().optional().or(z.literal("")).nullable(),
  responseLimit:      z.number().int().positive().optional().nullable(),
  expiresAt:          z.string().datetime().optional().nullable(),
  password:           z.string().min(4).max(100).optional().nullable(),
});

export const formOutputSchema = z.object({
  id:             z.string().uuid(),
  title:          z.string(),
  description:    z.string().nullable(),
  slug:           z.string(),
  customSlug:     z.string().nullable(),
  status:         z.enum(["draft", "published", "archived", "paused"]),
  visibility:     z.enum(["public", "unlisted"]),
  totalResponses: z.number(),
  totalViews:     z.number(),
  hasPassword:    z.boolean(),
  responseLimit:  z.number().nullable(),
  expiresAt:      z.string().datetime().nullable(),
  publishedAt:    z.string().datetime().nullable(),
  createdAt:      z.string().datetime(),
  updatedAt:      z.string().datetime(),
});

export const formListInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit:  z.number().int().min(1).max(50).default(20),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().max(100).optional(),
});

export const formListOutputSchema = z.object({
  forms:      z.array(formOutputSchema),
  nextCursor: z.string().nullable(),
  total:      z.number(),
});

export type CreateFormInput = z.infer<typeof createFormInputSchema>;
export type UpdateFormInput = z.infer<typeof updateFormInputSchema>;

export const themeOutputSchema = z.object({
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
}).nullable();

export const fieldInFormSchema = z.object({
  id:          z.string().uuid(),
  formId:      z.string().uuid(),
  type:        z.enum([
    "short_text", "long_text", "email", "number", "date", "phone",
    "single_select", "multi_select", "checkbox", "rating",
    "file_upload", "divider", "section_title"
  ]),
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

// FIX: added currentVersionId and version so the builder can show
// which published version is live without an extra API call.
export const formDetailOutputSchema = formOutputSchema.extend({
  fields:           z.array(fieldInFormSchema),
  theme:            themeOutputSchema,
  currentVersionId: z.string().uuid().nullable().optional(),
  version:          z.number().optional(),
});

// FIX: added wrongPassword so the frontend PasswordGate can show
// "Incorrect password" feedback vs "no password entered yet"
export const publicFormOutputSchema = formOutputSchema.extend({
  fields:           z.array(fieldInFormSchema),
  currentVersionId: z.string().uuid().nullable(),
  requiresPassword: z.boolean().optional(),
  wrongPassword:    z.boolean().optional(),
});