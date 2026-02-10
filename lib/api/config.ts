/**
 * API Client Configuration
 * Centralized configuration for API requests
 */

import { supabase } from "@/lib/supabase/client";

/**
 * Normalize API base URL from env (add https:// if no scheme).
 * No hardcoded fallback — set NEXT_PUBLIC_API_URL in apps/app .env.
 */
const normalizeApiUrl = (url: string | undefined): string => {
  const raw = (url ?? "").trim();
  if (!raw) return "";
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  return `https://${trimmed}`;
};

const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

/**
 * Get API base URL (from NEXT_PUBLIC_API_URL). Throws if not set.
 */
export const getApiBaseUrl = (): string => {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set in environment (e.g. in apps/app .env)",
    );
  }
  return API_BASE_URL;
};

/**
 * Get full API endpoint URL (uses NEXT_PUBLIC_API_URL; throws if not set).
 */
export const getApiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${base}/${cleanEndpoint}`;
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
    return session?.access_token || null;
  } catch {
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

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
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
