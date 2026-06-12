// packages/queues/src/index.ts
import { Queue } from "bullmq";
import Redis from "ioredis";

let bullRedis: Redis | null = null;

function getBullRedis(): Redis {
  if (!bullRedis) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    bullRedis = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return bullRedis;
}

function makeQueue(name: string): Queue {
  const connection = getBullRedis();
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
}

// Lazy singletons — created once needed
let _emailQueue: Queue | null = null;
let _webhookQueue: Queue | null = null;
let _analyticsQueue: Queue | null = null;
let _exportQueue: Queue | null = null;

export function getEmailQueue(): Queue {
  if (!_emailQueue) _emailQueue = makeQueue("email");
  return _emailQueue;
}

export function getWebhookQueue(): Queue {
  if (!_webhookQueue) _webhookQueue = makeQueue("webhook");
  return _webhookQueue;
}

export function getAnalyticsQueue(): Queue {
  if (!_analyticsQueue) _analyticsQueue = makeQueue("analytics");
  return _analyticsQueue;
}

export function getExportQueue(): Queue {
  if (!_exportQueue) _exportQueue = makeQueue("export");
  return _exportQueue;
}

// Safe enqueue — never throws, used for fire-and-forget side effects
export async function safeEnqueue(
  queue: Queue,
  jobName: string,
  data: unknown
): Promise<void> {
  try {
    await queue.add(jobName, data);
  } catch {
    // Non-fatal: queues may not be available in all environments
  }
}
