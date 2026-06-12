// packages/trpc/server/routes/auth/service.ts
import { randomBytes, createHmac } from "node:crypto";
import { AuthRepository } from "./repository";
import type { SignupInput, LoginInput } from "./schema";
import { domainError } from "../../errors";
import { cacheDel } from "@repo/redis";
import { AUTH_COOKIE_NAME } from "./constants";

export class AuthService {
  constructor(private repository: AuthRepository) {}

  hashPassword(password: string, salt: string): string {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  async signup(payload: SignupInput, ipAddress: string, userAgent: string) {
    const existing = await this.repository.findUserByEmail(payload.email);
    if (existing) {
      throw domainError("EMAIL_TAKEN", "An account with this email already exists", "CONFLICT");
    }

    const salt  = randomBytes(16).toString("hex");
    const hash  = this.hashPassword(payload.password, salt);
    const user  = await this.repository.createUser({ ...payload, password: hash, salt });
    const token = randomBytes(64).toString("hex");
    await this.repository.createSession({ userId: user.id, token, ipAddress, userAgent });

    return { user, token };
  }

  async login(payload: LoginInput, ipAddress: string, userAgent: string) {
    const user = await this.repository.findUserByEmail(payload.email);
    // Same message for wrong email AND wrong password — prevents user enumeration
    if (!user || !user.salt || !user.password) {
      throw domainError("INVALID_CREDENTIALS", "Wrong email or password", "UNAUTHORIZED");
    }

    const hash = this.hashPassword(payload.password, user.salt);
    if (hash !== user.password) {
      throw domainError("INVALID_CREDENTIALS", "Wrong email or password", "UNAUTHORIZED");
    }

    const token = randomBytes(64).toString("hex");
    await this.repository.createSession({ userId: user.id, token, ipAddress, userAgent });

    return {
      user: {
        id:        user.id,
        email:     user.email,
        fullName:  user.fullName ?? null,
        plan:      user.plan,
        avatarUrl: user.avatarUrl ?? null,
      },
      token,
    };
  }

  async logout(token: string) {
    await cacheDel(`sf:session:${token}`);
    await this.repository.deleteSession(token);
  }

  async forgotPassword(email: string, sendEmail: (data: { email: string; token: string }) => Promise<void>) {
    const user = await this.repository.findUserByEmail(email);
    // Always return success — never leak whether email exists
    if (user) {
      const token = randomBytes(64).toString("hex");
      await this.repository.setResetToken(user.id, token);
      await Promise.resolve(sendEmail({ email: user.email, token })).catch(() => {});
    }
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.repository.findUserByResetToken(token);
    if (!user) {
      throw domainError("RESET_TOKEN_INVALID", "Invalid or expired reset token", "BAD_REQUEST");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = this.hashPassword(newPassword, salt);
    await this.repository.updatePassword(user.id, hash, salt);
    return { success: true };
  }

  async updateProfile(
    userId: string,
    token: string | undefined,
    data: { fullName?: string; avatarUrl?: string | null }
  ) {
    await this.repository.updateProfile(userId, data);
    if (token) await cacheDel(`sf:session:${token}`);
    return { success: true };
  }
}
