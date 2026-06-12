// packages/database/models/webhooks.ts
import {
  pgTable, uuid, text, boolean, timestamp,
  integer, jsonb, varchar
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsTable } from "./forms";

export const webhooksTable = pgTable("webhooks", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  formId:    uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }),
  url:       text("url").notNull(),
  secret:    text("secret").notNull(),
  events:    jsonb("events").$type<string[]>().notNull(),
  isActive:  boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookDeliveriesTable = pgTable("webhook_deliveries", {
  id:           uuid("id").primaryKey().defaultRandom(),
  webhookId:    uuid("webhook_id").notNull().references(() => webhooksTable.id),
  event:        varchar("event", { length: 100 }).notNull(),
  payload:      jsonb("payload").notNull(),
  statusCode:   integer("status_code"),
  responseBody: text("response_body"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  status:       varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  deliveredAt:  timestamp("delivered_at"),
});

export type SelectWebhook = typeof webhooksTable.$inferSelect;
