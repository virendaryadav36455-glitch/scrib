// apps/web/hooks/api/themes/index.ts
"use client";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

export function useThemeList(filters: { category?: string; search?: string } = {}) {
  return trpc.themes.list.useQuery(
    { includeSystem: true, includeUser: true, ...filters },
    { staleTime: 10 * 60_000 }
  );
}

export function useApplyTheme(formId: string) {
  const utils = trpc.useUtils();
  return trpc.themes.applyToForm.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id: formId });
      toast.success("Theme applied!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
