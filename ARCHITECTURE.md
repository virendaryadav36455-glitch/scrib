# ScribbleForms — Complete Architecture Deep Dive
## Senior Engineer Mentorship · Interview Preparation · Beginner-to-Expert Guide

> Read time: ~2 hours. This document explains every file, every decision, every tradeoff.
> Written for: junior developers, hackathon judges, interviewers, and anyone joining the project.

---

# PART 1 — WHAT IS SCRIBBLEFORMS?

## The Problem It Solves

Imagine you need to collect survey responses, job applications, or user feedback. You could build a form from scratch — but that means writing HTML, validation, a database schema, an API, and an analytics dashboard. **ScribbleForms solves all of this** as a hosted service, just like Typeform or Google Forms, but built as a production-grade SaaS with a proper backend architecture.

**What creators can do:**
- Build forms with 13 different field types (text, email, rating, multi-select, file upload, etc.)
- Set fields as required or optional, with custom validation rules
- Apply themes (visual styles) to forms
- Publish forms publicly or as "unlisted" (only accessible via direct link)
- View responses in a dashboard
- See analytics (completion rates, drop-off, device breakdown)
- Set response limits, expiry dates, password protection
- Get webhook notifications when responses arrive
- Export responses as CSV

**What respondents can do:**
- Fill forms without creating an account
- Submit validated responses
- See custom success messages

---

# PART 2 — WHY THIS EXACT TECH STACK?

Before touching any code, let's understand WHY each technology was chosen. This is the most important section for interviews.

## PostgreSQL — The Database

**Simple explanation:** PostgreSQL is like a giant spreadsheet program that lives on a server and can hold millions of rows with relationships between them.

**Why PostgreSQL specifically?**
- It has JSONB columns (stores arbitrary JSON data efficiently — used for field config and form version snapshots)
- It has proper ACID transactions (all-or-nothing writes — critical for form submissions)
- It has `ON CONFLICT DO UPDATE` (upsert) — used for analytics daily aggregates
- It has array operators for JSONB (`@>`) — used in webhook filtering
- Free hosting available on Neon, Supabase, Railway

**Why NOT MongoDB?**
- Our data IS relational: forms have fields, responses have answers, users have forms
- MongoDB's flexibility is unnecessary here and loses us JOIN performance
- ACID transactions in MongoDB are complex; in PostgreSQL they're built-in

**Interview answer:** "PostgreSQL was chosen for its JSONB support (needed for dynamic field configs), ACID compliance (critical for atomic response submission), and its mature ecosystem. The data model is fundamentally relational, so a document database would have been the wrong tool."

## Drizzle ORM — The Database Layer

**Simple explanation:** Drizzle is a tool that lets you write database queries using TypeScript instead of raw SQL strings. But unlike most ORMs, Drizzle stays very close to SQL — you can see exactly what query it generates.

**How it works internally:**
```typescript
// You write this TypeScript:
const users = await db.select().from(usersTable).where(eq(usersTable.email, "alice@example.com"));

// Drizzle generates this SQL:
// SELECT * FROM users WHERE email = 'alice@example.com'
```

Drizzle doesn't hide the SQL from you. Every method (`.select()`, `.from()`, `.where()`) directly maps to a SQL clause. This means no surprise "N+1 queries" — a common problem with ORMs like Prisma that do lazy loading behind your back.

**Why NOT Prisma?**
- Prisma has its own schema language (`.prisma` file) — a DSL you have to learn
- Prisma's migration system is opaque (it generates migrations for you, which can be wrong)
- Prisma's client is a singleton — hard to use cleanly in monorepos with multiple packages
- Prisma does "magic" lazy loading that causes N+1 queries without you realizing
- Drizzle schemas are pure TypeScript — importable, exportable, tree-shakeable

**Why NOT raw SQL strings?**
- `"SELECT * FROM users WHERE email = '" + email + "'"` is a SQL injection vulnerability
- TypeScript can't check column names in raw strings — typos become runtime errors
- Drizzle's `eq(usersTable.email, email)` — if `email` column doesn't exist, TypeScript error at compile time

**The Drizzle schema defines the TypeScript types AND the database structure:**
```typescript
export const usersTable = pgTable("users", {
  id:    uuid("id").primaryKey().defaultRandom(),  // → uuid column in DB, string in TypeScript
  email: varchar("email", { length: 255 }).notNull().unique(), // → NOT NULL UNIQUE constraint
  plan:  planEnum("plan").default("free").notNull(),  // → enum column
});
// Drizzle infers: typeof usersTable.$inferSelect = { id: string, email: string, plan: "free"|"creator"|"studio" }
```

**Interview answer:** "Drizzle was chosen over Prisma because it's schema-as-TypeScript (not a DSL), produces predictable SQL, integrates cleanly in monorepos, and avoids hidden N+1 queries. It gives us the type safety of an ORM with the transparency of raw SQL."

## tRPC — The API Layer

**Simple explanation:** Normally, the frontend and backend are separate programs that communicate by sending JSON strings over HTTP. tRPC is a library that makes it feel like you're just calling a function on the backend directly from the frontend — with full TypeScript type checking.

**Without tRPC:**
```typescript
// Frontend has to guess what the API returns
const response = await fetch("/api/forms");
const data = await response.json(); // TypeScript type: any — no safety
const title = data.forms[0].titl; // typo! but no error until runtime
```

**With tRPC:**
```typescript
// Frontend gets the exact same types as the backend
const { data } = trpc.forms.list.useQuery({ limit: 20 });
const title = data.forms[0].titl; // TypeScript ERROR: property 'titl' doesn't exist
// TypeScript knows the shape of every response because it's inferred from the server code
```

**How it works internally (the magic):**
1. The server defines a router with typed procedures:
   ```typescript
   export const serverRouter = router({
     forms: formsRouter,  // contains list, create, getById, etc.
   });
   export type ServerRouter = typeof serverRouter; // ← this type is the key
   ```
2. The frontend imports ONLY the type (not the actual code):
   ```typescript
   import type { ServerRouter } from "@repo/trpc/server"; // type-only import
   const trpc = createTRPCReact<ServerRouter>();
   ```
3. TypeScript uses `ServerRouter` to infer what inputs each procedure accepts and what it returns. No code is shipped to the browser — just the type information.

**Why not REST + OpenAPI?**
- REST requires manually writing OpenAPI schemas AND TypeScript types — two sources of truth that can drift
- With tRPC, there's one source of truth: the server router
- We also expose a REST API via `trpc-to-openapi` — so we get BOTH REST AND tRPC from one definition

**Why not GraphQL?**
- GraphQL requires learning its own schema language, resolvers, and client libraries
- tRPC has zero learning curve if you know TypeScript
- GraphQL's flexibility (clients can request any shape) is not needed here — the frontend always knows what it needs

**Interview answer:** "tRPC provides end-to-end type safety with zero code generation. The `ServerRouter` type is the single source of truth — frontend types are inferred from server code. We also expose REST via trpc-to-openapi, giving us two API protocols from one definition."

## Redis — The Cache and Queue Backbone

**Simple explanation:** Redis is like a super-fast dictionary (key → value store) that lives in RAM. Looking something up in Redis takes ~0.5ms; looking it up in PostgreSQL takes ~5ms. It's also used as a message queue — the API puts jobs in a queue, workers pick them up.

**Why Redis specifically?**
1. **Session caching:** Every authenticated API call needs to validate the session token. Without Redis: every call hits PostgreSQL (~5ms each). With Redis: cache hit in ~0.5ms. At 100 requests/second, that's the difference between 500ms of DB load and 50ms.
2. **Form caching:** A popular public form might get 1000 hits per minute. Without caching: 1000 PostgreSQL queries per minute. With 60-second Redis cache: 1 query per minute.
3. **BullMQ queues:** BullMQ (the background job library) uses Redis as its persistence layer. Jobs are stored in Redis sorted sets.

**Why not store sessions in PostgreSQL?**
- Session validation happens on EVERY request. A 10ms DB query on every API call adds up fast.
- Redis handles 100,000+ operations per second vs PostgreSQL's ~10,000
- Sessions have natural TTLs (expire after 30 days) — Redis has built-in TTL (`SETEX key 900 value`)

**Why not use memory (in-process caching)?**
- If you have 3 API server instances, in-process cache is not shared between them
- A server restart wipes the cache
- Redis works across multiple server instances and survives restarts

**Cache invalidation strategy (the hardest problem in CS):**
We invalidate caches immediately when data changes:
```typescript
// When a form is updated → delete its cache entry
await cacheDel(`sf:form:public:${form.slug}`);

// When a form is published/unpublished → delete the explore cache
await cacheDelPattern("sf:explore:*");
```

**Interview answer:** "Redis serves two roles: caching (session tokens, form data, analytics) and queue persistence (BullMQ). The session cache eliminates DB round trips on every authenticated request. The queue enables async processing of emails, webhooks, and analytics without blocking HTTP responses."

## Turborepo — The Monorepo Tool

**Simple explanation:** Instead of having separate GitHub repos for the frontend, backend, and shared code, everything lives in ONE repo. Turborepo is the tool that manages building and running multiple packages in the right order.

**Why a monorepo?**
Imagine this scenario WITHOUT a monorepo:
1. You change the `User` type in the backend
2. You have to update the backend package, publish it to npm
3. Then update the frontend package.json to use the new version
4. Then update the frontend code
5. Three separate commits, two npm publishes, possible version drift

