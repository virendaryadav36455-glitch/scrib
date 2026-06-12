// apps/api/src/__tests__/rate-limit.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server";

// NOTE: Rate limiters use in-memory stores by default in tests.
// We only test that the limiter middleware EXISTS and returns the right
// structure on a valid request — not that it actually blocks (that would
// require 200+ sequential requests which is slow and non-deterministic).

describe("Rate limit headers", () => {
  it("includes RateLimit headers on /health", async () => {
    const res = await request(app).get("/health");
    // express-rate-limit with standardHeaders:true adds these
    expect(res.headers).toHaveProperty("ratelimit-limit");
  });
});

describe("Auth endpoint basic behaviour", () => {
  it("POST /api/auth/signup returns 400-level on empty body (not 500)", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({});
    // Should be 400/422 (validation) not 500 (crash)
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("POST /api/auth/login returns 400-level on empty body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
