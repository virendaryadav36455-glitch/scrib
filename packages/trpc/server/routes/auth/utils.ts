import type { TRPCContext } from "../../context";
import { AUTH_COOKIE_NAME } from "./constants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   true,
  sameSite: "none" as const,  // ← changed from "lax" to "none"
  path:     "/",
  maxAge:   30 * 24 * 60 * 60 * 1000,
};

export function setAuthCookie(ctx: TRPCContext, token: string): void {
  ctx.createCookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearAuthCookie(ctx: TRPCContext): void {
  ctx.clearCookie(AUTH_COOKIE_NAME);
}

export function getAuthToken(ctx: TRPCContext): string | undefined {
  return ctx.getCookie(AUTH_COOKIE_NAME);
}