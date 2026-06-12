// apps/web/hooks/api/analytics/index.ts
"use client";
import { trpc } from "~/trpc/client";

export function useDashboardSummary() {
  return trpc.analytics.getDashboardSummary.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useFormStats(formId: string, startDate: string, endDate: string) {
  return trpc.analytics.getFormStats.useQuery(
    { formId, startDate, endDate, granularity: "day" },
    {
  staleTime: 5 * 60_000,
  gcTime: 10 * 60_000,
  retry: 1,
  enabled: !!formId && !!startDate && !!endDate,
  refetchOnWindowFocus: false,
}
  );
}

export function useTrackEvent() {
  return trpc.analytics.track.useMutation();
}
