// apps/web/hooks/api/auth/index.ts
"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

export function useMe() {
  return trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const utils  = trpc.useUtils();

  return trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useSignup() {
  const router = useRouter();
  const utils  = trpc.useUtils();

  return trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      utils.auth.me.invalidate();
      toast.success(`Welcome, ${data.fullName ?? data.email}!`);
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const utils  = trpc.useUtils();

  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.reset();
      router.replace("/login");
    },
  });
}

export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation({
    onSuccess: () => toast.success("Check your email for a reset link!"),
    onError:   (err) => toast.error(getErrorMessage(err)),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset! Please log in.");
      router.push("/login");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Profile saved!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
