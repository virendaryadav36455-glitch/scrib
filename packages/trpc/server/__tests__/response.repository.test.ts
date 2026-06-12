// packages/trpc/server/__tests__/response.repository.test.ts
import { describe, it, expect, vi } from "vitest";
import { ResponseRepository } from "../routes/responses/repository";

describe("ResponseRepository.createExportJob", () => {
  it("returns the new export job ID", async () => {
    const db = (await import("@repo/database")).default as any;
    db.insert.mockReturnThis();
    db.values.mockReturnThis();
    db.returning.mockResolvedValue([{ id: "export-job-1" }]);

    const repo   = new ResponseRepository();
    const jobId  = await repo.createExportJob("form-1", "user-1", "csv");
    expect(jobId).toBe("export-job-1");
  });
});

describe("ResponseRepository.getExportStatus", () => {
  it("returns pending when job does not exist", async () => {
    const db = (await import("@repo/database")).default as any;
    db.select.mockReturnThis();
    db.from.mockReturnThis();
    db.where.mockReturnThis();
    db.limit.mockResolvedValue([]);

    const repo   = new ResponseRepository();
    const status = await repo.getExportStatus("nonexistent");
    expect(status.status).toBe("pending");
    expect(status.fileUrl).toBeNull();
  });

  it("returns done and fileUrl when job is complete", async () => {
    const db = (await import("@repo/database")).default as any;
    db.select.mockReturnThis();
    db.from.mockReturnThis();
    db.where.mockReturnThis();
    db.limit.mockResolvedValue([{ status: "done", fileUrl: "https://cdn.example.com/export.csv" }]);

    const repo   = new ResponseRepository();
    const status = await repo.getExportStatus("job-1");
    expect(status.status).toBe("done");
    expect(status.fileUrl).toBe("https://cdn.example.com/export.csv");
  });
});
