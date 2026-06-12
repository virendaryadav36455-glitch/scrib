// packages/database/models/audit-logs.ts
import { pgTable, uuid, varchar, timestamp, jsonb, bigserial } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const auditLogsTable = pgTable("audit_logs", {
  id:         bigserial("id", { mode: "number" }).primaryKey(),
  userId:     uuid("user_id").references(() => usersTable.id),
  action:     varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId:   uuid("entity_id"),
  ipHash:     varchar("ip_hash", { length: 64 }),
  before:     jsonb("before"),
  after:      jsonb("after"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});
