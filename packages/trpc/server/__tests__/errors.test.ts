// packages/trpc/server/__tests__/errors.test.ts
import { describe, it, expect } from "vitest";
import { domainError, ERROR_CODES } from "../errors";
import { TRPCError } from "@trpc/server";

describe("domainError", () => {
  it("returns a TRPCError instance", () => {
    const err = domainError("EMAIL_TAKEN", "Email taken", "CONFLICT");
    expect(err).toBeInstanceOf(TRPCError);
  });

  it("sets the correct tRPC HTTP code", () => {
    const err = domainError("FORM_NOT_FOUND", "Not found", "NOT_FOUND");
    expect(err.code).toBe("NOT_FOUND");
  });

  it("attaches domainCode in cause for frontend consumption", () => {
    const err = domainError("INVALID_CREDENTIALS", "Bad creds", "UNAUTHORIZED");
    expect((err.cause as any)?.domainCode).toBe("INVALID_CREDENTIALS");
  });

  it("defaults httpStatus to BAD_REQUEST", () => {
    const err = domainError("VALIDATION_FAILED", "Failed");
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("covers every ERROR_CODE key without throwing", () => {
    for (const code of Object.keys(ERROR_CODES) as Array<keyof typeof ERROR_CODES>) {
      expect(() => domainError(code, "test message")).not.toThrow();
    }
  });
});
