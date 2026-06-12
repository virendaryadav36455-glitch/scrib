// apps/worker/src/workers/email.worker.ts
import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    // No Resend key → log to console (graceful degradation in dev)
    console.log(`[Email][Dev] To: ${to} | Subject: ${subject}`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const from   = process.env["EMAIL_FROM"] ?? "ScribbleForms <noreply@scribbleforms.dev>";
  await resend.emails.send({ from, to, subject, html });
}

export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type } = job.data as { type: string };
    const webUrl  = process.env["WEB_URL"] ?? "http://localhost:3000";

    switch (type) {
      case "welcome": {
        const { email, name } = job.data as { email: string; name: string };
        await sendEmail(
          email,
          "Welcome to ScribbleForms 🎉",
          `<h1>Welcome, ${name || "Creator"}!</h1>
           <p>Your account is ready. Start building beautiful forms at
           <a href="${webUrl}">${webUrl}</a>.</p>`
        );
        break;
      }
      case "password_reset": {
        const { email, token } = job.data as { email: string; token: string };
        await sendEmail(
          email,
          "Reset your ScribbleForms password",
          `<h1>Password Reset</h1>
           <p>Click <a href="${webUrl}/reset-password?token=${token}">here</a>
           to reset your password. This link expires in 1 hour.</p>`
        );
        break;
      }
      case "new_response": {
        const { email, formId } = job.data as { email: string; formId: string };
        if (!email) break;
        await sendEmail(
          email,
          "New form response received",
          `<h1>You have a new response!</h1>
           <p>Someone submitted your form.
           <a href="${webUrl}/dashboard/forms/${formId}/responses">View it here</a>.</p>`
        );
        break;
      }
      case "export_ready": {
        const { email, fileUrl } = job.data as { email: string; fileUrl: string };
        await sendEmail(
          email,
          "Your export is ready",
          `<h1>Export Ready</h1>
           <p>Your response export is ready.
           <a href="${fileUrl}">Download it here</a>.
           The link expires in 24 hours.</p>`
        );
        break;
      }
      default:
        console.warn(`[Email] Unknown type: ${type}`);
    }
  },
  { connection, concurrency: 5 }
);

emailWorker.on("failed", (job, err) => {
  console.error(`[Email][Failed] job=${job?.id}`, err.message);
});
