import type React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SocialAuthButtons } from "./social-auth-buttons";
import type { LoginFormValues } from "@/schemas/auth.schema";

export interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<LoginFormValues>;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  title?: string;
  description?: string;
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
}

export function LoginForm({
  register,
  handleSubmit,
  errors,
  isPending,
  isError,
  errorMessage,
  title = "Welcome back",
  description = "Login to your account",
  onGoogleLogin,
  onMicrosoftLogin,
}: LoginFormProps) {
  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8" noValidate>
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-balance text-muted-foreground">{description}</p>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={isPending}
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            disabled={isPending}
            {...register("password")}
          />
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication failed</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                "An unexpected error occurred. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Signing in..." : "Login"}
          </Button>
        </Field>

        <SocialAuthButtons
          disabled={isPending}
          onGoogleLogin={onGoogleLogin}
          onMicrosoftLogin={onMicrosoftLogin}
        />
      </FieldGroup>
    </form>
  );
}
