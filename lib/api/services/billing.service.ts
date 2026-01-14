/**
 * Billing API Service
 * Service layer for billing endpoints
 */

import { ApiClient } from "../client";
import type {
  BillingInvoice,
  BillingOverview,
  BillingUsage,
  BillingPlan,
} from "../types/billing";

export interface CheckoutSessionResult {
  checkoutUrl: string;
  subscriptionId: string;
}

export interface PortalSessionResult {
  url: string;
}

export class BillingService {
  private static readonly BASE_PATH = "api/billing";

  /**
   * Get billing overview for the authenticated user
   */
  static async getBillingOverview(): Promise<BillingOverview> {
    const overview = await ApiClient.get<BillingOverview>(
      `${BillingService.BASE_PATH}/overview`,
    );

    return overview;
  }

  /**
   * Get billing usage for the authenticated user
   */
  static async getBillingUsage(): Promise<BillingUsage> {
    const usage = await ApiClient.get<BillingUsage>(
      `${BillingService.BASE_PATH}/usage`,
    );

    return usage;
  }

  /**
   * Get billing invoices for the authenticated user
   */
  static async getBillingInvoices(): Promise<BillingInvoice[]> {
    const invoices = await ApiClient.get<BillingInvoice[]>(
      `${BillingService.BASE_PATH}/invoices`,
    );

    return invoices;
  }

  /**
   * Get available billing plans
   */
  static async getPlans(): Promise<BillingPlan[]> {
    const plans = await ApiClient.get<BillingPlan[]>(
      `${BillingService.BASE_PATH}/plans`,
    );

    return plans;
  }

  /**
   * Create checkout session for subscription
   * Returns Dodo-hosted checkout URL
   */
  static async createCheckoutSession(
    planId: string,
    interval: "month" | "year",
    returnUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const result = await ApiClient.post<CheckoutSessionResult>(
      `${BillingService.BASE_PATH}/checkout`,
      {
        planId,
        interval,
        returnUrl,
        cancelUrl,
      },
    );

    return result;
  }

  /**
   * Get customer portal URL
   * Returns Dodo-hosted billing portal URL
   */
  static async getPortalUrl(): Promise<string> {
    const result = await ApiClient.get<PortalSessionResult>(
      `${BillingService.BASE_PATH}/portal`,
    );

    return result.url;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    cancelImmediately: boolean = false,
  ): Promise<void> {
    await ApiClient.post(
      `${BillingService.BASE_PATH}/cancel`,
      {
        cancelImmediately,
      },
    );
  }

  /**
   * Get invoice download URL
   */
  static async getInvoiceDownloadUrl(
    invoiceId: string,
  ): Promise<string> {
    const result = await ApiClient.get<{ downloadUrl: string }>(
      `${BillingService.BASE_PATH}/invoices/${invoiceId}/download`,
    );

    return result.downloadUrl;
  }
}
