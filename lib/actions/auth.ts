"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UsersService } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";

export type AuthActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Server Action for user login
 * Validates input, authenticates user, and handles session management
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };

    const validation = loginSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { email, password } = validation.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Invalid email or password. Please try again.",
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: "Authentication failed. Please try again.",
      };
    }

    // Get auth token from the session for API calls
    const authToken = data.session.access_token;

    // Sync user with backend
    try {
      await UsersService.syncUser(
        {
          supabaseUserId: data.user.id,
          email: data.user.email || "",
          firstName:
            data.user.user_metadata?.first_name ||
            data.user.user_metadata?.firstName,
          lastName:
            data.user.user_metadata?.last_name ||
            data.user.user_metadata?.lastName,
          fullName:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.fullName,
          avatarUrl:
            data.user.user_metadata?.avatar_url ||
            data.user.user_metadata?.avatarUrl,
          metadata: {
            ...data.user.user_metadata,
            ...data.user.app_metadata,
          },
        },
        { token: authToken },
      );
    } catch (error) {
      console.error("Failed to sync user:", error);
      // Continue even if sync fails
    }

    // Get user from backend to check onboarding status
    let needsOnboarding = true;
    try {
      const backendUser = await UsersService.getCurrentUser({
        token: authToken,
      });
      // Only skip onboarding if explicitly completed (true)
      // undefined, null, or false means onboarding is needed
      needsOnboarding = backendUser.onboardingCompleted !== true;
    } catch (error) {
      // If user doesn't exist yet, they need onboarding
      console.error("[loginAction] Error getting user:", error);
      needsOnboarding = true;
    }

    // Revalidate paths
    revalidatePath("/", "layout");

    // Redirect based on onboarding status
    // IMPORTANT: redirect() throws a NEXT_REDIRECT error which is expected
    // This error should be re-thrown so Next.js can handle the redirect properly
    if (needsOnboarding) {
      redirect("/onboarding/welcome");
    } else {
      redirect("/workspace");
    }
  } catch (error) {
    // Check if it's a Next.js redirect error - if so, re-throw it
    // Next.js uses a special error with digest starting with "NEXT_REDIRECT"
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      // This is a redirect, not an error - re-throw so Next.js handles it
      throw error;
    }

    // For all other errors, return an error response
    console.error("[loginAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for user signup
 * Validates input, creates user account, and handles email confirmation
 */
export async function signupAction(
  _prevState: AuthActionResult<{ requiresEmailConfirmation: boolean }> | null,
  formData: FormData,
): Promise<AuthActionResult<{ requiresEmailConfirmation: boolean }>> {
  try {
    // Extract and validate form data
    const rawData = {
      firstName: formData.get("firstName")?.toString() ?? "",
      lastName: formData.get("lastName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    };

    const validation = signupSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { email, password, firstName, lastName } = validation.data;
    const supabase = await createClient();

    // Get the site URL for redirect after email confirmation
    // Priority: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "http://localhost:3000";
    
    // Redirect to callback route after email confirmation
    // The callback route will handle onboarding redirect
    const redirectTo = `${siteUrl}/auth/callback?type=signup`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to create account. Please try again.",
      };
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = !data.session;

    if (requiresEmailConfirmation) {
      return {
        success: true,
        data: { requiresEmailConfirmation: true },
        message:
          "Account created! Please check your email to confirm your account.",
      };
    }

    // Session exists - user is immediately authenticated
    // Sync user with backend
    try {
      if (!data.user) {
        throw new Error("User data is missing");
      }
      await UsersService.syncUser({
        supabaseUserId: data.user.id,
        email: data.user.email || "",
        firstName:
          data.user.user_metadata?.first_name ||
          data.user.user_metadata?.firstName,
        lastName:
          data.user.user_metadata?.last_name ||
          data.user.user_metadata?.lastName,
        fullName:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.fullName,
        avatarUrl:
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.avatarUrl,
        metadata: {
          ...data.user.user_metadata,
          ...data.user.app_metadata,
        },
      });
    } catch (error) {
      console.error("Failed to sync user:", error);
    }

    // Get user from backend to check onboarding status
    let needsOnboarding = true;
    try {
      const backendUser = await UsersService.getCurrentUser();
      // Only skip onboarding if explicitly completed (true)
      // undefined, null, or false means onboarding is needed
      needsOnboarding = backendUser.onboardingCompleted !== true;
    } catch (error) {
      // If user doesn't exist yet, they need onboarding
      console.error("[signupAction] Error getting user:", error);
      needsOnboarding = true;
    }

    revalidatePath("/", "layout");

    if (needsOnboarding) {
      redirect("/onboarding/welcome");
    } else {
      redirect("/workspace");
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for forgot password
 * Sends password reset email to user
 */
export async function forgotPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email")?.toString() ?? "",
    };

    const validation = forgotPasswordSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { email } = validation.data;
    const supabase = await createClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error:
          error.message ||
          "Unable to send password reset email. Please try again.",
      };
    }

    return {
      success: true,
      message: "Password reset email sent! Please check your email.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for accepting invite and setting password
 * Updates user password and syncs with backend to link to organization
 */
export async function acceptInviteAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      password: formData.get("password")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
      // Optional: access token from client (if session not in cookies yet)
      accessToken: formData.get("accessToken")?.toString(),
      refreshToken: formData.get("refreshToken")?.toString(),
    };

    const validation = resetPasswordSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { password, accessToken, refreshToken } = validation.data;
    const supabase = await createClient();

    console.log("[acceptInviteAction] Starting password update...");

    // If tokens are provided, set session first
    if (accessToken && refreshToken) {
      console.log(
        "[acceptInviteAction] Setting session from provided tokens...",
      );
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError || !sessionData.session) {
        console.error(
          "[acceptInviteAction] Error setting session:",
          sessionError,
        );
        return {
          success: false,
          error:
            "Invalid or expired invite link. Please contact the person who invited you.",
        };
      }
    }

    // Verify user has a valid session (from invite link)
    // Try getUser() first as it's more reliable for server-side
    let user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    } | null = null;
    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("[acceptInviteAction] getUser result:", {
      hasUser: !!userData,
      error: userError?.message,
      userId: userData?.id,
    });

    if (userError || !userData) {
      console.error("[acceptInviteAction] Error getting user:", userError);
      // Fallback to getSession
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("[acceptInviteAction] getSession result:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        error: sessionError?.message,
      });

      if (!session || !session.user) {
        console.error("[acceptInviteAction] No session or user found");
        console.error("[acceptInviteAction] User error:", userError);
        console.error("[acceptInviteAction] Session error:", sessionError);

        // Try to get more info about what cookies are available
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        console.log(
          "[acceptInviteAction] Available cookies:",
          allCookies.map((c) => c.name),
        );

        return {
          success: false,
          error:
            "Invalid or expired invite link. Please contact the person who invited you. Make sure you clicked the invite link and your session is active.",
        };
      }

      user = session.user;
    } else {
      user = userData;
    }

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    console.log("[acceptInviteAction] User found:", user.id, user.email);

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        success: false,
        error:
          updateError.message || "Failed to set password. Please try again.",
      };
    }

    // Get auth token from session for API calls
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    const authToken = currentSession?.access_token || null;

    if (!authToken) {
      console.warn("[acceptInviteAction] No auth token available for sync");
    }

    // Sync user with backend (this will link them to organization_members)
    try {
      await UsersService.syncUser(
        {
          supabaseUserId: user.id,
          email: user.email || "",
          firstName:
            (user.user_metadata?.first_name as string | undefined) ||
            (user.user_metadata?.firstName as string | undefined),
          lastName:
            (user.user_metadata?.last_name as string | undefined) ||
            (user.user_metadata?.lastName as string | undefined),
          fullName:
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.fullName as string | undefined),
          avatarUrl:
            (user.user_metadata?.avatar_url as string | undefined) ||
            (user.user_metadata?.avatarUrl as string | undefined),
          metadata: {
            ...user.user_metadata,
            ...user.app_metadata,
          },
        },
        { token: authToken },
      );
      console.log("[acceptInviteAction] User synced with backend");
    } catch (syncError) {
      console.error(
        "[acceptInviteAction] Failed to sync user after invite acceptance:",
        syncError,
      );
      // Continue even if sync fails - password is set
    }

    // Revalidate and redirect to workspace
    // IMPORTANT: redirect() throws a NEXT_REDIRECT error which is expected
    // We need to call it outside the try-catch or re-throw it
    revalidatePath("/", "layout");
    redirect("/workspace");
  } catch (error) {
    // Check if it's a Next.js redirect error - if so, re-throw it
    // Next.js uses a special error with digest starting with "NEXT_REDIRECT"
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      // This is a redirect, not an error - re-throw so Next.js handles it
      throw error;
    }

    // For all other errors, return an error response
    console.error("[acceptInviteAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for reset password
 * Updates user password after email confirmation
 */
export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      password: formData.get("password")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    };

    const validation = resetPasswordSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { password } = validation.data;
    const supabase = await createClient();

    // Verify user has a valid session (from password reset link)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error:
          "Invalid or expired reset link. Please request a new password reset.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update password. Please try again.",
      };
    }

    // Revalidate and redirect to login
    revalidatePath("/", "layout");
    redirect("/auth/login?reset=success");
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