WITH a monorepo and Turborepo:
1. You change the `User` type in `packages/trpc`
2. The change is immediately visible in `apps/api` AND `apps/web`
3. TypeScript shows errors everywhere the change breaks something
4. One commit fixes everything

**How Turborepo's build cache works:**
Turborepo hashes your source files. If the files haven't changed since the last build, it uses the cached build output instead of rebuilding. On CI, this makes subsequent runs take seconds instead of minutes.

**The dependency graph:**
```
apps/api  depends on  packages/trpc  depends on  packages/database
apps/web  depends on  packages/trpc                    ↓
                                               packages/redis
                                               packages/queues
                                               packages/constants
                                               packages/validators
```
Turborepo builds in this order automatically. You never manually specify "build database before trpc before api."

## Zod — The Validation Library

**Simple explanation:** Zod is a library that checks if data matches a shape you define. You describe what data should look like, and Zod tells you if it does — at runtime, with proper error messages.

**Why validation at all?**
When data comes from outside your system (HTTP requests, environment variables, form submissions), you can't trust its shape. Zod validates it and gives you a typed result.

**How Zod works:**
```typescript
const schema = z.object({
  email:    z.string().email(),          // must be a string AND a valid email format
  password: z.string().min(8).regex(/[A-Z]/), // string, 8+ chars, contains uppercase
});

// Runtime validation:
const result = schema.safeParse({ email: "bad", password: "short" });
// result.success = false
// result.error.flatten() = { email: ["Invalid email"], password: ["String must contain at least 8 char(s)"] }

// If valid, TypeScript KNOWS the shape:
const result2 = schema.parse({ email: "alice@test.com", password: "Password1" });
// TypeScript type of result2: { email: string, password: string }
```

**Three places Zod is used in ScribbleForms:**

1. **Env validation** (`apps/api/src/env.ts`): Fails at startup if required env vars are missing
2. **API input/output** (every tRPC procedure): `.input(schema)` validates incoming data, `.output(schema)` strips sensitive fields from responses
3. **Dynamic form validation** (`packages/validators/src/submission-schema.ts`): Builds a Zod schema at runtime based on form field configuration

**The most powerful use — dynamic schema generation:**
```typescript
// A form has these fields from the database:
const fields = [
  { id: "f1", type: "email",  required: true  },
  { id: "f2", type: "rating", required: false, config: { max: 5 } },
];

// We generate a Zod schema dynamically:
const schema = buildFieldSchema(fields);
// Equivalent to: z.object({ f1: z.string().email(), f2: z.number().min(1).max(5).optional() })

// This exact schema validates form submissions on the backend
// The SAME schema can be used on the frontend for real-time validation
```

**Interview answer:** "Zod provides runtime validation with compile-time type inference. The key insight is `z.infer<typeof schema>` — you define validation rules once and get TypeScript types for free. The shared `@repo/validators` package means frontend and backend validate with identical rules."

---

# PART 3 — THE MONOREPO STRUCTURE IN DETAIL

## Visual Map

```
scribbleforms/
│
├── apps/                         ← Runnable applications (deployable units)
│   ├── api/                      ← The HTTP server (what runs on Render)
│   └── worker/                   ← Background job processor (separate Render service)
│
├── packages/                     ← Shared libraries (not deployable themselves)
│   ├── database/                 ← Schema + migrations + seed + DB client
│   ├── trpc/                     ← All API logic: routers, services, repositories
│   ├── validators/               ← Shared Zod schemas (frontend + backend)
│   ├── redis/                    ← Redis client singleton + helpers
│   ├── queues/                   ← BullMQ queue definitions
│   ├── constants/                ← Plan limits, field registry, rate limits
│   └── logger/                   ← Structured logging
│
├── turbo.json                    ← Turborepo pipeline configuration
├── pnpm-workspace.yaml           ← Tells pnpm about the monorepo structure
└── README.md                     ← Getting started guide
```

## Why This Split Between `apps/` and `packages/`?

**`apps/`** = things you deploy. Each app is a separate process with its own `package.json` and its own startup command. You deploy them independently.

**`packages/`** = things you share. They're libraries — they don't run on their own. They're imported by apps.

**Critical insight:** The `apps/worker` is separate from `apps/api` even though they share code (both use `@repo/queues`, `@repo/database`). Why? Because:
1. Workers hold long-lived Redis connections — the BullMQ "blocking pop" pattern. These block the event loop in ways that would hurt HTTP response times if mixed.
2. A crashing worker (e.g., a malformed webhook payload causes an unhandled exception) should NOT crash the API server.
3. You can scale them independently — add more worker instances when emails pile up without touching the API.

## Every Package Explained

### `packages/database/` — The Foundation

**Purpose:** Single source of truth for the database. Every other package imports from here.

**What's inside:**
- `models/` — Drizzle table definitions (one file per entity)
- `schema.ts` — Barrel file that re-exports all models (so other packages do `import { usersTable } from "@repo/database/schema"`)
- `index.ts` — Creates and exports the Drizzle DB client
- `drizzle.config.ts` — Config for Drizzle Kit (the migration CLI tool)
- `env.ts` — Validates `DATABASE_URL` env var
- `seed/index.ts` — Populates demo data

**Why schema in a separate package?**
Both `packages/trpc` and `apps/worker` need to query the database. If the schema lived inside `apps/api`, the worker couldn't import it without circular dependencies. A shared `packages/database` solves this cleanly.

**What happens if you delete it?** Everything breaks. Every package depends on it.

**The database client:**
```typescript
// packages/database/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });
// The { schema } option enables Drizzle's relational query builder
// Without it, you can't use db.query.usersTable.findFirst()
```

### `packages/trpc/` — The Brain

**Purpose:** Contains ALL business logic. This is the most important package.

**What's inside:**
```
packages/trpc/server/
├── trpc.ts              ← Initializes the tRPC instance
├── context.ts           ← Defines the TRPCContext type
├── index.ts             ← Assembles all routers into one serverRouter
├── errors/              ← Custom error codes with domain-specific messages
├── middleware/
│   ├── auth.middleware.ts   ← isAuthenticated middleware
│   └── plan.middleware.ts   ← plan feature gating
├── utils/
│   └── audit.ts         ← Fire-and-forget audit log writer
└── routes/
    ├── auth/            ← Authentication (login, signup, OAuth, etc.)
    │   ├── schema.ts    ← Zod input/output schemas
    │   ├── repository.ts ← Database queries
    │   ├── service.ts   ← Business logic
    │   ├── route.ts     ← tRPC procedures
    │   ├── utils.ts     ← Cookie helpers
    │   └── constants.ts ← AUTH_COOKIE_NAME
    ├── forms/           ← Form CRUD + publish/unpublish + public access
    ├── fields/          ← Field CRUD + reorder + duplicate
    ├── responses/       ← Response list + export
    ├── analytics/       ← Stats, dashboard, event tracking
    ├── themes/          ← Theme list + apply
    ├── webhooks/        ← Webhook CRUD + test
    ├── api-keys/        ← API key CRUD
    └── health/          ← Health check
```

**The four-layer pattern (schema → repository → service → route):**

Every route follows the same four files:

```
schema.ts     → What data looks like (Zod schemas)
repository.ts → How to talk to the database (raw Drizzle queries)
service.ts    → Business rules (what you're allowed to do)
route.ts      → HTTP endpoint (input → call service → output)
```

**Why this separation?**

```
repository.ts:  "Give me the form with id X from the database"
service.ts:     "Give me form X, but only if it's published and not expired"
route.ts:       "The user requested form X. Validate their session, call service, return JSON"
```

Each layer has ONE job. This is the **Single Responsibility Principle** in practice:

- Want to change how pagination works? Edit `repository.ts`
- Want to change the business rule about expired forms? Edit `service.ts`
- Want to change the HTTP method from GET to POST? Edit `route.ts`
- Want to change the response shape? Edit `schema.ts`

**Testing benefit:** Services are testable without an HTTP server. Repositories are mockable. Tests in `server/__tests__/` mock the repository and test only the service logic.

### `packages/validators/` — Shared Validation

**Purpose:** Zod schemas and validation utilities used by BOTH frontend and backend.

**The key insight:**
```
Before: buildFieldSchema() lived in apps/api/src/routes/submit.ts
After:  buildFieldSchema() lives in packages/validators/src/submission-schema.ts
```

Why does this matter? The frontend can now import the same schema:
```typescript
// On the frontend (form renderer):
import { buildFieldSchema, applyConditions } from "@repo/validators";
// Real-time validation with the EXACT same rules as the backend
// Zero possibility of frontend/backend validation drift
```

**What's inside:**
- `submission-schema.ts` — `submissionEnvelopeSchema` (envelope validation) + `buildFieldSchema()` (dynamic field validation)
- `field-conditions.ts` — `applyConditions()` (evaluates conditional logic — which fields are visible)

**Interview talking point:** "The shared validators package is the architectural signal that we take validation seriously. A field that's required on the backend is required on the frontend. They use the exact same code."

### `packages/redis/` — Caching Layer

**Purpose:** One Redis client instance shared across the entire application.

**Why a singleton?** Each Redis connection has overhead. If every service created its own connection, you'd exhaust the connection pool quickly. A singleton means one connection per process.

```typescript
// packages/redis/src/index.ts
let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL!);
  }
  return redisInstance; // returns the SAME instance every time
}
```

