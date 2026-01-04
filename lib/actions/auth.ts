"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";
import { UsersService } from "@/lib/api";

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

    // Sync user with backend
    try {
      await UsersService.syncUser({
        supabaseUserId: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name || data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.last_name || data.user.user_metadata?.lastName,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.fullName,
        avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.avatarUrl,
        metadata: {
          ...data.user.user_metadata,
          ...data.user.app_metadata,
        },
      });
    } catch (error) {
      console.error('Failed to sync user:', error);
      // Continue even if sync fails
    }

    // Get user from backend to check onboarding status
    let needsOnboarding = true;
    try {
      const backendUser = await UsersService.getCurrentUser();
      needsOnboarding = !backendUser.onboardingCompleted;
    } catch {
      // If user doesn't exist yet, they need onboarding
      needsOnboarding = true;
    }
    
    // Revalidate paths
    revalidatePath("/", "layout");
    
    // Redirect based on onboarding status
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
      await UsersService.syncUser({
        supabaseUserId: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name || data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.last_name || data.user.user_metadata?.lastName,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.fullName,
        avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.avatarUrl,
        metadata: {
          ...data.user.user_metadata,
          ...data.user.app_metadata,
        },
      });
    } catch (error) {
      console.error('Failed to sync user:', error);
    }

    // Get user from backend to check onboarding status
    let needsOnboarding = true;
    try {
      const backendUser = await UsersService.getCurrentUser();
      needsOnboarding = !backendUser.onboardingCompleted;
    } catch {
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

    // Verify user has a valid session (from invite link)
    const {
      data: { session, user },
    } = await supabase.auth.getSession();

    if (!session || !user) {
      return {
        success: false,
        error:
          "Invalid or expired invite link. Please contact the person who invited you.",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to set password. Please try again.",
      };
    }

    // Sync user with backend (this will link them to organization_members)
    try {
      await UsersService.syncUser({
        supabaseUserId: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || user.user_metadata?.firstName,
        lastName: user.user_metadata?.last_name || user.user_metadata?.lastName,
        fullName: user.user_metadata?.full_name || user.user_metadata?.fullName,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl,
        metadata: {
          ...user.user_metadata,
          ...user.app_metadata,
        },
      });
    } catch (syncError) {
      console.error('Failed to sync user after invite acceptance:', syncError);
      // Continue even if sync fails - password is set
    }

    // Revalidate and redirect to workspace
    revalidatePath("/", "layout");
    redirect("/workspace");
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
