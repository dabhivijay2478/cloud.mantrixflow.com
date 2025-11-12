# Authentication Setup Guide

This guide will help you complete the authentication setup for your MantrixFlow AI BI platform.

## Prerequisites

1. **Supabase Project**: You need a Supabase project set up
2. **Environment Variables**: Configure your environment variables

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: NextAuth Configuration (for additional providers)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### 2. Configure Authentication

In your Supabase dashboard:

1. **Go to Authentication > Settings**
2. **Enable Email Authentication**
3. **Configure Site URL**: Set to `http://localhost:3000` for development
4. **Configure Redirect URLs**: Add the following URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### 3. Enable OAuth Providers (Optional)

To enable Google and GitHub authentication:

#### Google OAuth:
1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

#### GitHub OAuth:
1. Go to Authentication > Providers  
2. Enable GitHub provider
3. Add your GitHub OAuth credentials

### 4. Email Templates (Optional)

Customize email templates in Authentication > Email Templates:
- **Confirm signup**: Welcome email with confirmation link
- **Reset password**: Password reset email
- **Magic Link**: Magic link login email

## Features Implemented

### ✅ Authentication Pages
- **Login Page**: `/auth/login`
- **Signup Page**: `/auth/signup`
- **Forgot Password**: `/auth/forgot-password`
- **Reset Password**: `/auth/reset-password`
- **Auth Error Page**: `/auth/auth-code-error`

### ✅ API Routes
- **POST** `/api/auth/login` - Email/password login
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/logout` - Sign out
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Update password
- **GET** `/auth/callback` - OAuth callback handler

### ✅ Components
- **LoginForm**: Email/password + OAuth login
- **SignupForm**: User registration with validation
- **ForgotPasswordForm**: Password reset request
- **ResetPasswordForm**: Password update form
- **AuthProvider**: Global auth state management

### ✅ Features
- **Form Validation**: Zod schema validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Loading indicators during auth operations
- **Toast Notifications**: Success/error feedback
- **OAuth Integration**: Google and GitHub sign-in
- **Email Confirmation**: Secure email verification
- **Password Reset**: Secure password reset flow
- **Route Protection**: Middleware-based route protection
- **Responsive Design**: Mobile-friendly UI

## Usage

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Authentication Flow

1. **Visit**: `http://localhost:3000`
2. **Sign Up**: Create a new account
3. **Check Email**: Confirm your email (if email confirmation is enabled)
4. **Sign In**: Log in with your credentials
5. **Dashboard**: Access the protected dashboard
6. **Password Reset**: Test forgot password flow

### 3. Authentication State

The authentication state is managed globally using Zustand:

```typescript
import { useAuthStore } from "@/lib/stores/auth-store";

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuthStore();
  
  // Use authentication state and methods
}
```

## File Structure

```
app/
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── callback/route.ts
│   └── auth-code-error/page.tsx
├── api/auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   ├── logout/route.ts
│   ├── forgot-password/route.ts
│   └── reset-password/route.ts
├── dashboard/page.tsx
└── layout.tsx

components/auth/
├── auth-provider.tsx
├── login-form.tsx
├── signup-form.tsx
├── forgot-password-form.tsx
└── reset-password-form.tsx

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── stores/
│   └── auth-store.ts
└── validations/
    └── auth.ts

middleware.ts
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure proper CORS settings in Supabase
4. **Rate Limiting**: Consider implementing rate limiting for auth endpoints
5. **Session Security**: Sessions are handled securely by Supabase

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**: Check email/password combination
2. **OAuth redirect errors**: Verify redirect URLs in provider settings
3. **Email not received**: Check spam folder, verify SMTP settings
4. **CORS errors**: Ensure site URL is configured in Supabase

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Next Steps

1. **Database Schema**: Set up user profiles and application-specific tables
2. **Role-Based Access**: Implement user roles and permissions
3. **Email Customization**: Customize email templates
4. **Analytics**: Add authentication analytics
5. **Security**: Implement additional security measures

## Support

For issues or questions:
1. Check Supabase documentation
2. Review Next.js authentication guides
3. Check the component implementations for examples
