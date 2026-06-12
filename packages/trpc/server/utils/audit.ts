// packages/trpc/server/utils/audit.ts
import db from "@repo/database";
import { auditLogsTable } from "@repo/database";

type AuditAction =
  | "form.create" | "form.update" | "form.publish" | "form.unpublish"
  | "form.delete" | "field.create" | "field.update" | "field.delete"
  | "response.delete" | "theme.apply" | "webhook.create" | "webhook.delete"
  | "api_key.create" | "api_key.revoke" | "user.login" | "user.logout";

export async function logAudit(payload: {
  userId:      string;
  action:      AuditAction;
  entityType?: string;
  entityId?:   string;
  before?:     object;
  after?:      object;
  ipHash?:     string;
}): Promise<void> {
  // Fire-and-forget — never block the main response
  db.insert(auditLogsTable).values(payload).catch(() => {});
}
