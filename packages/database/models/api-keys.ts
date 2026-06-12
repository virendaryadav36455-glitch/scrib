// packages/database/models/api-keys.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const apiKeysTable = pgTable("api_keys", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name:       varchar("name", { length: 100 }).notNull(),
  keyHash:    text("key_hash").notNull().unique(),
  keyPrefix:  varchar("key_prefix", { length: 16 }).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt:  timestamp("expires_at"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  revokedAt:  timestamp("revoked_at"),
});

export type SelectApiKey = typeof apiKeysTable.$inferSelect;
