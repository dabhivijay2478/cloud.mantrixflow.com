/**
 * Sync user with backend after Supabase auth
 * Call this after successful login/signup/email confirmation
 */

import { UsersService } from "@/lib/api";
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
  } catch (error) {
    console.error("Failed to sync user:", error);
    // Don't throw - this is a background sync operation
  }
}
