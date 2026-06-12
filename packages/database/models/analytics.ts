// packages/database/models/analytics.ts
import {
  pgTable, uuid, integer, timestamp,
  date, unique, jsonb, varchar, bigserial, pgEnum
} from "drizzle-orm/pg-core";
import { formsTable } from "./forms";


export const eventTypeEnum = pgEnum("event_type", [
  "form_view", "form_start", "field_focus", "field_blur",
  "field_skip", "form_submit", "form_abandon"
]);

export const analyticsEventsTable = pgTable("analytics_events", {
  id:         bigserial("id", { mode: "number" }).primaryKey(),
  formId:     uuid("form_id").notNull().references(() => formsTable.id),
  responseId: uuid("response_id"),
  eventType:  eventTypeEnum("event_type").notNull(),
  fieldId:    uuid("field_id"),
  sessionId:  varchar("session_id", { length: 64 }),
  metadata:   jsonb("metadata"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const analyticsDailyTable = pgTable("analytics_daily", {
  id:          uuid("id").primaryKey().defaultRandom(),
  formId:      uuid("form_id").notNull().references(() => formsTable.id),
  date:        date("date").notNull(),
  views:       integer("views").default(0).notNull(),
  starts:      integer("starts").default(0).notNull(),
  completions: integer("completions").default(0).notNull(),
  abandons:    integer("abandons").default(0).notNull(),
  avgTimeMs:   integer("avg_time_ms"),
}, (t) => [
  unique("analytics_daily_form_date").on(t.formId, t.date)
]);
