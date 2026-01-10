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
  status: "paid" | "pending";
  downloadUrl: string;
}
