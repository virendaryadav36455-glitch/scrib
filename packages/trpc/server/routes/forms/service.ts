// FILE: packages/trpc/server/routes/forms/service.ts
import { FormRepository } from "./repository";
import type { CreateFormInput, UpdateFormInput } from "./schema";
import { domainError } from "../../errors";
import { verifyFormPassword } from "./repository";

export class FormService {
  constructor(private repository: FormRepository) {}

  async listForUser(userId: string, opts: { cursor?: string; limit: number; status?: string; search?: string }) {
    return this.repository.listForUser(userId, opts);
  }

  async countForUser(userId: string) {
    return this.repository.countForUser(userId);
  }

  async getByIdForUser(id: string, userId: string) {
    return this.repository.findByIdWithFields(id, userId);
  }

  async getPublicBySlug(slug: string, password?: string) {
    const form = await this.repository.findBySlug(slug);
    if (!form) return null;
    if (form.status !== "published") return null;
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) return null;

    // FIX: was returning `null` on wrong password — frontend got a 404-like error
    // with no way to distinguish "not found" from "wrong password".
    // Now returns { requiresPassword: true, wrongPassword: true } so the
    // PasswordGate component can show "Incorrect password" feedback.
    if (form.passwordHash) {
      if (!password) return { requiresPassword: true };
      const valid = verifyFormPassword(password, form.passwordHash);
      if (!valid) return { requiresPassword: true, wrongPassword: true };
    }

    // Load fields from the published version snapshot (not the live draft fields)
    // so respondents always see the version that was published, not in-progress edits.
    let fields: unknown[] = [];
    if (form.currentVersionId) {
      const db = (await import("@repo/database")).default;
      const { formVersionsTable } = await import("@repo/database/schema");
      const { eq } = await import("drizzle-orm");
      const [ver] = await db
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.id, form.currentVersionId))
        .limit(1);
      fields = (ver?.fieldsJson as unknown[]) ?? [];
    }

    return {
      ...this.repository.toOutput(form),
      fields,
      currentVersionId: form.currentVersionId,
    };
  }

  async create(userId: string, input: CreateFormInput) {
    return this.repository.create(userId, input);
  }

  async update(id: string, input: UpdateFormInput) {
    return this.repository.update(id, input);
  }

  async assertOwnership(formId: string, userId: string) {
    const form = await this.repository.findByOwner(formId, userId);
    if (!form) {
      throw domainError("FORM_NOT_FOUND", "Form not found or you don't have access", "NOT_FOUND");
    }
    return form;
  }

  async publish(id: string, userId: string) {
    const form = await this.repository.findByIdWithFields(id, userId);
    if (!form || !form.fields || form.fields.length === 0) {
      throw domainError("FORM_EMPTY", "Cannot publish a form with no fields", "BAD_REQUEST");
    }
    return this.repository.publish(id, userId);
  }

  async unpublish(id: string) {
    return this.repository.unpublish(id);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }

  async duplicate(id: string, userId: string) {
    const result = await this.repository.duplicate(id, userId);
    if (!result) throw domainError("FORM_NOT_FOUND", "Form not found", "NOT_FOUND");
    return result;
  }

  async getPublicExplore(opts: { cursor?: string; limit: number; category?: string }) {
    return this.repository.getPublicExplore(opts);
  }
}