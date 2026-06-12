# Workers, Redis & Webhooks — Complete Line-by-Line Tutorial

> Written for someone seeing these concepts for the first time.
> Every line of actual code is explained. No skipping anything.

---

## SECTION 1 — THE BIG PICTURE (Start Here)

### The Restaurant Kitchen Analogy

Imagine a busy restaurant:
- **The Waiter** (API server) takes your order and says "Done, enjoy!" immediately
- **The Kitchen** (Worker) actually cooks the food separately, in the background
- **The Order Ticket Board** (Redis / BullMQ) holds all pending orders

Without this separation, the waiter would stand at your table waiting while the kitchen cooked — you'd wait 10 minutes just to order. With this separation, the waiter says "done!" in 2 seconds, and the kitchen processes everything in the background.

**In ScribbleForms:**
```
User submits a form
      ↓
API saves response to DB  ← takes ~5ms, user gets "Thank you!" immediately
      ↓ (same time, non-blocking)
API puts 3 jobs into Redis queue:
  1. "send email to creator"
  2. "fire webhook to Slack"
  3. "update analytics counts"
      ↓
Worker (separate program) picks up jobs from queue and processes them
  - sends email    ← takes ~400ms, user doesn't wait
  - fires webhook  ← takes ~200ms, user doesn't wait
  - updates DB     ← takes ~20ms,  user doesn't wait
```

---

## SECTION 2 — REDIS EXPLAINED FROM SCRATCH

### What Redis Actually Is

Redis is a program that stores data **in RAM (memory)** instead of on disk like PostgreSQL.

```
PostgreSQL (disk):   [💾 hard drive] → reading takes ~5ms
Redis     (memory):  [⚡ RAM]        → reading takes ~0.5ms
```

Think of it as a giant dictionary/hashmap living in RAM:
```
key                          → value
"sf:session:abc123..."       → '{"id":"u1","email":"a@b.com","plan":"free"}'
"sf:form:public:my-form"     → '{"id":"f1","title":"Survey",...}'
"sf:dashboard:user-uuid"     → '{"totalForms":5,"totalResponses":120}'
```

You ask Redis: "What's at key X?" — it gives you the value in 0.5ms.
You ask PostgreSQL the same: it reads from disk — takes 5ms.

10x faster. That's why we use it.

### Redis Also Has TTL (Time To Live)

Every key can have an expiry time. After the time runs out, Redis automatically deletes it:

```
SETEX "sf:session:abc123" 900 '{"id":"u1",...}'
                          ^^^
                      expires in 900 seconds (15 minutes)
```

No manual cleanup needed. Redis handles it.

---

## SECTION 3 — THE REDIS PACKAGE — EVERY LINE EXPLAINED

### File: `packages/redis/src/index.ts`

```typescript
import Redis from "ioredis";
```
Import the `ioredis` library — this is the Node.js client that talks to the Redis server. Think of it as the phone you use to call Redis.

```typescript
let redisInstance: Redis | null = null;
```
A module-level variable to hold ONE Redis connection. It starts as `null` (no connection yet).
Why one connection? Each connection has overhead. We reuse the same one forever.

```typescript
export function getRedis(): Redis {
  if (!redisInstance) {
```
First time this function is called — `redisInstance` is null — so create a connection.
Every time after that — `redisInstance` already exists — skip straight to `return redisInstance`.
This is called a **singleton pattern**: one instance, shared everywhere.

```typescript
    const url = process.env.REDIS_URL || "redis://localhost:6379";
```
Read the Redis server address from environment variable.
In production: `rediss://user:pass@upstash-host:6379` (Upstash URL)
In development: `redis://localhost:6379` (your local Redis)

```typescript
    redisInstance = new Redis(url, {
      maxRetriesPerRequest: 3,
```
If a Redis command fails (network blip), retry it up to 3 times before giving up.

```typescript
      enableReadyCheck: false,
```
Don't wait for Redis to send a "READY" signal before allowing commands. Speeds up startup.

```typescript
      lazyConnect: true,
```
Don't actually connect to Redis right now — wait until the first command is sent. Saves resources if Redis is never needed (e.g., in tests).

```typescript
    });
    redisInstance.on("error", (err) => {
      console.warn("[Redis] connection error:", err.message);
    });
```
If Redis goes down or is unreachable, log a warning but **don't crash**.
This is critical — Redis failure should degrade gracefully (slower), not crash the API.

```typescript
export const redis = getRedis();
```
When this file is first imported anywhere in the app, immediately call `getRedis()` to create the connection. So the connection is ready before any code tries to use it.

---

### The Four Cache Helper Functions

```typescript
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
```
Send `GET key` command to Redis. Returns a string or `null` if key doesn't exist.

```typescript
    return val ? (JSON.parse(val) as T) : null;
```
If we got a value (not null), parse the JSON string back into a JavaScript object.
`<T>` is a TypeScript generic — the caller tells us what type to expect:
```typescript
const user = await cacheGet<SessionUser>("sf:session:abc");
// TypeScript knows: user is SessionUser | null
```

```typescript
  } catch {
    return null;
  }
}
```
If Redis is down, `redis.get()` throws an error. We catch it and return `null`.
`null` means "cache miss" — the caller will fall back to the database.
**The API never crashes because Redis is down.**

---

```typescript
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
```
`SETEX key ttl value` — Set a key with an expiry time.
`JSON.stringify(value)` converts any JavaScript object to a string (Redis only stores strings).

