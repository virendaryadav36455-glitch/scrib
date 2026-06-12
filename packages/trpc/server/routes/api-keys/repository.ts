// packages/trpc/server/routes/api-keys/repository.ts
import db from "@repo/database";
import { eq, and, isNull } from "drizzle-orm";
import { apiKeysTable } from "@repo/database";
import { randomBytes, createHash } from "node:crypto";

export class ApiKeyRepository {
  async listForUser(userId: string) {
    const keys = await db
      .select({
        id:         apiKeysTable.id,
        name:       apiKeysTable.name,
        keyPrefix:  apiKeysTable.keyPrefix,
        lastUsedAt: apiKeysTable.lastUsedAt,
        expiresAt:  apiKeysTable.expiresAt,
        createdAt:  apiKeysTable.createdAt,
        revokedAt:  apiKeysTable.revokedAt,
      })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, userId));

    return {
      keys: keys.map((k) => ({
        id:         k.id,
        name:       k.name,
        keyPrefix:  k.keyPrefix,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        expiresAt:  k.expiresAt?.toISOString() ?? null,
        createdAt:  k.createdAt.toISOString(),
        revokedAt:  k.revokedAt?.toISOString() ?? null,
      })),
    };
  }

  async create(userId: string, name: string) {
    const rawKey   = `sf_${randomBytes(32).toString("hex")}`;
    const keyHash  = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 12);

    const [key] = await db
      .insert(apiKeysTable)
      .values({ userId, name, keyHash, keyPrefix })
      .returning({
        id:        apiKeysTable.id,
        name:      apiKeysTable.name,
        keyPrefix: apiKeysTable.keyPrefix,
      });

    return {
      id:        key!.id,
      name:      key!.name,
      keyPrefix: key!.keyPrefix,
      fullKey:   rawKey, // shown only once
    };
  }

  async revoke(id: string, userId: string) {
    await db
      .update(apiKeysTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeysTable.id, id), eq(apiKeysTable.userId, userId)));
  }

  async findByHash(hash: string) {
    const [key] = await db
      .select()
      .from(apiKeysTable)
      .where(and(eq(apiKeysTable.keyHash, hash), isNull(apiKeysTable.revokedAt)))
      .limit(1);
    return key ?? null;
  }
}
