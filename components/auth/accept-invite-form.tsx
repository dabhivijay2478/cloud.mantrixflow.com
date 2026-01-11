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
import { type AuthActionResult, acceptInviteAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

function AcceptInviteFormContent({
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
  >(acceptInviteAction, null);

  // Check for code or tokens in URL and set session
  useEffect(() => {
    const checkToken = async () => {
      const code = searchParams.get("code");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const token = searchParams.get("token"); // Token from Supabase verify endpoint
      const type = searchParams.get("type");

      try {
        const { supabase } = await import("@/lib/supabase/client");

        // Handle tokens in URL hash (Supabase redirects with tokens in hash fragment)
        // Extract from window.location.hash
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          const hashAccessToken = hashParams.get("access_token");
          const hashRefreshToken = hashParams.get("refresh_token");
          const _hashType = hashParams.get("type");

          if (hashAccessToken && hashRefreshToken) {
            console.log("Found tokens in URL hash, setting session...");
            const { data: sessionData, error } = await supabase.auth.setSession(
              {
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken,
              },
            );

            if (error) {
              console.error("Error setting session from hash:", error);
              toast.error(
                "Invalid invite link",
                "This invitation link is invalid or has expired.",
              );
              setTimeout(() => {
                router.push("/auth/login");
              }, 3000);
              setIsCheckingToken(false);
              return;
            }

            if (!sessionData.session) {
              console.error("No session returned from setSession");
              toast.error(
                "Invalid invite link",
                "Failed to create session. Please try again.",
              );
              setTimeout(() => {
                router.push("/auth/login");
              }, 3000);
              setIsCheckingToken(false);
              return;
            }

            console.log(
              "Session set successfully, user ID:",
              sessionData.session.user.id,
            );

            // Clear the hash from URL
            window.history.replaceState(null, "", window.location.pathname);

            // IMPORTANT: The session is now in localStorage
            // For server actions to work, we need to reload the page
            // This will trigger the middleware which will sync the session to cookies
            // The middleware reads from localStorage and writes to cookies
            console.log(
              "Reloading page to sync session to cookies via middleware...",
            );

            // Small delay to ensure session is persisted
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Reload the page - middleware will sync session to cookies
            window.location.reload();
            return;
          }
        }

        // Handle code-based flow (Supabase OAuth/invite flow)
        if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error exchanging code for session:", error);
            toast.error(
              "Invalid invite link",
              error.message ||
                "This invitation link is invalid or has expired.",
            );
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
            setIsCheckingToken(false);
            return;
          }

          if (!data.session) {
            console.error("No session after code exchange");
            toast.error(
              "Invalid invite link",
              "Failed to create session. Please try again.",
            );
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
            setIsCheckingToken(false);
            return;
          }

          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // Handle direct token flow (legacy or recovery)
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            toast.error(
              "Invalid invite link",
              "This invitation link is invalid or has expired.",
            );
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
            setIsCheckingToken(false);
            return;
          }

          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // Check if user already has a valid session (might have been set by callback or previous verification)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          console.log("Found existing session, allowing password setup");
          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }

        // If we have a token parameter from Supabase verify endpoint, try to verify it
        // Supabase verify endpoint redirects with token in URL, but we need to handle it server-side
        // For now, redirect to callback route which will handle the verification
        if (token) {
          console.log(
            "Found token parameter, redirecting to callback for verification",
          );
          // Redirect to callback route which will handle token verification
          router.push(`/auth/callback?token=${token}&type=invite`);
          return;
        }

        // No valid tokens or code found
        console.error(
          "No valid tokens or code found in URL. Available params:",
          {
            code: !!code,
            token: !!token,
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
            type,
            allParams: Object.fromEntries(searchParams.entries()),
          },
        );
        toast.error(
          "Invalid invite link",
          "This invitation link is invalid or has expired. Please contact the person who invited you.",
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        setIsCheckingToken(false);
      } catch (error) {
        console.error("Error checking token:", error);
        toast.error(
          "Invalid invite link",
          "This invitation link is invalid or has expired.",
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams, router]);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      toast.success("Password set successfully!", state.message);
      // Redirect handled by Server Action
    } else if (state && !state.success) {
      // Don't show error if it's a redirect (NEXT_REDIRECT)
      // Redirects throw errors but they're not actual failures
      if (state.error && !state.error.includes("NEXT_REDIRECT")) {
        setError(state.error);
        toast.error("Failed to set password", state.error);
      }
      // If it's a redirect error, just let the redirect happen silently
    }
  }, [state, setError]);

  if (isCheckingToken) {
    return (
      <div className="flex items-center justify-center p-4">Loading...</div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Invalid Invite Link</h1>
          <p className="text-muted-foreground text-sm text-balance">
            This invitation link is invalid or has expired. Please contact the
            person who invited you for a new invitation.
          </p>
        </div>
        <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
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
          title="Set your password"
          description="Welcome! Please set a password to complete your account setup."
        />

        {state && !state.success && <AuthErrorDisplay error={state.error} />}

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
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
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm your password"
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
          <Button type="submit" disabled={isPending} aria-busy={isPending} className="cursor-pointer">
            {isPending ? "Setting password..." : "Set password"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center cursor-pointer">
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

export function AcceptInviteForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">Loading...</div>
      }
    >
      <AcceptInviteFormContent {...props} />
    </Suspense>
  );
}