```typescript
  } catch {
    // ignore
  }
}
```
If Redis is down, just skip the cache write. The data goes un-cached.
Next request will miss the cache and query the DB — slower but correct.

---

```typescript
export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch { }
}
```
`DEL key` — Delete one specific key from Redis.
Used when data changes: if form "my-form" is updated, delete `"sf:form:public:my-form"` so next request gets fresh data from DB.

---

```typescript
export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
```
`KEYS pattern` — Find ALL keys matching a pattern.
`"sf:explore:*"` matches: `"sf:explore:{}"`, `"sf:explore:{'limit':12}"`, etc.
The `*` is a wildcard meaning "anything here".

```typescript
    if (keys.length > 0) await redis.del(...keys);
```
Delete ALL the matching keys at once.
Used when a form is published/unpublished — the explore page cache must be cleared for ALL query variations.

---

## SECTION 4 — WHERE REDIS IS CALLED IN THE PROJECT

Here is every single Redis call, what it does, and exactly when it happens:

### Call 1 — Session validation (MOST IMPORTANT, happens on EVERY protected API call)

**File:** `packages/trpc/server/middleware/auth.middleware.ts`

```typescript
const cacheKey = `sf:session:${token}`;
//                             ^^^^^ the cookie value from the browser
// Example key: "sf:session:a3b5f8c9d0e1f2a3b4c5d6e7f8a9b0c1..."
```

```typescript
const cached = await cacheGet<SessionUser>(cacheKey);
```
**STEP 1:** Ask Redis: "Do you have session data for this token?"

```
SCENARIO A — Cache HIT (Redis has it):
  Redis returns: '{"id":"u1","email":"alice@test.com","plan":"free"}'
  → Parse JSON → set as ctx.user → proceed to handler
  → Total time: ~0.5ms
  → Database: NOT touched

SCENARIO B — Cache MISS (Redis doesn't have it, first request after login):
  Redis returns: null
  → Fall through to database query
```

```typescript
if (cached) {
  return next({ ctx: { ...ctx, user: cached } }); // user injected into context
}
```
Cache hit — skip database entirely, inject user into tRPC context, continue.

```typescript
const [session] = await db.select(...)
  .from(sessionsTable)
  .innerJoin(usersTable, ...)
  .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())))
  .limit(1);
```
**STEP 2 (only on cache miss):** Query PostgreSQL for the session.
This joins two tables: `sessions` (for the token) and `users` (for user data).
The `gt(expiresAt, now)` check ensures the session hasn't expired.

```typescript
await cacheSet(cacheKey, session.user, 900);
```
**STEP 3:** Store in Redis for 900 seconds (15 minutes).
Next 900 seconds of requests → cache hit → no DB query.

**The math:** 100 users each making 10 requests/minute = 1000 requests/minute.
- Without Redis: 1000 DB queries/minute just for session validation
- With Redis: ~1 DB query per user per 15 minutes = ~6 DB queries/minute
- **Reduction: 99.4% fewer DB queries**

---

### Call 2 — Public form data (happens every time someone opens a form link)

**File:** `packages/trpc/server/routes/forms/route.ts` (getPublic procedure)
**Also:** `apps/api/src/routes/submit.ts` (form submission)

```typescript
const cacheKey = `sf:form:public:${input.slug}`;
// Example: "sf:form:public:anime-fan-survey-a3b5"
```

```typescript
const cached = await cacheGet<unknown>(cacheKey);
if (cached) return cached as any;
```
**When respondent opens a form URL:**
- Cache HIT → return immediately, no DB query
- Cache MISS → query DB, cache result for 60 seconds

```typescript
await cacheSet(cacheKey, form, 60); // TTL: 60 seconds
```
60-second TTL because form data changes occasionally (creator edits it).
If 1000 people open the same form in one minute → 1 DB query instead of 1000.

**When is this cache deleted?**
```typescript
// In forms/route.ts — when form is UPDATED:
await cacheDel(`sf:form:public:${existing.slug}`);

// When form is UNPUBLISHED:
await cacheDel(`sf:form:public:${form.slug}`);

// When form is DELETED:
await cacheDel(`sf:form:public:${form.slug}`);

// When a field is added/changed/deleted (form content changed):
if (form.status === "published") await cacheDel(`sf:form:public:${form.slug}`);
```
Immediately deletes the cache entry so the next request gets fresh data.

---

### Call 3 — Explore page (public gallery of forms)

**File:** `packages/trpc/server/routes/forms/route.ts` (explore procedure)

```typescript
const cacheKey = `sf:explore:${JSON.stringify(input)}`;
// Example: 'sf:explore:{"limit":12}'
// Example: 'sf:explore:{"limit":12,"cursor":"uuid..."}'
// Different query params = different cache keys
```

```typescript
const cached = await cacheGet<unknown>(cacheKey);
if (cached) return cached as any;
// ...query DB...
await cacheSet(cacheKey, result, 120); // TTL: 2 minutes
```
The explore page is the same for ALL users. 2-minute cache.

**When is this cleared?**
```typescript
// When any form is PUBLISHED (new form appears in explore):
await cacheDelPattern("sf:explore:*");

// When form is UNPUBLISHED (must disappear from explore):
await cacheDelPattern("sf:explore:*");

// When form is DELETED:
await cacheDelPattern("sf:explore:*");
```
`cacheDelPattern("sf:explore:*")` deletes ALL explore cache entries (all pagination pages).

---

### Call 4 — Analytics stats (dashboard charts)

