// packages/trpc/server/routes/responses/repository.ts
import db from "@repo/database";
import { eq, and, desc, gte, lte, count, sql, inArray } from "drizzle-orm";
import {
  responsesTable, responseAnswersTable, exportJobsTable, formsTable
} from "@repo/database/schema";

export class ResponseRepository {
  async listForForm(opts: {
    formId: string;
    cursor?: string;
    limit: number;
    startDate?: string;
    endDate?: string;
  }) {
    const conditions: any[] = [eq(responsesTable.formId, opts.formId)];
    if (opts.startDate) conditions.push(gte(responsesTable.createdAt, new Date(opts.startDate)));
    if (opts.endDate)   conditions.push(lte(responsesTable.createdAt, new Date(opts.endDate)));

    const [countRow] = await db
      .select({ total: count() })
      .from(responsesTable)
      .where(and(...conditions));

    const responses = await db
      .select()
      .from(responsesTable)
      .where(and(...conditions))
      .orderBy(desc(responsesTable.createdAt))
      .limit(opts.limit + 1);

    const hasMore = responses.length > opts.limit;
    const items   = hasMore ? responses.slice(0, opts.limit) : responses;

    if (items.length === 0) {
      return { responses: [], nextCursor: null, total: Number(countRow?.total ?? 0) };
    }

    // Single query to get all email and name answers for this page — eliminates N+1
    const responseIds = items.map((r) => r.id);
    const allAnswers  = await db
      .select({
        responseId: responseAnswersTable.responseId,
        fieldType:  responseAnswersTable.fieldType,
        valueText:  responseAnswersTable.valueText,
      })
      .from(responseAnswersTable)
      .where(
        and(
          inArray(responseAnswersTable.responseId, responseIds),
          sql`${responseAnswersTable.fieldType} IN ('email', 'short_text')`
        )
      );

    // Build a map: responseId → { email, name }
    const answerMap = new Map<string, { email: string | null; name: string | null }>();
    for (const r of responseIds) answerMap.set(r, { email: null, name: null });
    for (const a of allAnswers) {
      const entry = answerMap.get(a.responseId);
      if (!entry) continue;
      if (a.fieldType === "email" && !entry.email) entry.email = a.valueText;
      if (a.fieldType === "short_text" && !entry.name) entry.name = a.valueText;
    }

    const enriched = items.map((r) => {
      const meta = answerMap.get(r.id);
      return {
        id:               r.id,
        formId:           r.formId,
        isComplete:       r.isComplete,
        timeToCompleteMs: r.timeToCompleteMs ?? null,
        createdAt:        r.createdAt.toISOString(),
        emailAnswer:      meta?.email ?? null,
        nameAnswer:       meta?.name  ?? null,
      };
    });

    return {
      responses:  enriched,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
      total:      Number(countRow?.total ?? 0),
    };
  }

  async getWithAnswers(responseId: string, userId: string) {
    const [response] = await db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.id, responseId))
      .limit(1);

    if (!response) return null;

    const [form] = await db
      .select({ userId: formsTable.userId })
      .from(formsTable)
      .where(eq(formsTable.id, response.formId))
      .limit(1);

    if (!form || form.userId !== userId) return null;

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.responseId, responseId));

    return { ...response, createdAt: response.createdAt.toISOString(), answers };
  }

  async delete(responseId: string, userId: string) {
    const [response] = await db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.id, responseId))
      .limit(1);

    if (!response) return;

    const [form] = await db
      .select({ userId: formsTable.userId })
      .from(formsTable)
      .where(eq(formsTable.id, response.formId))
      .limit(1);

    if (!form || form.userId !== userId) return;

    await db.delete(responsesTable).where(eq(responsesTable.id, responseId));

    await db
      .update(formsTable)
      .set({ totalResponses: sql`GREATEST(${formsTable.totalResponses} - 1, 0)` })
      .where(eq(formsTable.id, response.formId));
  }

  async createExportJob(formId: string, userId: string, format: string): Promise<string> {
    const [job] = await db
      .insert(exportJobsTable)
      .values({ formId, userId, format, status: "pending" })
      .returning({ id: exportJobsTable.id });
    return job!.id;
  }

  async getExportStatus(exportJobId: string) {
    const [job] = await db
      .select()
      .from(exportJobsTable)
      .where(eq(exportJobsTable.id, exportJobId))
      .limit(1);

    if (!job) return { status: "pending" as const, fileUrl: null };
    return {
      status:  job.status as "pending" | "processing" | "done" | "failed",
      fileUrl: job.fileUrl ?? null,
    };
  }
}