**The cache helper functions:**
```typescript
// cacheGet: wraps redis.get() with JSON.parse + error handling
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) as T : null;
  } catch {
    return null; // Redis down → cache miss → fall through to DB (graceful degradation)
  }
}
```

**Why `try/catch` in every cache operation?**
A Redis outage should NOT crash the API. By catching errors and returning `null`, every cache miss simply falls through to the database. The service is slower but still functional. This is called **graceful degradation**.

### `packages/queues/` — Job Queue Definitions

**Purpose:** Defines BullMQ queues used by both the API (to enqueue jobs) and the worker (to process jobs).

**Why shared between API and worker?**
Both need to reference the same queue name ("email", "webhook", etc.). If these were defined separately, a naming mismatch would silently break delivery.

```typescript
// API enqueues:
safeEnqueue(getEmailQueue(), "welcome", { type: "welcome", userId: "..." });

// Worker dequeues from same queue:
const emailWorker = new Worker("email", async (job) => { /* process */ });
```

**The `safeEnqueue` wrapper:**
```typescript
export async function safeEnqueue(queue: Queue, jobName: string, data: unknown): Promise<void> {
  try {
    await queue.add(jobName, data);
  } catch {
    // Queue unavailable (Redis down) → log and continue
    // The form submission still succeeds even if the email fails to queue
  }
}
```

This is the "fire and forget" pattern — the HTTP response is sent regardless of whether the side effect (email, webhook) succeeds.

### `packages/constants/` — Shared Configuration

**Purpose:** Constants shared across packages that can't change at runtime.

**`plan-limits.ts`** — The subscription tier definitions:
```typescript
export const PLAN_LIMITS = {
  free:    { maxForms: 3,  maxFieldsPerForm: 10,  hasWebhooks: false, ... },
  creator: { maxForms: 20, maxFieldsPerForm: 50,  hasWebhooks: false, ... },
  studio:  { maxForms: -1, maxFieldsPerForm: -1,  hasWebhooks: true,  ... },
};
// -1 means unlimited
```

**`field-registry.ts`** — How to serialize/deserialize each field type:
```typescript
export const FIELD_REGISTRY = {
  short_text: {
    serializeAnswer: (value) => ({ valueText: String(value) }),   // how to store in DB
    deserializeAnswer: (row)  => row.valueText,                   // how to read from DB
  },
  rating: {
    serializeAnswer: (value) => ({ valueNumber: String(value) }), // number → DB
    deserializeAnswer: (row)  => row.valueNumber ? parseInt(row.valueNumber) : null,
  },
  multi_select: {
    serializeAnswer: (value) => ({ valueArray: value as string[] }), // array → DB JSONB
    deserializeAnswer: (row)  => row.valueArray ?? [],
  },
};
```

**Why a field registry?**
Different field types store their values in different columns (`value_text`, `value_number`, `value_array`). The registry is a map from field type → serialization strategy. Adding a new field type means adding one entry to this registry — no code changes elsewhere.

---

# PART 4 — THE API SERVER IN DETAIL

## `apps/api/src/server.ts` — The Express Application

**Simple explanation:** Express is the web framework. It receives HTTP requests, runs middleware, and sends responses. Think of middleware as a pipeline — every request passes through each piece of middleware in order.

**Why Express if we're using tRPC?**
tRPC is not a standalone server — it's a library that handles RPC calls. It needs to be mounted ON an HTTP server. Express provides:
- Cookie parsing (`cookie-parser` middleware)
- CORS headers
- Security headers (`helmet`)
- Rate limiting
- Custom REST routes (OAuth, form submission, file upload)

**The middleware pipeline:**
```
HTTP Request
     ↓
  helmet     → Sets security headers (X-Frame-Options, Content-Security-Policy, etc.)
     ↓
  cors       → Allows frontend origin, enables credentials (cookies)
     ↓
  json()     → Parses request body as JSON
     ↓
  cookieParser → Parses cookies into req.cookies object
     ↓
  trustProxy → Trusts X-Forwarded-For header (needed behind Render/Railway load balancers)
     ↓
  X-Request-Id → Adds unique trace ID to every response
     ↓
  rateLimiters.global → Max 200 requests/minute per IP
     ↓
  /auth/google/* → OAuth routes (Express REST, not tRPC — needs redirects)
     ↓
  /upload/sign → Cloudinary pre-sign (Express REST)
     ↓
  /f/:slug/submit → Form submission (Express REST, special rate limiter per slug)
     ↓
  /api/* → REST adapter (trpc-to-openapi converts REST ↔ tRPC)
     ↓
  /trpc/* → Native tRPC adapter (@trpc/server/adapters/express)
     ↓
  404 handler → Returns { code: "NOT_FOUND" }
     ↓
  Error handler → Returns { code: "INTERNAL_SERVER_ERROR" }
```

**Why are submission, OAuth, and upload NOT tRPC routes?**
- **Form submission** (`/f/:slug/submit`): Needs per-slug rate limiting. The slug comes from the URL path, not the request body. tRPC routes receive the input as JSON body or query params — URL path parameters aren't natural for tRPC.
- **Google OAuth** (`/auth/google/*`): OAuth requires HTTP redirects (`res.redirect(url)`). tRPC procedures return data, not redirects.
- **Upload signing** (`/upload/sign`): Could be tRPC, but the response is raw JSON for Cloudinary — no benefit from tRPC type inference here.

## `apps/api/src/env.ts` — Fail-Fast Environment Validation

**Why validate env vars at startup?**

Without validation:
```
Server starts ✓
User signs up ✓
User tries password reset ✗ → crash: "RESEND_API_KEY is not defined"
```

With validation (our approach):
```
Server starts → validates env → RESEND_API_KEY missing → process.exit(1) with clear error
// Deployment fails immediately, not 3 hours later when a user triggers the code path
```

**How it works:**
```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"), // must exist and be non-empty
  PORT:         z.coerce.number().default(8000),  // coerce means "convert string '8000' to number 8000"
  REDIS_URL:    z.string().default("redis://localhost:6379"), // optional with default
});

export const env = envSchema.parse(process.env); // throws on startup if invalid
```

`z.coerce.number()` is needed because ALL environment variables are strings. `process.env.PORT` is `"8000"` (string), not `8000` (number). Zod's coerce automatically converts it.

## `apps/api/src/context.ts` — The tRPC Context

**Simple explanation:** Context is a JavaScript object that tRPC creates for EVERY request and passes to every procedure handler. It's how procedures know who the user is, how to set cookies, and how to access shared services.

**What's in the context:**
```typescript
interface TRPCContext {
  createCookie: (name, value, options?) => void,  // wraps res.cookie()
  getCookie:    (name) => string | undefined,      // wraps req.cookies[name]
  clearCookie:  (name) => void,                   // wraps res.clearCookie()
  user:         SessionUser | null,               // set by auth middleware
  req:          Request,                          // the raw Express request
}
```

**The cookie factory pattern — the most important architectural decision:**

```typescript
// ❌ BAD approach (what beginners do):
async function login(input, req, res) { // service receives HTTP objects
  const user = await validateCredentials(input);
  res.cookie("sf_session", token);  // service has HTTP side effect
  return user;
}
// Problem: service is coupled to Express. Can't test without spinning up HTTP.

// ✅ GOOD approach (what we do):
// 1. Context creation (runs once per request):
export async function createContext({ req, res }) {
  return {
    createCookie: createCookieFactory(res), // captures res in closure
    getCookie:    getCookieFactory(req),
    // ... other stuff
  };
}

// 2. Auth service (pure — no HTTP knowledge):
async function login(input, ipAddress, userAgent) {
  const token = await createSession();
  return { user, token }; // just returns the token — doesn't set it
}

// 3. Route handler (thin layer that connects HTTP to service):
login: publicProcedure.mutation(async ({ input, ctx }) => {
  const { user, token } = await authService.login(input, ip, ua);
  ctx.createCookie("sf_session", token, cookieOptions); // sets cookie
  return user;
})
```

**Why this matters for testing:**
```typescript
// Testing the service (no HTTP needed):
const result = await authService.login({ email: "a@b.com", password: "Pass1" }, "", "");
expect(result.token).toBeTruthy(); // just checks the returned token

// The service doesn't know about cookies or Express — pure function
```

## `apps/api/src/lib/cookie/index.ts` — The Cookie Factories

Three factory functions, each captures the `req` or `res` by closure:

```typescript
export function createCookieFactory(res: Response) {
  return function createCookie(name: string, value: string, options?: CookieOptions) {
    res.cookie(name, value, options); // res is captured from outer scope
  };
}
```

**What's a closure?** When `createCookieFactory(res)` is called, it creates a new function that "remembers" the `res` from the outer scope. Every request gets its own `res`, so every request's `createCookie` writes to its own response object.

**Cookie security flags:**
```typescript
const DEFAULT_OPTIONS = {
  httpOnly: true,   // JS can't read this cookie (prevents XSS theft)
  secure: true,     // only sent over HTTPS (prevents HTTP interception)
  sameSite: "lax",  // sent on same-site requests + top-level navigation (CSRF protection)
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in milliseconds
};
```

- `httpOnly: true` — If there's an XSS vulnerability, the attacker's JavaScript cannot read the session cookie. This is the single most important security flag.
- `secure: true` — The cookie is only sent over HTTPS. In production, this prevents session theft over HTTP connections.
- `sameSite: "lax"` — The cookie is sent when navigating TO the site, but not on cross-site POST requests. This prevents CSRF attacks where a malicious site tricks your browser into submitting forms.

