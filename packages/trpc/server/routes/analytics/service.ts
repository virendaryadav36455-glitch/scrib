// packages/trpc/server/routes/analytics/service.ts
import db from "@repo/database";
import {
  eq, and, gte, lte, desc, sql, count, avg
} from "drizzle-orm";
import {
  responsesTable, analyticsDailyTable, analyticsEventsTable, formsTable
} from "@repo/database/schema";
import type { formStatsInputSchema } from "./schema";
import type { z } from "zod";

type FormStatsInput = z.infer<typeof formStatsInputSchema>;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class AnalyticsService {
  async getFormStats(input: FormStatsInput) {
    const { formId, startDate, endDate } = input;
    const start = new Date(startDate);
    const end   = new Date(endDate);

    // Get daily aggregates
    const daily = await db
      .select()
      .from(analyticsDailyTable)
      .where(
        and(
          eq(analyticsDailyTable.formId, formId),
          gte(analyticsDailyTable.date, start.toISOString().split("T")[0]!),
          lte(analyticsDailyTable.date, end.toISOString().split("T")[0]!)
        )
      )
      .orderBy(analyticsDailyTable.date);

    const totalViews       = daily.reduce((s, d) => s + d.views, 0);
    const totalStarts      = daily.reduce((s, d) => s + d.starts, 0);
    const totalCompletions = daily.reduce((s, d) => s + d.completions, 0);
    const totalAbandons    = daily.reduce((s, d) => s + d.abandons, 0);

    // FIX: analyticsDailyTable is only written by the queue worker.
    // If the worker wasn't running when responses came in, daily counts are 0
    // even though responsesTable has the real data.
    // Fall back to a direct count from responsesTable so analytics is never empty.
    let effectiveCompletions = totalCompletions;
    if (totalCompletions === 0) {
      const [directCount] = await db
        .select({ count: count() })
        .from(responsesTable)
        .where(
          and(
            eq(responsesTable.formId, formId),
            eq(responsesTable.isComplete, true),
            gte(responsesTable.createdAt, start),
            lte(responsesTable.createdAt, end)
          )
        );
      effectiveCompletions = Number(directCount?.count ?? 0);
    }

    const completionRate = totalStarts > 0 ? Math.round((effectiveCompletions / totalStarts) * 100) : 0;
    const dropOffRate    = totalStarts > 0 ? Math.round((totalAbandons / totalStarts) * 100) : 0;

    // avg time from responses table
    const [avgRow] = await db
      .select({ avg: avg(responsesTable.timeToCompleteMs) })
      .from(responsesTable)
      .where(
        and(
          eq(responsesTable.formId, formId),
          gte(responsesTable.createdAt, start),
          lte(responsesTable.createdAt, end)
        )
      );

    const avgTimeToCompleteMs = Math.round(Number(avgRow?.avg ?? 0));

    // FIX: when analyticsDailyTable is empty, build responses-over-time from
    // the responses table directly so the chart always shows real data
    let responsesOverTime: Array<{ date: string; count: number }>;
    if (daily.length > 0 && daily.some(d => d.completions > 0)) {
      responsesOverTime = daily.map((d) => ({
        date:  d.date as string,
        count: d.completions,
      }));
    } else {
      // Group actual responses by date
      const groupRows = await db
        .select({
          date:  sql<string>`date_trunc('day', ${responsesTable.createdAt})::date::text`,
          count: count(),
        })
        .from(responsesTable)
        .where(
          and(
            eq(responsesTable.formId, formId),
            eq(responsesTable.isComplete, true),
            gte(responsesTable.createdAt, start),
            lte(responsesTable.createdAt, end)
          )
        )
        .groupBy(sql`date_trunc('day', ${responsesTable.createdAt})::date`)
        .orderBy(sql`date_trunc('day', ${responsesTable.createdAt})::date`);
      responsesOverTime = groupRows.map(r => ({ date: r.date, count: Number(r.count) }));
    }

    // Previous period (same duration before start)
    const duration = end.getTime() - start.getTime();
    const prevEnd   = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    const prevDaily = await db
      .select()
      .from(analyticsDailyTable)
      .where(
        and(
          eq(analyticsDailyTable.formId, formId),
          gte(analyticsDailyTable.date, prevStart.toISOString().split("T")[0]!),
          lte(analyticsDailyTable.date, prevEnd.toISOString().split("T")[0]!)
        )
      );

    const prevViews       = prevDaily.reduce((s, d) => s + d.views, 0);
    const prevStarts      = prevDaily.reduce((s, d) => s + d.starts, 0);
    const prevCompletions = prevDaily.reduce((s, d) => s + d.completions, 0);
    const [prevAvgRow]    = await db
      .select({ avg: avg(responsesTable.timeToCompleteMs) })
      .from(responsesTable)
      .where(
        and(
          eq(responsesTable.formId, formId),
          gte(responsesTable.createdAt, prevStart),
          lte(responsesTable.createdAt, prevEnd)
        )
      );

    // Day-of-week breakdown
    const allResponses = await db
      .select({ createdAt: responsesTable.createdAt, userAgent: responsesTable.userAgent, referrer: responsesTable.referrer })
      .from(responsesTable)
      .where(
        and(
          eq(responsesTable.formId, formId),
          gte(responsesTable.createdAt, start),
          lte(responsesTable.createdAt, end)
        )
      );

    const dowCounts = DAYS.map((d) => ({ day: d, count: 0 }));
    for (const r of allResponses) {
      dowCounts[r.createdAt.getDay()]!.count++;
    }

    // ── Device breakdown from user agents ─────────────────────────────────────
    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
    for (const r of allResponses) {
      const ua = (r as any).userAgent as string | null ?? "";
      if (/Mobi|Android|iPhone|iPod/.test(ua)) deviceBreakdown.mobile++;
      else if (/iPad|Tablet/.test(ua))          deviceBreakdown.tablet++;
      else if (ua.length > 0)                   deviceBreakdown.desktop++;
      else                                       deviceBreakdown.other++;
    }

    // ── Top referrer sources ────────────────────────────────────────────────
    const sourceMap = new Map<string, number>();
    for (const r of allResponses) {
      const ref = (r as any).referrer as string | null ?? "";
      let source = "Direct";
      try {
        if (ref) source = new URL(ref).hostname;
      } catch { source = ref.slice(0, 50) || "Direct"; }
      sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
    }
    const totalSourceCount = [...sourceMap.values()].reduce((a, b) => a + b, 0) || 1;
    const topSources = [...sourceMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, cnt]) => ({
        source,
        count: cnt,
        // FIX: percentage was count/totalCompletions which is 0 when queue hasn't run
        // Use share of all tracked sources as the denominator
        percentage: Math.round((cnt / totalSourceCount) * 100),
      }));

    // ── Field drop-off from analytics events ────────────────────────────────
    const skipEvents = await db
      .select({
        fieldId:   analyticsEventsTable.fieldId,
        skipCount: sql<number>`cast(count(*) as int)`,
      })
      .from(analyticsEventsTable)
      .where(
        and(
          eq(analyticsEventsTable.formId, formId),
          eq(analyticsEventsTable.eventType, "field_skip"),
          gte(analyticsEventsTable.createdAt, start),
          lte(analyticsEventsTable.createdAt, end)
        )
      )
      .groupBy(analyticsEventsTable.fieldId);

    const skipMap = new Map(skipEvents.map((e) => [e.fieldId, e.skipCount]));

    // Get field metadata from the latest version if available
    const { formVersionsTable, fieldsTable } = await import("@repo/database/schema");
    const [latestVer] = await db
      .select({ currentVersionId: (await import("@repo/database/schema")).formsTable.currentVersionId })
      .from((await import("@repo/database/schema")).formsTable)
      .where(eq((await import("@repo/database/schema")).formsTable.id, formId))
      .limit(1);

    let fieldDropOff: Array<{ fieldId: string; fieldLabel: string; fieldOrder: number; dropOffRate: number; avgTimeMs: number }> = [];
    if (latestVer?.currentVersionId) {
      const [ver] = await db
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.id, latestVer.currentVersionId))
        .limit(1);

      if (ver) {
        const vfields = ver.fieldsJson as Array<{ id: string; label: string; order: number }>;
        fieldDropOff = vfields
          .filter((f: any) => f.type !== "divider" && f.type !== "section_title")
          .map((f) => {
            const skips   = skipMap.get(f.id) ?? 0;
            const dropRate = totalStarts > 0 ? Math.round((skips / totalStarts) * 100) : 0;
            return { fieldId: f.id, fieldLabel: f.label, fieldOrder: f.order, dropOffRate: dropRate, avgTimeMs: 0 };
          });
      }
    }

    return {
      totalResponses:       effectiveCompletions,
      completionRate,
      avgTimeToCompleteMs,
      totalViews,
      dropOffRate,
      responsesOverTime,
      deviceBreakdown,
      topSources,
      responsesByDayOfWeek: dowCounts,
      completionFunnel: [
        { stage: "Viewed",    count: totalViews },
        { stage: "Started",   count: totalStarts > 0 ? totalStarts : effectiveCompletions },
        { stage: "Completed", count: effectiveCompletions },
      ],
      fieldDropOff,
      previousPeriod: {
        totalResponses:      prevCompletions,
        completionRate:      prevStarts > 0 ? Math.round((prevCompletions / prevStarts) * 100) : 0,
        totalViews:          prevViews,
        avgTimeToCompleteMs: Math.round(Number(prevAvgRow?.avg ?? 0)),
      },
    };
  }

  async getDashboardSummary(userId: string) {
    const forms = await db
      .select({
        id:             formsTable.id,
        title:          formsTable.title,
        status:         formsTable.status,
        totalResponses: formsTable.totalResponses,
        totalViews:     formsTable.totalViews,
        publishedAt:    formsTable.publishedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.userId, userId))
      .orderBy(desc(formsTable.totalResponses))
      .limit(5);

    const [totals] = await db
      .select({
        totalForms:     count(),
        totalResponses: sql<number>`SUM(${formsTable.totalResponses})`,
        totalViews:     sql<number>`SUM(${formsTable.totalViews})`,
      })
      .from(formsTable)
      .where(eq(formsTable.userId, userId));

    return {
      topForms:       forms,
      totalForms:     Number(totals?.totalForms ?? 0),
      totalResponses: Number(totals?.totalResponses ?? 0),
      totalViews:     Number(totals?.totalViews ?? 0),
    };
  }

  async trackEvent(event: {
    formId: string;
    eventType: string;
    fieldId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    // Insert raw event
    await db.insert(analyticsEventsTable).values({
      formId:    event.formId,
      eventType: event.eventType as any,
      fieldId:   event.fieldId,
      sessionId: event.sessionId,
      metadata:  event.metadata,
    });

    // Upsert daily aggregate
    const today = new Date().toISOString().split("T")[0]!;

    const updateCol =
      event.eventType === "form_view"    ? "views"       :
      event.eventType === "form_start"   ? "starts"      :
      event.eventType === "form_submit"  ? "completions" :
      event.eventType === "form_abandon" ? "abandons"    : null;

    if (updateCol) {
      await db
        .insert(analyticsDailyTable)
        .values({
          formId:      event.formId,
          date:        today,
          views:       updateCol === "views"       ? 1 : 0,
          starts:      updateCol === "starts"      ? 1 : 0,
          completions: updateCol === "completions" ? 1 : 0,
          abandons:    updateCol === "abandons"    ? 1 : 0,
        })
        .onConflictDoUpdate({
          target:  [analyticsDailyTable.formId, analyticsDailyTable.date],
          set: {
            views:       updateCol === "views"       ? sql`${analyticsDailyTable.views} + 1`       : analyticsDailyTable.views,
            starts:      updateCol === "starts"      ? sql`${analyticsDailyTable.starts} + 1`      : analyticsDailyTable.starts,
            completions: updateCol === "completions" ? sql`${analyticsDailyTable.completions} + 1` : analyticsDailyTable.completions,
            abandons:    updateCol === "abandons"    ? sql`${analyticsDailyTable.abandons} + 1`    : analyticsDailyTable.abandons,
          },
        });
    }
  }
}