import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import { useLogin } from "@/hooks/use-login";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { ROUTES } from "@/routes/paths";

/**
 * Validates and sanitizes a redirect target to prevent open redirect vulnerabilities.
 */
export function getSafeRedirectUrl(from: unknown): string {
  const path =
    typeof from === "string"
      ? from
      : (from as { pathname?: string } | null | undefined)?.pathname;

  if (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  ) {
    return path;
  }

  return ROUTES.DASHBOARD;
}

export interface UseLoginFormOptions {
  defaultValues?: Partial<LoginFormValues>;
  onSuccess?: () => void;
}

export interface UseLoginFormReturn {
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<LoginFormValues>;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  resetError: () => void;
}

export function useLoginForm(
  options: UseLoginFormOptions = {},
): UseLoginFormReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...options.defaultValues,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        options.onSuccess?.();
        const targetUrl = getSafeRedirectUrl(location.state?.from);
        navigate(targetUrl, { replace: true });
      },
    });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isPending: loginMutation.isPending,
    isError: loginMutation.isError,
    errorMessage: loginMutation.error?.message,
    resetError: loginMutation.reset,
  };
}
