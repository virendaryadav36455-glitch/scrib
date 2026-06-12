// packages/trpc/server/routes/auth/repository.ts
import db from "@repo/database";
import { eq, and, gt, isNull } from "drizzle-orm";
import { usersTable, sessionsTable } from "@repo/database";

export class AuthRepository {
  async findUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email.toLowerCase()), isNull(usersTable.deletedAt)))
      .limit(1);
    return user ?? null;
  }

  async createUser(payload: {
    fullName: string;
    email: string;
    password: string;
    salt: string;
  }) {
    const [user] = await db
      .insert(usersTable)
      .values({
        email:        payload.email.toLowerCase(),
        fullName:     payload.fullName,
        password:     payload.password,
        salt:         payload.salt,
        authProvider: "email",
      })
      .returning({
        id:       usersTable.id,
        email:    usersTable.email,
        fullName: usersTable.fullName,
        plan:     usersTable.plan,
        avatarUrl: usersTable.avatarUrl,
      });
    return user!;
  }

  async upsertOAuthUser(payload: {
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    authProvider: "google" | "github";
    providerUserId: string;
  }) {
    // Try find existing
    const existing = await this.findUserByEmail(payload.email);
    if (existing) return existing;

    const [user] = await db
      .insert(usersTable)
      .values({
        email:          payload.email.toLowerCase(),
        fullName:       payload.fullName,
        avatarUrl:      payload.avatarUrl,
        authProvider:   payload.authProvider,
        providerUserId: payload.providerUserId,
        emailVerified:  true,
      })
      .returning({
        id:       usersTable.id,
        email:    usersTable.email,
        fullName: usersTable.fullName,
        plan:     usersTable.plan,
        avatarUrl: usersTable.avatarUrl,
      });
    return user!;
  }

  async createSession(payload: {
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ ...payload, expiresAt });
    return { token: payload.token, expiresAt };
  }

  async findValidSession(token: string) {
    const [session] = await db
      .select({
        user: {
          id:        usersTable.id,
          email:     usersTable.email,
          fullName:  usersTable.fullName,
          plan:      usersTable.plan,
          avatarUrl: usersTable.avatarUrl,
        },
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
      .where(
        and(
          eq(sessionsTable.token, token),
          gt(sessionsTable.expiresAt, new Date())
        )
      )
      .limit(1);
    return session ?? null;
  }

  async deleteSession(token: string) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  async deleteAllUserSessions(userId: string) {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
  }

  async setResetToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.update(usersTable)
      .set({ resetToken: token, resetExpiresAt: expiresAt })
      .where(eq(usersTable.id, userId));
  }

  async findUserByResetToken(token: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.resetToken, token),
          gt(usersTable.resetExpiresAt!, new Date())
        )
      )
      .limit(1);
    return user ?? null;
  }

  async updatePassword(userId: string, password: string, salt: string) {
    await db.update(usersTable)
      .set({ password, salt, resetToken: null, resetExpiresAt: null })
      .where(eq(usersTable.id, userId));
  }

  async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string | null }) {
    await db.update(usersTable).set(data).where(eq(usersTable.id, userId));
  }
}
