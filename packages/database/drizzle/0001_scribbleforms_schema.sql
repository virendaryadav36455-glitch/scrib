-- ScribbleForms complete schema migration
-- Generated for PostgreSQL

-- Enums
DO $$ BEGIN
  CREATE TYPE "plan" AS ENUM ('free', 'creator', 'studio');
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "auth_provider" AS ENUM ('email', 'google', 'github');
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "form_status" AS ENUM ('draft', 'published', 'archived', 'paused');
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "visibility" AS ENUM ('public', 'unlisted');
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "field_type" AS ENUM (
    'short_text', 'long_text', 'email', 'number', 'date', 'phone',
    'single_select', 'multi_select', 'checkbox', 'rating',
    'file_upload', 'divider', 'section_title'
  );
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "event_type" AS ENUM (
    'form_view', 'form_start', 'field_focus', 'field_blur',
    'field_skip', 'form_submit', 'form_abandon'
  );
  EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"            VARCHAR(255) NOT NULL UNIQUE,
  "full_name"        VARCHAR(255),
  "avatar_url"       TEXT,
  "password"         TEXT,
  "salt"             VARCHAR(32),
  "auth_provider"    "auth_provider" NOT NULL DEFAULT 'email',
  "provider_user_id" VARCHAR(255),
  "plan"             "plan" NOT NULL DEFAULT 'free',
  "email_verified"   BOOLEAN NOT NULL DEFAULT false,
  "reset_token"      VARCHAR(128),
  "reset_expires_at" TIMESTAMP,
  "created_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at"       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "users_email_idx"            ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_provider_user_id_idx" ON "users" ("provider_user_id");

-- Sessions
CREATE TABLE IF NOT EXISTS "sessions" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token"          TEXT NOT NULL UNIQUE,
  "ip_address"     VARCHAR(45),
  "user_agent"     TEXT,
  "expires_at"     TIMESTAMP NOT NULL,
  "created_at"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_active_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx"  ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" ("expires_at");

-- Themes
CREATE TABLE IF NOT EXISTS "themes" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        VARCHAR(100) NOT NULL,
  "slug"        VARCHAR(100) NOT NULL UNIQUE,
  "is_system"   BOOLEAN NOT NULL DEFAULT false,
  "user_id"     UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "category"    VARCHAR(50),
  "tokens_json" JSONB NOT NULL DEFAULT '{}',
  "colors"      JSONB NOT NULL DEFAULT '[]',
  "is_active"   BOOLEAN NOT NULL DEFAULT true,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Forms
CREATE TABLE IF NOT EXISTS "forms" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"              UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title"                VARCHAR(255) NOT NULL,
  "description"          TEXT,
  "slug"                 VARCHAR(100) NOT NULL UNIQUE,
  "custom_slug"          VARCHAR(100) UNIQUE,
  "status"               "form_status" NOT NULL DEFAULT 'draft',
  "visibility"           "visibility"  NOT NULL DEFAULT 'public',
  "theme_id"             UUID REFERENCES "themes"("id") ON DELETE SET NULL,
  "success_message"      TEXT,
  "success_redirect_url" TEXT,
  "password_hash"        TEXT,
  "response_limit"       INTEGER,
  "expires_at"           TIMESTAMP,
  "current_version_id"   UUID,
  "total_responses"      INTEGER NOT NULL DEFAULT 0,
  "total_views"          INTEGER NOT NULL DEFAULT 0,
  "published_at"         TIMESTAMP,
  "created_at"           TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at"           TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "forms_user_id_idx"              ON "forms" ("user_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "forms_status_visibility_idx"    ON "forms" ("status", "visibility", "deleted_at");
CREATE INDEX IF NOT EXISTS "forms_created_at_idx"           ON "forms" ("created_at" DESC);

-- Form versions
CREATE TABLE IF NOT EXISTS "form_versions" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id"      UUID NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "version"      INTEGER NOT NULL DEFAULT 1,
  "fields_json"  JSONB NOT NULL,
  "published_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "published_by" UUID REFERENCES "users"("id")
);
CREATE INDEX IF NOT EXISTS "form_versions_form_id_idx" ON "form_versions" ("form_id");

