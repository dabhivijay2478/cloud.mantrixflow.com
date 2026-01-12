"use client";

import { Check, CreditCard, Loader2, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useBillingOverview,
  useBillingUsage,
  useBillingPlans,
  useCreateCheckoutSession,
} from "@/lib/api/hooks/use-billing";
import { showErrorToast } from "@/lib/utils/toast";
import type { BillingPlan } from "@/lib/api/types/billing";

export default function OrganizationBillingPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">("month");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const createCheckoutSession = useCreateCheckoutSession();

  // Fetch billing data
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
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useBillingPlans();

  // Show loading state
  if (!organizationId || overviewLoading || usageLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Handle API errors
  if (overviewError || usageError || plansError) {
    const errorMessage =
      overviewError instanceof Error
        ? overviewError.message
        : usageError instanceof Error
          ? usageError.message
          : plansError instanceof Error
            ? plansError.message
            : "Failed to load billing information";

    if (!errorMessage.includes("403") && !errorMessage.includes("Forbidden")) {
      showErrorToast("loadFailed", "Billing", errorMessage);
    }
  }

  // Handle upgrade to plan
  const handleUpgrade = async (planId: string) => {
    if (!organizationId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const returnUrl = `${window.location.origin}/organizations/${organizationId}/billing?success=true`;
      const cancelUrl = `${window.location.origin}/organizations/${organizationId}/billing?canceled=true`;

      const result = await createCheckoutSession.mutateAsync({
        organizationId,
        planId,
        interval: selectedInterval,
        returnUrl,
        cancelUrl,
      });

      // Store checkout data in sessionStorage for checkout page
      if (result.checkoutData) {
        sessionStorage.setItem(
          `checkout_${result.subscriptionId}`,
          JSON.stringify(result.checkoutData),
        );
      }

      // Redirect to custom checkout page
      const checkoutUrl = new URL(
        `/organizations/${organizationId}/billing/checkout`,
        window.location.origin,
      );
      checkoutUrl.searchParams.set("subscriptionId", result.subscriptionId);
      checkoutUrl.searchParams.set("planId", planId);
      router.push(checkoutUrl.toString());
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
  const formatCurrency = (amount: number, currency: string = "INR") => {
    if (amount === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const displayPlans = plans || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your organization billing and subscription
        </p>
      </div>

      {/* Current Plan Card */}
      {overview && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Subscription and billing information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="text-lg font-semibold capitalize">{overview.currentPlan}</p>
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
                <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                <p className="text-lg font-semibold">{formatDate(overview.nextBillingDate)}</p>
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
            <CardDescription>Current usage for this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pipelines Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Pipelines</p>
                  <p className="text-sm text-muted-foreground">
                    {usage.pipelinesUsed} /{" "}
                    {usage.pipelinesLimit === 999999 ? "Unlimited" : usage.pipelinesLimit}
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
                    {usage.dataSourcesUsed} /{" "}
                    {usage.dataSourcesLimit === 999999
                      ? "Unlimited"
                      : usage.dataSourcesLimit}
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

      {/* Pricing Cards */}
      {displayPlans.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Choose a Plan</h2>
              <p className="text-muted-foreground">Select the plan that fits your needs</p>
            </div>
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={selectedInterval === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedInterval("month")}
              >
                Monthly
              </Button>
              <Button
                variant={selectedInterval === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedInterval("year")}
              >
                Yearly
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPlans.map((plan: BillingPlan) => {
              const isCurrentPlan = overview?.currentPlan === plan.id;
              const price =
                selectedInterval === "month" ? plan.pricing.month : plan.pricing.year;
              const isPopular = plan.id === "pro";

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isPopular ? "border-primary shadow-lg" : ""} ${
                    isCurrentPlan ? "border-2" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Popular</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">Current</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {plan.id === "pro" && <Zap className="h-5 w-5 text-primary" />}
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {formatCurrency(price, "INR")}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {selectedInterval === "month" ? "month" : "year"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>{feature.label}:</strong> {feature.value}
                            {feature.unit && ` ${feature.unit}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      disabled={isCurrentPlan || isCreatingCheckout}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : isCreatingCheckout
                          ? "Loading..."
                          : plan.id === "free"
                            ? "Downgrade"
                            : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
