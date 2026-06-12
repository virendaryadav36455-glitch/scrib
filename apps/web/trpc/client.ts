import { createTRPCReact } from "@trpc/react-query";
import type { ServerRouter } from "@repo/trpc/server";

export const trpc = createTRPCReact<ServerRouter>();