// packages/database/models/responses.ts
import {
  pgTable, uuid, text, boolean,
  timestamp, integer, varchar, jsonb, numeric
} from "drizzle-orm/pg-core";
import { formsTable, formVersionsTable } from "./forms";
import { fieldsTable, fieldTypeEnum } from "./fields";

export const responsesTable = pgTable("responses", {
  id:               uuid("id").primaryKey().defaultRandom(),
  formId:           uuid("form_id").notNull().references(() => formsTable.id),
  formVersionId:    uuid("form_version_id").notNull(),
  ipHash:           varchar("ip_hash", { length: 64 }),
  userAgent:        text("user_agent"),
  referrer:         text("referrer"),
  timeToCompleteMs: integer("time_to_complete_ms"),
  isComplete:       boolean("is_complete").default(true).notNull(),
  createdAt:        timestamp("created_at").defaultNow().notNull(),
});

export const responseAnswersTable = pgTable("response_answers", {
  id:          uuid("id").primaryKey().defaultRandom(),
  responseId:  uuid("response_id").notNull().references(() => responsesTable.id, { onDelete: "cascade" }),
  fieldId:     uuid("field_id").notNull(),
  fieldType:   fieldTypeEnum("field_type").notNull(),
  valueText:   text("value_text"),
  valueNumber: numeric("value_number", { precision: 10, scale: 2 }),
  valueArray:  jsonb("value_array").$type<unknown[]>(),
  valueJson:   jsonb("value_json"),
});

export const exportJobsTable = pgTable("export_jobs", {
  id:        uuid("id").primaryKey().defaultRandom(),
  formId:    uuid("form_id").notNull().references(() => formsTable.id),
  userId:    uuid("user_id").notNull(),
  format:    varchar("format", { length: 10 }).notNull().default("csv"),
  status:    varchar("status", { length: 20 }).notNull().default("pending"),
  fileUrl:   text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
