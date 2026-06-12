// packages/trpc/server/middleware/plan.middleware.ts
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { PLAN_LIMITS, type PlanLimits } from "@repo/constants";

export function planMiddleware(feature: keyof PlanLimits) {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    const limits = PLAN_LIMITS[ctx.user.plan];
    const allowed = limits[feature];
    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This feature requires a higher plan. Please upgrade.`,
      });
    }
    return next({ ctx });
  });
}
