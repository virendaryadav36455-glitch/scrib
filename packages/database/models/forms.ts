// packages/database/models/forms.ts
import {
  pgTable, uuid, varchar, text, boolean,
  timestamp, integer, pgEnum, jsonb
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived", "paused"]);
export const visibilityEnum  = pgEnum("visibility",  ["public", "unlisted"]);

export const formsTable = pgTable("forms", {
  id:                 uuid("id").primaryKey().defaultRandom(),
  userId:             uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title:              varchar("title", { length: 255 }).notNull(),
  description:        text("description"),
  slug:               varchar("slug", { length: 100 }).notNull().unique(),
  customSlug:         varchar("custom_slug", { length: 100 }).unique(),
  status:             formStatusEnum("status").default("draft").notNull(),
  visibility:         visibilityEnum("visibility").default("public").notNull(),
  themeId:            uuid("theme_id"),
  successMessage:     text("success_message"),
  successRedirectUrl: text("success_redirect_url"),
  passwordHash:       text("password_hash"),
  responseLimit:      integer("response_limit"),
  expiresAt:          timestamp("expires_at"),
  currentVersionId:   uuid("current_version_id"),
  totalResponses:     integer("total_responses").default(0).notNull(),
  totalViews:         integer("total_views").default(0).notNull(),
  publishedAt:        timestamp("published_at"),
  createdAt:          timestamp("created_at").defaultNow().notNull(),
  updatedAt:          timestamp("updated_at").defaultNow().notNull(),
  deletedAt:          timestamp("deleted_at"),
});

export const formVersionsTable = pgTable("form_versions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  formId:     uuid("form_id").notNull().references(() => formsTable.id, { onDelete: "cascade" }),
  version:    integer("version").notNull().default(1),
  fieldsJson: jsonb("fields_json").notNull().$type<any[]>(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  publishedBy: uuid("published_by").references(() => usersTable.id),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type SelectFormVersion = typeof formVersionsTable.$inferSelect;
