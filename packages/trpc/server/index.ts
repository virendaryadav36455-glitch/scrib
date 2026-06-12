import type { AnyRouter } from "@trpc/server";
import { router } from "./trpc";
import { authRouter }      from "./routes/auth/route";
import { formsRouter }     from "./routes/forms/route";
import { fieldsRouter }    from "./routes/fields/route";
import { responsesRouter } from "./routes/responses/route";
import { analyticsRouter } from "./routes/analytics/route";
import { themesRouter }    from "./routes/themes/route";
import { webhooksRouter }  from "./routes/webhooks/route";
import { apiKeysRouter }   from "./routes/api-keys/route";
import { healthRouter }    from "./routes/health/route";

const appRouter = router({
  health:    healthRouter,
  auth:      authRouter,
  forms:     formsRouter,
  fields:    fieldsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  themes:    themesRouter,
  webhooks:  webhooksRouter,
  apiKeys:   apiKeysRouter,
});

export type ServerRouter = typeof appRouter;
export const serverRouter: AnyRouter = appRouter;

export { createContext } from "./context";
export type { TRPCContext } from "./context";
export { AuthRepository } from "./routes/auth/repository";
export { submissionEnvelopeSchema } from "./routes/responses/schema";
export type { SubmissionEnvelope } from "./routes/responses/schema";