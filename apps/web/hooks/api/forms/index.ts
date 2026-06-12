"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";
import { useUIStore } from "~/store/ui.store";

export function useFormList(filters: { status?: "draft" | "published" | "archived"; search?: string } = {}) {
  return trpc.forms.list.useInfiniteQuery(
    { limit: 20, ...filters },
    { getNextPageParam: (last) => last.nextCursor ?? undefined }
  );
}

export function useFormDetail(formId: string) {
  return trpc.forms.getById.useQuery({ id: formId }, { staleTime: 0, enabled: !!formId });
}

// FIX: was staleTime:60_000 with no refetchOnMount.
// When the user enters a password the parent sets `password` state which changes
// the query key — but the old staleTime meant React Query served the cached
// { requiresPassword:true } blob instead of re-fetching with the new password.
// staleTime:0 when a password is present forces a fresh fetch every time.
// refetchOnMount:true makes the page always load fresh data on mount.
export function usePublicForm(slug: string, password: string | undefined) {
  return trpc.forms.getPublic.useQuery(
    { slug, password },
    {
      staleTime:      password ? 0 : 60_000,
      retry:          false,
      enabled:        !!slug,
      refetchOnMount: true,
    }
  );
}

export function useExplore(filters = {}) {
  return trpc.forms.explore.useInfiniteQuery(
    { limit: 12, ...filters },
    { getNextPageParam: (last) => last.nextCursor ?? undefined }
  );
}

export function useCreateForm() {
  const utils  = trpc.useUtils();
  const router = useRouter();

  return trpc.forms.create.useMutation({
    onSuccess: (form) => {
      utils.forms.list.invalidate();
      router.push(`/dashboard/forms/${form.id}/build`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateForm(formId: string) {
  const utils = trpc.useUtils();
  const { setAutosaveStatus } = useUIStore();

  return trpc.forms.update.useMutation({
    onMutate:  () => setAutosaveStatus("saving"),
    onSuccess: () => {
      setAutosaveStatus("saved");
      utils.forms.getById.invalidate({ id: formId });
      // FIX: reset indicator to idle after 2s — without this "All changes saved"
      // stays green forever and the user can't tell if a NEW save is in-flight.
      setTimeout(() => setAutosaveStatus("idle"), 2000);
    },
    onError: () => setAutosaveStatus("error"),
  });
}

export function usePublishForm(formId: string) {
  const utils = trpc.useUtils();

  return trpc.forms.publish.useMutation({
    onSuccess: ({ version }) => {
      utils.forms.getById.invalidate({ id: formId });
      utils.forms.list.invalidate();
      toast.success(`Published! Version ${version} is now live.`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUnpublishForm(formId: string) {
  const utils = trpc.useUtils();

  return trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id: formId });
      utils.forms.list.invalidate();
      toast.success("Form unpublished.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteForm() {
  const utils = trpc.useUtils();

  return trpc.forms.delete.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
      toast.success("Form deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDuplicateForm() {
  const utils = trpc.useUtils();

  return trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
      toast.success("Form duplicated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── Fields ────────────────────────────────────────────────────────────────

export function useAddField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.addField.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError:   (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateField(formId: string) {
  const utils = trpc.useUtils();
  const { setAutosaveStatus } = useUIStore();
  return trpc.fields.updateField.useMutation({
    onMutate:  () => setAutosaveStatus("saving"),
    onSuccess: () => {
      setAutosaveStatus("saved");
      utils.forms.getById.invalidate({ id: formId });
      // FIX: same as useUpdateForm — reset to idle after 2s
      setTimeout(() => setAutosaveStatus("idle"), 2000);
    },
    onError: () => setAutosaveStatus("error"),
  });
}

export function useDeleteField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.deleteField.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError:   (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReorderFields(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.reorder.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
  });
}

export function useDuplicateField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.duplicate.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError:   (err) => toast.error(getErrorMessage(err)),
  });
}