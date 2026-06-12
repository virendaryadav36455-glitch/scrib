// packages/trpc/server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import type { TRPCContext } from "./context";

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<TRPCContext>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      };
    },
  });

export const router        = t.router;
export const publicProcedure = t.procedure;
export const middleware    = t.middleware;
