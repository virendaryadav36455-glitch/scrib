// packages/database/models/themes.ts
import {
  pgTable, uuid, varchar, text,
  boolean, timestamp, integer, jsonb
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const themesTable = pgTable("themes", {
  id:         uuid("id").primaryKey().defaultRandom(),
  name:       varchar("name", { length: 100 }).notNull(),
  slug:       varchar("slug", { length: 100 }).notNull().unique(),
  isSystem:   boolean("is_system").default(false).notNull(),
  userId:     uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  category:   varchar("category", { length: 50 }),
  tokensJson: jsonb("tokens_json").$type<Record<string, string>>().notNull().default({}),
  colors:     jsonb("colors").$type<string[]>().notNull().default([]),
  isActive:   boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
