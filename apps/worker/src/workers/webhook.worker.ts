// apps/worker/src/workers/webhook.worker.ts
import { Worker } from "bullmq";
import Redis from "ioredis";
import { createHmac } from "node:crypto";
import db from "@repo/database";
import { webhooksTable, webhookDeliveriesTable } from "@repo/database";
import { eq, and, or, isNull, sql } from "drizzle-orm";

const connection = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});

async function findWebhooks(formId: string, event: string) {
  return db
    .select()
    .from(webhooksTable)
    .where(
      and(
        eq(webhooksTable.isActive, true),
        or(isNull(webhooksTable.formId), eq(webhooksTable.formId, formId)),
        // JSONB array contains the event string
        sql`${webhooksTable.events} @> ${JSON.stringify([event])}::jsonb`
      )
    );
}

async function recordDelivery(
  webhookId: string,
  event:     string,
  payload:   unknown,
  statusCode: number,
  status:    string
) {
  await db.insert(webhookDeliveriesTable).values({
    webhookId,
    event,
    payload:      payload as any,
    statusCode,
    status,
    deliveredAt:  new Date(),
    attemptCount: 1,
  }).catch(() => {});
}

export const webhookWorker = new Worker(
  "webhook",
  async (job) => {
    const { formId, event, payload } = job.data as {
      formId:  string;
      event:   string;
      payload: unknown;
    };

    const webhooks = await findWebhooks(formId, event);

    await Promise.all(
      webhooks.map(async (wh) => {
        const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
        const sig  = createHmac("sha256", wh.secret).update(body).digest("hex");

        try {
          const response = await fetch(wh.url, {
            method:  "POST",
            headers: {
              "Content-Type":              "application/json",
              "X-ScribbleForms-Signature": `sha256=${sig}`,
              "X-ScribbleForms-Event":     event,
            },
            body,
            signal: AbortSignal.timeout(10_000),
          });

          await recordDelivery(wh.id, event, payload, response.status, response.ok ? "success" : "failed");
          if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
        } catch (err: any) {
          await recordDelivery(wh.id, event, payload, 0, "failed");
          throw err; // triggers BullMQ retry
        }
      })
    );
  },
  { connection, concurrency: 10 }
);

webhookWorker.on("failed", (job, err) => {
  console.error(`[Webhook][Failed] job=${job?.id}`, err.message);
});
