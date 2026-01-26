/**
 * Sync user with backend after Supabase auth
 * Call this after successful login/signup/email confirmation
 */

import { UsersService } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";

export async function syncUserAfterAuth(): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return;
    }

    const user = session.user;

    // Sync user with backend
    await UsersService.syncUser({
      supabaseUserId: user.id,
      email: user.email || "",
      firstName:
        user.user_metadata?.first_name || user.user_metadata?.firstName,
      lastName: user.user_metadata?.last_name || user.user_metadata?.lastName,
      fullName: user.user_metadata?.full_name || user.user_metadata?.fullName,
      avatarUrl:
        user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl,
      metadata: {
        ...user.user_metadata,
        ...user.app_metadata,
      },
    });
  } catch {
    // Don't throw - this is a background sync operation
    // Error is silently handled as this is a background operation
  }
}

/**
 * Refresh Supabase user to get updated user metadata
 * This is useful after updating user profile information server-side
 * Refreshes the session to get a new JWT token with updated metadata
 */
export async function refreshSupabaseUser(): Promise<void> {
  try {
    // First, try to refresh the session to get a new token with updated metadata
    const {
      data: { session: refreshedSession },
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (!refreshError && refreshedSession?.user) {
      // Update the auth store with the refreshed user
      useAuthStore.getState().setUser(refreshedSession.user);
      return;
    }

    // If refresh fails (e.g., no refresh token), fall back to getUser()
    // This will at least get the current user data
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
      return;
    }

    // Update the auth store with the user
    if (user) {
      useAuthStore.getState().setUser(user);
    }
  } catch {
    // Error is silently handled
  }
}
