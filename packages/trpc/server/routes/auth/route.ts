// packages/trpc/server/routes/auth/route.ts
import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { protectedProcedure } from "../../middleware/auth.middleware";
import { AuthService } from "./service";
import { AuthRepository } from "./repository";
import {
  signupInputSchema, signupOutputSchema,
  loginInputSchema,  loginOutputSchema,
  meOutputSchema,    forgotPasswordInputSchema,
  resetPasswordInputSchema, updateProfileInputSchema,
} from "./schema";
import { setAuthCookie, clearAuthCookie, getAuthToken } from "./utils";
import { safeEnqueue, getEmailQueue } from "@repo/queues";

const TAGS = ["Authentication"];

const authService = new AuthService(new AuthRepository());

export const authRouter = router({
  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/signup", tags: TAGS, summary: "Create creator account" } })
    .input(signupInputSchema)
    .output(signupOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = (ctx.req as any).ip ?? "";
      const ua = (ctx.req.headers["user-agent"]) ?? "";
      const { user, token } = await authService.signup(input, ip, ua);
      setAuthCookie(ctx, token);

      safeEnqueue(getEmailQueue(), "welcome", {
        type: "welcome",
        userId: user.id,
        email: user.email,
        name: user.fullName ?? "",
      });

      return { id: user.id, email: user.email, fullName: user.fullName ?? null, plan: user.plan };
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/login", tags: TAGS, summary: "Login to creator account" } })
    .input(loginInputSchema)
    .output(loginOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = (ctx.req as any).ip ?? "";
      const ua = ctx.req.headers["user-agent"] ?? "";
      const { user, token } = await authService.login(input, ip, ua);
      setAuthCookie(ctx, token);
      return user;
    }),

  logout: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/auth/logout", tags: TAGS, summary: "Logout current session" } })
    // .input(z.union([z.void(), z.object({}).strict()]).optional())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const token = getAuthToken(ctx);
      if (token) await authService.logout(token);
      clearAuthCookie(ctx);
      return { success: true };
    }),

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/auth/me", tags: TAGS, summary: "Get current user" } })
    .input(z.void())
    .output(meOutputSchema)
    .query(async ({ ctx }) => {
      return {
        id:            ctx.user!.id,
        email:         ctx.user!.email,
        fullName:      ctx.user!.fullName,
        plan:          ctx.user!.plan,
        avatarUrl:     ctx.user!.avatarUrl,
        emailVerified: true,
      };
    }),

  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/forgot-password", tags: TAGS, summary: "Request password reset" } })
    .input(forgotPasswordInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      return authService.forgotPassword(input.email, async ({ email, token }) => {
        await safeEnqueue(getEmailQueue(), "password_reset", {
          type: "password_reset",
          email,
          token,
        });
      });
    }),

  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/reset-password", tags: TAGS, summary: "Reset password with token" } })
    .input(resetPasswordInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      return authService.resetPassword(input.token, input.password);
    }),

  logoutAll: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/auth/logout-all", tags: TAGS, summary: "Logout from all devices" } })
    .input(z.void())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const repo = new AuthRepository();
      await repo.deleteAllUserSessions(ctx.user!.id);
      clearAuthCookie(ctx);
      return { success: true };
    }),

  updateProfile: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/auth/profile", tags: TAGS, summary: "Update user profile" } })
    .input(updateProfileInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const token = getAuthToken(ctx);
      return authService.updateProfile(ctx.user!.id, token, input);
    }),
});