---

# PART 5 — AUTHENTICATION SYSTEM (DEEP DIVE)

## How Login Works (Step by Step)

### Step 1: User submits login form
```
POST /api/auth/login
Body: { email: "alice@example.com", password: "Password1" }
```

### Step 2: Express receives request, runs middleware
- Helmet sets security headers
- CORS validates origin
- `express.json()` parses body
- `cookieParser()` parses existing cookies
- Rate limiter checks: has this IP made 10+ failed auth attempts in 15 minutes?

### Step 3: tRPC adapter receives the request
The `createOpenApiExpressMiddleware` adapter receives the request and calls `createContext({ req, res })`:
```typescript
// apps/api/src/context.ts
export async function createContext({ req, res }) {
  return {
    createCookie: createCookieFactory(res), // bound to this specific res object
    getCookie:    getCookieFactory(req),
    clearCookie:  clearCookieFactory(res),
    user:         null,  // no user yet — set by auth middleware for protected routes
    req,
  };
}
```

### Step 4: tRPC finds the `auth.login` procedure
The procedure has no middleware (it's a `publicProcedure`) so it runs directly.

Input validation runs first:
```typescript
.input(loginInputSchema) // z.object({ email: z.string().email(), password: z.string().min(1) })
// If email is "notanemail", tRPC throws a 400 before our code runs
```

### Step 5: The route handler calls the service
```typescript
.mutation(async ({ input, ctx }) => {
  const ip = ctx.req.ip ?? "";
  const ua = ctx.req.headers["user-agent"] ?? "";
  const { user, token } = await authService.login(input, ip, ua);
  setAuthCookie(ctx, token); // calls ctx.createCookie(...)
  return user;
})
```

### Step 6: AuthService.login runs the business logic
```typescript
async login(payload, ipAddress, userAgent) {
  // 1. Find user by email (case-insensitive)
  const user = await this.repository.findUserByEmail(payload.email);

  // 2. SAME error for wrong email AND wrong password (prevents user enumeration)
  if (!user || !user.salt || !user.password) {
    throw domainError("INVALID_CREDENTIALS", "Wrong email or password", "UNAUTHORIZED");
  }

  // 3. Hash the submitted password with the stored salt and compare
  const hash = this.hashPassword(payload.password, user.salt);
  if (hash !== user.password) {
    throw domainError("INVALID_CREDENTIALS", "Wrong email or password", "UNAUTHORIZED"); // same message!
  }

  // 4. Create a new session
  const token = randomBytes(64).toString("hex"); // 128-char hex string
  await this.repository.createSession({ userId: user.id, token, ipAddress, userAgent });

  return { user, token };
}
```

**Why the same error message for wrong email and wrong password?**
If you return different errors, an attacker can probe accounts:
- "Wrong email" → this email is NOT registered → try the next email
- "Wrong password" → this email IS registered → now try passwords

Same message → attacker learns nothing.

### Step 7: Password verification (HMAC-SHA256 + salt)
```typescript
hashPassword(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
}
```

**What is HMAC-SHA256?**
SHA-256 is a one-way hash function. `HMAC(salt, password)` means "hash the password with the salt as a secret key." The result is always the same for the same salt+password combination, but different salts produce completely different hashes for the same password.

**Why a unique salt per user?**
Without salt: If two users have password "Password1", their hashes are identical. An attacker who cracks one cracks both.
With salt: `HMAC(salt1, "Password1")` ≠ `HMAC(salt2, "Password1")` — even for the same password.

### Step 8: Session token creation
```typescript
const token = randomBytes(64).toString("hex");
// → "a3b5f8..." (128 hex characters = 512 bits of entropy)
// Probability of guessing: 1 in 2^512 ≈ mathematically impossible
```

The token is stored in the `sessions` table with an expiry timestamp.

### Step 9: Cookie is set on the response
```typescript
setAuthCookie(ctx, token);
// → calls ctx.createCookie("sf_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: ... })
```

The browser receives a `Set-Cookie: sf_session=a3b5f8...; HttpOnly; Secure; SameSite=Lax` header.

### Step 10: Response sent to client
```
HTTP/1.1 200 OK
Set-Cookie: sf_session=a3b5f8...; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
Content-Type: application/json

{ "id": "uuid...", "email": "alice@example.com", "plan": "free" }
```

Note: the password and salt are NOT in the response because the output schema only includes `{ id, email, fullName, plan, avatarUrl }`.

## How Protected Routes Work

Every subsequent request from the logged-in user includes the cookie automatically (the browser sends all matching cookies with every request). Here's how `protectedProcedure` validates it:

### `packages/trpc/server/middleware/auth.middleware.ts`

```typescript
const isAuthenticated = middleware(async ({ ctx, next }) => {
  // 1. Read the cookie
  const token = ctx.getCookie("sf_session");
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });

  // 2. Try Redis cache first (fast path: ~0.5ms)
  const cacheKey = `sf:session:${token}`;
  const cached = await cacheGet<SessionUser>(cacheKey);
  if (cached) {
    return next({ ctx: { ...ctx, user: cached } }); // set user on context, continue
  }

  // 3. Cache miss → query PostgreSQL (slower path: ~5ms)
  const session = await db.select({ user: { id, email, plan... } })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);

  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });

  // 4. Cache the user for 15 minutes (next requests use cache)
  await cacheSet(cacheKey, session.user, 900);

  // 5. Inject user into context and continue
  return next({ ctx: { ...ctx, user: session.user } });
});

export const protectedProcedure = publicProcedure.use(isAuthenticated);
```

**The `next()` function** is how tRPC middleware chains work. Calling `next({ ctx: newCtx })` passes the modified context to the next middleware or the procedure handler. NOT calling `next()` means the request stops here (returns an error).

---

# PART 6 — GOOGLE OAUTH DEEP DIVE

## What OAuth Is (Simple Explanation)

OAuth lets users log in with their Google/GitHub account instead of creating a password. The idea is: "I trust Google to verify this person's identity. Google says this is Alice. I'll create/find Alice's account."

## The Full OAuth Flow (Step by Step)

```
Browser                    Our API              Google
   |                          |                    |
   | 1. Click "Login with      |                    |
   |    Google"                |                    |
   |                          |                    |
   | 2. GET /auth/google/redirect                  |
   |──────────────────────────>|                    |
   |                          | 3. Generate random |
   |                          |    "state" string  |
   |                          |    Set state cookie|
   |                          |                    |
   | 4. 302 Redirect to Google OAuth URL           |
   |<─────────────────────────|                    |
   |                          |                    |
   | 5. Follow redirect to Google                  |
   |───────────────────────────────────────────────>
   |                          |                    |
   |      6. User approves "Sign in with Google"  |
   |                          |                    |
   | 7. 302 Redirect back to /auth/google/callback?code=xyz&state=abc
   |<───────────────────────────────────────────────
   |                          |                    |
   | 8. GET /auth/google/callback?code=xyz&state=abc
   |──────────────────────────>|                    |
   |                          | 9. Verify state    |
   |                          |    (prevents CSRF) |
   |                          |                    |
   |                          | 10. Exchange code  |
   |                          |─────────────────────>
   |                          |                    |
   |                          | 11. Receive access |
   |                          |    + id_token      |
   |                          |<─────────────────────
   |                          |                    |
   |                          | 12. Verify id_token|
   |                          |    Extract email   |
   |                          |                    |
   |                          | 13. Upsert user in |
   |                          |    PostgreSQL       |
   |                          |                    |
   |                          | 14. Create session |
   |                          |    Set sf_session  |
   |                          |    cookie          |
   |                          |                    |
   | 15. 302 Redirect to frontend /dashboard       |
   |<─────────────────────────|                    |
```

**The state parameter (step 3 and 9) prevents CSRF:**
If there's no state check, an attacker could trick your browser into completing an OAuth flow with the attacker's Google account — effectively logging you into their account.

The state is a random string stored in a cookie. When Google redirects back with `?state=abc`, we check that it matches the cookie. If it doesn't match (the user didn't initiate this flow), we abort.

**The code exchange (step 10):**
Google redirects with a `code` parameter. This code is short-lived (60 seconds) and single-use. We exchange it for actual tokens server-side. The browser never sees the access token — only the code, which is useless without our client secret.

## `apps/api/src/routes/oauth.ts` Implementation

```typescript
oauthRouter.get("/auth/google/callback", async (req, res) => {
  const code        = req.query["code"] as string | undefined;
  const state       = req.query["state"] as string | undefined;
  const cookieState = req.cookies?.["oauth_state"]; // the state we set in step 3

  // CSRF check: state must match
  if (!state || state !== cookieState) {
    return res.redirect(`${env.WEB_URL}/login?error=oauth_state_mismatch`);
  }

  // Exchange code for tokens (this is a server-to-server call, not browser-to-Google)
  const tokenRes = await client.getToken(code!);
  const tokens   = tokenRes.tokens;

  // Verify the id_token (JWT signed by Google)
  const ticket  = await client.verifyIdToken({ idToken: tokens.id_token!, audience: env.GOOGLE_CLIENT_ID! });
  const payload = ticket.getPayload()!;
  // payload contains: { email, name, picture, sub (Google user ID) }

  // Upsert the user (create if new, find if existing)
  const user = await authRepo.upsertOAuthUser({
    email:          payload.email!,
    fullName:       payload.name ?? null,
    authProvider:   "google",
    providerUserId: payload.sub, // Google's unique user ID
  });

  // Create a session and set the cookie
  const token = randomBytes(64).toString("hex");
  await authRepo.createSession({ userId: user.id, token, ipAddress: req.ip ?? "", userAgent: req.headers["user-agent"] ?? "" });
  res.cookie("sf_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });

  // Redirect to the frontend dashboard
  res.redirect(`${env.WEB_URL}/dashboard`);
});
```

