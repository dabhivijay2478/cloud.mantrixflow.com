"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect, useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { type AuthActionResult, resetPasswordAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

function ResetPasswordFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { setError } = useAuthStore();

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(resetPasswordAction, null);

  // Check for access token in URL and set session, or check for existing session
  useEffect(() => {
    const checkToken = async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client");
        
        // First, check if there's already a valid session (set by callback route)
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // If no session, check for tokens in URL params
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const code = searchParams.get("code");

        // Handle code exchange (from Supabase redirect)
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error || !data.session) {
            toast.error(
              "Invalid reset link",
              "This password reset link is invalid or has expired.",
            );
            setTimeout(() => {
              router.push("/auth/forgot-password");
            }, 3000);
            setIsCheckingToken(false);
            return;
          }

          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // Handle direct token params (legacy support)
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            toast.error(
              "Invalid reset link",
              "This password reset link is invalid or has expired.",
            );
            setTimeout(() => {
              router.push("/auth/forgot-password");
            }, 3000);
            setIsCheckingToken(false);
            return;
          }

          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // No valid tokens or session found
        toast.error(
          "Invalid reset link",
          "This password reset link is invalid or has expired.",
        );
        setTimeout(() => {
          router.push("/auth/forgot-password");
        }, 3000);
        setIsCheckingToken(false);
      } catch (_error) {
        toast.error(
          "Invalid reset link",
          "This password reset link is invalid or has expired.",
        );
        setTimeout(() => {
          router.push("/auth/forgot-password");
        }, 3000);
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams, router]);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      toast.success("Password updated!", state.message);
      // Redirect to login after successful password update
      setTimeout(() => {
        router.push("/auth/login?reset=success");
      }, 1500);
    } else if (state && !state.success) {
      setError(state.error);
      toast.error("Password update failed", state.error);
    }
  }, [state, setError, router]);

  if (isCheckingToken) {
    return (
      <div className="flex items-center justify-center p-4">Loading...</div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm text-balance">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>
        <Button onClick={() => router.push("/auth/forgot-password")}>
          Request New Reset Link
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      noValidate
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader
          title="Reset your password"
          description="Enter your new password below"
        />

        {state && !state.success && <AuthErrorDisplay error={state.error} />}

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
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
          <FieldLabel htmlFor="confirm-password">
            Confirm New Password
          </FieldLabel>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm your new password"
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

        <Field>
          <Button type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? "Updating password..." : "Update password"}
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

export function ResetPasswordForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">Loading...</div>
      }
    >
      <ResetPasswordFormContent {...props} />
    </Suspense>
  );
}
