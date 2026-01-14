/**
 * Billing API Types
 * Type definitions for billing endpoints
 */

export interface BillingOverview {
  currentPlan: string;
  billingStatus: "active" | "trial" | "expired" | "incomplete";
  nextBillingDate: string | Date | null;
  amount: number;
  currency: string;
}

export interface BillingUsage {
  pipelinesUsed: number;
  pipelinesLimit: number;
  dataSourcesUsed: number;
  dataSourcesLimit: number;
  migrationsRun: number;
}

export interface BillingInvoice {
  invoiceId: string;
  date: string | Date;
  amount: number;
  currency?: string;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

export interface BillingPlan {
  id: "free" | "pro" | "scale";
  name: string;
  description: string;
  pricing: {
    month: number;
    year: number;
    countryPricing?: Record<string, { month: number; year: number }>;
  };
  features: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  limits: {
    pipelines: number;
    dataSources: number;
    migrationsPerMonth: number;
  };
}

export interface CheckoutSessionResult {
  checkoutData: {
    subscriptionId: string;
    customerId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    returnUrl?: string;
    cancelUrl?: string;
    planId?: string;
    interval?: string;
  };
  subscriptionId: string;
}
