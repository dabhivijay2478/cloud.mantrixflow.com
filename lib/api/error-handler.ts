/**
 * API Error Handler
 * Centralized handling of API errors for consistent UX
 */

import { ApiClientError } from "./client";
import { toast } from "@/lib/utils/toast";

/**
 * Get user-friendly message from API error
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode >= 500) {
      return "A server error occurred. Please try again later.";
    }
    if (error.statusCode === 404) {
      return "The requested resource was not found.";
    }
    if (error.statusCode === 403) {
      return "You don't have permission to perform this action.";
    }
    if (error.statusCode === 401) {
      return "Please sign in to continue.";
    }
    return error.message || "An error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

/**
 * Handle API error: optionally show toast and return user-friendly message.
 * Use in mutation onError callbacks and critical flows.
 */
export function handleApiError(
  error: unknown,
  options?: { showToast?: boolean; fallbackMessage?: string },
): string {
  const { showToast = true, fallbackMessage } = options ?? {};
  const message = getApiErrorMessage(error) || fallbackMessage || "An error occurred.";

  if (showToast) {
    toast.error("Error", message);
  }

  return message;
}
