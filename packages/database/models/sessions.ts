// packages/database/models/sessions.ts
import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const sessionsTable = pgTable("sessions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token:        text("token").notNull().unique(),
  ipAddress:    varchar("ip_address", { length: 45 }),
  userAgent:    text("user_agent"),
  expiresAt:    timestamp("expires_at").notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export type SelectSession = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
