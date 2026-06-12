// packages/trpc/server/routes/themes/repository.ts
import db from "@repo/database";
import { eq, and, or, isNull, ilike, sql } from "drizzle-orm";
import { themesTable, formsTable } from "@repo/database";

export class ThemeRepository {
  async list(opts: { category?: string; search?: string; includeSystem: boolean; includeUser: boolean; userId?: string }) {
    const conditions: any[] = [eq(themesTable.isActive, true)];

    if (opts.search) conditions.push(ilike(themesTable.name, `%${opts.search}%`));
    if (opts.category) conditions.push(eq(themesTable.category, opts.category));

    const visibility: any[] = [];
    if (opts.includeSystem) visibility.push(eq(themesTable.isSystem, true));
    if (opts.includeUser && opts.userId) visibility.push(eq(themesTable.userId, opts.userId));
    if (visibility.length > 0) conditions.push(or(...visibility));

    const themes = await db
      .select()
      .from(themesTable)
      .where(and(...conditions));

    return {
      themes: themes.map((t) => ({
        id:         t.id,
        name:       t.name,
        slug:       t.slug,
        isSystem:   t.isSystem,
        category:   t.category ?? null,
        tokensJson: t.tokensJson as Record<string, string>,
        colors:     t.colors as string[],
        isActive:   t.isActive,
        usageCount: t.usageCount,
        createdAt:  t.createdAt.toISOString(),
      })),
    };
  }

  async applyToForm(formId: string, themeId: string, userId: string) {
    // Verify ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);
    if (!form) throw new Error("Form not found");

    await db
      .update(formsTable)
      .set({ themeId, updatedAt: new Date() })
      .where(eq(formsTable.id, formId));

    // Increment usage count atomically
    await db
      .update(themesTable)
      .set({ usageCount: sql`${themesTable.usageCount} + 1` })
      .where(eq(themesTable.id, themeId));
  }

  async findById(id: string) {
    const [theme] = await db
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, id))
      .limit(1);
    return theme ?? null;
  }
}
