// packages/trpc/server/__tests__/api-keys.repository.test.ts
import { describe, it, expect, vi } from "vitest";
import { ApiKeyRepository } from "../routes/api-keys/repository";

describe("ApiKeyRepository.create", () => {
  it("returns a fullKey that starts with sf_", async () => {
    const now = new Date();
    const db  = (await import("@repo/database")).default as any;

    // Capture what was inserted so we can verify the hash/prefix
    let inserted: any;
    db.insert.mockReturnThis();
    db.values.mockImplementation((vals: any) => {
      inserted = vals;
      return db;
    });
    db.returning.mockResolvedValue([{
      id:        "key-1",
      name:      "My Key",
      keyPrefix: "sf_abc123456789",
    }]);

    const repo   = new ApiKeyRepository();
    const result = await repo.create("user-1", "My Key");

    expect(result.fullKey).toMatch(/^sf_/);
    expect(result.fullKey.length).toBeGreaterThan(30);
    expect(result.id).toBe("key-1");
  });

  it("never stores the plain key (stores SHA-256 hash instead)", async () => {
    const db = (await import("@repo/database")).default as any;
    let storedHash = "";
    let storedPrefix = "";

    db.insert.mockReturnThis();
    db.values.mockImplementation((vals: any) => {
      storedHash   = vals.keyHash;
      storedPrefix = vals.keyPrefix;
      return db;
    });
    db.returning.mockResolvedValue([{ id: "k2", name: "k", keyPrefix: storedPrefix }]);

    const repo   = new ApiKeyRepository();
    const result = await repo.create("user-1", "k");

    // The stored hash must NOT equal the raw key
    expect(storedHash).not.toBe(result.fullKey);
    // The prefix must be a substring of the raw key
    expect(result.fullKey).toContain(storedPrefix);
  });
});

describe("ApiKeyRepository.revoke", () => {
  it("sets revokedAt on the key", async () => {
    const db = (await import("@repo/database")).default as any;
    db.update.mockReturnThis();
    db.set.mockReturnThis();
    db.where.mockResolvedValue(undefined);

    const repo = new ApiKeyRepository();
    await repo.revoke("key-1", "user-1");

    expect(db.update).toHaveBeenCalledOnce();
    const setArg = db.set.mock.calls[0]![0];
    expect(setArg).toHaveProperty("revokedAt");
    expect(setArg.revokedAt).toBeInstanceOf(Date);
  });
});
