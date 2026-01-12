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
  CheckoutSessionResult,
} from "../types/billing";

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
   */
  static async createCheckoutSession(
    organizationId: string,
    planId: string,
    interval: "month" | "year",
    returnUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const result = await ApiClient.post<CheckoutSessionResult>(
      `${BillingService.BASE_PATH}/checkout`,
      {
        organizationId,
        planId,
        interval,
        returnUrl,
        cancelUrl,
      },
    );

    return result;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    organizationId: string,
    cancelImmediately: boolean = false,
  ): Promise<void> {
    await ApiClient.post(
      `${BillingService.BASE_PATH}/cancel`,
      {
        organizationId,
        cancelImmediately,
      },
    );
  }
}
