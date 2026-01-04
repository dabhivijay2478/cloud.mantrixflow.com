import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UsersService } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token"); // Supabase verify token
  const type = searchParams.get("type");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Handle Supabase verify token (from invite email)
  if (token && type === "invite") {
    try {
      // Verify the token using verifyOtp
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      });

      if (error || !data.session || !data.user) {
        console.error('Error verifying invite token:', error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      // Redirect to accept-invite page - session is now set
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const redirectPath = "/auth/accept-invite";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } catch (error) {
      console.error('Error in token verification:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Check if this is from an invite (check type parameter and user metadata)
      const isInvite = type === "invite" || 
                       data.user.app_metadata?.organizationId || 
                       data.user.user_metadata?.organizationId;
      
      // If this is an invite, redirect to accept-invite page for password setup
      // The session is already set via exchangeCodeForSession, so they can proceed
      if (isInvite) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        const redirectPath = "/auth/accept-invite";
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        }
      }
      
      // Sync user with backend (this will link them to organization_members if invited)
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
        // If user was invited and just accepted, go to workspace (skip onboarding)
        if (isInvite && backendUser.onboardingCompleted !== undefined) {
          redirectPath = "/workspace";
        } else if (!backendUser.onboardingCompleted) {
          redirectPath = "/onboarding/welcome";
        } else {
          redirectPath = "/workspace";
        }
      } catch {
        // If user doesn't exist, redirect based on invite status
        redirectPath = isInvite ? "/workspace" : "/onboarding/welcome";
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

  // If we reach here and it's an invite type, redirect to accept-invite
  // The tokens might be in the URL hash (client-side only), so let the client handle it
  if (type === "invite") {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    const redirectPath = "/auth/accept-invite";
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
    } else {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
