// apps/api/src/__tests__/submit.integration.test.ts
// Tests the HTTP routing layer of the submission endpoint.
// DB is mocked via setup.ts; we configure returns per-test.
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import request from "supertest";

// app imported lazily to ensure mocks are set up first
let app: any;
beforeAll(async () => { app = (await import("../server")).app; });

const V_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const F1   = "b47ac10b-58cc-4372-a567-0e02b2c3d479";
const F2   = "c47ac10b-58cc-4372-a567-0e02b2c3d479";

const BASE_FORM = {
  id:               "d47ac10b-58cc-4372-a567-0e02b2c3d479",
  userId:           "e47ac10b-58cc-4372-a567-0e02b2c3d479",
  status:           "published",
  expiresAt:        null,
  responseLimit:    null,
  totalResponses:   0,
  currentVersionId: V_ID,
  passwordHash:     null,
  successMessage:   "Thanks!",
  successRedirectUrl: null,
  deletedAt:        null,
};

const VERSION = {
  id:         V_ID,
  fieldsJson: [
    { id: F1, type: "short_text", label: "Name",  required: true,  order: 0 },
    { id: F2, type: "email",      label: "Email", required: false, order: 1 },
  ],
};

const BODY = {
  formVersionId: V_ID,
  answers:       { [F1]: "Alice", [F2]: "alice@example.com" },
  metadata:      { timeToCompleteMs: 45_000 },
};

// Unique slug per test so the per-slug rate limiter doesn't block
let n = 0;
const slug = () => `integration-test-slug-${++n}`;

// Wire the db mock to return specific data for each test
async function mockDb(formOverride?: Partial<typeof BASE_FORM> | null) {
  const mod = await import("@repo/database");
  const db  = (mod as any).default;

  // Build a complete tx mock
  const tx: any = {
    insert:   vi.fn().mockReturnThis(),
    values:   vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "resp-1" }]),
    update:   vi.fn().mockReturnThis(),
    set:      vi.fn().mockReturnThis(),
    where:    vi.fn().mockResolvedValue(undefined),
  };

  db.select.mockReturnThis();
  db.from.mockReturnThis();
  db.where.mockReturnThis();
  db.transaction.mockImplementation(async (fn: any) => fn(tx));

  if (formOverride === null) {
    db.limit.mockResolvedValue([]);
  } else {
    const form = { ...BASE_FORM, ...(formOverride ?? {}) };
    db.limit
      .mockResolvedValueOnce([form])
      .mockResolvedValueOnce([VERSION]);
  }
}

describe("POST /f/:slug/submit — envelope validation", () => {
  it("returns 422 on completely malformed body (no formVersionId)", async () => {
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send({ garbage: true });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_FAILED");
  });

  it("returns 422 on missing formVersionId", async () => {
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send({ answers: { [F1]: "Alice" } });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_FAILED");
  });

  it("returns 422 when formVersionId is not a valid UUID", async () => {
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send({ formVersionId: "not-a-uuid", answers: {} });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_FAILED");
  });
});

describe("POST /f/:slug/submit — form gate checks (db-driven)", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns 404 when no form matches the slug", async () => {
    await mockDb(null);
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("FORM_NOT_FOUND");
  });

  it("returns 403 when form status is draft", async () => {
    await mockDb({ status: "draft" });
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORM_NOT_PUBLISHED");
  });

  it("returns 410 when form has expired", async () => {
    await mockDb({ expiresAt: new Date(Date.now() - 1).toISOString() as any });
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(410);
    expect(res.body.code).toBe("FORM_EXPIRED");
  });

  it("returns 410 when response limit is reached", async () => {
    await mockDb({ responseLimit: 5, totalResponses: 5 } as any);
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(410);
    expect(res.body.code).toBe("FORM_RESPONSE_LIMIT");
  });

  it("returns 409 when formVersionId does not match currentVersionId", async () => {
    await mockDb({ currentVersionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479" });
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("FORM_VERSION_OUTDATED");
    expect(res.body.currentVersionId).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
  });

  it("returns 200 with success=true on a fully valid submission", async () => {
    await mockDb();
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send(BODY);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Thanks!");
    expect(res.body.responseId).toBeTruthy();
  });

  it("returns 422 when required field is absent from answers", async () => {
    await mockDb();
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send({
        formVersionId: V_ID,
        answers:       { [F2]: "alice@example.com" }, // F1 required, missing
      });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_FAILED");
  });

  it("returns 422 for filled honeypot (__hp != empty) — envelope rejects it", async () => {
    // The honeypot field __hp uses z.literal("") — any non-empty value fails parse
    const res = await request(app)
      .post(`/f/${slug()}/submit`)
      .send({ formVersionId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", answers: {}, __hp: "bot-value" });
    // Non-empty __hp fails z.literal("") validation — 422 is correct
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_FAILED");
  });
});
