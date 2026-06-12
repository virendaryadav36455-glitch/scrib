// packages/trpc/server/__tests__/setup.ts
import { vi, beforeEach, afterAll } from "vitest";

// ── Mock @repo/database ────────────────────────────────────────────────────
vi.mock("@repo/database", () => {
  const mockDb = {
    select:  vi.fn().mockReturnThis(),
    from:    vi.fn().mockReturnThis(),
    where:   vi.fn().mockReturnThis(),
    limit:   vi.fn().mockResolvedValue([]),
    insert:  vi.fn().mockReturnThis(),
    values:  vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update:  vi.fn().mockReturnThis(),
    set:     vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset:  vi.fn().mockReturnThis(),
    transaction: vi.fn(async (fn: any) => fn(mockDb)),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    onConflictDoUpdate:  vi.fn().mockReturnThis(),
    query: {
      usersTable: { findFirst: vi.fn().mockResolvedValue(null) },
    },
  };
  return { default: mockDb, db: mockDb };
});

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
  safeEnqueue:      vi.fn().mockResolvedValue(undefined),
  getEmailQueue:    vi.fn().mockReturnValue({ add: vi.fn() }),
  getWebhookQueue:  vi.fn().mockReturnValue({ add: vi.fn() }),
  getAnalyticsQueue: vi.fn().mockReturnValue({ add: vi.fn() }),
  getExportQueue:   vi.fn().mockReturnValue({ add: vi.fn() }),
}));

// ── Mock @repo/database/schema ─────────────────────────────────────────────
vi.mock("@repo/database/schema", () => ({
  usersTable:             { id: "id", email: "email" },
  sessionsTable:          { id: "id", token: "token" },
  formsTable:             { id: "id" },
  formVersionsTable:      { id: "id" },
  fieldsTable:            { id: "id" },
  responsesTable:         { id: "id" },
  responseAnswersTable:   { id: "id" },
  analyticsDailyTable:    { id: "id", formId: "form_id", date: "date" },
  analyticsEventsTable:   { id: "id" },
  themesTable:            { id: "id" },
  webhooksTable:          { id: "id" },
  webhookDeliveriesTable: { id: "id" },
  apiKeysTable:           { id: "id" },
  auditLogsTable:         { id: "id" },
  exportJobsTable:        { id: "id" },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