**File:** `packages/trpc/server/routes/analytics/route.ts`

```typescript
const cacheKey = `sf:form:stats:${input.formId}:${input.startDate}:${input.endDate}`;
// Example: "sf:form:stats:uuid...:2025-01-01T00:00:00.000Z:2025-01-31T23:59:59.000Z"
```

```typescript
const cached = await cacheGet<...>(cacheKey);
if (cached) return cached;
const stats = await analyticsService.getFormStats(input); // expensive DB query
await cacheSet(cacheKey, stats, 300); // TTL: 5 minutes
```
Analytics queries do `GROUP BY date`, `AVG()`, `COUNT()` across thousands of rows.
These are expensive. Cache them for 5 minutes — the chart doesn't need to update every second.

---

### Call 5 — Dashboard summary

**File:** `packages/trpc/server/routes/analytics/route.ts`

```typescript
const cacheKey = `sf:dashboard:${ctx.user!.id}`;
// Different cache per user: "sf:dashboard:user-uuid-1", "sf:dashboard:user-uuid-2"
```

```typescript
const cached = await cacheGet<unknown>(cacheKey);
if (cached) return cached;
const summary = await analyticsService.getDashboardSummary(ctx.user!.id);
await cacheSet(cacheKey, summary, 120); // TTL: 2 minutes
```
When a creator opens their dashboard, this runs an aggregate query across all their forms.
Cache for 2 minutes so refresh-clicking doesn't hammer the DB.

---

### Redis Decision Map — When DB, When Redis?

```
Request arrives
    │
    ├─ Protected route? → Read cookie → Check Redis("sf:session:TOKEN")
    │                       HIT  → Use Redis data, skip DB ✓
    │                       MISS → Query DB, write to Redis, use DB data
    │
    ├─ GET public form? → Check Redis("sf:form:public:SLUG")
    │                       HIT  → Return Redis data immediately ✓
    │                       MISS → Query DB, write to Redis, return data
    │
    ├─ GET explore page? → Check Redis("sf:explore:PARAMS")
    │                         HIT  → Return Redis data immediately ✓
    │                         MISS → Query DB, write to Redis, return data
    │
    ├─ GET analytics? → Check Redis("sf:form:stats:ID:DATES")
    │                     HIT  → Return Redis data immediately ✓
    │                     MISS → Run expensive DB aggregation, write to Redis
    │
    └─ Everything else → Go straight to DB (writes, creates, deletes always hit DB)

Data changes (write operations) → Always:
    1. Write to DB (source of truth)
    2. Delete Redis cache entries for affected data
    3. Next read will miss cache → DB → repopulate Redis
```

---

## SECTION 5 — BULLMQ AND QUEUES EXPLAINED

### What BullMQ Is

BullMQ is a job queue library. It uses Redis to store "jobs" (tasks to be done).

```
The API puts a job INTO Redis:
  redis.lpush("bull:email:wait", '{"type":"welcome","email":"alice@test.com"}')

The Worker watches Redis and picks up jobs:
  redis.brpop("bull:email:wait")  ← blocking pop, waits until a job appears
```

**BRPOP** = "Blocking Right Pop" — the worker literally blocks/waits until a job appears. When a job arrives, it instantly unblocks and processes it. Zero polling delay.

### The Queue Package — Every Line

**File:** `packages/queues/src/index.ts`

```typescript
let bullRedis: Redis | null = null;

function getBullRedis(): Redis {
  if (!bullRedis) {
    bullRedis = new Redis(url, {
      maxRetriesPerRequest: null, // ← Important: null means "retry forever"
```
`maxRetriesPerRequest: null` is REQUIRED for BullMQ. If a Redis command fails inside a worker, BullMQ needs to retry forever (not give up after 3 tries). The default `3` would crash the worker on a brief Redis blip.

```typescript
      enableReadyCheck: false,
```
Same as before — don't wait for ready signal.

```typescript
function makeQueue(name: string): Queue {
  const connection = getBullRedis();
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
```
If a job fails (e.g., email server is down), retry it 3 times total.

```typescript
      backoff: { type: "exponential", delay: 2000 },
```
Exponential backoff: wait 2s before retry 1, 4s before retry 2, 8s before retry 3.
This prevents hammering a failing service repeatedly.

```typescript
      removeOnComplete: 100,
```
After a job succeeds, keep it in Redis for 100 completed jobs (for debugging).
After 101 completed jobs, the oldest is deleted. Prevents Redis filling up.

```typescript
      removeOnFail: 200,
```
Keep the last 200 failed jobs so you can inspect what went wrong.

```typescript
let _emailQueue: Queue | null = null;

export function getEmailQueue(): Queue {
  if (!_emailQueue) _emailQueue = makeQueue("email");
  return _emailQueue;
}
```
Lazy singleton — the queue is only created when first requested.
`makeQueue("email")` creates a Queue object connected to Redis.
The string `"email"` is the queue name — it becomes the Redis key prefix `bull:email:*`.

```typescript
export async function safeEnqueue(queue: Queue, jobName: string, data: unknown): Promise<void> {
  try {
    await queue.add(jobName, data);
```
`queue.add("welcome", { email: "a@b.com" })` → stores this job in Redis.
The job sits in Redis until a worker picks it up.

```typescript
  } catch {
    // Non-fatal: queues may not be available in all environments
  }
}
```
If Redis is down, the job is lost — but the form submission still succeeds.
This is intentional: core functionality (saving response) > side effects (sending email).

---

