"use client";

import { ArrowDown, ArrowUp, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useChangePlan,
  useCreateCheckout,
  useSubscription,
} from "@/lib/api/hooks/use-billing";
import type { SubscriptionPlan } from "@/lib/api/types/billing";
import { toast } from "@/lib/utils/toast";
import { format } from "date-fns";

const PLANS: Array<{
  id: SubscriptionPlan;
  name: string;
  price: number;
  features: string[];
  description?: string;
  comingSoon?: boolean;
}> = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Best for evaluation & small tests",
    features: [
      "1 organization",
      "1 data source connection",
      "1 data pipeline",
      "Manual sync only",
      "Limited records per run (e.g. 10k)",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Best for individual developers & small teams",
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
    comingSoon: true,
  },
];

function getPlanComparison(
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan,
): "upgrade" | "downgrade" | "same" {
  const planOrder: SubscriptionPlan[] = ["free", "pro", "scale", "enterprise"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (currentIndex === targetIndex) return "same";
  return currentIndex < targetIndex ? "upgrade" : "downgrade";
}

export default function ManageSubscriptionPage() {
  const { data: subscription, isLoading } = useSubscription();
  const changePlan = useChangePlan();
  const createCheckout = useCreateCheckout();

  const [showPlanChangeConfirm, setShowPlanChangeConfirm] = useState(false);
  const [pendingPlanChange, setPendingPlanChange] = useState<{
    planId: SubscriptionPlan;
    comparison: "upgrade" | "downgrade";
  } | null>(null);

  const handlePlanChangeClick = (planId: SubscriptionPlan) => {
    if (!subscription) return;

    const comparison = getPlanComparison(subscription.planId, planId);
    if (comparison === "same") return;

    setPendingPlanChange({ planId, comparison });
    setShowPlanChangeConfirm(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!pendingPlanChange || !subscription) return;

    try {
      if (pendingPlanChange.comparison === "upgrade") {
        // For upgrades, create checkout session
        await createCheckout.mutateAsync({
          planId: pendingPlanChange.planId,
          returnUrl: `${window.location.origin}/workspace/billing?payment=success&from=manage`,
        });
      } else {
        // For downgrades, change plan directly
        await changePlan.mutateAsync({
          planId: pendingPlanChange.planId,
        });
        toast.success("Plan downgraded successfully");
        setShowPlanChangeConfirm(false);
        setPendingPlanChange(null);
      }
    } catch (error) {
      toast.error(
        "Failed to change plan",
        error instanceof Error ? error.message : "Please try again",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Manage Subscription"
          description="Select a plan to get started"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No active subscription found
          </p>
          <Button asChild>
            <Link href="/workspace/billing">Go to Billing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Plan"
        description="Upgrade or downgrade your plan at any time. Changes take effect immediately."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = subscription.planId === plan.id;
          const isChanging = changePlan.isPending || createCheckout.isPending;
          const comparison = getPlanComparison(subscription.planId, plan.id);
          const isUpgrade = comparison === "upgrade";
          const isDowngrade = comparison === "downgrade";
          const isFree = plan.id === "free";

          return (
            <Card
              key={plan.id}
              className={`relative ${
                isCurrentPlan ? "border-primary border-2" : ""
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-2 left-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Current
                  </Badge>
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-2 right-3">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold">$0</span>
                  ) : plan.id === "enterprise" ? (
                    <span className="text-2xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/mo.</span>
                    </>
                  )}
                </div>
                <CardDescription className="text-sm mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={
                    isCurrentPlan ||
                    isChanging ||
                    createCheckout.isPending ||
                    plan.comingSoon ||
                    isFree
                  }
                  onClick={() => {
                    if (!isFree && (isUpgrade || isDowngrade)) {
                      handlePlanChangeClick(plan.id);
                    }
                  }}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : isChanging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isFree ? (
                    "Not Available"
                  ) : isUpgrade ? (
                    <>
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  ) : isDowngrade ? (
                    <>
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Downgrade to {plan.name}
                    </>
                  ) : plan.comingSoon ? (
                    "Coming Soon"
                  ) : (
                    `Select ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Change Confirmation Modal */}
      {pendingPlanChange && (
        <Dialog
          open={showPlanChangeConfirm}
          onOpenChange={(open) => {
            setShowPlanChangeConfirm(open);
            if (!open) {
              setPendingPlanChange(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingPlanChange.comparison === "upgrade"
                  ? `Confirm Upgrade to ${
                      PLANS.find((p) => p.id === pendingPlanChange.planId)
                        ?.name || pendingPlanChange.planId
                    }`
                  : `Confirm Downgrade to ${
                      PLANS.find((p) => p.id === pendingPlanChange.planId)
                        ?.name || pendingPlanChange.planId
                    }`}
              </DialogTitle>
              <DialogDescription className="pt-4">
                {pendingPlanChange.comparison === "upgrade" ? (
                  <div className="space-y-2">
                    <p>
                      You will be charged $
                      {
                        PLANS.find((p) => p.id === pendingPlanChange.planId)
                          ?.price || 0
                      }
                      /month, and receive a prorated refund for the remaining
                      days in your current plan.
                    </p>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground">
                        Current plan ends:{" "}
                        {format(
                          new Date(subscription.currentPeriodEnd),
                          "MMM dd, yyyy",
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      Your plan will be downgraded immediately. You'll receive
                      a prorated credit for the remaining time on your current
                      plan, which will be applied to future billing cycles.
                    </p>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground">
                        Current plan ends:{" "}
                        {format(
                          new Date(subscription.currentPeriodEnd),
                          "MMM dd, yyyy",
                        )}
                      </p>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPlanChangeConfirm(false);
                  setPendingPlanChange(null);
                }}
                disabled={changePlan.isPending || createCheckout.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmPlanChange}
                disabled={changePlan.isPending || createCheckout.isPending}
              >
                {changePlan.isPending || createCheckout.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : pendingPlanChange.comparison === "upgrade" ? (
                  "Confirm"
                ) : (
                  "Confirm Downgrade"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
