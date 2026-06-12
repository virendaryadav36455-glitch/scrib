// packages/trpc/server/middleware/auth.middleware.ts
import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "../trpc";
import { AUTH_COOKIE_NAME } from "../routes/auth/constants";
import { cacheGet, cacheSet } from "@repo/redis";
import db from "@repo/database";
import { sessionsTable, usersTable } from "@repo/database";
import { eq, and, gt } from "drizzle-orm";
import type { SessionUser } from "../context";

const isAuthenticated = middleware(async ({ ctx, next }) => {
  const token = ctx.getCookie(AUTH_COOKIE_NAME);

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No authentication token found",
    });
  }

  // Redis cache first
  const cacheKey = `sf:session:${token}`;
  const cached = await cacheGet<SessionUser>(cacheKey);

  if (cached) {
    return next({ ctx: { ...ctx, user: cached } });
  }

  // DB lookup
  const [session] = await db
    .select({
      user: {
        id:       usersTable.id,
        email:    usersTable.email,
        fullName: usersTable.fullName,
        plan:     usersTable.plan,
        avatarUrl: usersTable.avatarUrl,
      },
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(
      and(
        eq(sessionsTable.token, token),
        gt(sessionsTable.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session expired or invalid. Please log in again.",
    });
  }

  // Cache for 15 min sliding window
  await cacheSet(cacheKey, session.user, 900);

  return next({ ctx: { ...ctx, user: session.user } });
});

export const protectedProcedure = publicProcedure.use(isAuthenticated);