## SECTION 6 — THE WORKER PROGRAM — EVERY FILE AND LINE

### File: `apps/worker/src/index.ts` — The Entry Point

```typescript
import "dotenv/config";
```
Load environment variables from `.env` file. Must be first import so all code that follows can access `process.env.REDIS_URL` etc.

```typescript
import { emailWorker }     from "./workers/email.worker";
import { webhookWorker }   from "./workers/webhook.worker";
import { analyticsWorker } from "./workers/analytics.worker";
import { exportWorker }    from "./workers/export.worker";
```
Import all four workers. Each file exports a `Worker` object.
**Importing these files immediately starts the workers** — the `new Worker(...)` call in each file runs as soon as the file is imported.

```typescript
const workers = [emailWorker, webhookWorker, analyticsWorker, exportWorker];
```
Put all workers in an array so we can operate on all of them together.

```typescript
const shutdown = async () => {
  console.log("Worker shutting down...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown);
```
**Graceful shutdown:**
- `SIGTERM` = Render/Docker sends this when stopping the container
- `SIGINT` = Ctrl+C in your terminal

When shutdown signal received:
1. `w.close()` — Wait for any currently-running job to finish
2. Don't pick up new jobs
3. `process.exit(0)` — Exit cleanly

Without this, stopping the worker mid-job would corrupt the job state.

```typescript
workers.forEach((w) => {
  w.on("ready",  () => console.log(`✅ Worker [${w.name}] ready`));
  w.on("error",  (err) => console.error(`❌ Worker [${w.name}] error:`, err.message));
});
```
Subscribe to events on each worker.
`"ready"` fires when the worker has connected to Redis and is listening for jobs.
`"error"` fires if Redis connection fails.

---

### File: `apps/worker/src/workers/email.worker.ts` — Line by Line

```typescript
import { Worker } from "bullmq";
import Redis from "ioredis";
```
`Worker` class from BullMQ — this is what listens to the queue and runs your handler.
`Redis` from ioredis — the Redis client for BullMQ's internal use.

```typescript
const connection = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
});
```
Create the Redis connection that BullMQ uses to watch for jobs.
**This is SEPARATE from the caching Redis** in `packages/redis/`.
Why two connections? BullMQ needs `maxRetriesPerRequest: null` (retry forever).
The caching Redis needs `maxRetriesPerRequest: 3` (give up quickly on cache misses).
Same Redis server, different connection settings, different purpose.

```typescript
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.log(`[Email][Dev] To: ${to} | Subject: ${subject}`);
    return;
  }
```
If `RESEND_API_KEY` is not set (local development), just log the email instead of sending.
This is **graceful degradation** — the app works without email configured, just differently.

```typescript
  const { Resend } = await import("resend");
```
Dynamic import — only loads the Resend library when actually needed (when we have an API key).
This is a performance optimization: if no API key, the Resend library is never loaded.

```typescript
  const resend = new Resend(apiKey);
  const from   = process.env["EMAIL_FROM"] ?? "ScribbleForms <noreply@scribbleforms.dev>";
  await resend.emails.send({ from, to, subject, html });
}
```
Use Resend's SDK to send the email. This makes an HTTP request to Resend's API.
Resend then delivers the email to the recipient.

```typescript
export const emailWorker = new Worker(
  "email",          // ← Listen to the "email" queue in Redis
  async (job) => {  // ← This function runs for every job
```
`new Worker("email", handler)` does this internally:
```
1. Connects to Redis
2. Runs: BRPOP bull:email:wait  (blocking wait for a job)
3. When a job arrives: parse it, call handler(job)
4. If handler succeeds: mark job complete, BRPOP again
5. If handler throws: mark job failed, retry after backoff
```

```typescript
    const { type } = job.data as { type: string };
```
`job.data` is whatever we passed to `queue.add("welcome", { type: "welcome", ... })`.
TypeScript doesn't know the shape at compile time (it came from Redis as JSON) so we cast it.

```typescript
    switch (type) {
      case "welcome": {
        const { email, name } = job.data as { email: string; name: string };
        await sendEmail(email, "Welcome to ScribbleForms 🎉", `<h1>Welcome...</h1>`);
        break;
      }
```
For `type: "welcome"` jobs, send a welcome email.

```typescript
      case "password_reset": {
        const { email, token } = job.data as { email: string; token: string };
        await sendEmail(email, "Reset your password", `...${token}...`);
        break;
      }
```
For `type: "password_reset"` jobs, send the reset link. The `token` in the URL is the reset token from the `users.reset_token` database column.

```typescript
      case "new_response": {
        const { email, formId } = job.data as { email: string; formId: string };
        if (!email) break; // creator might not have email set
        await sendEmail(email, "New form response received", `...${formId}...`);
        break;
      }
```
For `type: "new_response"` — notify the form creator that someone submitted their form.

```typescript
      case "export_ready": {
        const { email, fileUrl } = job.data as { email: string; fileUrl: string };
        await sendEmail(email, "Your export is ready", `...${fileUrl}...`);
        break;
      }
```
After the export worker finishes generating a CSV, it queues a "export_ready" job to notify the creator.

```typescript
  { connection, concurrency: 5 }
```
`concurrency: 5` — process up to 5 email jobs at the same time (in parallel).
Why not 100? Each email job calls Resend's API — too many parallel calls would hit rate limits.
5 is a safe number: can send 5 emails simultaneously without issues.

