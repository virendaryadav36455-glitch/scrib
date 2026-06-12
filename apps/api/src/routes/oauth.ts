// apps/api/src/routes/oauth.ts
// Google OAuth as plain Express routes (not tRPC) because they involve redirects
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { randomBytes } from "node:crypto";
import { AuthRepository } from "@repo/trpc/server";
import { env } from "../env";

const authRepo = new AuthRepository();

export const oauthRouter = Router();

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.BASE_URL}/auth/google/callback`
  );

  // Step 1 — Redirect to Google
  oauthRouter.get("/auth/google/redirect", (_req, res) => {
    const state = randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, {
      httpOnly: true,
      maxAge:   10 * 60 * 1000,
      sameSite: "lax",
    });
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope:       ["email", "profile"],
      state,
    });
    res.redirect(url);
  });

  // Step 2 — Receive code, create session, redirect to frontend
  oauthRouter.get("/auth/google/callback", async (req, res) => {
    const code        = req.query["code"] as string | undefined;
    const state       = req.query["state"] as string | undefined;
    const cookieState = (req.cookies as Record<string, string>)?.["oauth_state"];

    if (!state || state !== cookieState) {
      return res.redirect(`${env.WEB_URL}/login?error=oauth_state_mismatch`);
    }
    if (!code) {
      return res.redirect(`${env.WEB_URL}/login?error=missing_code`);
    }

    try {
      const tokenRes = await client.getToken(code);
      const tokens   = tokenRes.tokens;
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken:  tokens.id_token!,
        audience: env.GOOGLE_CLIENT_ID!,
      });
      const payload = ticket.getPayload()!;

      const user = await authRepo.upsertOAuthUser({
        email:          payload.email!,
        fullName:       payload.name ?? null,
        avatarUrl:      payload.picture ?? null,
        authProvider:   "google",
        providerUserId: payload.sub,
      });

      const token = randomBytes(64).toString("hex");
      await authRepo.createSession({
        userId:    user.id,
        token,
        ipAddress: req.ip ?? "",
        userAgent: req.headers["user-agent"] ?? "",
      });

      const isProd = env.NODE_ENV === "production";

      const COOKIE_OPTIONS = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" as const : "lax" as const,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      };

      res.cookie("sf_session", token, COOKIE_OPTIONS);

      return res.send(`
        <script>
          window.location.href = "${env.WEB_URL}/dashboard";
        </script>
      `);
    } catch (err) {
      console.error("[OAuth] Google callback error:", err);
      return res.redirect(`${env.WEB_URL}/login?error=oauth_failed`);
    }
  });
}
