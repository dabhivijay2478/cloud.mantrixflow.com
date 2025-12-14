/**
 * API Client Configuration
 * Centralized configuration for API requests
 */

import { supabase } from '@/lib/supabase/client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get API base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Default fetch options
 */
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

/**
 * Get auth token from Supabase session
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }
};

/**
 * Create fetch options with authentication
 */
export const createFetchOptions = async (
  options: RequestInit = {},
): Promise<RequestInit> => {
  const token = await getAuthToken();
  const headers = new Headers(defaultFetchOptions.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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
