/**
 * Billing API Service
 * Service layer for billing endpoints
 */

import { ApiClient } from "../client";
import type { BillingInvoice, BillingOverview, BillingUsage } from "../types/billing";

export class BillingService {
  private static readonly BASE_PATH = "api/billing";

  /**
   * Get billing overview for an organization
   */
  static async getBillingOverview(
    organizationId: string,
  ): Promise<BillingOverview> {
    const params = new URLSearchParams();
    params.append("organizationId", organizationId);

    const overview = await ApiClient.get<BillingOverview>(
      `${BillingService.BASE_PATH}/overview?${params.toString()}`,
    );

    return overview;
  }

  /**
   * Get billing usage for an organization
   */
  static async getBillingUsage(organizationId: string): Promise<BillingUsage> {
    const params = new URLSearchParams();
    params.append("organizationId", organizationId);

    const usage = await ApiClient.get<BillingUsage>(
      `${BillingService.BASE_PATH}/usage?${params.toString()}`,
    );

    return usage;
  }

  /**
   * Get billing invoices for an organization
   */
  static async getBillingInvoices(
    organizationId: string,
  ): Promise<BillingInvoice[]> {
    const params = new URLSearchParams();
    params.append("organizationId", organizationId);

    const invoices = await ApiClient.get<BillingInvoice[]>(
      `${BillingService.BASE_PATH}/invoices?${params.toString()}`,
    );

    return invoices;
  }

  /**
   * Create Stripe Customer Portal session
   */
  static async createPortalSession(
    organizationId: string,
    returnUrl: string,
  ): Promise<string> {
    const response = await ApiClient.post<{ url: string }>(
      `${BillingService.BASE_PATH}/create-portal-session`,
      {
        organizationId,
        returnUrl,
      },
    );

    return response.url;
  }

  /**
   * Create Stripe Checkout session
   */
  static async createCheckoutSession(
    organizationId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    const response = await ApiClient.post<{ url: string }>(
      `${BillingService.BASE_PATH}/create-checkout-session`,
      {
        organizationId,
        planId,
        successUrl,
        cancelUrl,
      },
    );

    return response.url;
  }
}
