// packages/trpc/server/context.ts
// We import Request type from express but do NOT import express itself —
// the API app wires the real factories.  This file only defines the shape.
import type { Request, Response, CookieOptions } from "express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type CreateCookieFn = (name: string, value: string, options?: CookieOptions) => void;
export type GetCookieFn    = (name: string) => string | undefined;
export type ClearCookieFn  = (name: string) => void;

export interface SessionUser {
  id:        string;
  email:     string;
  fullName:  string | null;
  plan:      "free" | "creator" | "studio";
  avatarUrl: string | null;
}

export interface TRPCContext {
  createCookie: CreateCookieFn;
  getCookie:    GetCookieFn;
  clearCookie:  ClearCookieFn;
  user:         SessionUser | null;
  req:          Request;
}

// Default no-op factory — replaced by apps/api/src/context.ts
export async function createContext(opts: CreateExpressContextOptions): Promise<TRPCContext> {
  return {
    createCookie: () => {},
    getCookie:    () => undefined,
    clearCookie:  () => {},
    user:         null,
    req:          opts.req as Request,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