**Why is OAuth an Express route, not tRPC?**
tRPC procedures return data. OAuth requires `res.redirect(url)` — sending a 302 HTTP response that tells the browser to navigate to a new URL. That's not a data response, it's a navigation command. Express handles this naturally; tRPC doesn't.

---

# PART 7 — DATABASE ARCHITECTURE (EVERY TABLE)

## Entity Relationship Diagram

```
users (1) ────────── (many) sessions
  │                          [session tokens, expiry, IP]
  │
  ├───── (many) forms ────── (many) form_versions
  │                │                [field snapshot on publish]
  │                │
  │                ├───── (many) fields
  │                │              [type, label, required, config JSONB, conditions JSONB]
  │                │
  │                ├───── (many) responses ──── (many) response_answers
  │                │              [ip_hash, time]    [valueText/Number/Array per field]
  │                │
  │                ├───── (many) analytics_events
  │                │              [form_view, form_start, field_skip, form_submit]
  │                │
  │                └───── (many) analytics_daily
  │                               [pre-aggregated: views/starts/completions per day]
  │
  ├───── (many) webhooks ──── (many) webhook_deliveries
  │
  ├───── (many) api_keys
  │
  └───── (many) audit_logs

themes (standalone — seeded system themes + user custom themes)
export_jobs (tracks async CSV export progress)
```

## Every Table Explained

