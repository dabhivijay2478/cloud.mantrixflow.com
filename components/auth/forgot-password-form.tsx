"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth";
import {
  AuthFormHeader,
  AuthErrorDisplay,
} from "@/components/features/auth/components";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword, error: authError, setError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await forgotPassword(data.email);

    if (error) {
      setIsSubmitting(false);
      toast.error("Failed to send reset email", error.message || "Unable to send password reset email. Please try again.");
      return;
    }

    // Show success toast
    toast.success("Reset email sent!", "Please check your email for password reset instructions.");

    setIsSubmitting(false);
    
    // Redirect back to login after a short delay
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader
          title="Forgot your password?"
          description="Enter your email address and we'll send you a link to reset your password"
        />

        <AuthErrorDisplay error={authError} />

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset email"}
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
