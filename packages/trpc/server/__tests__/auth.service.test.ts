// packages/trpc/server/__tests__/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../routes/auth/service";
import { AuthRepository } from "../routes/auth/repository";

// ── Helpers ─────────────────────────────────────────────────────────────────
function makeRepo(overrides: Partial<Record<keyof AuthRepository, any>> = {}) {
  return {
    findUserByEmail:      vi.fn().mockResolvedValue(null),
    createUser:           vi.fn(),
    createSession:        vi.fn().mockResolvedValue({ token: "tok", expiresAt: new Date() }),
    findValidSession:     vi.fn().mockResolvedValue(null),
    deleteSession:        vi.fn().mockResolvedValue(undefined),
    deleteAllUserSessions: vi.fn().mockResolvedValue(undefined),
    setResetToken:        vi.fn().mockResolvedValue(undefined),
    findUserByResetToken: vi.fn().mockResolvedValue(null),
    updatePassword:       vi.fn().mockResolvedValue(undefined),
    updateProfile:        vi.fn().mockResolvedValue(undefined),
    upsertOAuthUser:      vi.fn(),
    ...overrides,
  } as unknown as AuthRepository;
}

const VALID_SIGNUP = {
  fullName: "Alice Test",
  email:    "alice@example.com",
  password: "Password1",
};

const VALID_USER = {
  id:        "uuid-1",
  email:     "alice@example.com",
  fullName:  "Alice Test",
  plan:      "free" as const,
  avatarUrl: null,
  salt:      "abc123def456abc1",
  password:  "", // will be set
};

// ── signup ───────────────────────────────────────────────────────────────────
describe("AuthService.signup", () => {
  it("creates user and session when email is new", async () => {
    const salt = "1234567890abcdef";
    const svc  = new AuthService(
      makeRepo({
        findUserByEmail: vi.fn().mockResolvedValue(null),
        createUser: vi.fn().mockResolvedValue({ id: "uuid-1", email: VALID_SIGNUP.email, fullName: VALID_SIGNUP.fullName, plan: "free", avatarUrl: null }),
        createSession: vi.fn().mockResolvedValue({ token: "session-token", expiresAt: new Date() }),
      })
    );

    const result = await svc.signup(VALID_SIGNUP, "127.0.0.1", "TestAgent");
    expect(result.user.email).toBe(VALID_SIGNUP.email);
    expect(result.token).toBeTruthy();
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(60);
  });

  it("throws EMAIL_TAKEN when email already exists", async () => {
    const svc = new AuthService(
      makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(VALID_USER) })
    );

    await expect(svc.signup(VALID_SIGNUP, "127.0.0.1", "ua")).rejects.toMatchObject({
      message: expect.stringContaining("email already exists"),
    });
  });

  it("generates unique tokens for two signups", async () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const svc = new AuthService(
        makeRepo({
          createUser: vi.fn().mockResolvedValue({ id: `uid-${i}`, email: `u${i}@test.com`, fullName: null, plan: "free", avatarUrl: null }),
          createSession: vi.fn().mockResolvedValue({ token: "t", expiresAt: new Date() }),
        })
      );
      const { token } = await svc.signup({ ...VALID_SIGNUP, email: `u${i}@test.com` }, "", "");
      tokens.add(token);
    }
    expect(tokens.size).toBe(5);
  });
});

// ── login ────────────────────────────────────────────────────────────────────
describe("AuthService.login", () => {
  it("returns user and token on correct credentials", async () => {
    const svc    = new AuthService(makeRepo()); // build salt+hash fresh
    const helper = new AuthService(makeRepo());
    const salt   = "testsalt12345678";
    const hash   = helper.hashPassword("Password1", salt);

    const userWithHash = { ...VALID_USER, salt, password: hash };
    const repo = makeRepo({
      findUserByEmail: vi.fn().mockResolvedValue(userWithHash),
      createSession:   vi.fn().mockResolvedValue({ token: "tok", expiresAt: new Date() }),
    });
    const service = new AuthService(repo);

    const result = await service.login({ email: "alice@example.com", password: "Password1" }, "127.0.0.1", "ua");
    expect(result.user.email).toBe("alice@example.com");
    expect(result.token).toBeTruthy();
  });

  it("throws INVALID_CREDENTIALS on wrong password", async () => {
    const salt = "testsalt12345678";
    const hash = new AuthService(makeRepo()).hashPassword("RealPass1", salt);
    const repo = makeRepo({
      findUserByEmail: vi.fn().mockResolvedValue({ ...VALID_USER, salt, password: hash }),
    });
    const svc  = new AuthService(repo);

    await expect(
      svc.login({ email: "alice@example.com", password: "WrongPass1" }, "", "")
    ).rejects.toMatchObject({ message: "Wrong email or password" });
  });

  it("throws INVALID_CREDENTIALS when user not found (same message — no enumeration)", async () => {
    const svc = new AuthService(makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(null) }));

    await expect(
      svc.login({ email: "nobody@example.com", password: "Password1" }, "", "")
    ).rejects.toMatchObject({ message: "Wrong email or password" });
  });
});

