// packages/trpc/server/__tests__/field.repository.test.ts
import { describe, it, expect, vi } from "vitest";
import { FieldRepository } from "../routes/fields/repository";

// The FieldRepository uses db from @repo/database (mocked in setup.ts)
// We test each method in isolation by configuring the mock chain

describe("FieldRepository.reorderFields", () => {
  it("issues one update per field", async () => {
    const db = (await import("@repo/database")).default as any;
    // Each update call returns a chainable object
    db.update.mockReturnThis();
    db.set.mockReturnThis();
    db.where.mockResolvedValue(undefined);

    const repo   = new FieldRepository();
    const fields = [
      { id: "f1", order: 0 },
      { id: "f2", order: 1 },
      { id: "f3", order: 2 },
    ];

    await repo.reorderFields(fields);
    // update should have been called once per field
    expect(db.update).toHaveBeenCalledTimes(3);
  });
});

describe("FieldRepository.addField", () => {
  it("inserts a field and returns output shape", async () => {
    const now     = new Date();
    const db      = (await import("@repo/database")).default as any;
    const inserted = {
      id:          "field-uuid",
      formId:      "form-uuid",
      type:        "short_text",
      label:       "Your name",
      description: null,
      placeholder: null,
      helpText:    null,
      required:    true,
      order:       0,
      config:      null,
      conditions:  null,
      createdAt:   now,
      updatedAt:   now,
    };

    db.insert.mockReturnThis();
    db.values.mockReturnThis();
    db.returning.mockResolvedValue([inserted]);

    const repo   = new FieldRepository();
    const result = await repo.addField("form-uuid", {
      type:     "short_text",
      label:    "Your name",
      required: true,
      order:    0,
    });

    expect(result.id).toBe("field-uuid");
    expect(result.formId).toBe("form-uuid");
    expect(result.createdAt).toBe(now.toISOString());
  });
});
