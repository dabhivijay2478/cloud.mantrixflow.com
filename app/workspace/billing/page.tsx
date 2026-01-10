"use client";

import { CreditCard, Download, ExternalLink, Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useBillingInvoices,
  useBillingOverview,
  useBillingUsage,
  useCreateCheckoutSession,
  useCreatePortalSession,
} from "@/lib/api/hooks/use-billing";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function BillingPage() {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const createPortalSession = useCreatePortalSession();
  const createCheckoutSession = useCreateCheckoutSession();

  // Fetch billing data (organization-scoped)
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useBillingOverview(organizationId);
  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
  } = useBillingUsage(organizationId);
  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useBillingInvoices(organizationId);

  // Show loading state
  if (!organizationId || overviewLoading || usageLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Handle API errors
  if (overviewError || usageError || invoicesError) {
    const errorMessage =
      overviewError instanceof Error
        ? overviewError.message
        : usageError instanceof Error
          ? usageError.message
          : invoicesError instanceof Error
            ? invoicesError.message
            : "Failed to load billing information";

    if (!errorMessage.includes("403") && !errorMessage.includes("Forbidden")) {
      showErrorToast("loadFailed", "Billing", errorMessage);
    }
  }

  // Handle Manage Billing (redirect to Stripe Customer Portal)
  const handleManageBilling = async () => {
    if (!organizationId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    setIsCreatingPortal(true);
    try {
      const returnUrl = `${window.location.origin}/workspace/billing`;
      const portalUrl = await createPortalSession.mutateAsync({
        organizationId,
        returnUrl,
      });

      // Redirect to Stripe Customer Portal
      window.location.href = portalUrl;
    } catch (error) {
      showErrorToast(
        "loadFailed",
        "Billing",
        error instanceof Error ? error.message : "Failed to create portal session",
      );
    } finally {
      setIsCreatingPortal(false);
    }
  };

  // Handle Upgrade Plan (redirect to Stripe Checkout)
  const handleUpgradePlan = async (planId: string = "pro") => {
    if (!organizationId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const successUrl = `${window.location.origin}/workspace/billing?success=true`;
      const cancelUrl = `${window.location.origin}/workspace/billing?canceled=true`;

      const checkoutUrl = await createCheckoutSession.mutateAsync({
        organizationId,
        planId,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      showErrorToast(
        "loadFailed",
        "Billing",
        error instanceof Error ? error.message : "Failed to create checkout session",
      );
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate usage percentages
  const pipelinesUsagePercent =
    usage && usage.pipelinesLimit > 0
      ? Math.round((usage.pipelinesUsed / usage.pipelinesLimit) * 100)
      : 0;
  const dataSourcesUsagePercent =
    usage && usage.dataSourcesLimit > 0
      ? Math.round((usage.dataSourcesUsed / usage.dataSourcesLimit) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your organization billing and subscription
          </p>
        </div>
        <div className="flex items-center gap-2">
          {overview && (
            <>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isCreatingPortal}
              >
                <Settings className="mr-2 h-4 w-4" />
                {isCreatingPortal ? "Loading..." : "Manage Billing"}
              </Button>
              {overview.billingStatus === "incomplete" ||
                (overview.currentPlan === "free" && (
                  <Button
                    onClick={() => handleUpgradePlan("pro")}
                    disabled={isCreatingCheckout}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isCreatingCheckout ? "Loading..." : "Upgrade Plan"}
                  </Button>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Current Plan Card */}
      {overview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Subscription and billing information
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="text-lg font-semibold capitalize">
                  {overview.currentPlan}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge
                  variant={
                    overview.billingStatus === "active"
                      ? "default"
                      : overview.billingStatus === "trial"
                        ? "secondary"
                        : "destructive"
                  }
                  className="capitalize"
                >
                  {overview.billingStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-lg font-semibold">
                  {overview.amount > 0
                    ? formatCurrency(overview.amount, overview.currency)
                    : "Free"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Next Billing Date
                </p>
                <p className="text-lg font-semibold">
                  {formatDate(overview.nextBillingDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Summary */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>
              Current usage for this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pipelines Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Pipelines</p>
                  <p className="text-sm text-muted-foreground">
                    {usage.pipelinesUsed} / {usage.pipelinesLimit}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(pipelinesUsagePercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pipelinesUsagePercent}% of limit used
                </p>
              </div>

              {/* Data Sources Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Data Sources</p>
                  <p className="text-sm text-muted-foreground">
                    {usage.dataSourcesUsed} / {usage.dataSourcesLimit}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(dataSourcesUsagePercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dataSourcesUsagePercent}% of limit used
                </p>
              </div>

              {/* Migrations */}
              <div>
                <p className="text-sm font-medium mb-1">Migrations Run</p>
                <p className="text-2xl font-semibold">{usage.migrationsRun}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total migrations executed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices - Minimal display, redirect to Stripe for details */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  View and download invoices from Stripe
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={isCreatingPortal}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View All Invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoiceId}
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          invoice.amount,
                          overview?.currency || "INR",
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.downloadUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(invoice.downloadUrl, "_blank")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                For complete invoice history and payment management,{" "}
                <button
                  onClick={handleManageBilling}
                  className="text-primary hover:underline"
                  disabled={isCreatingPortal}
                >
                  visit Stripe Customer Portal
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
