// packages/trpc/server/routes/auth/schema.ts
import { z } from "zod";

export const signupInputSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(255),
  email:    z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const signupOutputSchema = z.object({
  id:       z.string().uuid(),
  email:    z.string().email(),
  fullName: z.string().nullable(),
  plan:     z.enum(["free", "creator", "studio"]),
});

export const loginInputSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const loginOutputSchema = z.object({
  id:        z.string().uuid(),
  email:     z.string().email(),
  fullName:  z.string().nullable(),
  plan:      z.enum(["free", "creator", "studio"]),
  avatarUrl: z.string().nullable(),
});

export const meOutputSchema = z.object({
  id:            z.string().uuid(),
  email:         z.string().email(),
  fullName:      z.string().nullable(),
  plan:          z.enum(["free", "creator", "studio"]),
  avatarUrl:     z.string().nullable(),
  emailVerified: z.boolean(),
});

export const forgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordInputSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const updateProfileInputSchema = z.object({
  fullName:  z.string().min(1).max(255).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
export type LoginInput  = z.infer<typeof loginInputSchema>;
