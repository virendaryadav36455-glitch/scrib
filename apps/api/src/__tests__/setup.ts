// apps/api/src/__tests__/setup.ts
// Set required env vars BEFORE any module imports run
process.env["DATABASE_URL"]   = "postgresql://test:test@localhost:5432/test";
process.env["REDIS_URL"]      = "redis://localhost:6379";
process.env["IP_HASH_SECRET"] = "test_secret_that_is_32_chars_long!!";
// NODE_ENV is read-only in some TS configs — set via vitest config instead

import { vi, beforeEach, afterAll } from "vitest";

// ── Mock database ──────────────────────────────────────────────────────────
vi.mock("@repo/database", () => {
  const mockDb: any = {
    select:   vi.fn().mockReturnThis(),
    from:     vi.fn().mockReturnThis(),
    where:    vi.fn().mockReturnThis(),
    limit:    vi.fn().mockResolvedValue([]),
    insert:   vi.fn().mockReturnThis(),
    values:   vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update:   vi.fn().mockReturnThis(),
    set:      vi.fn().mockReturnThis(),
    delete:   vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy:  vi.fn().mockReturnThis(),
    offset:   vi.fn().mockReturnThis(),
    transaction: vi.fn(async (fn: any) => fn(mockDb)),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    onConflictDoUpdate:  vi.fn().mockReturnThis(),
    $count: vi.fn().mockReturnThis(),
    query:  {
      usersTable: { findFirst: vi.fn().mockResolvedValue(null) },
    },
  };
  return {
    default:  mockDb,
    db:       mockDb,
    eq:       vi.fn((a: any, b: any) => `eq(${a},${b})`),
    and:      vi.fn((...args: any[]) => `and(${args.join(",")})`),
    isNull:   vi.fn((a: any)         => `isNull(${a})`),
    gt:       vi.fn((a: any, b: any) => `gt(${a},${b})`),
    gte:      vi.fn((a: any, b: any) => `gte(${a},${b})`),
    lte:      vi.fn((a: any, b: any) => `lte(${a},${b})`),
    ilike:    vi.fn((a: any, b: any) => `ilike(${a},${b})`),
    desc:     vi.fn((a: any)         => `desc(${a})`),
    count:    vi.fn()                                   .mockReturnValue("COUNT(*)"),
    avg:      vi.fn()                                   .mockReturnValue("AVG()"),
    sql:      vi.fn()                                   .mockReturnValue("sql"),
    or:       vi.fn((...args: any[]) => `or(${args.join(",")})`),
  };
});

// ── Mock @repo/database/schema ─────────────────────────────────────────────
vi.mock("@repo/database/schema", () => ({
  usersTable:             { id: {}, email: {}, salt: {}, password: {}, deletedAt: {} },
  sessionsTable:          { id: {}, userId: {}, token: {}, expiresAt: {} },
  formsTable:             { id: {}, userId: {}, slug: {}, customSlug: {}, status: {}, deletedAt: {}, totalResponses: {}, totalViews: {} },
  formVersionsTable:      { id: {}, formId: {}, version: {}, fieldsJson: {} },
  fieldsTable:            { id: {}, formId: {}, order: {} },
  responsesTable:         { id: {}, formId: {}, formVersionId: {}, createdAt: {} },
  responseAnswersTable:   { id: {}, responseId: {}, fieldType: {}, fieldId: {} },
  analyticsDailyTable:    { id: {}, formId: {}, date: {}, views: {}, starts: {}, completions: {}, abandons: {} },
  analyticsEventsTable:   { id: {}, formId: {} },
  themesTable:            { id: {}, slug: {}, isActive: {}, isSystem: {}, userId: {}, name: {}, category: {} },
  webhooksTable:          { id: {}, userId: {}, isActive: {}, events: {}, formId: {} },
  webhookDeliveriesTable: { id: {} },
  apiKeysTable:           { id: {}, userId: {}, keyHash: {}, revokedAt: {} },
  auditLogsTable:         { id: {} },
  exportJobsTable:        { id: {}, status: {}, fileUrl: {} },
}));

// ── Mock @repo/redis ───────────────────────────────────────────────────────
vi.mock("@repo/redis", () => ({
  cacheGet:        vi.fn().mockResolvedValue(null),
  cacheSet:        vi.fn().mockResolvedValue(undefined),
  cacheDel:        vi.fn().mockResolvedValue(undefined),
  cacheDelPattern: vi.fn().mockResolvedValue(undefined),
  redis:           { get: vi.fn(), set: vi.fn(), del: vi.fn(), setex: vi.fn() },
  getRedis:        vi.fn(),
}));

// ── Mock @repo/queues ──────────────────────────────────────────────────────
vi.mock("@repo/queues", () => ({
  safeEnqueue:       vi.fn().mockResolvedValue(undefined),
  getEmailQueue:     vi.fn().mockReturnValue({ add: vi.fn() }),
  getWebhookQueue:   vi.fn().mockReturnValue({ add: vi.fn() }),
  getAnalyticsQueue: vi.fn().mockReturnValue({ add: vi.fn() }),
  getExportQueue:    vi.fn().mockReturnValue({ add: vi.fn() }),
}));

// ── Mock @repo/constants ───────────────────────────────────────────────────
vi.mock("@repo/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/constants")>();
  return {
    ...actual,
    PLAN_LIMITS: {
      free:    { ...actual.PLAN_LIMITS.free    },
      creator: { ...actual.PLAN_LIMITS.creator },
      studio:  { ...actual.PLAN_LIMITS.studio  },
    },
  };
});

beforeEach(() => vi.clearAllMocks());
afterAll(()  => vi.restoreAllMocks());
