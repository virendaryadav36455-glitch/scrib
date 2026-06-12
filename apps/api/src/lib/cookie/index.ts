// apps/api/src/lib/cookie/index.ts
import { Request, Response, CookieOptions } from "express";

const DEFAULT_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",

  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  path: "/",

  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    options: CookieOptions = DEFAULT_OPTIONS
  ) {
    res.cookie(name, value, options);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string): string | undefined {
    return (req.cookies as Record<string, string | undefined>)?.[name];
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string) {
    res.clearCookie(name, { path: "/" });
  };
}
