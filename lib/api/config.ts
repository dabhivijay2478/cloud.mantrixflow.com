/**
 * API Client Configuration
 * Centralized configuration for API requests
 */

import { supabase } from "@/lib/supabase/client";

/**
 * Normalize API base URL to ensure it has a protocol
 * If no protocol is provided, defaults to https://
 */
const normalizeApiUrl = (url: string): string => {
  if (!url) return "http://localhost:5000";

  // Remove trailing slashes
  const trimmed = url.trim().replace(/\/+$/, "");

  // If it already has a protocol, return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Otherwise, add https:// by default
  return `https://${trimmed}`;
};

const API_BASE_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
);

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