```typescript
emailWorker.on("failed", (job, err) => {
  console.error(`[Email][Failed] job=${job?.id}`, err.message);
});
```
When all 3 retry attempts fail, BullMQ emits `"failed"`. We log it.
In production you'd send this to an error tracker (Sentry etc).

---

### File: `apps/worker/src/workers/analytics.worker.ts` — Line by Line

```typescript
const COL_MAP: Record<string, string> = {
  form_view:    "views",
  form_start:   "starts",
  form_submit:  "completions",
  form_abandon: "abandons",
};
```
Maps event type names to database column names.
`"form_view"` → increment the `views` column in `analytics_daily`.
`"field_focus"` and `"field_blur"` are NOT in this map → they're tracked in raw events only, not daily aggregates.

```typescript
export const analyticsWorker = new Worker("analytics", async (job) => {
  if (job.data.type !== "track_event") return;
```
Safety check — only process "track_event" type jobs. If somehow a different job type ended up in this queue, skip it safely.

```typescript
  const event = job.data.event as {
    formId:     string;
    eventType:  string;
    fieldId?:   string;
    sessionId?: string;
    responseId?: string;
    metadata?:  Record<string, unknown>;
  };

  if (!event?.formId || !event?.eventType) return;
```
Validate the event has required fields. If missing, skip this job.

```typescript
  await db.insert(analyticsEventsTable).values({
    formId:    event.formId,
    eventType: event.eventType as any,
    fieldId:   event.fieldId   ?? null,
    sessionId: event.sessionId ?? null,
    metadata:  event.metadata  ?? null,
    responseId: event.responseId ?? null,
  }).catch(() => {});
```
**Step 1: Insert raw event** into `analytics_events` table.
One row per event. This table grows indefinitely but it's append-only and not queried for dashboards.
`.catch(() => {})` — if this fails (DB down), don't crash the worker, just skip.

```typescript
  const today = new Date().toISOString().split("T")[0]!;
  // new Date() → "2025-01-15T14:30:00.000Z"
  // .split("T")[0] → "2025-01-15"
  // This is today's date string in YYYY-MM-DD format
```

```typescript
  const col = COL_MAP[event.eventType];
  if (!col) return;
  // If eventType is "field_focus" → not in COL_MAP → col is undefined → return
  // Only form_view, form_start, form_submit, form_abandon update daily aggregates
```

```typescript
  await db
    .insert(analyticsDailyTable)
    .values({
      formId:      event.formId,
      date:        today,
      views:       col === "views"       ? 1 : 0,
      starts:      col === "starts"      ? 1 : 0,
      completions: col === "completions" ? 1 : 0,
      abandons:    col === "abandons"    ? 1 : 0,
    })
```
**Step 2: Try to INSERT a new row** for today's date.
If this is the first event today, this creates the row with e.g. `views=1, starts=0`.

```typescript
    .onConflictDoUpdate({
      target: [analyticsDailyTable.formId, analyticsDailyTable.date],
```
BUT — if a row for this `(formId, date)` already exists (unique constraint), don't insert a duplicate. Instead, UPDATE the existing row.

```typescript
      set: {
        views: col === "views" ? sql`${analyticsDailyTable.views} + 1` : analyticsDailyTable.views,
        // If this is a "views" event: views = views + 1
        // Otherwise: views = views (unchanged)
      },
    })
```
`sql\`${analyticsDailyTable.views} + 1\`` generates raw SQL: `analytics_daily.views + 1`
This is atomic — the database does the increment, not JavaScript.
No race condition even with 20 concurrent events.

**Example — what happens over a day:**

```
Event 1: form_view for form-123 on 2025-01-15
→ INSERT (form-123, 2025-01-15, views=1, starts=0, completions=0, abandons=0)
   (no conflict, new row created)

Event 2: form_view for form-123 on 2025-01-15
→ INSERT ... CONFLICT → UPDATE SET views = 1 + 1 = 2

Event 3: form_start for form-123 on 2025-01-15
→ INSERT ... CONFLICT → UPDATE SET starts = 0 + 1 = 1

Event 4: form_submit for form-123 on 2025-01-15
→ INSERT ... CONFLICT → UPDATE SET completions = 0 + 1 = 1

Final row: (form-123, 2025-01-15, views=2, starts=1, completions=1, abandons=0)
```

```typescript
}, { connection, concurrency: 20 });
```
`concurrency: 20` — process 20 analytics events simultaneously.
Analytics events are cheap (simple DB writes), so high concurrency is fine.
During a spike (form goes viral), 20 parallel workers can handle the flood.

---

### File: `apps/worker/src/workers/export.worker.ts` — Line by Line

```typescript
async function generateCsv(formId: string): Promise<string> {
  const fields = await db.select().from(fieldsTable)
    .where(eq(fieldsTable.formId, formId))
    .orderBy(fieldsTable.order);
```
Load all fields for this form, ordered by their position (order column).
These become the CSV column headers.

```typescript
  const responses = await db.select().from(responsesTable)
    .where(eq(responsesTable.formId, formId))
    .orderBy(desc(responsesTable.createdAt))
    .limit(10_000);
```
Load up to 10,000 responses (newest first). The 10k limit prevents memory exhaustion.
In a future version, this would be streaming/paginated.

```typescript
  const headers = [
    "Response ID", "Submitted At", "Completed", "Time (ms)",
    ...fields.map((f) => f.label),  // one column per field label
  ];
  const rows: string[][] = [headers];
```
Build the header row. `...fields.map(f => f.label)` spreads the field labels as extra columns.
Example: `["Response ID", "Submitted At", "Completed", "Time (ms)", "Name", "Email", "Rating"]`

