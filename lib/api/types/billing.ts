/**
 * Billing API Types
 * TypeScript types for billing endpoints
 */

export type SubscriptionPlan = "free" | "pro" | "scale" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "on_hold"
  | "failed"
  | "canceled"
  | "trialing";

export interface Subscription {
  id: string;
  userId: string;
  dodoSubscriptionId: string | null;
  dodoCustomerId: string | null;
  planId: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  canceledAt: Date | null;
  cancelAtPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPortalResponse {
  portalUrl: string;
}

export interface CreateCheckoutRequest {
  planId: SubscriptionPlan;
  returnUrl: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface ChangePlanRequest {
  planId: SubscriptionPlan;
  returnUrl?: string; // Optional, not used anymore but kept for backward compatibility
}

export interface ChangePlanResponse {
  success: boolean;
  message: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export interface UpdatePaymentMethodRequest {
  returnUrl?: string;
}

export interface UpdatePaymentMethodResponse {
  url: string;
  sessionId?: string;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceInterval: "month" | "year";
  features: string[];
  popular?: boolean;
}
