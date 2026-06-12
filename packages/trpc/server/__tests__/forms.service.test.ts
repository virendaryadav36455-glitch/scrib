// packages/trpc/server/__tests__/forms.service.test.ts
import { describe, it, expect, vi } from "vitest";
import { FormService } from "../routes/forms/service";
import { FormRepository } from "../routes/forms/repository";

function makeFormRepo(overrides: Partial<Record<keyof FormRepository, any>> = {}) {
  const baseForm = {
    id:             "form-uuid-1",
    title:          "Test Form",
    description:    null,
    slug:           "test-form-abc",
    customSlug:     null,
    status:         "draft",
    visibility:     "public",
    totalResponses: 0,
    totalViews:     0,
    hasPassword:    false,
    responseLimit:  null,
    expiresAt:      null,
    publishedAt:    null,
    createdAt:      new Date().toISOString(),
    updatedAt:      new Date().toISOString(),
  };

  return {
    findById:            vi.fn().mockResolvedValue(baseForm),
    findByIdWithFields:  vi.fn().mockResolvedValue({ ...baseForm, fields: [], theme: null }),
    findByOwner:         vi.fn().mockResolvedValue(baseForm),
    findBySlug:          vi.fn().mockResolvedValue(null),
    listForUser:         vi.fn().mockResolvedValue({ forms: [baseForm], nextCursor: null, total: 1 }),
    countForUser:        vi.fn().mockResolvedValue(0),
    create:              vi.fn().mockResolvedValue(baseForm),
    update:              vi.fn().mockResolvedValue(baseForm),
    publish:             vi.fn().mockResolvedValue({ versionId: "ver-1", version: 1 }),
    unpublish:           vi.fn().mockResolvedValue(undefined),
    softDelete:          vi.fn().mockResolvedValue(undefined),
    duplicate:           vi.fn().mockResolvedValue({ ...baseForm, id: "form-copy-1" }),
    getPublicExplore:    vi.fn().mockResolvedValue({ forms: [], nextCursor: null }),
    toOutput:            vi.fn().mockImplementation((f: any) => f),
    ...overrides,
  } as unknown as FormRepository;
}

describe("FormService.assertOwnership", () => {
  it("returns form when user owns it", async () => {
    const repo = makeFormRepo();
    const svc  = new FormService(repo);
    const form = await svc.assertOwnership("form-uuid-1", "user-1");
    expect(form).toBeDefined();
    expect(repo.findByOwner).toHaveBeenCalledWith("form-uuid-1", "user-1");
  });

  it("throws FORM_NOT_FOUND when form does not belong to user", async () => {
    const repo = makeFormRepo({ findByOwner: vi.fn().mockResolvedValue(null) });
    const svc  = new FormService(repo);

    await expect(svc.assertOwnership("form-uuid-1", "other-user")).rejects.toMatchObject({
      message: expect.stringContaining("Form not found"),
    });
  });
});

describe("FormService.publish", () => {
  it("throws FORM_EMPTY when form has no fields", async () => {
    const repo = makeFormRepo({
      findByIdWithFields: vi.fn().mockResolvedValue({ id: "form-1", fields: [], status: "draft" }),
    });
    const svc  = new FormService(repo);

    await expect(svc.publish("form-1", "user-1")).rejects.toMatchObject({
      message: expect.stringContaining("no fields"),
    });
  });

  it("calls repository.publish when form has fields", async () => {
    const publish = vi.fn().mockResolvedValue({ versionId: "v1", version: 1 });
    const repo    = makeFormRepo({
      findByIdWithFields: vi.fn().mockResolvedValue({ id: "form-1", fields: [{ id: "f1" }], status: "draft" }),
      publish,
    });
    const svc = new FormService(repo);

    const result = await svc.publish("form-1", "user-1");
    expect(result.versionId).toBe("v1");
    expect(publish).toHaveBeenCalledWith("form-1", "user-1");
  });
});

describe("FormService.create", () => {
  it("delegates to repository.create with correct args", async () => {
    const create = vi.fn().mockResolvedValue({ id: "new-form", slug: "my-form-xyz" });
    const svc    = new FormService(makeFormRepo({ create }));

    const input  = { title: "My Form", visibility: "public" as const };
    await svc.create("user-1", input);
    expect(create).toHaveBeenCalledWith("user-1", input);
  });
});

describe("FormService.duplicate", () => {
  it("throws when form not found", async () => {
    const svc = new FormService(makeFormRepo({ duplicate: vi.fn().mockResolvedValue(null) }));
    await expect(svc.duplicate("bad-id", "user-1")).rejects.toMatchObject({
      message: "Form not found",
    });
  });

  it("returns the duplicated form", async () => {
    const copy = { id: "copy-id", slug: "copy-slug" };
    const svc  = new FormService(makeFormRepo({ duplicate: vi.fn().mockResolvedValue(copy) }));
    const result = await svc.duplicate("form-1", "user-1");
    expect(result.id).toBe("copy-id");
  });
});

describe("FormService.getPublicBySlug", () => {
  it("returns null for unpublished forms", async () => {
    const svc = new FormService(
      makeFormRepo({ findBySlug: vi.fn().mockResolvedValue({ status: "draft", slug: "test" }) })
    );
    const result = await svc.getPublicBySlug("test");
    expect(result).toBeNull();
  });

  it("returns null for expired forms", async () => {
    const pastDate = new Date(Date.now() - 86400_000).toISOString();
    const svc      = new FormService(
      makeFormRepo({
        findBySlug: vi.fn().mockResolvedValue({ status: "published", expiresAt: pastDate, slug: "test" }),
      })
    );
    const result = await svc.getPublicBySlug("test");
    expect(result).toBeNull();
  });

  it("returns requiresPassword flag when form is password protected and no password given", async () => {
    const svc = new FormService(
      makeFormRepo({
        findBySlug: vi.fn().mockResolvedValue({
          status:       "published",
          expiresAt:    null,
          passwordHash: "somehash",
          slug:         "locked",
          currentVersionId: null,
        }),
      })
    );
    const result = await svc.getPublicBySlug("locked");
    expect(result).toMatchObject({ requiresPassword: true });
  });
});