```typescript
  const responseIds = responses.map((r) => r.id);
  const allAnswers  = await db.select().from(responseAnswersTable)
    .where(inArray(responseAnswersTable.responseId, responseIds));
```
**IMPORTANT — this is the N+1 fix:**
Instead of: loop 500 responses → 500 separate DB queries for each response's answers (500 queries total)
We do: ONE query with `WHERE response_id IN (uuid1, uuid2, ...)` (1 query total)
`inArray` generates `IN (...)` SQL clause.

```typescript
  const answerMap = new Map<string, Map<string, typeof allAnswers[number]>>();
  for (const r of responseIds) answerMap.set(r, new Map());
  for (const a of allAnswers) {
    answerMap.get(a.responseId)?.set(a.fieldId, a);
  }
```
Build a nested Map: `responseId → fieldId → answer`.
```
answerMap = {
  "resp-1" → { "field-1" → {valueText: "Alice"}, "field-2" → {valueText: "alice@test.com"} },
  "resp-2" → { "field-1" → {valueText: "Bob"},   "field-2" → {valueText: "bob@test.com"} },
}
```
O(n) construction — very fast, no DB queries.

```typescript
  for (const r of responses) {
    const fieldAnswers = answerMap.get(r.id) ?? new Map();
    const row: string[] = [
      r.id, r.createdAt.toISOString(), String(r.isComplete), String(r.timeToCompleteMs ?? ""),
      ...fields.map((f) => {
        const a = fieldAnswers.get(f.id);
        if (!a) return "";
        if (a.valueText   != null) return a.valueText;
        if (a.valueNumber != null) return String(a.valueNumber);
        if (a.valueArray  != null) return JSON.stringify(a.valueArray);
        if (a.valueJson   != null) return JSON.stringify(a.valueJson);
        return "";
      }),
    ];
    rows.push(row);
  }
```
For each response, build a CSV row. For each field, find its answer in the map.
Different answer types (text, number, array) are handled separately.

```typescript
  return rows
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
```
Convert to proper CSV format:
- Each cell is wrapped in double quotes
- Any `"` inside a cell becomes `""` (CSV escaping rule)
- Cells are joined with commas
- Rows are joined with newlines

```typescript
export const exportWorker = new Worker("export", async (job) => {
  await db.update(exportJobsTable)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(exportJobsTable.id, exportJobId));
```
Update the `export_jobs` table to status "processing".
The frontend polls `GET /api/export/{jobId}/status` — this makes it show "Processing..." in the UI.

```typescript
  const content  = await generateCsv(formId);
  const filename = `${formId}-${Date.now()}`;
  const fileUrl  = await uploadToCloudinary(content, filename);
```
Generate the CSV string, upload to Cloudinary (file storage), get back a public URL.

```typescript
  await db.update(exportJobsTable)
    .set({ status: "done", fileUrl, updatedAt: new Date() })
    .where(eq(exportJobsTable.id, exportJobId));
```
Update status to "done" and store the Cloudinary URL.
Frontend polling sees status "done" → shows download link.

```typescript
  if (fileUrl && userEmail) {
    await safeEnqueue(getEmailQueue(), "export_ready", {
      type: "export_ready", email: userEmail, fileUrl,
    });
  }
```
Queue an email to tell the creator "your export is ready".
Notice: the export worker queues a job into the EMAIL queue.
Workers can create jobs for other workers!

```typescript
}, { connection, concurrency: 2 });
```
Only 2 concurrent exports — generating CSV for 10,000 responses uses significant CPU and memory. Keep it low to avoid resource exhaustion.

---

## SECTION 7 — WEBHOOKS — COMPLETE DEEP DIVE

### What a Webhook Is

A webhook is your app calling SOMEONE ELSE'S server when something happens.

**Normal API call:** YOU call THEIR server to ask "any new responses?"
**Webhook:** THEY call YOUR server to tell "new response just happened!"

**Real example:**
- Creator sets up webhook: "Call `https://hooks.slack.com/xyz` when someone submits my form"
- Someone submits the form
- ScribbleForms calls Slack's URL with the response data
- Slack shows a notification in the creator's channel

### The Webhook Database Tables

```
webhooks table:
  id         = "wh-uuid"
  user_id    = creator who owns this webhook
  form_id    = which form triggers it (NULL = all forms)
  url        = "https://hooks.slack.com/xyz" ← where to send the HTTP request
  secret     = "a3b5f8..." ← random 32-byte string, used for signing
  events     = ["form.response.created", "form.published"] ← which events trigger it
  is_active  = true

webhook_deliveries table (log of every attempt):
  id           = "del-uuid"
  webhook_id   = which webhook
  event        = "form.response.created"
  payload      = the JSON we sent
  status_code  = 200 (what their server returned)
  status       = "success" or "failed"
  delivered_at = timestamp
```

### Where Webhooks Are Triggered (Every Call Site)

**Location 1:** `apps/api/src/routes/submit.ts` — after form submission:
```typescript
setImmediate(() => {
  safeEnqueue(getWebhookQueue(), "dispatch", {
    formId:  form.id,
    event:   "form.response.created",
    payload: { formId: form.id, responseId },
  });
});
```
When someone submits a form → queue a webhook job.
`setImmediate` means: queue this AFTER sending the HTTP response. User doesn't wait.

