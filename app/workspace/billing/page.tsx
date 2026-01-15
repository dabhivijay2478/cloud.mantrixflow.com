"use client";

import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { DataTable } from "@/components/shared/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCancelSubscription,
  useChangePlan,
  useCreateCheckout,
  useCustomerPortal,
  useResumeSubscription,
  useSubscription,
} from "@/lib/api/hooks/use-billing";
import type { SubscriptionPlan } from "@/lib/api/types/billing";
import { toast } from "@/lib/utils/toast";

const PLANS: Array<{
  id: SubscriptionPlan;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  description?: string;
  pipelines: string;
  executions: string;
  invites: boolean;
  comingSoon?: boolean;
}> = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Best for evaluation & small tests",
    pipelines: "1",
    executions: "5 / day",
    invites: false,
    features: [
      "1 organization",
      "1 data source connection",
      "1 data pipeline",
      "Manual sync only",
      "Limited records per run (e.g. 10k)",
      "Community support",
      "No billing setup required",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Best for individual developers & small teams",
    pipelines: "Up to 5",
    executions: "50 / day",
    invites: true,
    popular: true,
    features: [
      "1 organization",
      "Up to 5 data sources",
      "Up to 5 active pipelines",
      "Scheduled sync (hourly / daily)",
      "Incremental sync",
      "Basic transformations",
      "Activity logs (7 days)",
      "Email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 99,
    description: "Best for growing teams & production workloads",
    pipelines: "Unlimited",
    executions: "500 / day",
    invites: true,
    features: [
      "Up to 3 organizations",
      "Unlimited data sources",
      "Unlimited pipelines",
      "Near-real-time sync",
      "Advanced transformations",
      "Retry & failure handling",
      "Activity logs (90 days)",
      "Team roles & permissions",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    description: "Best for large teams & enterprise workloads",
    pipelines: "Unlimited",
    executions: "Custom / Unlimited",
    invites: true,
    comingSoon: true,
    features: [
      "Unlimited organizations",
      "Unlimited pipelines & sources",
      "High-volume / continuous sync",
      "Custom SLAs",
      "Dedicated support channel",
      "Audit logs & compliance",
      "Custom retention policies",
      "SSO / SCIM (optional)",
      "Custom contract & invoicing",
    ],
  },
];

// Helper function to determine if a plan is an upgrade or downgrade
const getPlanComparison = (
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan,
): "upgrade" | "downgrade" | "same" => {
  const planOrder: SubscriptionPlan[] = ["free", "pro", "scale", "enterprise"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (currentIndex === targetIndex) return "same";
  return targetIndex > currentIndex ? "upgrade" : "downgrade";
};

export default function BillingPage() {
  const { data: subscription, isLoading, error } = useSubscription();
  const changePlan = useChangePlan();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();
  const cancelSubscription = useCancelSubscription();
  const resumeSubscription = useResumeSubscription();
  const searchParams = useSearchParams();

  // State for plan change confirmation modal
  const [pendingPlanChange, setPendingPlanChange] = useState<{
    planId: SubscriptionPlan;
    comparison: "upgrade" | "downgrade";
  } | null>(null);

  // Mock data for usage (will be replaced with real API calls later)
  const [includedUsage] = useState({
    pipelines: { used: 3, limit: 5, cost: 0 },
    executions: { used: 1250, limit: 1500, cost: 0 }, // 50/day * 30 days
    dataSources: { used: 4, limit: 5, cost: 0 },
  });

  // Define columns for usage table (must be before early returns to follow Rules of Hooks)
  type UsageItem = {
    item: string;
    usage: string;
    cost: string;
  };

  const usageColumns: ColumnDef<UsageItem>[] = useMemo(
    () => [
      {
        id: "item",
        accessorKey: "item",
        header: "Item",
        cell: ({ row }) => (
          <span className={row.original.item === "Total" ? "font-semibold" : "font-medium"}>
            {row.original.item}
          </span>
        ),
        meta: {
          className: "text-left",
        },
      },
      {
        id: "usage",
        accessorKey: "usage",
        header: "Usage",
        cell: ({ row }) => row.original.usage,
        meta: {
          className: "text-right",
        },
      },
      {
        id: "cost",
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.cost}</span>
        ),
        meta: {
          className: "text-right",
        },
      },
    ],
    [],
  );

  // Prepare usage data for table (must be before early returns to follow Rules of Hooks)
  const usageData: UsageItem[] = useMemo(
    () => [
      {
        item: "Pipelines",
        usage: `${includedUsage.pipelines.used} / ${includedUsage.pipelines.limit}`,
        cost: "Included",
      },
      {
        item: "Executions",
        usage: `${includedUsage.executions.used.toLocaleString()} / ${includedUsage.executions.limit.toLocaleString()}`,
        cost: "Included",
      },
      {
        item: "Total",
        usage: `${includedUsage.pipelines.used + includedUsage.executions.used}`,
        cost: "Included",
      },
    ],
    [includedUsage],
  );

  // Show success message if redirected from payment
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const planChanged = searchParams.get("planChanged") === "true";
      
      if (planChanged) {
        toast.success(
          "Plan changed successfully!",
          "Your subscription plan has been updated.",
        );
      } else {
        toast.success(
          "Payment successful!",
          "Your subscription has been activated.",
        );
      }
      // Remove query param from URL
      window.history.replaceState({}, "", "/workspace/billing");
    }
  }, [searchParams]);

  // Get billing period dates
  const getBillingPeriod = () => {
    if (!subscription?.currentPeriodStart || !subscription?.currentPeriodEnd) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
    return {
      start: new Date(subscription.currentPeriodStart),
      end: new Date(subscription.currentPeriodEnd),
    };
  };

  const billingPeriod = getBillingPeriod();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription and billing information"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription and billing information"
        />
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Error
            </CardTitle>
            <CardDescription>
              Failed to load subscription information. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPlan = subscription
    ? PLANS.find((p) => p.id === subscription.planId)
    : null;

  const handlePlanChangeClick = (planId: SubscriptionPlan) => {
    if (!subscription || subscription.planId === planId) {
      return;
    }

    const comparison = getPlanComparison(subscription.planId, planId);
    
    if (comparison === "same") {
      return;
    }

    setPendingPlanChange({ planId, comparison });
  };

  const handleConfirmPlanChange = async () => {
    if (!pendingPlanChange || !subscription) {
      return;
    }

    const { planId, comparison } = pendingPlanChange;

    try {
      if (comparison === "upgrade") {
        await createCheckout.mutateAsync({
          planId,
          returnUrl: `${window.location.origin}/workspace/billing?payment=success&planChanged=true`,
        });
      } else {
        const result = await changePlan.mutateAsync({
          planId,
        });

        setPendingPlanChange(null);

        if (result?.success) {
          toast.success("Plan changed successfully!", result.message);
        }
      }
    } catch (error) {
      console.error("Failed to change plan:", error);
      toast.error(
        "Failed to change plan",
        error instanceof Error ? error.message : "Please try again",
      );
      setPendingPlanChange(null);
    }
  };

  // Prepare confirmation modal props
  const confirmationTitle = pendingPlanChange
    ? pendingPlanChange.comparison === "upgrade"
      ? `Confirm Upgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId}`
      : `Confirm Downgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId}`
    : "";

  const confirmationDescription = pendingPlanChange
    ? pendingPlanChange.comparison === "upgrade"
      ? `You will be charged $${PLANS.find((p) => p.id === pendingPlanChange.planId)?.price || 0}/month, and receive a prorated refund for the remaining days in your current plan.${
          subscription?.currentPeriodEnd
            ? ` Current plan ends: ${format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}.`
            : ""
        }`
      : `Your plan will be downgraded immediately. You'll receive a prorated credit for the remaining time on your current plan, which will be applied to future billing cycles.${
          subscription?.currentPeriodEnd
            ? ` Current plan ends: ${format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}.`
            : ""
        }`
    : "";

  const isProcessing = changePlan.isPending || createCheckout.isPending;

  return (
    <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Manage your subscription, usage, and billing history"
        action={
          subscription?.dodoCustomerId ? (
            <Button
              variant="outline"
              onClick={() => customerPortal.mutate()}
              disabled={customerPortal.isPending}
              className="gap-2"
            >
              {customerPortal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Manage in Dodo Payments
                </>
              )}
            </Button>
          ) : undefined
        }
      />



      {/* Current Subscription Summary */}
      {subscription ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Plan Card */}
          <Card id="current-subscription">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{currentPlan?.name || subscription.planId}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                </div>
                <div className="text-right">
                  {currentPlan?.price === 0 ? (
                    <span className="text-2xl font-bold">$0</span>
                  ) : currentPlan?.id === "enterprise" ? (
                    <span className="text-2xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">${currentPlan?.price || 0}</span>
                      <span className="text-muted-foreground text-sm">/mo.</span>
                    </>
                  )}
                </div>
              </div>
              <CardDescription className="text-sm mt-2">
                {currentPlan?.description || "Your current subscription plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                className="w-full"
                variant="secondary"
                asChild
              >
                <Link href="/workspace/billing/manage">Manage Subscription</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription. Choose a plan to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="default"
              asChild
            >
              <Link href="/workspace/billing/manage">View Plans & Subscribe</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Included Usage Section */}
      {subscription && subscription.planId !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Included Usage</CardTitle>
            <CardDescription>
              {format(billingPeriod.start, "MMM dd, yyyy")} - {format(billingPeriod.end, "MMM dd, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Included in {currentPlan?.name || subscription.planId}
            </div>
            <DataTable
              tableId="billing-usage-table"
              columns={usageColumns}
              data={usageData}
              enableFiltering={false}
              enableSorting={false}
              enableRowSelection={false}
              emptyMessage="No usage data available"
            />
          </CardContent>
        </Card>
      )}




      {/* Plan Change Confirmation Modal */}
      {pendingPlanChange && (
        <ConfirmationModal
          open={!!pendingPlanChange}
          onOpenChange={(open) => {
            if (!open) {
              setPendingPlanChange(null);
            }
          }}
          action="custom"
          title={confirmationTitle}
          description={confirmationDescription}
          isLoading={isProcessing}
          onConfirm={handleConfirmPlanChange}
          confirmLabel={
            pendingPlanChange.comparison === "upgrade"
              ? "Confirm"
              : "Confirm Downgrade"
          }
          confirmVariant="default"
        />
      )}


    </div>
  );
}
