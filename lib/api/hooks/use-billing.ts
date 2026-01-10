/**
 * Billing TanStack Query Hooks
 * Reusable hooks for billing API endpoints
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { BillingService } from "../services/billing.service";

// Query Keys
export const billingKeys = {
  all: ["billing"] as const,
  overview: (organizationId: string) =>
    [...billingKeys.all, "overview", organizationId] as const,
  usage: (organizationId: string) =>
    [...billingKeys.all, "usage", organizationId] as const,
  invoices: (organizationId: string) =>
    [...billingKeys.all, "invoices", organizationId] as const,
};

/**
 * Get billing overview for an organization
 */
export function useBillingOverview(organizationId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.overview(organizationId || ""),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const result = await BillingService.getBillingOverview(organizationId);
      if (!result) {
        throw new Error("Billing overview data is undefined");
      }
      return result;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get billing usage for an organization
 */
export function useBillingUsage(organizationId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.usage(organizationId || ""),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const result = await BillingService.getBillingUsage(organizationId);
      if (!result) {
        throw new Error("Billing usage data is undefined");
      }
      return result;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get billing invoices for an organization
 */
export function useBillingInvoices(organizationId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.invoices(organizationId || ""),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const result = await BillingService.getBillingInvoices(organizationId);
      if (!result) {
        throw new Error("Billing invoices data is undefined");
      }
      return result;
    },
    enabled: !!organizationId,
  });
}

/**
 * Create Stripe Customer Portal session
 */
export function useCreatePortalSession() {
  return useMutation({
    mutationFn: ({
      organizationId,
      returnUrl,
    }: {
      organizationId: string;
      returnUrl: string;
    }) => BillingService.createPortalSession(organizationId, returnUrl),
  });
}

/**
 * Create Stripe Checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: ({
      organizationId,
      planId,
      successUrl,
      cancelUrl,
    }: {
      organizationId: string;
      planId: string;
      successUrl: string;
      cancelUrl: string;
    }) =>
      BillingService.createCheckoutSession(
        organizationId,
        planId,
        successUrl,
        cancelUrl,
      ),
  });
}
