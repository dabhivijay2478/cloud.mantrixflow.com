# Supabase Redirect URL Configuration for Signup

## Overview

When a user signs up, Supabase sends an email confirmation link. After the user clicks the confirmation link, they need to be redirected back to your application. This document explains how to configure the redirect URLs in Supabase.

## Configuration Steps

### 1. Environment Variables

Make sure you have the following environment variable set:

```env
NEXT_PUBLIC_SITE_URL=https://mantrixflow.com
```

For development:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase Dashboard Configuration

1. **Go to your Supabase Dashboard**
   - Navigate to: Authentication > URL Configuration

2. **Set Site URL**
   - **Development**: `http://localhost:3000`
   - **Production**: `https://mantrixflow.com` (replace with your domain)

3. **Add Redirect URLs**
   
   Add these URLs to the "Redirect URLs" list:
   
   **Development:**
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`
   
   **Production:**
   - `https://mantrixflow.com/auth/callback` (replace with your domain)
   - `https://mantrixflow.com/auth/reset-password` (replace with your domain)

### 3. How It Works

1. **User Signs Up**: 
   - User fills out the signup form
   - Application calls `supabase.auth.signUp()` with `emailRedirectTo: ${siteUrl}/auth/callback?type=signup`

2. **Email Confirmation**:
   - Supabase sends an email with a confirmation link
   - The link contains a code/token that will be exchanged for a session

3. **User Clicks Link**:
   - User is redirected to `/auth/callback?code=...&type=signup`
   - The callback route exchanges the code for a session
   - User is synced with the backend
   - User is redirected based on onboarding status:
     - If onboarding not completed → `/onboarding/welcome`
     - If onboarding completed → `/workspace`

### 4. Code Implementation

The signup action (`apps/app/lib/actions/auth.ts`) now includes:

```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || "http://localhost:3000";

const redirectTo = `${siteUrl}/auth/callback?type=signup`;

await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo,
    // ... other options
  },
});
```

### 5. Callback Route Handling

The callback route (`apps/app/app/auth/callback/route.ts`) handles:
- Email confirmation (signup)
- Password reset
- OAuth callbacks
- Invite acceptance

It automatically:
- Syncs the user with the backend
- Checks onboarding status
- Redirects to the appropriate page

## Troubleshooting

### Issue: Redirect URL not allowed

**Error**: "Invalid redirect URL"

**Solution**: 
1. Check that the redirect URL is exactly added in Supabase dashboard
2. Ensure `NEXT_PUBLIC_SITE_URL` matches your Supabase Site URL
3. Check for trailing slashes or protocol mismatches

### Issue: User not redirected after email confirmation

**Solution**:
1. Verify the redirect URL is in the allowed list in Supabase
2. Check browser console for errors
3. Verify the callback route is accessible
4. Check that `emailRedirectTo` is being set correctly in signup

### Issue: User redirected to wrong page

**Solution**:
1. Check the callback route logic for onboarding status
2. Verify user is being synced with backend correctly
3. Check backend onboarding status endpoint

## Production Checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` environment variable in Vercel/production
- [ ] Add production redirect URLs to Supabase dashboard
- [ ] Update Site URL in Supabase to production domain
- [ ] Test signup flow end-to-end
- [ ] Verify email confirmation redirects correctly
- [ ] Test onboarding flow after email confirmation

## Additional Notes

- The redirect URL must be **exactly** as configured in Supabase
- Wildcards are not supported in redirect URLs
- Each environment (dev/staging/prod) needs its own redirect URLs
- The `type=signup` parameter helps the callback route identify the flow type

