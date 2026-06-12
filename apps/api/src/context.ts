// apps/api/src/context.ts
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  createCookieFactory,
  getCookieFactory,
  clearCookieFactory,
} from "./lib/cookie";
import type { TRPCContext } from "@repo/trpc/server";

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  return {
    createCookie: createCookieFactory(res),
    getCookie:    getCookieFactory(req),
    clearCookie:  clearCookieFactory(res),
    user:         null,
    req,
  };
}
