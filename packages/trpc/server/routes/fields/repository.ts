// packages/trpc/server/routes/fields/repository.ts
import db from "@repo/database";
import { eq, desc } from "drizzle-orm";
import { fieldsTable } from "@repo/database";
import type { CreateFieldInput } from "./schema";

function toOutput(f: typeof fieldsTable.$inferSelect) {
  return {
    id:          f.id,
    formId:      f.formId,
    type:        f.type,
    label:       f.label,
    description: f.description ?? null,
    placeholder: f.placeholder ?? null,
    helpText:    f.helpText ?? null,
    required:    f.required,
    order:       f.order,
    config:      (f.config as Record<string, unknown>) ?? null,
    conditions:  f.conditions ?? null,
    createdAt:   f.createdAt.toISOString(),
    updatedAt:   f.updatedAt.toISOString(),
  };
}

export class FieldRepository {
  async addField(formId: string, input: CreateFieldInput) {
    const [field] = await db
      .insert(fieldsTable)
      .values({
        formId,
        type:        input.type,
        label:       input.label,
        description: input.description,
        placeholder: input.placeholder,
        helpText:    input.helpText,
        required:    input.required,
        order:       input.order,
        config:      input.config as any,
        conditions:  input.conditions as any,
      })
      .returning();
    return toOutput(field!);
  }

  async updateField(fieldId: string, data: Partial<CreateFieldInput>) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.label !== undefined)       updateData.label = data.label;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.placeholder !== undefined) updateData.placeholder = data.placeholder;
    if (data.helpText !== undefined)    updateData.helpText = data.helpText;
    if (data.required !== undefined)    updateData.required = data.required;
    if (data.order !== undefined)       updateData.order = data.order;
    if (data.config !== undefined)      updateData.config = data.config;
    if (data.conditions !== undefined)  updateData.conditions = data.conditions;

    const [field] = await db
      .update(fieldsTable)
      .set(updateData as any)
      .where(eq(fieldsTable.id, fieldId))
      .returning();
    return toOutput(field!);
  }

  async deleteField(fieldId: string) {
    await db.delete(fieldsTable).where(eq(fieldsTable.id, fieldId));
  }

  async reorderFields(fields: Array<{ id: string; order: number }>) {
    await Promise.all(
      fields.map(({ id, order }) =>
        db.update(fieldsTable).set({ order, updatedAt: new Date() }).where(eq(fieldsTable.id, id))
      )
    );
  }

  async duplicateField(fieldId: string) {
    const [source] = await db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.id, fieldId))
      .limit(1);

    if (!source) throw new Error("Field not found");

    // Get max order in form
    const siblings = await db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, source.formId))
      .orderBy(desc(fieldsTable.order))
      .limit(1);

    const newOrder = (siblings[0]?.order ?? 0) + 1;

    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = source;
    const [field] = await db
      .insert(fieldsTable)
      .values({ ...rest, order: newOrder, label: `${source.label} (Copy)` })
      .returning();

    return toOutput(field!);
  }
}
