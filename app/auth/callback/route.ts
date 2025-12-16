import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UsersService } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Sync user with backend after email confirmation/login
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
        console.error('Failed to sync user in callback:', error);
        // Continue even if sync fails
      }

      // Check onboarding status
      let redirectPath = next;
      try {
        const backendUser = await UsersService.getCurrentUser();
        if (!backendUser.onboardingCompleted) {
          redirectPath = "/onboarding/welcome";
        } else {
          redirectPath = "/workspace";
        }
      } catch {
        // If user doesn't exist, redirect to onboarding
        redirectPath = "/onboarding/welcome";
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
