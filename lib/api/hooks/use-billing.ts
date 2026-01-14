/**
 * Billing TanStack Query Hooks
 * Reusable hooks for billing API endpoints
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { BillingService } from "../services/billing.service";

// Query Keys
export const billingKeys = {
  all: ["billing"] as const,
  overview: () => [...billingKeys.all, "overview"] as const,
  usage: () => [...billingKeys.all, "usage"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
};

/**
 * Get billing overview for the authenticated user
 */
export function useBillingOverview() {
  return useQuery({
    queryKey: billingKeys.overview(),
    queryFn: async () => {
      const result = await BillingService.getBillingOverview();
      if (!result) {
        throw new Error("Billing overview data is undefined");
      }
      return result;
    },
  });
}

/**
 * Get billing usage for the authenticated user
 */
export function useBillingUsage() {
  return useQuery({
    queryKey: billingKeys.usage(),
    queryFn: async () => {
      const result = await BillingService.getBillingUsage();
      if (!result) {
        throw new Error("Billing usage data is undefined");
      }
      return result;
    },
  });
}

/**
 * Get billing invoices for the authenticated user
 */
export function useBillingInvoices() {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: async () => {
      const result = await BillingService.getBillingInvoices();
      if (!result) {
        throw new Error("Billing invoices data is undefined");
      }
      return result;
    },
  });
}

/**
 * Get available billing plans
 */
export function useBillingPlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const result = await BillingService.getPlans();
      if (!result) {
        throw new Error("Billing plans data is undefined");
      }
      return result;
    },
  });
}

/**
 * Create checkout session
 * Returns Dodo-hosted checkout URL
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: ({
      planId,
      interval,
      returnUrl,
      cancelUrl,
    }: {
      planId: string;
      interval: "month" | "year";
      returnUrl: string;
      cancelUrl: string;
    }) =>
      BillingService.createCheckoutSession(
        planId,
        interval,
        returnUrl,
        cancelUrl,
      ),
  });
}

/**
 * Get customer portal URL
 */
export function useGetPortalUrl() {
  return useMutation({
    mutationFn: () => BillingService.getPortalUrl(),
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  return useMutation({
    mutationFn: ({ cancelImmediately }: { cancelImmediately?: boolean }) =>
      BillingService.cancelSubscription(cancelImmediately),
  });
}

/**
 * Get invoice download URL
 */
export function useGetInvoiceDownloadUrl() {
  return useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: string }) =>
      BillingService.getInvoiceDownloadUrl(invoiceId),
  });
}
