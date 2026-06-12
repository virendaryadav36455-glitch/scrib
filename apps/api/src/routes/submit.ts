// apps/api/src/routes/submit.ts
import { Request, Response } from "express";
import { createHmac } from "node:crypto";
import db from "@repo/database";
import {
  formsTable, formVersionsTable,
  responsesTable, responseAnswersTable,
} from "@repo/database";
import { eq, and, isNull, sql } from "drizzle-orm";
import { submissionEnvelopeSchema } from "@repo/trpc/server";
import { FIELD_REGISTRY } from "@repo/constants";
import { cacheGet } from "@repo/redis";
import { safeEnqueue, getEmailQueue, getAnalyticsQueue, getWebhookQueue } from "@repo/queues";
import { env } from "../env";
import { z } from "zod";
import { applyConditions, buildFieldSchema } from "@repo/validators";

function hashIp(ip: string, formId: string): string {
  const today = new Date().toISOString().split("T")[0]!;
  return createHmac("sha256", env.IP_HASH_SECRET)
    .update(`${ip}:${formId}:${today}`)
    .digest("hex");
}

// applyConditions imported from @repo/validators (shared with frontend)

// buildFieldSchema imported from @repo/validators (shared with frontend)

export async function handleFormSubmit(req: Request, res: Response) {
  const { slug } = req.params;

  // Validate envelope
  const envelopeResult = submissionEnvelopeSchema.safeParse(req.body);
  if (!envelopeResult.success) {
    return res.status(422).json({
      code:    "VALIDATION_FAILED",
      message: "Invalid submission format",
      errors:  envelopeResult.error.flatten().fieldErrors,
    });
  }

  // Honeypot — silently accept but discard
  if (envelopeResult.data.__hp !== undefined && envelopeResult.data.__hp !== "") {
    return res.status(200).json({ success: true, responseId: crypto.randomUUID() });
  }

  const { formVersionId, answers, metadata } = envelopeResult.data;

  // Try Redis cache first
  const cacheKey = `sf:form:public:${slug}`;
  let form: any = await cacheGet(cacheKey);

  if (!form) {
    const [dbForm] = await db
      .select()
      .from(formsTable)
      .where(and(
        sql`(${formsTable.slug} = ${slug} OR ${formsTable.customSlug} = ${slug})`,
        isNull(formsTable.deletedAt)
      ))
      .limit(1);
    form = dbForm;
  }

  if (!form)
    return res.status(404).json({ code: "FORM_NOT_FOUND", message: "Form not found" });

  if (form.status !== "published")
    return res.status(403).json({ code: "FORM_NOT_PUBLISHED", message: "This form is not accepting responses" });
  
  if (form.hasPassword || form.passwordHash) {
  return res.status(403).json({
    code: "PASSWORD_REQUIRED",
    message: "This form requires a password. Please open the form link to enter it.",
  });
}

  if (form.expiresAt && new Date(form.expiresAt) < new Date())
    return res.status(410).json({ code: "FORM_EXPIRED", message: "This form has expired" });

  if (form.responseLimit && form.totalResponses >= form.responseLimit)
    return res.status(410).json({ code: "FORM_RESPONSE_LIMIT", message: "This form has reached its response limit" });

  if (form.currentVersionId && form.currentVersionId !== formVersionId)
    return res.status(409).json({
      code:             "FORM_VERSION_OUTDATED",
      message:          "The form has been updated. Please refresh and try again.",
      currentVersionId: form.currentVersionId,
    });

  // Load the version snapshot
  const [version] = await db
    .select()
    .from(formVersionsTable)
    .where(eq(formVersionsTable.id, formVersionId))
    .limit(1);

  if (!version)
    return res.status(404).json({ code: "FORM_NOT_FOUND", message: "Form version not found" });

  const allFields    = version.fieldsJson as any[];
  const activeFields = applyConditions(allFields, answers as Record<string, unknown>);
  // Cast: activeFields come from DB snapshot which always has required set
  const schema       = buildFieldSchema(activeFields as any);
  const validation   = schema.safeParse(answers);

  if (!validation.success) {
    return res.status(422).json({
      code:    "VALIDATION_FAILED",
      message: "One or more answers are invalid",
      errors:  validation.error.flatten().fieldErrors,
    });
  }

  const ipHash = hashIp(req.ip ?? "0.0.0.0", form.id);

  // Persist in a transaction
  // NOTE: response limit is re-checked atomically inside the transaction
  // to prevent race conditions from concurrent submissions
  let limitExceeded = false;
  const responseId = await db.transaction(async (tx) => {
    // Re-read the counter inside the transaction for atomicity
    if (form.responseLimit) {
      const [current] = await tx
        .select({ totalResponses: formsTable.totalResponses })
        .from(formsTable)
        .where(eq(formsTable.id, form.id));
      if (current && current.totalResponses >= form.responseLimit) {
        limitExceeded = true;
        return null;
      }
    }

    const [response] = await tx
      .insert(responsesTable)
      .values({
        formId:           form.id,
        formVersionId,
        ipHash,
        userAgent:        req.headers["user-agent"] ?? null,
        referrer:         typeof metadata?.referrer === "string" ? metadata.referrer : null,
        timeToCompleteMs: metadata?.timeToCompleteMs ?? null,
        isComplete:       true,
      })
      .returning({ id: responsesTable.id });

    const answersToInsert = activeFields
      .filter((f) => f.type !== "divider" && f.type !== "section_title")
      .flatMap((field) => {
        const raw = (validation.data as Record<string, unknown>)[field.id];
        if (raw == null) return [];
        const reg        = FIELD_REGISTRY[field.type] ?? FIELD_REGISTRY["short_text"]!;
        const serialized = reg.serializeAnswer(raw);
        return [{
          responseId: response!.id,
          fieldId:    field.id,
          fieldType:  field.type,
          ...serialized,
        }];
      });

    if (answersToInsert.length > 0) {
      await tx.insert(responseAnswersTable).values(answersToInsert as any[]);
    }

    await tx
      .update(formsTable)
      .set({ totalResponses: sql`${formsTable.totalResponses} + 1` })
      .where(eq(formsTable.id, form.id));

    return response!.id;
  }) as string | null;

  if (limitExceeded || !responseId) {
    return res.status(410).json({ code: "FORM_RESPONSE_LIMIT", message: "This form has reached its response limit" });
  }

  // Non-blocking side effects
  setImmediate(() => {
    safeEnqueue(getEmailQueue(), "new_response", {
      type:       "new_response",
      userId:     form.userId,
      formId:     form.id,
      responseId,
    });
    safeEnqueue(getAnalyticsQueue(), "track", {
      type:  "track_event",
      event: {
        formId:    form.id,
        eventType: "form_submit",
        responseId,
        sessionId: metadata?.sessionId,
      },
    });
    safeEnqueue(getWebhookQueue(), "dispatch", {
      formId:  form.id,
      event:   "form.response.created",
      payload: { formId: form.id, responseId },
    });
  });

  return res.status(200).json({
    success:     true,
    responseId,
    redirectUrl: form.successRedirectUrl ?? null,
    message:     form.successMessage ?? "Thank you for your response!",
  });
}
