"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
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
import { type AuthActionResult, signupAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { signInWithGitHub, signInWithGoogle, setError } = useAuthStore();

  const [state, formAction, isPending] = useActionState<
    AuthActionResult<{ requiresEmailConfirmation: boolean }> | null,
    FormData
  >(signupAction, null);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      if (state.data?.requiresEmailConfirmation) {
        toast.success("Account created!", state.message);
        router.push("/auth/login?confirmEmail=true");
      } else {
        toast.success(
          "Account created successfully!",
          "Welcome! Your account has been created.",
        );
      }
    } else if (state && !state.success) {
      setError(state.error);
      toast.error("Signup failed", state.error);
    }
  }, [state, router, setError]);

  const handleGitHubLogin = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) {
      toast.error(
        "GitHub signup failed",
        error.message || "Failed to sign up with GitHub. Please try again.",
      );
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(
        "Google signup failed",
        error.message || "Failed to sign up with Google. Please try again.",
      );
    }
  };

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-3", className)}
      noValidate
      {...props}
    >
      <FieldGroup className="gap-3">
        <AuthFormHeader
          title="Create your account"
          description="Fill in the form below to create your account"
        />

        {state && !state.success && <AuthErrorDisplay error={state.error} />}

        {/* Two column grid for name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="first-name" className="text-xs">
              First Name
            </FieldLabel>
            <Input
              id="first-name"
              name="firstName"
              type="text"
              placeholder="John"
              className="h-8 text-sm"
              required
              aria-invalid={
                state && !state.success && state.fieldErrors?.firstName
                  ? "true"
                  : "false"
              }
              aria-describedby={
                state && !state.success && state.fieldErrors?.firstName
                  ? "first-name-error"
                  : undefined
              }
            />
            {state && !state.success && state.fieldErrors?.firstName && (
              <FieldError
                id="first-name-error"
                errors={state.fieldErrors.firstName}
              />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="last-name" className="text-xs">
              Last Name
            </FieldLabel>
            <Input
              id="last-name"
              name="lastName"
              type="text"
              placeholder="Doe"
              className="h-8 text-sm"
              required
              aria-invalid={
                state && !state.success && state.fieldErrors?.lastName
                  ? "true"
                  : "false"
              }
              aria-describedby={
                state && !state.success && state.fieldErrors?.lastName
                  ? "last-name-error"
                  : undefined
              }
            />
            {state && !state.success && state.fieldErrors?.lastName && (
              <FieldError
                id="last-name-error"
                errors={state.fieldErrors.lastName}
              />
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email" className="text-xs">
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            className="h-8 text-sm"
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

        {/* Two column grid for password fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="password" className="text-xs">
              Password
            </FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              className="h-8 text-sm"
              placeholder="Enter your password"
              autoComplete="new-password"
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
            <FieldLabel htmlFor="confirm-password" className="text-xs">
              Confirm Password
            </FieldLabel>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              className="h-8 text-sm"
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              aria-invalid={
                state && !state.success && state.fieldErrors?.confirmPassword
                  ? "true"
                  : "false"
              }
              aria-describedby={
                state && !state.success && state.fieldErrors?.confirmPassword
                  ? "confirm-password-error"
                  : undefined
              }
            />
            {state && !state.success && state.fieldErrors?.confirmPassword && (
              <FieldError
                id="confirm-password-error"
                errors={state.fieldErrors.confirmPassword}
              />
            )}
          </Field>
        </div>

        <Field>
          <Button
            type="submit"
            className="h-8 text-sm"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator className="text-xs">Or continue with</FieldSeparator>

        <Field>
          <OAuthButtons
            onGitHubClick={handleGitHubLogin}
            onGoogleClick={handleGoogleLogin}
            disabled={isPending}
            variant="compact"
          />

          <FieldDescription className="text-center text-xs">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
