/**
 * API Client Configuration
 * Centralized configuration for API requests
 */

import { supabase } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get API base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Default fetch options
 */
export const defaultFetchOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

/**
 * Get auth token from Supabase session (client-side only)
 * For server-side, use getServerAuthToken() instead
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    // Server-side: return null - token should be passed explicitly
    return null;
  }

  try {
    // Client-side: use browser session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      console.log("[API Config] Got token from browser session");
    }
    return session?.access_token || null;
  } catch (error) {
    console.error("[API Config] Error getting Supabase session:", error);
    return null;
  }
};

/**
 * Create fetch options with authentication
 * @param options - Fetch options
 * @param token - Optional auth token (for server-side use)
 */
export const createFetchOptions = async (
  options: RequestInit = {},
  token?: string | null,
): Promise<RequestInit> => {
  // If token is provided, use it; otherwise try to get from session
  const authToken = token !== undefined ? token : await getAuthToken();
  const headers = new Headers(defaultFetchOptions.headers);

  console.log("[API Config] createFetchOptions called:", {
    tokenProvided: token !== undefined,
    tokenValue: token ? `${token.substring(0, 20)}...` : null,
    authTokenResult: authToken ? `${authToken.substring(0, 20)}...` : null,
    isServer: typeof window === "undefined",
  });

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
    console.log("[API Config] Authorization header added to request");
  } else {
    console.warn(
      "[API Config] No auth token available - request will be unauthenticated",
    );
    if (token === null) {
      console.warn(
        "[API Config] Token was explicitly null (server action may have failed to get token)",
      );
    } else if (token === undefined) {
      console.warn(
        "[API Config] No token provided, tried to get from session but failed",
      );
    }
  }

  // Merge custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, String(value));
    });
  }

  return {
    ...defaultFetchOptions,
    ...options,
    headers,
  };
};
