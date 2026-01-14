/**
 * Billing API Service
 * Service layer for billing endpoints
 */

import { ApiClient } from "../client";
import type {
  CancelSubscriptionResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  Subscription,
  UpdatePaymentMethodRequest,
  UpdatePaymentMethodResponse,
} from "../types/billing";

export class BillingService {
  private static readonly BASE_PATH = "api/billing";

  /**
   * Create checkout session for subscription
   */
  static async createCheckout(
    request: CreateCheckoutRequest,
    options?: { token?: string | null },
  ): Promise<CreateCheckoutResponse> {
    return ApiClient.post<CreateCheckoutResponse>(
      `${BillingService.BASE_PATH}/create-checkout`,
      request,
      {
        token: options?.token,
      },
    );
  }

  /**
   * Get current subscription for user
   * Returns null if no subscription exists
   */
  static async getSubscription(options?: {
    token?: string | null;
  }): Promise<Subscription | null> {
    try {
      return await ApiClient.get<Subscription>(
        `${BillingService.BASE_PATH}/subscription`,
        {
          token: options?.token,
        },
      );
    } catch (error: unknown) {
      // Handle 404 as "no subscription" rather than an error
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Change subscription plan - uses Dodo Payments changePlan API directly
   * No checkout session needed - plan changes immediately
   */
  static async changePlan(
    request: ChangePlanRequest,
    options?: { token?: string | null },
  ): Promise<ChangePlanResponse> {
    return ApiClient.post<ChangePlanResponse>(
      `${BillingService.BASE_PATH}/change-plan`,
      request,
      {
        token: options?.token,
      },
    );
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(options?: {
    token?: string | null;
  }): Promise<CancelSubscriptionResponse> {
    return ApiClient.post<CancelSubscriptionResponse>(
      `${BillingService.BASE_PATH}/cancel`,
      {},
      {
        token: options?.token,
      },
    );
  }

  /**
   * Resume subscription (undo cancel)
   */
  static async resumeSubscription(options?: {
    token?: string | null;
  }): Promise<CancelSubscriptionResponse> {
    return ApiClient.post<CancelSubscriptionResponse>(
      `${BillingService.BASE_PATH}/resume`,
      {},
      {
        token: options?.token,
      },
    );
  }

  /**
   * Update payment method for subscription
   * Returns URL to redirect user to payment method update page
   */
  static async updatePaymentMethod(
    request?: UpdatePaymentMethodRequest,
    options?: { token?: string | null },
  ): Promise<UpdatePaymentMethodResponse> {
    return ApiClient.post<UpdatePaymentMethodResponse>(
      `${BillingService.BASE_PATH}/update-payment-method`,
      request || {},
      {
        token: options?.token,
      },
    );
  }

  /**
   * Get customer portal URL for managing subscriptions and invoices
   */
  static async getCustomerPortalUrl(options?: {
    token?: string | null;
  }): Promise<{ portalUrl: string }> {
    return ApiClient.get<{ portalUrl: string }>(
      `${BillingService.BASE_PATH}/customer-portal`,
      {
        token: options?.token,
      },
    );
  }
}