**Location 2:** `packages/trpc/server/routes/forms/route.ts` — when form is published:
```typescript
safeEnqueue(getWebhookQueue(), "dispatch", {
  formId: input.id,
  event:  "form.published",
  payload: { formId: input.id },
});
```
When creator publishes a form → notify webhook subscribers.

### The Webhook Worker — Every Line

```typescript
async function findWebhooks(formId: string, event: string) {
  return db.select().from(webhooksTable).where(
    and(
      eq(webhooksTable.isActive, true),
```
Only find active webhooks (not deleted/paused ones).

```typescript
      or(isNull(webhooksTable.formId), eq(webhooksTable.formId, formId)),
```
Two types of webhooks:
- **Global** (`form_id IS NULL`): fires for ALL forms this user has
- **Form-specific** (`form_id = formId`): fires only for this specific form

`or(isNull(...), eq(...))` matches both types.

```typescript
      sql`${webhooksTable.events} @> ${JSON.stringify([event])}::jsonb`
```
This is raw SQL: `webhooks.events @> '["form.response.created"]'::jsonb`

`@>` is PostgreSQL's "contains" operator for JSONB.
`events` column stores: `["form.response.created", "form.published"]` (a JSON array)
`'["form.response.created"]'::jsonb` is: `["form.response.created"]` (also a JSON array)

The `@>` checks: does `events` array contain ALL elements of the right-side array?
```
["form.response.created", "form.published"] @> ["form.response.created"] → TRUE ✓
["form.published"]                          @> ["form.response.created"] → FALSE ✗
```
So we only get webhooks that have subscribed to this specific event.

```typescript
const webhooks = await findWebhooks(formId, event);

await Promise.all(
  webhooks.map(async (wh) => {
```
For each matching webhook, fire them ALL in parallel (`Promise.all`).
If a user has 5 webhooks, all 5 HTTP requests go out simultaneously.

```typescript
    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString(),
    });
```
Build the JSON body we'll POST to their URL.
Example:
```json
{
  "event": "form.response.created",
  "payload": { "formId": "uuid...", "responseId": "uuid..." },
  "timestamp": "2025-01-15T14:30:00.000Z"
}
```

```typescript
    const sig = createHmac("sha256", wh.secret).update(body).digest("hex");
```
**HMAC signing — the security mechanism:**

`wh.secret` = a random 32-byte hex string stored when the webhook was created.
`createHmac("sha256", secret)` = create an HMAC machine keyed with the secret.
`.update(body)` = feed the entire JSON body through the HMAC.
`.digest("hex")` = get the result as a hex string.

Think of it as: `HMAC(secret, body)` → a fingerprint of the message, known only to us and the recipient.

The recipient re-runs the same calculation. If the results match, the message is genuine.

```typescript
    const response = await fetch(wh.url, {
      method: "POST",
      headers: {
        "Content-Type":              "application/json",
        "X-ScribbleForms-Signature": `sha256=${sig}`,
        "X-ScribbleForms-Event":     event,
      },
      body,
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });
```
Make the HTTP POST request to the user's configured URL.

`X-ScribbleForms-Signature: sha256=a3b5f8...` — the signature header.
Their server reads this, recomputes the HMAC, and verifies it matches.

`AbortSignal.timeout(10_000)` — if their server takes more than 10 seconds to respond, cancel the request. We don't wait forever.

```typescript
    await recordDelivery(wh.id, event, payload, response.status, response.ok ? "success" : "failed");
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
```
Record the delivery attempt (HTTP status, success/fail) in `webhook_deliveries` table.
If their server returned 4xx or 5xx, throw an error → BullMQ retries the job.

```typescript
  } catch (err: any) {
    await recordDelivery(wh.id, event, payload, 0, "failed");
    throw err; // triggers BullMQ retry
  }
```
If ANY error occurs (network timeout, DNS failure, etc.), record it as failed and re-throw.
BullMQ sees the thrown error and schedules a retry (attempt 2, then 3, 4, 5 with exponential backoff).

**Retry schedule:**
```
Attempt 1: immediately
Attempt 2: 1 second later
Attempt 3: 2 seconds later
Attempt 4: 4 seconds later
Attempt 5: 8 seconds later
Final fail: give up, mark job as "failed" in Redis
```

---

## SECTION 8 — HOW API AND WORKER INTERACT (COMPLETE FLOW)

```
┌──────────────────────────────────────────────────────────────────┐
│                        TWO SEPARATE PROGRAMS                     │
│                                                                  │
│   apps/api (HTTP server)              apps/worker (job processor)│
│   ─────────────────────               ──────────────────────────-│
│   Handles HTTP requests               Watches Redis queues       │
│   Returns responses fast              Processes jobs slowly      │
│   Never blocks on slow tasks          Does the slow tasks        │
│                                                                  │
│            REDIS connects them                                   │
│   API puts jobs IN → → → → → → → → Worker takes jobs OUT        │
└──────────────────────────────────────────────────────────────────┘
```

### Complete Flow: Someone Submits a Form

**MILLISECOND 0:** Browser sends POST to `/f/my-form/submit`

**MILLISECONDS 1-5:** API server (apps/api):
1. Validates the submission (Zod)
2. Checks form exists and is published
3. Validates answers against field schemas
4. Runs database transaction:
   - INSERT INTO responses → saves the response
   - INSERT INTO response_answers → saves each answer
   - UPDATE forms SET total_responses = total_responses + 1

**MILLISECOND 5:** API sends response: `200 OK { success: true, responseId: "..." }`
→ User sees "Thank you!" immediately

