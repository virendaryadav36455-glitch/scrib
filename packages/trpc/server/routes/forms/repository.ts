// FILE: packages/trpc/server/routes/forms/repository.ts
import db from "@repo/database";
import {
  eq, and, isNull, lt, gt, ilike, desc, sql, count, lte
} from "drizzle-orm";
import {
  formsTable, formVersionsTable, fieldsTable, themesTable
} from "@repo/database/schema";
import type { CreateFormInput, UpdateFormInput } from "./schema";
import { randomBytes } from "node:crypto";
import { hashSync, compareSync } from "bcryptjs";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const suffix = randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}

function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyFormPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export class FormRepository {
  async findById(id: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), isNull(formsTable.deletedAt)))
      .limit(1);
    return form ?? null;
  }

  async findByIdWithFields(id: string, userId: string) {
    const form = await this.findByOwner(id, userId);
    if (!form) return null;

    const fields = await db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, id))
      .orderBy(fieldsTable.order);

    let theme = null;
    if (form.themeId) {
      const [t] = await db.select().from(themesTable).where(eq(themesTable.id, form.themeId)).limit(1);
      theme = t ?? null;
    }

    const serializedFields = fields.map((f) => ({
      ...f,
      description: f.description ?? null,
      placeholder: f.placeholder ?? null,
      helpText:    f.helpText ?? null,
      config:      (f.config as Record<string, unknown>) ?? null,
      conditions:  f.conditions ?? null,
      createdAt:   f.createdAt.toISOString(),
      updatedAt:   f.updatedAt.toISOString(),
    }));

    const serializedTheme = theme ? {
      id:         theme.id,
      name:       theme.name,
      slug:       theme.slug,
      isSystem:   theme.isSystem,
      category:   theme.category ?? null,
      tokensJson: theme.tokensJson as Record<string, string>,
      colors:     theme.colors as string[],
      isActive:   theme.isActive,
      usageCount: theme.usageCount,
      createdAt:  theme.createdAt.toISOString(),
    } : null;

    // FIX: include currentVersionId and version number so the builder header
    // can display "v2" without a separate API call.
    return {
      ...this.toOutput(form),
      fields:           serializedFields,
      theme:            serializedTheme,
      currentVersionId: form.currentVersionId ?? null,
      version:          form.currentVersionId
        ? await this._getVersionNumber(form.currentVersionId)
        : undefined,
    };
  }

  // Helper: look up the human-readable version number for a given version UUID
  async _getVersionNumber(versionId: string): Promise<number | undefined> {
    const [ver] = await db
      .select({ version: formVersionsTable.version })
      .from(formVersionsTable)
      .where(eq(formVersionsTable.id, versionId))
      .limit(1);
    return ver?.version;
  }

  async findByOwner(id: string, userId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId), isNull(formsTable.deletedAt)))
      .limit(1);
    return form ?? null;
  }

  async findBySlug(slug: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          isNull(formsTable.deletedAt),
          sql`(${formsTable.slug} = ${slug} OR ${formsTable.customSlug} = ${slug})`
        )
      )
      .limit(1);
    return form ?? null;
  }

  async listForUser(
    userId: string,
    opts: { cursor?: string; limit: number; status?: string; search?: string }
  ) {
    const conditions: ReturnType<typeof eq>[] = [
      eq(formsTable.userId, userId),
      isNull(formsTable.deletedAt) as any,
    ];

    if (opts.status) conditions.push(eq(formsTable.status, opts.status as any) as any);
    if (opts.search) conditions.push(ilike(formsTable.title, `%${opts.search}%`) as any);

    const [countRow] = await db
      .select({ total: count() })
      .from(formsTable)
      .where(and(...conditions));

    if (opts.cursor) {
      const [cursorForm] = await db
        .select({ createdAt: formsTable.createdAt })
        .from(formsTable)
        .where(eq(formsTable.id, opts.cursor))
        .limit(1);
      if (cursorForm) {
        conditions[conditions.length - 2] = lt(formsTable.createdAt, cursorForm.createdAt) as any;
        conditions.pop();
      }
    }

    const forms = await db
      .select()
      .from(formsTable)
      .where(and(...conditions))
      .orderBy(desc(formsTable.createdAt))
      .limit(opts.limit + 1);

    const hasMore = forms.length > opts.limit;
    const items   = hasMore ? forms.slice(0, opts.limit) : forms;

    return {
      forms:      items.map((f) => this.toOutput(f)),
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
      total:      Number(countRow?.total ?? 0),
    };
  }

  async countForUser(userId: string): Promise<number> {
    const [countRow] = await db
      .select({ total: count() })
      .from(formsTable)
      .where(and(eq(formsTable.userId, userId), isNull(formsTable.deletedAt)));
    return Number(countRow?.total ?? 0);
  }

  async create(userId: string, input: CreateFormInput) {
    const slug = generateSlug(input.title);
    const [form] = await db
      .insert(formsTable)
      .values({
        userId,
        title:       input.title,
        description: input.description,
        visibility:  input.visibility,
        themeId:     input.themeId,
        slug,
      })
      .returning();
    return this.toOutput(form!);
  }

  async update(id: string, input: UpdateFormInput) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.title !== undefined)              updateData.title = input.title;
    if (input.description !== undefined)        updateData.description = input.description;
    if (input.visibility !== undefined)         updateData.visibility = input.visibility;
    if (input.themeId !== undefined)            updateData.themeId = input.themeId;
    if (input.customSlug !== undefined)         updateData.customSlug = input.customSlug;
    if (input.successMessage !== undefined)     updateData.successMessage = input.successMessage;
    if (input.successRedirectUrl !== undefined) updateData.successRedirectUrl = input.successRedirectUrl;
    if (input.responseLimit !== undefined)      updateData.responseLimit = input.responseLimit;
    if (input.expiresAt !== undefined)          updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (input.password !== undefined) {
      updateData.passwordHash = input.password ? hashPassword(input.password) : null;
    }

    const [updated] = await db
      .update(formsTable)
      .set(updateData as any)
      .where(eq(formsTable.id, id))
      .returning();
    return this.toOutput(updated!);
  }

  async publish(id: string, userId: string) {
    const fields = await db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, id))
      .orderBy(fieldsTable.order);

    const versions = await db
      .select({ version: formVersionsTable.version })
      .from(formVersionsTable)
      .where(eq(formVersionsTable.formId, id))
      .orderBy(desc(formVersionsTable.version))
      .limit(1);

    const nextVersion = (versions[0]?.version ?? 0) + 1;

    const [version] = await db
      .insert(formVersionsTable)
      .values({
        formId:      id,
        version:     nextVersion,
        fieldsJson:  fields,
        publishedBy: userId,
      })
      .returning();

    await db
      .update(formsTable)
      .set({
        status:           "published",
        publishedAt:      new Date(),
        currentVersionId: version!.id,
        updatedAt:        new Date(),
      })
      .where(eq(formsTable.id, id));

    return { versionId: version!.id, version: nextVersion };
  }

  async unpublish(id: string) {
    await db
      .update(formsTable)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(formsTable.id, id));
  }

  async softDelete(id: string) {
    await db
      .update(formsTable)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(formsTable.id, id));
  }

  async duplicate(id: string, userId: string) {
    const source = await this.findById(id);
    if (!source) return null;

    const newSlug = generateSlug(`${source.title}-copy`);
    const [newForm] = await db
      .insert(formsTable)
      .values({
        userId,
        title:       `${source.title} (Copy)`,
        description: source.description,
        visibility:  source.visibility,
        themeId:     source.themeId,
        slug:        newSlug,
        status:      "draft",
      })
      .returning();

    const fields = await db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, id))
      .orderBy(fieldsTable.order);

    if (fields.length > 0) {
      await db.insert(fieldsTable).values(
        fields.map(({ id: _id, createdAt: _c, updatedAt: _u, ...f }) => ({
          ...f,
          formId: newForm!.id,
        }))
      );
    }

    return this.toOutput(newForm!);
  }

  async getPublicExplore(opts: { cursor?: string; limit: number; category?: string }) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public"),
          isNull(formsTable.deletedAt)
        )
      )
      .orderBy(desc(formsTable.totalResponses))
      .limit(opts.limit + 1);

    const hasMore = forms.length > opts.limit;
    const items   = hasMore ? forms.slice(0, opts.limit) : forms;

    return {
      forms:      items.map((f) => this.toOutput(f)),
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }

  toOutput(form: typeof formsTable.$inferSelect) {
    return {
      id:             form.id,
      title:          form.title,
      description:    form.description ?? null,
      slug:           form.slug,
      customSlug:     form.customSlug ?? null,
      status:         form.status,
      visibility:     form.visibility,
      totalResponses: form.totalResponses,
      totalViews:     form.totalViews,
      hasPassword:    !!form.passwordHash,
      responseLimit:  form.responseLimit ?? null,
      expiresAt:      form.expiresAt?.toISOString() ?? null,
      publishedAt:    form.publishedAt?.toISOString() ?? null,
      createdAt:      form.createdAt.toISOString(),
      updatedAt:      form.updatedAt.toISOString(),
    };
  }
}