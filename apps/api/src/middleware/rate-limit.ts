// apps/api/src/middleware/rate-limit.ts
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

// Extracts IP safely for IPv4 and IPv6, then appends the form slug
function slugKeyGen(req: Request): string {
  // req.ip is already the correct string — pass it through ipKeyGenerator
  const ip   = ipKeyGenerator(req.ip ?? "0.0.0.0");
  const slug = (req.params as Record<string, string>)["slug"] ?? "unknown";
  return `${ip}:${slug}`;
}

export const rateLimiters = {
  global: rateLimit({
    windowMs:        60_000,
    max:             200,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { code: "RATE_LIMITED", message: "Too many requests, please slow down." },
  }),

  auth: rateLimit({
    windowMs:               15 * 60_000,
    max:                    10,
    skipSuccessfulRequests: true,
    standardHeaders:        true,
    legacyHeaders:          false,
    message: { code: "RATE_LIMITED", message: "Too many auth attempts. Try again in 15 minutes." },
  }),

  formSubmit: rateLimit({
    windowMs:     60_000,
    max:          5,
    keyGenerator: slugKeyGen,
    message: { code: "RATE_LIMITED", message: "Too many submissions. Please wait before submitting again." },
  }),

  analytics: rateLimit({
    windowMs: 60_000,
    max:      120,
    message: { code: "RATE_LIMITED", message: "Too many analytics events." },
  }),

  passwordReset: rateLimit({
    windowMs: 60 * 60_000,
    max:      3,
    message: { code: "RATE_LIMITED", message: "Too many password reset requests." },
  }),

  upload: rateLimit({
    windowMs: 60_000,
    max:      20,
    message: { code: "RATE_LIMITED", message: "Too many upload requests." },
  }),
};
