/**
 * Billing API Hooks
 * TanStack Query hooks for billing endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BillingService } from "../services/billing.service";
import type {
  ChangePlanRequest,
  CreateCheckoutRequest,
} from "../types/billing";

// Query keys
export const billingKeys = {
  all: ["billing"] as const,
  subscription: () => [...billingKeys.all, "subscription"] as const,
};

/**
 * Get current subscription
 * Returns null if no subscription exists
 */
export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => BillingService.getSubscription(),
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (no subscription)
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 404
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Create checkout session
 */
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (request: CreateCheckoutRequest) =>
      BillingService.createCheckout(request),
    onSuccess: (data) => {
      // Redirect to checkout URL
      console.log("Checkout response received:", JSON.stringify(data, null, 2));

      if (data?.checkoutUrl) {
        console.log("Redirecting to checkout URL:", data.checkoutUrl);
        // Use window.location.replace to avoid back button issues
        window.location.replace(data.checkoutUrl);
      } else {
        console.error("No checkout URL in response. Full response:", data);
        alert(
          "Failed to get checkout URL. Please check the console for details.",
        );
      }
    },
    onError: (error) => {
      console.error("Failed to create checkout session:", error);
      alert("Failed to create checkout session. Please try again.");
    },
  });
}

/**
 * Change subscription plan - uses Dodo Payments changePlan API directly
 * No redirect needed - plan changes immediately
 */
export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChangePlanRequest) =>
      BillingService.changePlan(request),
    onSuccess: (data) => {
      // Plan changed successfully - no redirect needed!
      console.log("Plan change successful:", data.message);

      // Invalidate subscription query to refresh data
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscription(),
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to change plan:", error);
    },
  });
}

/**
 * Cancel subscription at period end
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => BillingService.cancelSubscription(),
    onSuccess: () => {
      // Invalidate subscription query to refresh data
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscription(),
      });
    },
  });
}

/**
 * Resume subscription (undo cancel)
 */
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => BillingService.resumeSubscription(),
    onSuccess: () => {
      // Invalidate subscription query to refresh data
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscription(),
      });
    },
  });
}


/**
 * Get customer portal URL for managing subscriptions and invoices
 */
export function useCustomerPortal() {
  return useMutation({
    mutationFn: () => BillingService.getCustomerPortalUrl(),
    onSuccess: (data) => {
      if (data?.portalUrl) {
        // Open customer portal in new tab
        window.open(data.portalUrl, "_blank", "noopener,noreferrer");
      } else {
        console.error("No portal URL in response. Full response:", data);
        alert("Failed to get customer portal URL. Please try again.");
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to get customer portal URL:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Failed to open customer portal. Please try again.";
      alert(message);
    },
  });
}

