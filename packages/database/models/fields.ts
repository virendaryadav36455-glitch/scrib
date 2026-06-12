// packages/database/models/fields.ts
import {
  pgTable, uuid, text, boolean,
  timestamp, integer, pgEnum, jsonb
} from "drizzle-orm/pg-core";
import { formsTable } from "./forms";

export const fieldTypeEnum = pgEnum("field_type", [
  "short_text", "long_text", "email", "number", "date", "phone",
  "single_select", "multi_select", "checkbox", "rating",
  "file_upload", "divider", "section_title"
]);

export const fieldsTable = pgTable("fields", {
  id:          uuid("id").primaryKey().defaultRandom(),
  formId:      uuid("form_id").notNull().references(() => formsTable.id, { onDelete: "cascade" }),
  type:        fieldTypeEnum("type").notNull(),
  label:       text("label").notNull(),
  description: text("description"),
  placeholder: text("placeholder"),
  helpText:    text("help_text"),
  required:    boolean("required").default(false).notNull(),
  order:       integer("order").notNull(),
  config:      jsonb("config").$type<Record<string, unknown>>(),
  conditions:  jsonb("conditions").$type<{
    show: boolean;
    logic: "and" | "or";
    rules: Array<{ fieldId: string; operator: string; value: unknown }>;
  }>(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export type SelectField = typeof fieldsTable.$inferSelect;
export type InsertField = typeof fieldsTable.$inferInsert;
