// apps/worker/src/workers/export.worker.ts
import { Worker } from "bullmq";
import Redis from "ioredis";
import db from "@repo/database";
import {
  responsesTable, responseAnswersTable,
  fieldsTable, exportJobsTable,
} from "@repo/database";
import { eq, desc, inArray, asc } from "drizzle-orm";
import { getEmailQueue, safeEnqueue } from "@repo/queues";

const connection = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});



async function generateCsv(formId: string): Promise<string> {
  console.log(process.env.DATABASE_URL)
  const fields = await db
    .select()
    .from(fieldsTable)
    .where(eq(fieldsTable.formId, formId))
    .orderBy(asc(fieldsTable.order));;

  const responses = await db
    .select()
    .from(responsesTable)
    .where(eq(responsesTable.formId, formId))
    .orderBy(desc(responsesTable.createdAt))
    .limit(10_000);

  const headers = [
    "Response ID", "Submitted At", "Completed", "Time (ms)",
    ...fields.map((f) => f.label),
  ];
  const rows: string[][] = [headers];

  // if (responses.length === 0) {
  //   return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  // }

  // Batch-load all answers (no N+1)
  const responseIds = responses.map((r) => r.id);
  const allAnswers  = await db
    .select()
    .from(responseAnswersTable)
    .where(inArray(responseAnswersTable.responseId, responseIds));

  const answerMap = new Map<string, Map<string, typeof allAnswers[number]>>();
  for (const r of responseIds) answerMap.set(r, new Map());
  for (const a of allAnswers) {
    answerMap.get(a.responseId)?.set(a.fieldId, a);
  }

  for (const r of responses) {
    const fieldAnswers = answerMap.get(r.id) ?? new Map();
    const row: string[] = [
      r.id,
      r.createdAt.toISOString(),
      String(r.isComplete),
      String(r.timeToCompleteMs ?? ""),
      ...fields.map((f) => {
        const a = fieldAnswers.get(f.id);
        if (!a) return "";
        if (a.valueText   != null) return a.valueText;
        if (a.valueNumber != null) return String(a.valueNumber);
        if (a.valueArray  != null) return JSON.stringify(a.valueArray);
        if (a.valueJson   != null) return JSON.stringify(a.valueJson);
        return "";
      }),
    ];
    rows.push(row);
  }

  console.log(rows)

  return rows
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

async function uploadToCloudinary(content: string, filename: string): Promise<string | null> {
  const cloudName  = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey     = process.env["CLOUDINARY_API_KEY"];
  const apiSecret  = process.env["CLOUDINARY_API_SECRET"];

  if (!cloudName || !apiKey || !apiSecret) return null;
  console.log(cloudName,apiKey,apiSecret);

  try {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const buf = Buffer.from(content, "utf-8");
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: `exports/${filename}`, format: "csv" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result?.secure_url ?? null);
        }
      );
      stream.end(buf);
    });
  } catch (err) {
  console.error("Cloudinary upload failed", err);
  throw err;
}
}

export const exportWorker = new Worker(
  "export",
  async (job) => {
    console.log(process.env.DATABASE_URL)
    const { exportJobId, formId, userEmail } = job.data as {
      exportJobId: string;
      formId:      string;
      format:      string;
      userId:      string;
      userEmail:   string;
    };

    await db
      .update(exportJobsTable)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(exportJobsTable.id, exportJobId));

    try {
      const content  = await generateCsv(formId);
      const filename = `${formId}-${Date.now()}`;
      const fileUrl  = await uploadToCloudinary(content, filename);

      await db
        .update(exportJobsTable)
        .set({ status: "done", fileUrl, updatedAt: new Date() })
        .where(eq(exportJobsTable.id, exportJobId));

      if (fileUrl && userEmail) {
        await safeEnqueue(getEmailQueue(), "export_ready", {
          type:    "export_ready",
          email:   userEmail,
          fileUrl,
        });
      }
    } catch (err) {
      console.error(`[Export][Failed] job=${job?.id}`, err);
      await db
        .update(exportJobsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(exportJobsTable.id, exportJobId));
      throw err;
    }
  },
  { connection, concurrency: 2 }
);

exportWorker.on("failed", (job, err) => {
  console.error(`[Export][Failed] job=${job?.id}`, err);
});
