"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  useUpdatePaymentMethod,
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
}> = [
  {
    id: "basic",
    name: "Basic",
    price: 10,
    description: "Perfect for getting started",
    features: [
      "Up to 5 data sources",
      "Basic support",
      "Standard features",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 20,
    description: "For growing teams",
    features: [
      "Unlimited data sources",
      "Priority support",
      "Advanced features",
      "Custom integrations",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 50,
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom SLA",
      "On-premise deployment",
      "Custom integrations",
      "Advanced security",
    ],
  },
];

// Helper function to determine if a plan is an upgrade or downgrade
const getPlanComparison = (
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan,
): "upgrade" | "downgrade" | "same" => {
  const planOrder: SubscriptionPlan[] = ["basic", "pro", "enterprise"];
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
  const updatePaymentMethod = useUpdatePaymentMethod();
  const searchParams = useSearchParams();

  // State for plan change confirmation modal
  const [showPlanChangeConfirm, setShowPlanChangeConfirm] = useState(false);
  const [pendingPlanChange, setPendingPlanChange] = useState<{
    planId: SubscriptionPlan;
    comparison: "upgrade" | "downgrade";
  } | null>(null);

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
      // Refetch subscription to show updated plan
      // The hook will automatically refetch when component remounts
    }

    // Show success message if payment method was updated
    if (searchParams.get("paymentMethodUpdated") === "true") {
      toast.success(
        "Payment method updated!",
        "Your payment method has been successfully updated.",
      );
      // Remove query param from URL
      window.history.replaceState({}, "", "/workspace/billing");
    }
  }, [searchParams]);

  // Debug: Log subscription data to help troubleshoot
  useEffect(() => {
    if (subscription) {
      console.log("Subscription data:", {
        id: subscription.id,
        dodoCustomerId: subscription.dodoCustomerId,
        dodoSubscriptionId: subscription.dodoSubscriptionId,
        planId: subscription.planId,
        status: subscription.status,
      });
    }
  }, [subscription]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500">Trial</Badge>;
      case "on_hold":
        return <Badge className="bg-yellow-500">On Hold</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePlanChangeClick = (planId: SubscriptionPlan) => {
    if (!subscription || subscription.planId === planId) {
      return;
    }

    // Determine if this is an upgrade or downgrade
    const comparison = getPlanComparison(subscription.planId, planId);
    
    if (comparison === "same") {
      return;
    }

    // Store the pending plan change and show confirmation modal
    setPendingPlanChange({ planId, comparison });
    setShowPlanChangeConfirm(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!pendingPlanChange || !subscription) {
      return;
    }

    const { planId, comparison } = pendingPlanChange;

    try {
      if (comparison === "upgrade") {
        // For upgrades: create checkout session (payment required)
        await createCheckout.mutateAsync({
          planId,
          returnUrl: `${window.location.origin}/workspace/billing?payment=success&planChanged=true`,
        });
        // Checkout will redirect, so we don't need to close modal here
      } else {
        // For downgrades: use changePlan API directly (database sync, no payment)
        const result = await changePlan.mutateAsync({
          planId,
        });

        // Close modal and show success message
        setShowPlanChangeConfirm(false);
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
      // Close modal on error
      setShowPlanChangeConfirm(false);
      setPendingPlanChange(null);
    }
  };

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

  // Don't return early - show plans even when no subscription

  const currentPlan = subscription
    ? PLANS.find((p) => p.id === subscription.planId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and billing information"
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

      {/* Current Subscription - Only show if subscription exists */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription>
                  Your current plan and billing information
                </CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plan
                </p>
                <p className="text-lg font-semibold">
                  {currentPlan?.name || subscription?.planId}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {subscription?.status}
                </p>
              </div>
              {subscription?.currentPeriodStart && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Period Start
                  </p>
                  <p className="text-lg font-semibold">
                    {format(
                      new Date(subscription.currentPeriodStart),
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
              )}
              {subscription?.currentPeriodEnd && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Period End
                  </p>
                  <p className="text-lg font-semibold">
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
              )}
              {subscription?.trialEnd && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trial Ends
                  </p>
                  <p className="text-lg font-semibold">
                    {format(new Date(subscription.trialEnd), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
              {subscription?.canceledAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Canceled At
                  </p>
                  <p className="text-lg font-semibold">
                    {format(new Date(subscription.canceledAt), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
              {subscription?.cancelAtPeriodEnd && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cancellation Status
                  </p>
                  <p className="text-lg font-semibold text-yellow-600">
                    Will cancel at period end
                    {subscription.currentPeriodEnd &&
                      ` (${format(
                        new Date(subscription.currentPeriodEnd),
                        "MMM dd, yyyy",
                      )})`}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {/* Update Payment Method - Show when on_hold or failed */}
              {(subscription.status === "on_hold" ||
                subscription.status === "failed") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    updatePaymentMethod.mutate({
                      returnUrl: `${window.location.origin}/workspace/billing?paymentMethodUpdated=true`,
                    });
                  }}
                  disabled={updatePaymentMethod.isPending}
                  className="gap-2"
                >
                  {updatePaymentMethod.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Update Payment Method
                    </>
                  )}
                </Button>
              )}

              {/* Resume Subscription - Show when cancelAtPeriodEnd is true */}
              {subscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await resumeSubscription.mutateAsync();
                      if (result?.success) {
                        toast.success("Subscription resumed!", result.message);
                      }
                    } catch (error) {
                      toast.error(
                        "Failed to resume subscription",
                        error instanceof Error
                          ? error.message
                          : "Please try again",
                      );
                    }
                  }}
                  disabled={resumeSubscription.isPending}
                  className="gap-2"
                >
                  {resumeSubscription.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Resume Subscription
                    </>
                  )}
                </Button>
              )}

              {/* Cancel Subscription - Show when active and not already canceled */}
              {subscription.status === "active" &&
                !subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.",
                        )
                      ) {
                        return;
                      }

                      try {
                        const result = await cancelSubscription.mutateAsync();
                        if (result?.success) {
                          toast.success(
                            "Subscription canceled",
                            result.message,
                          );
                        }
                      } catch (error) {
                        toast.error(
                          "Failed to cancel subscription",
                          error instanceof Error
                            ? error.message
                            : "Please try again",
                        );
                      }
                    }}
                    disabled={cancelSubscription.isPending}
                    className="gap-2"
                  >
                    {cancelSubscription.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          {subscription ? "Available Plans" : "Choose a Plan"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {subscription
            ? "Upgrade or downgrade your plan at any time. Changes take effect immediately."
            : "Select a plan to get started. You can upgrade or downgrade at any time."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;
            const isChanging = changePlan.isPending || createCheckout.isPending;
            const comparison = subscription
              ? getPlanComparison(subscription.planId, plan.id)
              : "same";
            const isUpgrade = comparison === "upgrade";
            const isDowngrade = comparison === "downgrade";

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary border-2"
                    : isCurrentPlan
                      ? "border-primary"
                      : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {!subscription ? (
                    <Button
                      className="w-full"
                      variant="default"
                      disabled={createCheckout.isPending}
                      onClick={async () => {
                        try {
                          // Create checkout session directly from billing page
                          // Return to billing page after payment (user already has org)
                          await createCheckout.mutateAsync({
                            planId: plan.id,
                            returnUrl: `${window.location.origin}/workspace/billing?payment=success&from=billing`,
                          });
                        } catch (error) {
                          console.error("Failed to create checkout:", error);
                          toast.error(
                            "Failed to create checkout session",
                            error instanceof Error
                              ? error.message
                              : "Please try again",
                          );
                        }
                      }}
                    >
                      {createCheckout.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Select {plan.name}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={
                        isCurrentPlan
                          ? "outline"
                          : isUpgrade
                            ? "default"
                            : "secondary"
                      }
                      disabled={isCurrentPlan || isChanging || createCheckout.isPending}
                      onClick={() => handlePlanChangeClick(plan.id)}
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
                      ) : (
                        `Select ${plan.name}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Change Plan Info */}
      {(changePlan.isPending || createCheckout.isPending) && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Processing Plan Change</AlertTitle>
          <AlertDescription>
            Please wait while we update your subscription. This may take a few
            moments.
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Change Confirmation Modal */}
      {pendingPlanChange && (
        <ConfirmationModal
          open={showPlanChangeConfirm}
          onOpenChange={(open) => {
            setShowPlanChangeConfirm(open);
            if (!open) {
              setPendingPlanChange(null);
            }
          }}
          action="update"
          title={
            pendingPlanChange.comparison === "upgrade"
              ? `Upgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId} Plan`
              : `Downgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId} Plan`
          }
          description={
            pendingPlanChange.comparison === "upgrade"
              ? `You will be redirected to checkout to complete your upgrade. The new plan will be charged immediately, and you'll receive a prorated credit for the remaining time on your current plan.`
              : `Your plan will be downgraded immediately. You'll receive a prorated credit for the remaining time on your current plan, which will be applied to future billing cycles.`
          }
          confirmLabel={
            pendingPlanChange.comparison === "upgrade"
              ? "Continue to Checkout"
              : "Confirm Downgrade"
          }
          cancelLabel="Cancel"
          confirmVariant="default"
          isLoading={changePlan.isPending || createCheckout.isPending}
          onConfirm={handleConfirmPlanChange}
        />
      )}
    </div>
  );
}