// ── logout ───────────────────────────────────────────────────────────────────
describe("AuthService.logout", () => {
  it("deletes session and invalidates redis cache", async () => {
    const deleteSession = vi.fn().mockResolvedValue(undefined);
    const { cacheDel }  = await import("@repo/redis");

    const svc = new AuthService(makeRepo({ deleteSession }));
    await svc.logout("my-token");

    expect(deleteSession).toHaveBeenCalledWith("my-token");
    expect(cacheDel).toHaveBeenCalledWith("sf:session:my-token");
  });
});

// ── forgotPassword ────────────────────────────────────────────────────────────
describe("AuthService.forgotPassword", () => {
  it("always returns success=true regardless of whether email exists", async () => {
    const noUser = new AuthService(makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(null) }));
    const res1   = await noUser.forgotPassword("ghost@example.com", vi.fn());
    expect(res1.success).toBe(true);

    const withUser = new AuthService(makeRepo({
      findUserByEmail: vi.fn().mockResolvedValue(VALID_USER),
      setResetToken:   vi.fn().mockResolvedValue(undefined),
    }));
    const res2 = await withUser.forgotPassword("alice@example.com", vi.fn());
    expect(res2.success).toBe(true);
  });

  it("calls sendEmail callback when user exists", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const svc  = new AuthService(makeRepo({
      findUserByEmail: vi.fn().mockResolvedValue(VALID_USER),
      setResetToken:   vi.fn().mockResolvedValue(undefined),
    }));
    await svc.forgotPassword("alice@example.com", send);
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]![0]).toMatchObject({ email: "alice@example.com" });
  });

  it("does NOT call sendEmail when user not found (anti-enumeration)", async () => {
    const send = vi.fn();
    const svc  = new AuthService(makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(null) }));
    await svc.forgotPassword("nobody@example.com", send);
    expect(send).not.toHaveBeenCalled();
  });
});

// ── resetPassword ─────────────────────────────────────────────────────────────
describe("AuthService.resetPassword", () => {
  it("updates password when token is valid", async () => {
    const updatePassword = vi.fn().mockResolvedValue(undefined);
    const svc = new AuthService(makeRepo({
      findUserByResetToken: vi.fn().mockResolvedValue(VALID_USER),
      updatePassword,
    }));

    const result = await svc.resetPassword("valid-token", "NewPass1");
    expect(result.success).toBe(true);
    expect(updatePassword).toHaveBeenCalledOnce();
  });

  it("throws RESET_TOKEN_INVALID on expired/missing token", async () => {
    const svc = new AuthService(makeRepo({ findUserByResetToken: vi.fn().mockResolvedValue(null) }));

    await expect(svc.resetPassword("bad-token", "NewPass1")).rejects.toMatchObject({
      message: expect.stringContaining("Invalid or expired reset token"),
    });
  });
});

// ── hashPassword ─────────────────────────────────────────────────────────────
describe("AuthService.hashPassword", () => {
  const svc = new AuthService(makeRepo());

  it("produces a consistent hash for the same input", () => {
    const h1 = svc.hashPassword("Password1", "salt123");
    const h2 = svc.hashPassword("Password1", "salt123");
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different salts", () => {
    const h1 = svc.hashPassword("Password1", "saltA");
    const h2 = svc.hashPassword("Password1", "saltB");
    expect(h1).not.toBe(h2);
  });

  it("produces different hashes for different passwords", () => {
    const h1 = svc.hashPassword("PasswordA1", "salt");
    const h2 = svc.hashPassword("PasswordB1", "salt");
    expect(h1).not.toBe(h2);
  });

  it("never returns plain text", () => {
    const h = svc.hashPassword("MySecret1", "salt");
    expect(h).not.toContain("MySecret1");
  });
});