-- Fields
CREATE TABLE IF NOT EXISTS "fields" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id"     UUID NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "type"        "field_type" NOT NULL,
  "label"       TEXT NOT NULL,
  "description" TEXT,
  "placeholder" TEXT,
  "help_text"   TEXT,
  "required"    BOOLEAN NOT NULL DEFAULT false,
  "order"       INTEGER NOT NULL,
  "config"      JSONB,
  "conditions"  JSONB,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "fields_form_id_order_idx" ON "fields" ("form_id", "order");

-- Responses
CREATE TABLE IF NOT EXISTS "responses" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id"           UUID NOT NULL REFERENCES "forms"("id"),
  "form_version_id"   UUID NOT NULL,
  "ip_hash"           VARCHAR(64),
  "user_agent"        TEXT,
  "referrer"          TEXT,
  "time_to_complete_ms" INTEGER,
  "is_complete"       BOOLEAN NOT NULL DEFAULT true,
  "created_at"        TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "responses_form_id_idx"    ON "responses" ("form_id");
CREATE INDEX IF NOT EXISTS "responses_created_at_idx" ON "responses" ("created_at" DESC);

-- Response answers
CREATE TABLE IF NOT EXISTS "response_answers" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "response_id"  UUID NOT NULL REFERENCES "responses"("id") ON DELETE CASCADE,
  "field_id"     UUID NOT NULL,
  "field_type"   "field_type" NOT NULL,
  "value_text"   TEXT,
  "value_number" NUMERIC(10, 2),
  "value_array"  JSONB,
  "value_json"   JSONB
);
CREATE INDEX IF NOT EXISTS "response_answers_response_id_idx" ON "response_answers" ("response_id");
CREATE INDEX IF NOT EXISTS "response_answers_field_id_idx"    ON "response_answers" ("field_id");

-- Analytics events
CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id"          BIGSERIAL PRIMARY KEY,
  "form_id"     UUID NOT NULL REFERENCES "forms"("id"),
  "response_id" UUID,
  "event_type"  "event_type" NOT NULL,
  "field_id"    UUID,
  "session_id"  VARCHAR(64),
  "metadata"    JSONB,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "analytics_events_form_id_idx"    ON "analytics_events" ("form_id");
CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events" ("created_at");

-- Analytics daily aggregates
CREATE TABLE IF NOT EXISTS "analytics_daily" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id"     UUID NOT NULL REFERENCES "forms"("id"),
  "date"        DATE NOT NULL,
  "views"       INTEGER NOT NULL DEFAULT 0,
  "starts"      INTEGER NOT NULL DEFAULT 0,
  "completions" INTEGER NOT NULL DEFAULT 0,
  "abandons"    INTEGER NOT NULL DEFAULT 0,
  "avg_time_ms" INTEGER,
  CONSTRAINT "analytics_daily_form_date" UNIQUE ("form_id", "date")
);

-- Webhooks
CREATE TABLE IF NOT EXISTS "webhooks" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "form_id"    UUID REFERENCES "forms"("id") ON DELETE CASCADE,
  "url"        TEXT NOT NULL,
  "secret"     TEXT NOT NULL,
  "events"     JSONB NOT NULL,
  "is_active"  BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "webhook_id"    UUID NOT NULL REFERENCES "webhooks"("id"),
  "event"         VARCHAR(100) NOT NULL,
  "payload"       JSONB NOT NULL,
  "status_code"   INTEGER,
  "response_body" TEXT,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "status"        VARCHAR(20) NOT NULL DEFAULT 'pending',
  "created_at"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "delivered_at"  TIMESTAMP
);

-- API keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name"        VARCHAR(100) NOT NULL,
  "key_hash"    TEXT NOT NULL UNIQUE,
  "key_prefix"  VARCHAR(16) NOT NULL,
  "last_used_at" TIMESTAMP,
  "expires_at"  TIMESTAMP,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "revoked_at"  TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"          BIGSERIAL PRIMARY KEY,
  "user_id"     UUID REFERENCES "users"("id"),
  "action"      VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(50),
  "entity_id"   UUID,
  "ip_hash"     VARCHAR(64),
  "before"      JSONB,
  "after"       JSONB,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx"   ON "audit_logs" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_entity_id_idx" ON "audit_logs" ("entity_id");

-- Export jobs
CREATE TABLE IF NOT EXISTS "export_jobs" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id"    UUID NOT NULL REFERENCES "forms"("id"),
  "user_id"    UUID NOT NULL,
  "format"     VARCHAR(10) NOT NULL DEFAULT 'csv',
  "status"     VARCHAR(20) NOT NULL DEFAULT 'pending',
  "file_url"   TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
