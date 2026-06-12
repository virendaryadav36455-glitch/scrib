// apps/worker/src/workers/analytics.worker.ts
import { Worker } from "bullmq";
import Redis from "ioredis";
import db from "@repo/database";
import { analyticsEventsTable, analyticsDailyTable } from "@repo/database";
import { eq, and, sql } from "drizzle-orm";

const connection = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});

const COL_MAP: Record<string, string> = {
  form_view:    "views",
  form_start:   "starts",
  form_submit:  "completions",
  form_abandon: "abandons",
};

export const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    if (job.data.type !== "track_event") return;

    const event = job.data.event as {
      formId:     string;
      eventType:  string;
      fieldId?:   string;
      sessionId?: string;
      responseId?: string;
      metadata?:  Record<string, unknown>;
    };

    if (!event?.formId || !event?.eventType) return;

    // Insert raw event
    await db.insert(analyticsEventsTable).values({
      formId:    event.formId,
      eventType: event.eventType as any,
      fieldId:   event.fieldId   ?? null,
      sessionId: event.sessionId ?? null,
      metadata:  event.metadata  ?? null,
      responseId: event.responseId ?? null,
    }).catch(() => {});

    // Upsert daily aggregate
    const today = new Date().toISOString().split("T")[0]!;
    const col   = COL_MAP[event.eventType];
    if (!col) return;

    await db
      .insert(analyticsDailyTable)
      .values({
        formId:      event.formId,
        date:        today,
        views:       col === "views"       ? 1 : 0,
        starts:      col === "starts"      ? 1 : 0,
        completions: col === "completions" ? 1 : 0,
        abandons:    col === "abandons"    ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [analyticsDailyTable.formId, analyticsDailyTable.date],
        set: {
          views:       col === "views"       ? sql`${analyticsDailyTable.views} + 1`       : analyticsDailyTable.views,
          starts:      col === "starts"      ? sql`${analyticsDailyTable.starts} + 1`      : analyticsDailyTable.starts,
          completions: col === "completions" ? sql`${analyticsDailyTable.completions} + 1` : analyticsDailyTable.completions,
          abandons:    col === "abandons"    ? sql`${analyticsDailyTable.abandons} + 1`    : analyticsDailyTable.abandons,
        },
      })
      .catch(() => {});
  },
  { connection, concurrency: 20 }
);

analyticsWorker.on("failed", (job, err) => {
  console.error(`[Analytics][Failed] job=${job?.id}`, err.message);
});
