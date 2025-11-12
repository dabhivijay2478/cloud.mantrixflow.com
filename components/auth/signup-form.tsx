"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "@/lib/utils/toast";
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
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { type SignupInput, signupSchema } from "@/lib/validations/auth";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    signUp,
    signInWithGitHub,
    signInWithGoogle,
    error: authError,
    setError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await signUp(data.email, data.password, {
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (error) {
      setIsSubmitting(false);
      toast.error("Signup failed", error.message || "Failed to create account. Please try again.");
      return;
    }

    // Check if email confirmation is required
    // If session is null, it means email confirmation is required
    const { supabase } = await import("@/lib/supabase/client");
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      // Email confirmation required - don't try to create user in DB yet
      toast.success("Account created!", "Please check your email to confirm your account. The confirmation link will create your account.");
      setIsSubmitting(false);
      // Redirect to login with message
      router.push("/auth/login?confirmEmail=true");
      return;
    }

    // Session exists (email confirmation not required or already confirmed)
    // Show success toast
    toast.success("Account created successfully!", "Welcome! Your account has been created. You can now start using the app.");

    // Redirect on success
    router.push("/");
    router.refresh();
  };

  const handleGitHubLogin = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) {
      toast.error("GitHub signup failed", error.message || "Failed to sign up with GitHub. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Google signup failed", error.message || "Failed to sign up with Google. Please try again.");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-3", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup className="gap-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-xs text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {authError && (
          <FieldError className="bg-destructive/10 border-destructive/20 border rounded-md p-3 text-center">
            {authError}
          </FieldError>
        )}

        {/* Two column grid for name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="first-name" className="text-xs">
              First Name
            </FieldLabel>
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              className="h-8 text-sm"
              aria-invalid={errors.firstName ? "true" : "false"}
              {...register("firstName")}
            />
            <FieldError
              errors={errors.firstName ? [errors.firstName] : undefined}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="last-name" className="text-xs">
              Last Name
            </FieldLabel>
            <Input
              id="last-name"
              type="text"
              placeholder="Doe"
              className="h-8 text-sm"
              aria-invalid={errors.lastName ? "true" : "false"}
              {...register("lastName")}
            />
            <FieldError
              errors={errors.lastName ? [errors.lastName] : undefined}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email" className="text-xs">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="h-8 text-sm"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        {/* Two column grid for password fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="password" className="text-xs">
              Password
            </FieldLabel>
            <PasswordInput
              id="password"
              className="h-8 text-sm"
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
            <FieldError
              errors={errors.password ? [errors.password] : undefined}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password" className="text-xs">
              Confirm Password
            </FieldLabel>
            <PasswordInput
              id="confirm-password"
              className="h-8 text-sm"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              {...register("confirmPassword")}
            />
            <FieldError
              errors={
                errors.confirmPassword ? [errors.confirmPassword] : undefined
              }
            />
          </Field>
        </div>

        <Field>
          <Button type="submit" className="h-8 text-sm" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator className="text-xs">Or continue with</FieldSeparator>

        <Field>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              type="button"
              className="h-8 text-xs"
              onClick={handleGitHubLogin}
              disabled={isSubmitting}
            >
              <FaGithub className="size-3" />
              GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-8 text-xs"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <FcGoogle className="size-3" />
              Google
            </Button>
          </div>

          <FieldDescription className="text-center text-xs">
            Already have an account?{" "}
            <a href="/auth/login" className="underline underline-offset-4">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
