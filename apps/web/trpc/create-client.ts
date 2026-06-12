// apps/web/trpc/create-client.ts
import { httpBatchStreamLink, httpLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface Opts { enableStreaming?: boolean }

export const createTRPCHttpBatchClientClient = (opts?: Opts) => {
  // API runs on NEXT_PUBLIC_API_URL (e.g. http://localhost:8000)
  // tRPC endpoint is /trpc on the API server
  const baseUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const link    = opts?.enableStreaming ? httpBatchStreamLink : httpLink;

  return link({
    url: `${baseUrl}/trpc`,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include", // sends the sf_session cookie cross-origin
      });
    },
  });
};
