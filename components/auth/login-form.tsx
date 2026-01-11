"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";
import {
  AuthErrorDisplay,
  AuthFormHeader,
  OAuthButtons,
} from "@/components/features/auth/components";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { type AuthActionResult, loginAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

function LoginFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const { signInWithGitHub, signInWithGoogle, setError } = useAuthStore();

  const [state, formAction, isPending] = useActionState<
    AuthActionResult<{ redirectTo: string }> | null,
    FormData
  >(loginAction, null);

  // Check for email confirmation or other URL params
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    const confirmEmail = searchParams.get("confirmEmail");

    if (confirmed === "true") {
      toast.success(
        "Email confirmed!",
        "Your email has been confirmed. You can now sign in.",
      );
    } else if (confirmEmail === "true") {
      toast.info(
        "Check your email",
        "Please check your email to confirm your account before signing in.",
      );
    }
  }, [searchParams]);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      // Get redirect path from server action result
      const redirectTo = state.data?.redirectTo || "/workspace";
      
      // Use window.location.href for full page reload to ensure session sync
      // This is important for cross-browser compatibility
      window.location.href = redirectTo;
    } else if (state && !state.success) {
      setError(state.error);
      toast.error("Login failed", state.error);
    }
  }, [state, setError]);

  const handleGitHubLogin = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) {
      toast.error(
        "GitHub login failed",
        error.message || "Failed to sign in with GitHub. Please try again.",
      );
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(
        "Google login failed",
        error.message || "Failed to sign in with Google. Please try again.",
      );
    }
  };

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      noValidate
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader
          title="Login to your account"
          description="Enter your email below to login to your account"
        />

        {state && !state.success && <AuthErrorDisplay error={state.error} />}

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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            aria-invalid={
              state && !state.success && state.fieldErrors?.password
                ? "true"
                : "false"
            }
            aria-describedby={
              state && !state.success && state.fieldErrors?.password
                ? "password-error"
                : undefined
            }
          />
          {state && !state.success && state.fieldErrors?.password && (
            <FieldError
              id="password-error"
              errors={state.fieldErrors.password}
            />
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isPending} aria-busy={isPending} className="cursor-pointer">
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <OAuthButtons
            onGitHubClick={handleGitHubLogin}
            onGoogleClick={handleGoogleLogin}
            disabled={isPending}
          />
          <FieldDescription className="text-center cursor-pointer">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

export function LoginForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">Loading...</div>
      }
    >
      <LoginFormContent {...props} />
    </Suspense>
  );
}