### `users`
Stores creator accounts. Supports two auth methods:
- Email/password: `password` (HMAC hash) + `salt` (16-byte hex) columns
- OAuth: `auth_provider` ("google"/"github") + `provider_user_id` (Google's `sub` field)
- `plan` enum: "free" | "creator" | "studio" — controls feature access
- `deleted_at` soft delete: users are never hard-deleted (preserves their forms/responses)

### `sessions`
Stores login sessions. Each login creates one row.
- `token`: 128-char hex (64 random bytes) — this is the cookie value
- `expires_at`: 30 days from creation
- `ip_address`: stored for security audit (was this login from an unusual location?)
- Why not JWT? JWTs are stateless — you can't revoke them. Session tokens can be deleted to force logout.

### `forms`
The core entity. Key design decisions:
- `slug`: auto-generated unique URL slug (e.g., "my-form-a3b5")
- `custom_slug`: user-defined slug (e.g., "job-application") — creator/studio plan
- `status` enum: draft | published | archived | paused
- `visibility` enum: public | unlisted
- `current_version_id`: FK to `form_versions` — which snapshot is live
- `password_hash`: bcrypt hash — null if no password required
- `response_limit`: max responses allowed — null if unlimited
- `expires_at`: after this date, submissions rejected — null if never
- `total_responses` / `total_views`: denormalized counters (fast reads, updated atomically via SQL)

**Why denormalized counters?**
`SELECT COUNT(*) FROM responses WHERE form_id = X` on a table with millions of rows is slow. Keeping a counter on the form row means reading it is O(1). We update it atomically with `SET total_responses = total_responses + 1` in the same transaction as the insert.

### `form_versions`
Snapshots of field configuration at publish time. `fields_json` stores the entire fields array as JSONB.

**Why store the whole array as JSON instead of joining to `fields`?**
If you relied on joining `fields` at submission time, updating a field after publishing would change what old responses were validated against. The snapshot is immutable — it captures exactly what the form looked like when published.

### `fields`
Individual questions in a form.
- `type` enum: 13 types (short_text, email, number, rating, single_select, multi_select, checkbox, date, phone, long_text, file_upload, divider, section_title)
- `config` JSONB: type-specific config:
  - For `single_select`: `{ "options": ["Yes", "No", "Maybe"] }`
  - For `rating`: `{ "max": 5 }`
  - For `short_text`: `{ "minLength": 10, "maxLength": 200 }`
- `conditions` JSONB: conditional logic rules
  - Example: `{ "show": true, "logic": "and", "rules": [{ "fieldId": "uuid", "operator": "equals", "value": "Yes" }] }`
  - If this field's conditions are met, show it; otherwise hide it

**Why JSONB for config and conditions?**
Different field types have completely different configurations. A relational approach would need separate tables for each config type (rating_config, select_config, text_config...) — very complex to query. JSONB stores arbitrary structure and PostgreSQL can index into it.

### `responses` and `response_answers`
Two-table design:
- `responses`: one row per form submission (metadata: IP hash, time, completion time)
- `response_answers`: many rows per response (one row per field answer)

**Why separate tables?**
A form might have 20 fields. Storing all 20 answers in one `responses` row would require 20 dynamic columns (impossible to know in advance). The normalized design allows any number of answers per response.

**Why `value_text`, `value_number`, `value_array` instead of just one JSON column?**
Enables efficient SQL queries:
- `SELECT AVG(value_number) FROM response_answers WHERE field_id = X` — average of a rating field
- `SELECT * FROM response_answers WHERE value_text ILIKE '%@gmail.com'` — find Gmail users
- Can add B-tree indexes on `value_text` for fast text search

### `analytics_events` and `analytics_daily`
Two-level analytics storage:

**`analytics_events`** (raw): Every trackable event is stored here.
```
form_view    → someone visited the form page
form_start   → someone started filling the form
field_focus  → someone clicked on a field
field_blur   → someone left a field
field_skip   → someone moved past a field without filling it
form_submit  → form was successfully submitted
form_abandon → someone closed the page without submitting
```

**`analytics_daily`** (aggregated): Pre-computed daily rollup.
```
form_id | date       | views | starts | completions | abandons | avg_time_ms
f1-uuid | 2025-01-15 | 423   | 287    | 198         | 89       | 75000
```

**Why two tables?**
The dashboard shows charts with 30 days of data. Running `SELECT COUNT(*) GROUP BY date` over millions of raw events for every dashboard load is O(N) over millions of rows. The daily rollup is O(30 rows) — thousands of times faster.

The analytics worker processes raw events and updates the daily rollup:
```typescript
await db.insert(analyticsDailyTable).values({ date, views: 1 })
  .onConflictDoUpdate({ set: { views: sql`analytics_daily.views + 1` } });
// If today's row exists, increment; if not, create it
```

---

# PART 8 — TRPC INTERNALS (HOW THE MAGIC WORKS)

## What tRPC Actually Does

Without tRPC, you write code like this:

**Backend** (`/api/forms`):
```typescript
app.get("/api/forms", async (req, res) => {
  const forms = await db.select().from(formsTable);
  res.json(forms); // TypeScript type: any — the frontend has no idea what this returns
});
```

**Frontend**:
```typescript
const response = await fetch("/api/forms");
const data = await response.json(); // TypeScript type: any — no safety
// data.forms[0].titl ← typo, no error until users hit it
```

With tRPC:

**Backend** (`packages/trpc/server/routes/forms/route.ts`):
```typescript
list: protectedProcedure
  .input(formListInputSchema)   // input shape defined with Zod
  .output(formListOutputSchema) // output shape defined with Zod
  .query(async ({ input, ctx }) => {
    return formService.listForUser(ctx.user!.id, input);
    // TypeScript KNOWS this returns { forms: FormOutput[], nextCursor: string | null, total: number }
  }),
```

**Frontend** (zero extra configuration needed):
```typescript
const { data } = trpc.forms.list.useQuery({ limit: 20 });
// data is typed as { forms: FormOutput[], nextCursor: string | null, total: number }
// data.forms[0].titl ← TypeScript ERROR immediately
```

## `packages/trpc/server/trpc.ts` — The Foundation

```typescript
import { initTRPC } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import type { TRPCContext } from "./context";

const t = initTRPC
  .meta<OpenApiMeta>()        // adds .meta({ openapi: {} }) capability
  .context<TRPCContext>()     // all procedures get access to ctx: TRPCContext
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          // Never expose stack traces in production — security risk
        },
      };
    },
  });

export const router        = t.router;         // used to create sub-routers
export const publicProcedure = t.procedure;    // base procedure (no auth)
export const middleware    = t.middleware;      // used to create auth/plan middleware
```

**What `initTRPC` does:** Creates a tRPC instance configured for your specific context type and metadata shape. The generic parameters `<OpenApiMeta>` and `<TRPCContext>` are TypeScript type parameters that flow down to every procedure defined with this instance.

## How Router Assembly Works

```typescript
// packages/trpc/server/index.ts
export const serverRouter = router({
  health:    healthRouter,    // GET /api/health
  auth:      authRouter,      // POST /api/auth/login, etc.
  forms:     formsRouter,     // GET /api/forms, POST /api/forms, etc.
  fields:    fieldsRouter,    // POST /api/forms/{formId}/fields, etc.
  responses: responsesRouter, // ...
  // ...
});

export type ServerRouter = typeof serverRouter;
// ServerRouter is the TYPE of the entire router — exported for frontend use
```

The router is just a nested object. `router.forms.list` maps to `formsRouter.list`. The path in the URL `/api/forms` and the tRPC path `trpc.forms.list` are both derived from this nesting.

## How `protectedProcedure` Works

```typescript
// auth.middleware.ts:
const isAuthenticated = middleware(async ({ ctx, next }) => {
  const token = ctx.getCookie("sf_session");
  // ... validate token ...
  return next({ ctx: { ...ctx, user: validatedUser } }); // inject user
});

// This creates a new procedure type with user guaranteed non-null:
export const protectedProcedure = publicProcedure.use(isAuthenticated);

// Usage in route:
list: protectedProcedure.query(async ({ input, ctx }) => {
  // TypeScript KNOWS ctx.user is not null here because isAuthenticated
  // calls next() only after setting ctx.user
  const forms = await formService.listForUser(ctx.user!.id, input);
  //                                                    ^^^
  //                                       TypeScript: ctx.user is SessionUser, not null
});
```

**The `next()` pattern:** tRPC middleware is similar to Express middleware. Calling `next({ ctx })` means "proceed to the next middleware or the handler, with this updated context." NOT calling next means "stop here and throw an error."

## How `trpc-to-openapi` Works

Standard tRPC: All calls go to `POST /trpc/forms.list` with JSON body `{ "0": { "input": {...} } }`
— weird for REST clients.

With `trpc-to-openapi`: We annotate each procedure:
```typescript
list: protectedProcedure
  .meta({ openapi: { method: "GET", path: "/forms", tags: ["Forms"] } })
  //                ^^^^^^^^^^^^^^^ This annotation
```

The library reads these annotations and:
1. Generates a REST endpoint `GET /api/forms` that maps to `forms.list`
2. Converts query params to tRPC input format
3. Generates an OpenAPI JSON document

The Scalar docs page at `/docs` renders this OpenAPI document as an interactive UI.

---

# PART 9 — FORM SUBMISSION PIPELINE (MOST COMPLEX FLOW)

## Step-by-Step: What Happens When Someone Submits a Form

```
Browser
POST /f/my-form-slug/submit
Body: {
  formVersionId: "a0eebc99-...",
  answers: {
    "field-uuid-1": "Alice Johnson",
    "field-uuid-2": "alice@example.com"
  },
  metadata: { timeToCompleteMs: 45000 }
}
```

### Layer 1: Envelope Validation (Zod)
```typescript
const envelopeResult = submissionEnvelopeSchema.safeParse(req.body);
// Checks: is formVersionId a valid UUID? is answers an object?
// If not: 422 VALIDATION_FAILED
```

### Layer 2: Honeypot Check
```typescript
if (envelopeResult.data.__hp !== undefined && envelopeResult.data.__hp !== "") {
  // Bot filled the hidden field — silently discard
  return res.status(200).json({ success: true, responseId: crypto.randomUUID() });
}
```

The bot thinks it succeeded. A real user never sees or fills `__hp` (it's hidden with CSS).

### Layer 3: Form Lookup (Cache → DB)
```typescript
// Try Redis first (60s TTL)
let form = await cacheGet(`sf:form:public:${slug}`);
if (!form) {
  // Cache miss: query PostgreSQL
  form = await db.select().from(formsTable).where(/* slug match */).limit(1);
}
// If not found: 404 FORM_NOT_FOUND
```

### Layer 4-7: Gate Checks (Sequential Guards)
```typescript
if (form.status !== "published")  → 403 FORM_NOT_PUBLISHED
if (form.expiresAt < now)         → 410 FORM_EXPIRED
if (form.totalResponses >= limit) → 410 (checked again inside transaction)
if (form.currentVersionId !== submittedVersionId) → 409 FORM_VERSION_OUTDATED
```

The version check (`409`) is critical. If a creator published a new version while someone was filling the form, we tell them to reload rather than validating against the wrong schema.

### Layer 5: Load Version Snapshot
```typescript
const version = await db.select().from(formVersionsTable)
  .where(eq(formVersionsTable.id, formVersionId)).limit(1);
const allFields = version.fieldsJson; // the exact fields as they were at publish time
```

### Layer 6: Apply Conditional Logic
```typescript
const activeFields = applyConditions(allFields, answers);
// "Show Field B only if Field A = 'Yes'"
// If Field A = "No", Field B is removed from activeFields
// The submission is only validated against fields that were actually shown
```

**Why this matters:** If Field B is a required email field but it's hidden because Field A = "No", we shouldn't require Field B to be filled. `applyConditions` removes it from the schema.

### Layer 7: Dynamic Zod Validation
```typescript
const schema = buildFieldSchema(activeFields);
// Generates something equivalent to:
// z.object({
//   "field-uuid-1": z.string().min(1),          // required short_text
//   "field-uuid-2": z.string().email().optional(), // optional email
// })
const validation = schema.safeParse(answers);
// If invalid: 422 VALIDATION_FAILED with per-field errors
```

### Layer 8: Database Transaction (Atomic)
```typescript
const responseId = await db.transaction(async (tx) => {
  // Re-check response limit inside transaction (prevents race condition)
  if (form.responseLimit) {
    const current = await tx.select({ count: formsTable.totalResponses })...;
    if (current >= form.responseLimit) { limitExceeded = true; return null; }
  }

  // 1. Insert response row
  const response = await tx.insert(responsesTable).values({...}).returning();

  // 2. Insert all answer rows
  await tx.insert(responseAnswersTable).values(serializedAnswers);

  // 3. Increment counter atomically
  await tx.update(formsTable).set({ totalResponses: sql`total_responses + 1` });

  return response.id;
}); // If anything fails, ALL three operations are rolled back
```

**Why a transaction?** If the server crashes after inserting the response but before incrementing the counter, the counter would be wrong. A transaction ensures all three operations succeed together or none at all. This is ACID compliance.

### After the Transaction: Fire-and-Forget Side Effects
```typescript
setImmediate(() => {
  safeEnqueue(getEmailQueue(),    "new_response", { formId, responseId });
  safeEnqueue(getAnalyticsQueue(), "track",       { eventType: "form_submit" });
  safeEnqueue(getWebhookQueue(),  "dispatch",     { event: "form.response.created" });
});
// Response is already sent — user gets 200 immediately
// Side effects happen asynchronously in the background
```

`setImmediate` pushes these enqueues to AFTER the current event loop tick — meaning the HTTP response is sent first, then these fire.

---

# PART 10 — BACKGROUND WORKERS

## The Four Workers

### Email Worker (`apps/worker/src/workers/email.worker.ts`)
Handles 4 email types: welcome, password_reset, new_response notification, export_ready.

**Why a worker for emails?**
SMTP calls take 200-500ms. If you send email synchronously during signup, the user waits 500ms longer than necessary. With a queue, signup returns in ~5ms and the email sends in the background.

**Retry strategy:** BullMQ retries failed jobs with exponential backoff:
- Attempt 1: immediate
- Attempt 2: 2 seconds later
- Attempt 3: 4 seconds later
This handles transient SMTP failures without losing emails.

### Webhook Worker (`apps/worker/src/workers/webhook.worker.ts`)
Fires HTTP POST requests to user-configured URLs when events occur.

**HMAC signature verification:**
```typescript
const body = JSON.stringify(payload);
const sig  = createHmac("sha256", webhook.secret).update(body).digest("hex");
// Header: X-ScribbleForms-Signature: sha256=<hex>
```

Recipients verify by recomputing the HMAC with their stored secret. If the header doesn't match, the request was either tampered with or not from ScribbleForms.

**SQL filtering (fixed from O(N) scan):**
```typescript
// Instead of loading ALL webhooks and filtering in JS:
.where(and(
  eq(webhooksTable.isActive, true),
  or(isNull(webhooksTable.formId), eq(webhooksTable.formId, formId)),
  sql`${webhooksTable.events} @> ${JSON.stringify([event])}::jsonb` // JSONB array contains
))
```

The `@>` operator checks if the JSONB `events` array contains the event string. This runs in the database with an index, not by loading all rows into JavaScript memory.

### Analytics Worker (`apps/worker/src/workers/analytics.worker.ts`)
Processes raw analytics events and updates the daily aggregate table.

```typescript
// Upsert pattern: INSERT new row, or UPDATE existing row's counter
await db.insert(analyticsDailyTable)
  .values({ formId, date, views: 1 })
  .onConflictDoUpdate({
    target: [analyticsDailyTable.formId, analyticsDailyTable.date],
    set: { views: sql`analytics_daily.views + 1` }
  });
```

### Export Worker (`apps/worker/src/workers/export.worker.ts`)
Generates CSV files asynchronously and uploads to Cloudinary.

**Why async export?**
A form with 10,000 responses might take 30 seconds to export. You can't make a user wait 30 seconds for an HTTP response (browser timeout is usually 30s). The pattern:
1. API: create export job record (status: "pending"), enqueue job, return `{ exportJobId }`
2. Worker: generate CSV, upload to Cloudinary, update job record (status: "done", fileUrl: "...")
3. Frontend: poll `GET /api/export/{jobId}/status` every 2 seconds until status is "done"

---

# PART 11 — ANALYTICS CALCULATION

## How Form Stats Are Computed

```typescript
async getFormStats({ formId, startDate, endDate }) {
  // 1. Query pre-aggregated daily data (fast — small table)
  const daily = await db.select().from(analyticsDailyTable)
    .where(and(eq(formId), betweenDates(startDate, endDate)));

  // 2. Simple arithmetic from aggregates
  const totalViews       = sum(daily.map(d => d.views));
  const totalStarts      = sum(daily.map(d => d.starts));
  const totalCompletions = sum(daily.map(d => d.completions));
  const completionRate   = (totalCompletions / totalStarts) * 100;
  const dropOffRate      = ((totalStarts - totalCompletions) / totalStarts) * 100;

  // 3. Average completion time from responses table (needs raw data)
  const avgTime = await db.select({ avg: avg(responses.timeToCompleteMs) })
    .from(responsesTable).where(and(formId, betweenDates));

  // 4. Device breakdown from user agents (UA string parsing)
  const devices = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
  for (const r of allResponses) {
    if (/Mobi|Android|iPhone/.test(r.userAgent)) devices.mobile++;
    else if (/iPad|Tablet/.test(r.userAgent))     devices.tablet++;
    else                                           devices.desktop++;
  }

  // 5. Field drop-off from skip events
  const skipEvents = await db.select({ fieldId, skipCount: count() })
    .from(analyticsEventsTable)
    .where(and(formId, eventType = "field_skip", betweenDates))
    .groupBy(fieldId);

  const fieldDropOff = fields.map(f => ({
    fieldId: f.id,
    fieldLabel: f.label,
    dropOffRate: (skipMap.get(f.id) ?? 0) / totalStarts * 100,
  }));

  // 6. Previous period comparison (same duration, immediately before)
  const prevData = /* same queries for prev period */;

  return { totalResponses, completionRate, dropOffRate, avgTimeToCompleteMs,
           deviceBreakdown, fieldDropOff, topSources, responsesOverTime, previousPeriod };
}
```

## The Two-Phase Analytics Pattern

```
Phase 1 (Real-time, synchronous):
  Form submit → insert response → increment total_responses counter
  Analytics track event → enqueue to BullMQ

Phase 2 (Async, via worker):
  BullMQ job → insert raw analytics_event → upsert analytics_daily aggregate
  "views + 1" or "starts + 1" etc.

Phase 3 (On demand, cached):
  Dashboard load → query analytics_daily (30 rows) → compute stats → cache 5 min
  Next load within 5 min → Redis cache hit → instant response
```

---

# PART 12 — PLAN SYSTEM AND FEATURE GATING

## How Plans Work

Plans are stored on the `users` table as an enum: `"free" | "creator" | "studio"`.

**Checking plan limits at the route level:**
```typescript
// In forms/route.ts — creating a new form:
create: protectedProcedure.mutation(async ({ input, ctx }) => {
  const count  = await formService.countForUser(ctx.user!.id);
  const limits = PLAN_LIMITS[ctx.user!.plan]; // { maxForms: 3, ... }
  if (limits.maxForms !== -1 && count >= limits.maxForms) {
    throw domainError("PLAN_LIMIT_FORMS",
      `Your plan allows up to ${limits.maxForms} forms. Upgrade to create more.`,
      "FORBIDDEN"); // 403
  }
  return formService.create(ctx.user!.id, input);
})
```

**Feature gating with `planMiddleware`:**
```typescript
// For procedures that entire plan tiers can't access at all:
list: protectedProcedure
  .use(planMiddleware("hasWebhooks")) // free/creator → throws 403 before handler runs
  .query(async ({ ctx }) => {
    // Only studio users reach here
  })
```

```typescript
// packages/trpc/server/middleware/plan.middleware.ts
export function planMiddleware(feature: keyof PlanLimits) {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const allowed = PLAN_LIMITS[ctx.user.plan][feature]; // e.g., PLAN_LIMITS.free.hasWebhooks = false
    if (!allowed) {
      throw new TRPCError({ code: "FORBIDDEN", message: "This feature requires a higher plan." });
    }
    return next({ ctx });
  });
}
```

---

# PART 13 — COMPLETE DATA FLOWS

## Flow: Creating and Publishing a Form

```
1. Creator fills form builder UI
   → clicks "Add field"
   → trpc.fields.addField.mutate({ formId, field: { type: "email", label: "Email", required: true } })

2. API receives POST /api/forms/{formId}/fields
   → isAuthenticated middleware validates cookie
   → assertOwnership: this form belongs to this user?
   → planMiddleware check: free plan allows ≤10 fields
   → fieldRepo.addField() → INSERT INTO fields VALUES (...)
   → cacheDel(`sf:form:public:${form.slug}`) — invalidate cache if published

3. Creator clicks "Publish"
   → trpc.forms.publish.mutate({ id: formId })

4. API receives POST /api/forms/{id}/publish
   → assertOwnership
   → formService.publish():
     a. load all fields for this form
     b. INSERT INTO form_versions VALUES ({ fieldsJson: allFields })
     c. UPDATE forms SET status='published', current_version_id=newVersionId

5. API returns { versionId, version: 1 }

6. Background tasks (non-blocking):
   → webhookQueue.add("dispatch", { event: "form.published" })
   → cacheDelPattern("sf:explore:*")  ← form is now public, refresh explore cache
```

## Flow: Loading the Explore Page

```
1. Browser: GET /api/forms/explore?limit=12

2. tRPC router: formsRouter.explore
   → No auth required (publicProcedure)
   → Check Redis: cacheGet("sf:explore:{'limit':12}")
   → Cache HIT → return cached JSON instantly (TTL: 2 minutes)
   → Cache MISS:
     a. db.select().from(formsTable)
        .where(and(status='published', visibility='public', deleted_at IS NULL))
        .orderBy(totalResponses DESC).limit(13)
     b. cacheSet("sf:explore:{'limit':12}", result, 120)
   → Return { forms: [...], nextCursor: "uuid..." }
```

## Flow: Webhook Triggered After Form Submission

```
1. Form submission succeeds (response saved to DB)

2. setImmediate → safeEnqueue(webhookQueue, "dispatch", {
     formId: "f1-uuid",
     event: "form.response.created",
     payload: { formId, responseId }
   })

3. Redis stores the job in a BullMQ sorted set

4. Webhook worker polls Redis (blocking BRPOP):
   → job dequeued
   → SQL query: webhooks WHERE is_active=true AND (form_id=f1-uuid OR form_id IS NULL)
                           AND events @> '["form.response.created"]'::jsonb
   → Found 2 webhooks

5. For each webhook:
   → body = JSON.stringify({ event, payload, timestamp })
   → sig  = HMAC-SHA256(webhook.secret, body)
   → fetch(webhook.url, { method: "POST", headers: { X-ScribbleForms-Signature: "sha256=..." }, body })

6. If HTTP response is not 2xx → BullMQ retries (up to 5 times with exponential backoff)

7. Record delivery: INSERT INTO webhook_deliveries VALUES ({ webhookId, statusCode, status: "success" })
```

---

# PART 14 — RATE LIMITING

## Why Rate Limiting?

Without rate limiting:
- A bot can try 1000 passwords on an account in 1 second (brute force)
- A bot can submit 10,000 fake form responses per hour (spam)
- A DDoS attack can send millions of requests, crashing the server

## Implementation

```typescript
// apps/api/src/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";

export const rateLimiters = {
  // Global: 200 requests per minute per IP — protects against DDoS
  global: rateLimit({ windowMs: 60_000, max: 200 }),

  // Auth: 10 failed attempts per 15 minutes — protects against brute force
  // skipSuccessfulRequests: true — successful logins don't count toward limit
  auth: rateLimit({ windowMs: 15 * 60_000, max: 10, skipSuccessfulRequests: true }),

  // Form submission: 5 submissions per minute per IP per form slug
  // keyGenerator makes the limit per (IP, slug) combination
  formSubmit: rateLimit({
    windowMs: 60_000, max: 5,
    keyGenerator: (req) => `${req.ip}:${req.params["slug"] ?? "unknown"}`,
  }),

  // Password reset: 3 requests per hour — prevents email flooding
  passwordReset: rateLimit({ windowMs: 60 * 60_000, max: 3 }),
};
```

**How `express-rate-limit` works internally:**
It maintains a counter in memory (or Redis) per key (IP address). Each request increments the counter. When the counter exceeds `max` within `windowMs` milliseconds, it returns `429 Too Many Requests`. After the window passes, the counter resets.

**Why the `formSubmit` rate limiter uses slug as part of the key:**
Without slug: if a bot submits form A and form B, both count toward the same counter. A single malicious user could submit form A 4 times and form B once (5 total), staying under the limit for both forms.
With slug: 5 submissions to form A, 5 submissions to form B — separate limits.

---

# PART 15 — WEBHOOKS DEEP DIVE

## What Webhooks Are

A webhook is a "callback" over HTTP. Instead of your system polling "did anything happen?", the other system calls YOUR URL when something happens.

```
Traditional API polling:                    Webhooks:
Frontend → "Any new responses?" → API       API → "New response!" → Your URL
Frontend → "Any new responses?" → API
Frontend → "Any new responses?" → API
... (100 requests per minute, mostly empty)
```

## Security: HMAC Signature

The problem: if someone discovers your webhook URL, they can send fake events.
The solution: every request is signed with a secret only you and ScribbleForms know.

```typescript
// ScribbleForms signs the payload:
const body = JSON.stringify({ event: "form.response.created", payload: {...}, timestamp: "..." });
const signature = createHmac("sha256", webhookSecret).update(body).digest("hex");
// Sends: X-ScribbleForms-Signature: sha256=a3b5f8...

// Your server verifies:
const expected = createHmac("sha256", process.env.WEBHOOK_SECRET!).update(rawBody).digest("hex");
if (`sha256=${expected}` !== req.headers["x-scribbleforms-signature"]) {
  return res.status(401).send("Invalid signature");
}
```

**Why HMAC instead of a simple token?**
A simple token in the header can be replayed (attacker captures a legitimate request and replays it later). HMAC signs the entire body — if the payload changes, the signature doesn't match. Combined with a timestamp in the payload, you can reject requests older than 5 minutes.

---

# PART 16 — INTERVIEW QUESTIONS AND ANSWERS

## Q: Why did you choose tRPC over REST?

**Answer:** "tRPC provides end-to-end type safety with zero code generation. The frontend gets TypeScript types inferred directly from the server router — if I rename a field on the server, TypeScript immediately shows errors on the frontend. We also expose a REST API via `trpc-to-openapi` so third-party integrations and our Scalar docs still work. One codebase, two protocols."

## Q: How does session authentication work?

**Answer:** "On login, we generate a 128-char hex token (64 random bytes) using `crypto.randomBytes`. We store it in the `sessions` table and set it as an `HttpOnly; Secure; SameSite=Lax` cookie. On every protected request, the middleware reads the cookie, checks Redis first (15-min TTL), then falls back to PostgreSQL if there's a cache miss. When the session expires or the user logs out, we delete it from both Redis and PostgreSQL."

## Q: How do you prevent race conditions on the response limit?

**Answer:** "The response limit check happens twice. First, a pre-check reads the cached `totalResponses` from Redis — this filters out most over-limit submissions cheaply. For the ones that pass, we re-check INSIDE the database transaction. The transaction reads the current counter with a SELECT before INSERT, ensuring atomicity. Two concurrent submissions can't both pass the limit check inside a transaction."

## Q: How does the dynamic form validation work?

**Answer:** "When a form is published, all field configurations are snapped into a `form_versions` row as a JSON array. At submission time, we load that snapshot, run `applyConditions()` to determine which fields are actually visible based on the answers, then call `buildFieldSchema()` from `@repo/validators` to generate a Zod schema dynamically. This schema validates required fields, type constraints, and options. The same `buildFieldSchema()` is available to the frontend for real-time validation."

## Q: Why is the `@repo/validators` package separate?

**Answer:** "Frontend and backend validation parity is critical. If the frontend validates an email field but the backend doesn't, or vice versa, users get confusing errors. By putting `buildFieldSchema()` and `applyConditions()` in a shared package, both frontend and backend use identical validation rules. This is the architectural signal that 'we take this seriously.'"

## Q: Explain your caching strategy.

**Answer:** "We have six cache keys with different TTLs based on data freshness requirements. Session tokens cache for 15 minutes (sliding window) — every auth'd request hits Redis not PostgreSQL. Public form data caches for 60 seconds — a popular form with 1000 hits/minute becomes 1 DB query/minute. Analytics stats cache for 5 minutes — expensive GROUP BY queries don't run on every dashboard load. The pattern is always: try cache → cache miss → DB query → populate cache. Cache invalidation happens immediately on data changes (update form → delete form cache, unpublish → delete explore cache)."

## Q: How would you scale this to 10 million users?

**Answer:** "Several changes: 
1. Move to a connection pooler like PgBouncer to handle more simultaneous DB connections
2. Add read replicas — analytics queries hit replicas, not the primary
3. Move the Redis cache to a Redis Cluster for horizontal scaling  
4. Add more worker instances — BullMQ supports multiple consumers on the same queue
5. Move the analytics pipeline to a time-series database (TimescaleDB or ClickHouse) for better aggregate query performance
6. Add a CDN layer in front of public form data (Cloudflare Workers could serve cached form JSON at the edge)
7. Consider event sourcing for the audit log — instead of direct writes, all changes emit events that write the audit log asynchronously"

---

# PART 17 — WHAT CAN BE IMPROVED

## Near-Term Improvements (1-2 weeks)

**1. JWT instead of sessions for stateless auth**
Currently sessions require a Redis lookup. JWTs encode the user data in the token itself — no DB or Redis lookup needed. Tradeoff: JWTs can't be revoked (use short expiry + refresh token rotation).

**2. WebSocket support for live collaboration**
Real-time form editing (multiple creators editing the same form) requires WebSockets. Socket.io with Redis pub/sub adapter would work.

**3. Idempotency keys on form submission**
If a user double-clicks submit, they might submit twice. An idempotency key (hashed from IP + form + time window) prevents duplicate submissions.

**4. Full-text search on responses**
Add a PostgreSQL GIN index on `response_answers.value_text` to support searching responses by content.

## Medium-Term (1-3 months)

**5. Event-driven architecture**
Instead of calling `safeEnqueue` directly in route handlers, emit domain events:
```typescript
eventBus.emit("form.submitted", { formId, responseId });
// Separate listeners handle: email, webhook, analytics, audit log
// Route handler knows nothing about side effects
```

**6. CQRS pattern for analytics**
Separate read model (analytics queries) from write model (response inserts). The write side publishes events; the read side maintains denormalized views optimized for queries.

**7. Row-level security in PostgreSQL**
Instead of `WHERE user_id = X` in every query, use PostgreSQL RLS policies. More secure (the DB enforces access, not application code) but more complex to set up with Drizzle.

## Long-Term (3-12 months)

**8. Microservice extraction**
The analytics service could become its own microservice that subscribes to events from the form service. Benefits: independent scaling, independent deployment, different tech stack (e.g., Go for analytics processing).

**9. Global deployment with edge caching**
Deploy form data globally using Cloudflare Workers and Durable Objects. Respondents get form data from the nearest edge node (<10ms) instead of the origin server (~100ms).

**10. GraphQL layer for dashboard**
The dashboard has complex data requirements (forms + recent responses + analytics all in one request). GraphQL's query composition would reduce round trips from 3 to 1.

---

# PART 18 — BEGINNER MENTAL MODELS

## The Restaurant Analogy for the Three-Layer Architecture

- **`route.ts`** = The Waiter: Takes your order (HTTP request), brings it to the kitchen, delivers the food (HTTP response). Doesn't cook anything.
- **`service.ts`** = The Chef: Knows the recipe (business rules). Checks if you're allowed to order this dish (plan limits). Doesn't know about tables, customers, or bills.
- **`repository.ts`** = The Pantry: Knows where everything is stored (database). Fetches ingredients. Doesn't know why you need them.

## The Library Card Analogy for Sessions

- Your library card = the `sf_session` cookie
- The card number = the session token (128-char hex string)
- The library database = the `sessions` table in PostgreSQL
- The front desk checking your card = the `isAuthenticated` middleware
- The card having an expiry date = `sessions.expires_at`
- The fast lookup system = Redis cache

## The Shipping Container Analogy for Monorepos

Without monorepo: each package (frontend, backend, shared types) lives in its own warehouse. Moving goods between them requires customs, paperwork, and delays (publishing to npm, bumping versions).

With monorepo: everything is in one massive warehouse. Moving goods between shelves is instant. Turborepo is the forklift operator that knows the optimal order to move things.

---

# PART 19 — FINAL ARCHITECTURE SUMMARY

## Why This Architecture Is Senior-Level

1. **Cookie factory pattern** — Services are pure functions. No HTTP primitives leak into business logic. Testable without HTTP.

2. **Form version snapshots** — Most candidates miss this. Immutable snapshots at publish time solve validation drift, mid-fill conflicts, and response attribution simultaneously.

3. **Two-phase analytics** — Raw events for debugging, daily aggregates for performance. The dashboard never touches raw event data.

4. **Shared `@repo/validators`** — Frontend and backend validation use identical code. No drift possible.

5. **Explicit error codes** — Every domain error has a machine-readable `domainCode` AND a human-readable message. The frontend can show localized messages based on the code; logging systems can alert on specific codes.

6. **`safeEnqueue` pattern** — Side effects (email, webhook) never block HTTP responses. Failures are swallowed gracefully (Redis down → email not queued → still responds 200).

7. **Atomic response limit check** — Race condition prevented by re-reading the counter inside the transaction.

8. **Graceful cache degradation** — Every cache operation is wrapped in try/catch. Redis outage = slower API, not a 500.

## The Biggest Strengths

- End-to-end type safety (tRPC + Zod + Drizzle together)
- Form version snapshots enabling safe schema evolution
- Two-level analytics (raw + pre-aggregated)
- Clean separation of concerns in the four-file pattern
- Production-quality security (HMAC, bcrypt, cookie flags, rate limiting, honeypot)
- 83 tests covering every critical path

## The Biggest Weaknesses

- No JWT/refresh token pattern (sessions can't be used in mobile apps without cookies)
- No real-time collaboration (WebSocket support missing)
- Analytics device breakdown uses basic UA parsing (should use a proper UA parser library)
- No retry logic on analytics event tracking (if worker fails, event is lost)
- Export generates CSV in memory (will OOM on very large exports — needs streaming)

## Estimated Complexity Level

This architecture sits between "senior engineer at a Series A startup" and "staff engineer at a Series B startup." The patterns used (cookie factories, version snapshots, shared validators, two-phase analytics, async side effects) are all production-grade and would be familiar to engineers at companies like Linear, Vercel, PlanetScale, or Stripe.

---

*This document was generated to explain the ScribbleForms codebase at interview depth. Every section answers "what, why, how, and what are the alternatives" — the four questions a senior engineer should be able to answer about every architectural decision.*
