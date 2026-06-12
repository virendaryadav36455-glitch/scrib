// apps/api/src/__tests__/health.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server";

describe("GET /health", () => {
  it("returns 200 with healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.ts).toBeTruthy();
  });
});

describe("GET /", () => {
  it("returns API version info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("ScribbleForms");
    expect(res.body.version).toBeTruthy();
  });
});

describe("GET /openapi.json", () => {
  it("returns a valid OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("openapi");
    expect(res.body).toHaveProperty("paths");
    expect(res.body).toHaveProperty("info");
    expect(res.body.info.title).toBe("ScribbleForms API");
  });
});

describe("GET /docs", () => {
  it("serves the Scalar UI page", async () => {
    const res = await request(app).get("/docs");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });
});

describe("Unknown route", () => {
  it("returns 404 for unmatched paths", async () => {
    const res = await request(app).get("/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