**MILLISECOND 6:** `setImmediate()` runs (after response is already sent):
```typescript
safeEnqueue(getEmailQueue(),    "new_response", {...}) // puts job in Redis: bull:email:wait
safeEnqueue(getAnalyticsQueue(), "track",       {...}) // puts job in Redis: bull:analytics:wait
safeEnqueue(getWebhookQueue(),  "dispatch",     {...}) // puts job in Redis: bull:webhook:wait
```
These three Redis writes take ~1ms each. But the user already has their response.

**MILLISECONDS 7-500:** Worker processes the jobs (user doesn't wait):

Worker is running separately and constantly watching Redis:
- Email worker sees `bull:email:wait` has a job → picks it up → calls Resend API → email sent
- Analytics worker sees `bull:analytics:wait` has a job → writes to analytics_events → updates analytics_daily
- Webhook worker sees `bull:webhook:wait` has a job → finds matching webhooks → fires HTTP requests

**Result:** User waited 5ms. Email/analytics/webhook happened in 500ms, in the background.

---

## SECTION 9 — ARCHITECTURE BENEFIT SUMMARY

### Why not just do everything in the API?

```typescript
// ❌ WITHOUT workers — everything synchronous:
async function handleSubmit(req, res) {
  await db.transaction(...)           // 5ms
  await sendEmail(...)                // 400ms — user waits
  await updateAnalytics(...)          // 20ms  — user waits
  await fireWebhooks(...)             // 200ms — user waits
  res.json({ success: true });        // response at 625ms
}

// ✅ WITH workers — async side effects:
async function handleSubmit(req, res) {
  await db.transaction(...)           // 5ms
  safeEnqueue(emailQueue, ...)        // 1ms   — just puts job in Redis
  safeEnqueue(analyticsQueue, ...)    // 1ms   — just puts job in Redis
  safeEnqueue(webhookQueue, ...)      // 1ms   — just puts job in Redis
  res.json({ success: true });        // response at 8ms — 78x faster!
}
// Worker processes email/analytics/webhook in background
```

### What happens if a worker crashes?

The job stays in Redis. When the worker restarts, it picks up where it left off.
BullMQ guarantees **"at least once delivery"** — jobs are never silently lost.

### What happens if Redis is down?

- `safeEnqueue` catches the error and silently skips the job
- Form submission still succeeds (core functionality preserved)
- Email/webhook/analytics are lost for that submission
- This is the deliberate tradeoff: core > side effects

### What happens if the DB is slow?

- The worker waits for the DB — it doesn't crash
- Jobs pile up in Redis queue
- When DB recovers, worker processes the backlog
- Redis acts as a buffer between API and slow downstream services

---

## QUICK REFERENCE

### Every Redis Key in the Project

| Key Pattern | Example | TTL | When Set | When Deleted |
|-------------|---------|-----|----------|--------------|
| `sf:session:{token}` | `sf:session:a3b5f8...` | 15 min | After login | On logout, profile update |
| `sf:form:public:{slug}` | `sf:form:public:my-form-abc` | 60 sec | After public form fetch | Form update, field change, unpublish, delete |
| `sf:explore:{params}` | `sf:explore:{"limit":12}` | 2 min | After explore fetch | Publish, unpublish, delete |
| `sf:form:stats:{id}:{dates}` | `sf:form:stats:uuid...:2025-01-01:...` | 5 min | After analytics fetch | Never (expires naturally) |
| `sf:dashboard:{userId}` | `sf:dashboard:user-uuid` | 2 min | After dashboard fetch | Never (expires naturally) |
| `bull:email:wait` | (BullMQ internal) | Until processed | `safeEnqueue(emailQueue,...)` | Worker picks up job |
| `bull:webhook:wait` | (BullMQ internal) | Until processed | `safeEnqueue(webhookQueue,...)` | Worker picks up job |
| `bull:analytics:wait` | (BullMQ internal) | Until processed | `safeEnqueue(analyticsQueue,...)` | Worker picks up job |
| `bull:export:wait` | (BullMQ internal) | Until processed | `safeEnqueue(exportQueue,...)` | Worker picks up job |

### Every Queue in the Project

| Queue | Who Enqueues | Who Processes | Concurrency | Job Types |
|-------|-------------|---------------|-------------|-----------|
| `email` | auth route (signup, forgot-pw), submit handler, export worker | email worker | 5 | welcome, password_reset, new_response, export_ready |
| `webhook` | forms route (publish), submit handler | webhook worker | 10 | dispatch |
| `analytics` | analytics route (track), submit handler | analytics worker | 20 | track_event |
| `export` | responses route (export) | export worker | 2 | export |

### When DB is hit vs Redis

| Operation | Redis | DB |
|-----------|-------|-----|
| Verify session on every protected request | ✅ First (15 min cache) | Only on cache miss |
| Load public form for respondent | ✅ First (60s cache) | Only on cache miss |
| Load explore page | ✅ First (2 min cache) | Only on cache miss |
| Load analytics chart | ✅ First (5 min cache) | Only on cache miss |
| Create form | ❌ | ✅ Always |
| Submit response | ❌ (Redis used only for form cache read) | ✅ Always (transaction) |
| Update form | ✅ Delete cache | ✅ Always |
| Delete form | ✅ Delete cache | ✅ Always |
| Login | ✅ Write session cache | ✅ Create session row |
| Logout | ✅ Delete session cache | ✅ Delete session row |
