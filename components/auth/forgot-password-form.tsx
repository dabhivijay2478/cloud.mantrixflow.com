"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  AuthErrorDisplay,
  AuthFormHeader,
} from "@/components/features/auth/components";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type AuthActionResult,
  forgotPasswordAction,
} from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { setError } = useAuthStore();

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(forgotPasswordAction, null);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      toast.success("Reset email sent!", state.message);
      // Redirect back to login after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else if (state && !state.success) {
      setError(state.error);
      toast.error("Failed to send reset email", state.error);
    }
  }, [state, router, setError]);

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      noValidate
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader
          title="Forgot your password?"
          description="Enter your email address and we'll send you a link to reset your password"
        />

        {state && !state.success && <AuthErrorDisplay error={state.error} />}

        {state?.success && (
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            {state.message}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            aria-invalid={
              state && !state.success && state.fieldErrors?.email
                ? "true"
                : "false"
            }
            aria-describedby={
              state && !state.success && state.fieldErrors?.email
                ? "email-error"
                : undefined
            }
          />
          {state && !state.success && state.fieldErrors?.email && (
            <FieldError id="email-error" errors={state.fieldErrors.email} />
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? "Sending..." : "Send reset email"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Remember your password?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
