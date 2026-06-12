// packages/trpc/server/__tests__/webhook.repository.test.ts
import { describe, it, expect, vi } from "vitest";
import { WebhookRepository } from "../routes/webhooks/repository";

describe("WebhookRepository.create", () => {
  it("inserts webhook and returns output shape", async () => {
    const now = new Date();
    const db  = (await import("@repo/database")).default as any;
    db.insert.mockReturnThis();
    db.values.mockReturnThis();
    db.returning.mockResolvedValue([{
      id:        "wh-1",
      formId:    null,
      url:       "https://example.com/hook",
      events:    ["form.response.created"],
      isActive:  true,
      createdAt: now,
    }]);

    const repo   = new WebhookRepository();
    const result = await repo.create({
      userId: "u1",
      url:    "https://example.com/hook",
      events: ["form.response.created"],
      secret: "abc",
    });

    expect(result.id).toBe("wh-1");
    expect(result.events).toContain("form.response.created");
    expect(result.createdAt).toBe(now.toISOString());
  });
});

describe("WebhookRepository.delete", () => {
  it("calls db.delete with correct where clause", async () => {
    const db = (await import("@repo/database")).default as any;
    db.delete.mockReturnThis();
    db.where.mockResolvedValue(undefined);

    const repo = new WebhookRepository();
    await repo.delete("wh-1", "user-1");
    expect(db.delete).toHaveBeenCalledOnce();
  });
});
