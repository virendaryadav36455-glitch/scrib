// apps/worker/src/index.ts
import "dotenv/config";
import { emailWorker }    from "./workers/email.worker";
import { webhookWorker }  from "./workers/webhook.worker";
import { analyticsWorker } from "./workers/analytics.worker";
import { exportWorker }   from "./workers/export.worker";

console.log("🔧 ScribbleForms Worker starting...");

const workers = [emailWorker, webhookWorker, analyticsWorker, exportWorker];

// Graceful shutdown
const shutdown = async () => {
  console.log("Worker shutting down...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown);

workers.forEach((w) => {
  w.on("ready",  () => console.log(`✅ Worker [${w.name}] ready`));
  w.on("error",  (err) => console.error(`❌ Worker [${w.name}] error:`, err.message));
});

console.log("✅ All workers started");
