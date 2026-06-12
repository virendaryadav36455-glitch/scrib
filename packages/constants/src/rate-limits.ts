// packages/constants/src/rate-limits.ts
export const RATE_LIMITS = {
  global:        { windowMs: 60_000,        max: 200 },
  auth:          { windowMs: 15 * 60_000,   max: 10 },
  formSubmit:    { windowMs: 60_000,        max: 5 },
  analytics:     { windowMs: 60_000,        max: 120 },
  passwordReset: { windowMs: 60 * 60_000,   max: 3 },
  upload:        { windowMs: 60_000,        max: 20 },
} as const;
