// apps/web/hooks/api/responses/index.ts
"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

export function useResponseList(formId: string) {
  return trpc.responses.list.useInfiniteQuery(
    { formId, limit: 25 },
    { getNextPageParam: (last) => last.nextCursor ?? undefined, enabled: !!formId }
  );
}

export function useResponseDetail(responseId: string, enabled: boolean) {
  return trpc.responses.getById.useQuery({ responseId }, { enabled, staleTime: 60_000 });
}

export function useDeleteResponse(formId: string) {
  const utils = trpc.useUtils();
  return trpc.responses.delete.useMutation({
    onSuccess: () => {
      utils.responses.list.invalidate({ formId });
      toast.success("Response deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useExportCsv(formId: string) {
  const [jobId, setJobId] = useState<string | null>(null);

  const exportMutation = trpc.responses.exportResponses.useMutation({
    onSuccess: ({ exportJobId }) => {
      setJobId(exportJobId);

      toast.info(
        "Export started! We'll notify you when it's ready."
      );
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const exportStatus = trpc.responses.getExportStatus.useQuery(
    { exportJobId: jobId! },
    {
      enabled: !!jobId,

      refetchInterval: (query) => {
        const status = query.state.data?.status;

        if (status === "done" || status === "failed") {
          return false;
        }

        return 3000;
      },
    }
  );

  // Handle completed export
  useEffect(() => {
    if (!exportStatus.data) return;

    const { status, fileUrl } = exportStatus.data;

    if (status === "done") {
      if (fileUrl) {
        toast.success("Export ready!");

        const link = document.createElement("a");

link.href = fileUrl;
link.download = "responses.csv";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);
      } else {
        toast.error("Export completed but no file was generated.");
      }

      setJobId(null);
    }

    if (status === "failed") {
      toast.error("Export failed.");

      setJobId(null);
    }
  }, [exportStatus.data]);

  return {
    startExport: () =>
      exportMutation.mutate({
        formId,
        format: "csv",
      }),

    isExporting:
      exportStatus.data?.status === "pending" ||
      exportStatus.data?.status === "processing",

    isPending: exportMutation.isPending,

    exportStatus: exportStatus.data?.status,

    fileUrl: exportStatus.data?.fileUrl,
  };
}