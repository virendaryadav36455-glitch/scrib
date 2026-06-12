// apps/web/hooks/api/settings/index.ts
"use client";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

export function useApiKeyList() {
  return trpc.apiKeys.list.useQuery(undefined, { staleTime: 30_000 });
}

export function useCreateApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      utils.apiKeys.list.invalidate();
      toast.success("API key created! Copy it now — it won't be shown again.");
      return data;
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRevokeApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      toast.success("API key revoked.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useWebhookList() {
  return trpc.webhooks.list.useQuery(undefined, { staleTime: 30_000 });
}

export function useCreateWebhook() {
  const utils = trpc.useUtils();
  return trpc.webhooks.create.useMutation({
    onSuccess: () => {
      utils.webhooks.list.invalidate();
      toast.success("Webhook created!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteWebhook() {
  const utils = trpc.useUtils();
  return trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      utils.webhooks.list.invalidate();
      toast.success("Webhook deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useTestWebhook() {
  return trpc.webhooks.test.useMutation({
    onSuccess: (d) => toast[d.success ? "success" : "error"](
      d.success ? "Test webhook sent!" : "Webhook test failed."
    ),
  });
}
