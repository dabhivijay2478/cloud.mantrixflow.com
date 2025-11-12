"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
import { type LoginInput, loginSchema } from "@/lib/validations/auth";

function LoginFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    signIn,
    signInWithGitHub,
    signInWithGoogle,
    error: authError,
    setError,
  } = useAuthStore();

  // Check for email confirmation or other URL params
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    const confirmEmail = searchParams.get("confirmEmail");

    if (confirmed === "true") {
      toast.success("Email confirmed!", "Your email has been confirmed. You can now sign in.");
    } else if (confirmEmail === "true") {
      toast.info("Check your email", "Please check your email to confirm your account before signing in.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await signIn(data.email, data.password);

    if (error) {
      setIsSubmitting(false);
      toast.error("Login failed", error.message || "Invalid email or password. Please try again.");
      return;
    }

    // Show success toast
    toast.success("Login successful!", "Welcome back! You've been successfully logged in.");

    // Redirect on success
    router.push("/");
    router.refresh();
  };

  const handleGitHubLogin = async () => {
    setError(null);
    const { error } = await signInWithGitHub();
    if (error) {
      toast.error("GitHub login failed", error.message || "Failed to sign in with GitHub. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Google login failed", error.message || "Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {authError && (
          <FieldError className="bg-destructive/10 border-destructive/20 border rounded-md p-3 text-center">
            {authError}
          </FieldError>
        )}

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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          <FieldError
            errors={errors.password ? [errors.password] : undefined}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGitHubLogin}
            disabled={isSubmitting}
          >
            <FaGithub className="size-4" />
            Login with GitHub
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <FcGoogle className="size-4" />
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </a>
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
