// packages/trpc/server/routes/webhooks/repository.ts
import db from "@repo/database";
import { eq, and } from "drizzle-orm";
import { webhooksTable, webhookDeliveriesTable } from "@repo/database";
import { randomBytes, createHmac } from "node:crypto";

export class WebhookRepository {
  async listForUser(userId: string) {
    const webhooks = await db
      .select()
      .from(webhooksTable)
      .where(eq(webhooksTable.userId, userId));

    return {
      webhooks: webhooks.map((w) => ({
        id:        w.id,
        formId:    w.formId ?? null,
        url:       w.url,
        events:    w.events as string[],
        isActive:  w.isActive,
        createdAt: w.createdAt.toISOString(),
      })),
    };
  }

  async create(payload: {
    userId:  string;
    formId?: string;
    url:     string;
    events:  string[];
    secret:  string;
  }) {
    const [wh] = await db
      .insert(webhooksTable)
      .values({
        userId:   payload.userId,
        formId:   payload.formId,
        url:      payload.url,
        events:   payload.events,
        secret:   payload.secret,
        isActive: true,
      })
      .returning();
    return {
      id:        wh!.id,
      formId:    wh!.formId ?? null,
      url:       wh!.url,
      events:    wh!.events as string[],
      isActive:  wh!.isActive,
      createdAt: wh!.createdAt.toISOString(),
    };
  }

  async delete(id: string, userId: string) {
    await db
      .delete(webhooksTable)
      .where(and(eq(webhooksTable.id, id), eq(webhooksTable.userId, userId)));
  }

  async findByIdForUser(id: string, userId: string) {
    const [wh] = await db
      .select()
      .from(webhooksTable)
      .where(and(eq(webhooksTable.id, id), eq(webhooksTable.userId, userId)))
      .limit(1);
    return wh ?? null;
  }

  async test(id: string, userId: string) {
    const wh = await this.findByIdForUser(id, userId);
    if (!wh) return { success: false };

    const payload = { event: "webhook.test", timestamp: new Date().toISOString() };
    const body    = JSON.stringify(payload);
    const sig     = createHmac("sha256", wh.secret).update(body).digest("hex");

    try {
      const res = await fetch(wh.url, {
        method:  "POST",
        headers: {
          "Content-Type":              "application/json",
          "X-ScribbleForms-Signature": `sha256=${sig}`,
          "X-ScribbleForms-Event":     "webhook.test",
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      return { success: res.ok, statusCode: res.status };
    } catch {
      return { success: false };
    }
  }
}
