"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/utils/toast";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/validations/auth";
import {
  AuthFormHeader,
  AuthErrorDisplay,
} from "@/components/features/auth/components";

function ResetPasswordFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const { resetPassword, error: authError, setError } = useAuthStore();

  // Check for access token in URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    
    if (accessToken && refreshToken) {
      setIsValidToken(true);
      // Set the session with the tokens from URL
      const { supabase } = require("@/lib/supabase/client");
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } else {
      toast.error("Invalid reset link", "This password reset link is invalid or has expired.");
      setTimeout(() => {
        router.push("/auth/forgot-password");
      }, 3000);
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!isValidToken) {
      toast.error("Invalid session", "Please request a new password reset link.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error } = await resetPassword(data.password);

    if (error) {
      setIsSubmitting(false);
      toast.error("Password update failed", error.message || "Failed to update password. Please try again.");
      return;
    }

    // Show success toast
    toast.success("Password updated!", "Your password has been successfully updated. You can now login with your new password.");

    // Redirect to login
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  if (!isValidToken) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm text-balance">
            This password reset link is invalid or has expired. Please request a new one.
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
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader
          title="Reset your password"
          description="Enter your new password below"
        />

        <AuthErrorDisplay error={authError} />

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          <FieldError
            errors={errors.password ? [errors.password] : undefined}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword")}
          />
          <FieldError
            errors={errors.confirmPassword ? [errors.confirmPassword] : undefined}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Remember your password?{" "}
            <a href="/auth/login" className="underline underline-offset-4">
              Back to login
            </a>
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
