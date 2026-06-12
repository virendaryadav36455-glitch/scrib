// packages/database/models/user.ts
import {
  pgTable, uuid, varchar, text, boolean,
  timestamp, pgEnum
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "creator", "studio"]);
export const authProviderEnum = pgEnum("auth_provider", ["email", "google", "github"]);

export const usersTable = pgTable("users", {
  id:             uuid("id").primaryKey().defaultRandom(),
  email:          varchar("email", { length: 255 }).notNull().unique(),
  fullName:       varchar("full_name", { length: 255 }),
  avatarUrl:      text("avatar_url"),
  password:       text("password"),
  salt:           varchar("salt", { length: 32 }),
  authProvider:   authProviderEnum("auth_provider").default("email").notNull(),
  providerUserId: varchar("provider_user_id", { length: 255 }),
  plan:           planEnum("plan").default("free").notNull(),
  emailVerified:  boolean("email_verified").default(false).notNull(),
  resetToken:     varchar("reset_token", { length: 128 }),
  resetExpiresAt: timestamp("reset_expires_at"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  deletedAt:      timestamp("deleted_at"),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
