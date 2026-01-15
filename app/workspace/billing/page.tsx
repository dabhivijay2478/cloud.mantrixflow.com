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
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCancelSubscription,
  useChangePlan,
  useCreateCheckout,
  useCreateOnDemandSubscription,
  useCustomerPortal,
  useResumeSubscription,
  useSubscription,
  useUpdatePaymentMethod,
  useSeatCount,
  useManageSeats,
} from "@/lib/api/hooks/use-billing";
import { useCurrentOrganization } from "@/lib/api/hooks/use-organizations";
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
  seats: string;
  extraSeatPrice?: string;
  onDemand: boolean;
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
    seats: "1 (Owner only)",
    onDemand: false,
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
    seats: "3 included",
    extraSeatPrice: "$5 / seat / month",
    onDemand: true,
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
    seats: "10 included",
    extraSeatPrice: "$4 / seat / month",
    onDemand: true,
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
    seats: "Unlimited or contract-based",
    onDemand: true,
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
  const { data: currentOrg } = useCurrentOrganization();
  const { data: seatInfo, isLoading: seatInfoLoading } = useSeatCount(
    currentOrg?.id || null,
  );
  const changePlan = useChangePlan();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();
  const cancelSubscription = useCancelSubscription();
  const resumeSubscription = useResumeSubscription();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const manageSeats = useManageSeats();
  const createOnDemandSubscription = useCreateOnDemandSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for plan change confirmation modal
  const [showPlanChangeConfirm, setShowPlanChangeConfirm] = useState(false);
  const [pendingPlanChange, setPendingPlanChange] = useState<{
    planId: SubscriptionPlan;
    comparison: "upgrade" | "downgrade";
  } | null>(null);

  // State for seat management
  const [showSeatManage, setShowSeatManage] = useState(false);
  const [desiredSeatCount, setDesiredSeatCount] = useState<number>(seatInfo?.seatCount || 0);

  // State for on-demand usage toggle
  const [onDemandEnabled, setOnDemandEnabled] = useState(false);
  const [spendLimit, setSpendLimit] = useState<number | "unlimited" | "custom">(50);
  const [customLimit, setCustomLimit] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Mock data for usage (will be replaced with real API calls later)
  const [includedUsage] = useState({
    pipelines: { used: 3, limit: 5, cost: 0 },
    executions: { used: 1250, limit: 1500, cost: 0 }, // 50/day * 30 days
    dataSources: { used: 4, limit: 5, cost: 0 },
  });

  const [onDemandUsage] = useState({
    executions: [],
    total: 0,
  });

  const [invoices] = useState([
    {
      id: "inv_1",
      date: subscription?.currentPeriodStart || new Date(),
      description: `${subscription?.planId || "Pro"} Plan - Monthly`,
      status: "Paid",
      amount: subscription ? PLANS.find((p) => p.id === subscription.planId)?.price || 0 : 0,
      invoiceUrl: "#",
    },
  ]);

  // Sync desired seat count when seat info changes
  useEffect(() => {
    if (seatInfo) {
      setDesiredSeatCount(seatInfo.seatCount);
    }
  }, [seatInfo]);

  // Show success message if redirected from payment
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const planChanged = searchParams.get("planChanged") === "true";
      const onDemand = searchParams.get("onDemand") === "true";
      
      if (onDemand) {
        toast.success(
          "On-demand subscription authorized!",
          "Your payment method has been authorized for execution overages.",
        );
        setOnDemandEnabled(true);
      } else if (planChanged) {
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

    // Show success message if payment method was updated
    if (searchParams.get("paymentMethodUpdated") === "true") {
      toast.success(
        "Payment method updated!",
        "Your payment method has been successfully updated.",
      );
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
          title="Billing & Invoices"
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
          title="Billing & Invoices"
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

    const comparison = getPlanComparison(subscription.planId, planId);
    
    if (comparison === "same") {
      return;
    }

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
        await createCheckout.mutateAsync({
          planId,
          returnUrl: `${window.location.origin}/workspace/billing?payment=success&planChanged=true`,
        });
      } else {
        const result = await changePlan.mutateAsync({
          planId,
        });

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
      setShowPlanChangeConfirm(false);
      setPendingPlanChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
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



      {/* Current Subscription Summary with On-Demand - Side by Side */}
      {subscription && (
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

          {/* On-Demand Usage Card - Separate Card */}
          {currentPlan && currentPlan.onDemand && subscription.planId !== "free" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  On-Demand Usage is {onDemandEnabled ? "On" : "Off"}
                </CardTitle>
                {!onDemandEnabled && (
                  <div className="mt-2 space-y-1">
                    <div className="text-muted-foreground text-xs">························</div>
                    <div className="text-muted-foreground text-xs">························</div>
                    <div className="text-muted-foreground text-xs">························</div>
                  </div>
                )}
                <CardDescription className="text-sm mt-2">
                  Go beyond your plan's included quota with on-demand usage
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {onDemandEnabled ? (
                  <>
                    {/* Show spend limit when enabled */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly Spend Limit</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[50, 100, 200, 500].map((limit) => (
                          <button
                            key={limit}
                            type="button"
                            className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                              spendLimit === limit
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => {
                              setSpendLimit(limit);
                              setShowCustomInput(false);
                              // TODO: Save to backend
                              toast.success(`Spend limit set to $${limit}`);
                            }}
                          >
                            ${limit}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                            spendLimit === "unlimited"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                          }`}
                          onClick={() => {
                            setSpendLimit("unlimited");
                            setShowCustomInput(false);
                            // TODO: Save to backend
                            toast.success("Spend limit set to Unlimited");
                          }}
                        >
                          Unlimited
                        </button>
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                            showCustomInput || spendLimit === "custom"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                          }`}
                          onClick={() => {
                            setShowCustomInput(!showCustomInput);
                            setSpendLimit("custom");
                          }}
                        >
                          Custom
                        </button>
                      </div>
                      {showCustomInput && (
                        <div className="space-y-2">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={customLimit}
                            onChange={(e) => setCustomLimit(e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                          />
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => {
                              if (customLimit) {
                                // TODO: Save to backend
                                toast.success(`Spend limit set to $${customLimit}`);
                                setShowCustomInput(false);
                                setCustomLimit("");
                              }
                            }}
                          >
                            Set Custom Limit
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-sm rounded-md border border-input bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      onClick={() => {
                        setOnDemandEnabled(false);
                        // TODO: Disable on-demand in backend
                        toast.success("On-demand usage disabled");
                      }}
                    >
                      Disable On-Demand Usage
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      try {
                        await createOnDemandSubscription.mutateAsync({
                          returnUrl: `${window.location.origin}/workspace/billing?payment=success&onDemand=true`,
                        });
                      } catch (error) {
                        toast.error(
                          "Failed to enable on-demand usage",
                          error instanceof Error ? error.message : "Please try again",
                        );
                      }
                    }}
                    disabled={createOnDemandSubscription.isPending}
                  >
                    {createOnDemandSubscription.isPending ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Enable On-Demand Usage"
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
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
            <div className="mb-2 text-sm text-muted-foreground">
              Included in {currentPlan?.name || subscription.planId}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Pipelines</TableCell>
                  <TableCell className="text-right">
                    {includedUsage.pipelines.used} / {includedUsage.pipelines.limit}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">Included</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Executions</TableCell>
                  <TableCell className="text-right">
                    {includedUsage.executions.used.toLocaleString()} / {includedUsage.executions.limit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">Included</span>
                  </TableCell>
                </TableRow>
                {seatInfo && (
                  <TableRow>
                    <TableCell className="font-medium">Seats</TableCell>
                    <TableCell className="text-right">
                      {seatInfo.seatCount} / {seatInfo.includedSeats + seatInfo.extraSeats}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground">Included</span>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {includedUsage.pipelines.used + includedUsage.executions.used + (seatInfo?.seatCount || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">Included</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* On-Demand Usage Section */}
      {subscription && currentPlan && currentPlan.onDemand && subscription.planId !== "free" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>On-Demand Usage</CardTitle>
                <CardDescription>
                  {format(billingPeriod.start, "MMM dd, yyyy")} - {format(billingPeriod.end, "MMM dd, yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select defaultValue={format(billingPeriod.start, "MMM dd, yyyy")}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={format(billingPeriod.start, "MMM dd, yyyy")}>
                      Cycle Starting {format(billingPeriod.start, "MMM dd, yyyy")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">
                    On-Demand Usage is {onDemandEnabled ? "On" : "Off"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Go beyond your plan's included quota with on-demand usage
                  </p>
                </div>
                <Button
                  variant={onDemandEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={async () => {
                    if (!onDemandEnabled) {
                      try {
                        await createOnDemandSubscription.mutateAsync({
                          returnUrl: `${window.location.origin}/workspace/billing?payment=success&onDemand=true`,
                        });
                      } catch (error) {
                        toast.error(
                          "Failed to enable on-demand usage",
                          error instanceof Error ? error.message : "Please try again",
                        );
                      }
                    } else {
                      // TODO: Implement disable on-demand
                      setOnDemandEnabled(false);
                      toast.success("On-demand usage disabled");
                    }
                  }}
                  disabled={createOnDemandSubscription.isPending}
                  className="gap-2"
                >
                  {createOnDemandSubscription.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : onDemandEnabled ? (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      Disable On-Demand
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      Enable On-Demand Usage
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="mb-4 text-right">
              <span className="text-2xl font-bold">US${onDemandUsage.total.toFixed(2)}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Executions</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onDemandUsage.executions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No on-demand usage this cycle
                    </TableCell>
                  </TableRow>
                ) : (
                  onDemandUsage.executions.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell className="text-right">{item.executions}</TableCell>
                      <TableCell className="text-right">US${item.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">US${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="font-semibold">
                  <TableCell colSpan={4}>Subtotal</TableCell>
                  <TableCell className="text-right">US${onDemandUsage.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invoices Section */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <Select defaultValue={format(new Date(), "MMMM yyyy")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={format(new Date(), "MMMM yyyy")}>
                    {format(new Date(), "MMMM yyyy")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{format(new Date(invoice.date), "dd MMM yyyy")}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === "Paid" ? "default" : "secondary"}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.amount.toFixed(2)} USD
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (invoice.invoiceUrl !== "#") {
                              window.open(invoice.invoiceUrl, "_blank");
                            } else {
                              customerPortal.mutate();
                            }
                          }}
                          className="gap-1"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}


      {/* Plan Change Confirmation Modal - With Refund Details */}
      {pendingPlanChange && (
        <Dialog open={showPlanChangeConfirm} onOpenChange={(open) => {
          setShowPlanChangeConfirm(open);
          if (!open) {
            setPendingPlanChange(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingPlanChange.comparison === "upgrade"
                  ? `Confirm Upgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId}`
                  : `Confirm Downgrade to ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.name || pendingPlanChange.planId}`}
              </DialogTitle>
              <DialogDescription className="pt-4">
                {pendingPlanChange.comparison === "upgrade" ? (
                  <div className="space-y-2">
                    <p>
                      You will be charged ${PLANS.find((p) => p.id === pendingPlanChange.planId)?.price || 0}/month, and receive a prorated refund for the remaining days in your current plan.
                    </p>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground">
                        Current plan ends: {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      Your plan will be downgraded immediately. You'll receive a prorated credit for the remaining time on your current plan, which will be applied to future billing cycles.
                    </p>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground">
                        Current plan ends: {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
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


      {/* Seat Management Modal */}
      {showSeatManage && seatInfo && currentOrg && subscription && (
        <AlertDialog open={showSeatManage} onOpenChange={setShowSeatManage}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Manage Seats</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Your plan includes {seatInfo.includedSeats} seats. You currently have {seatInfo.seatCount} billable seats
                    {seatInfo.extraSeats > 0 && ` (${seatInfo.extraSeats} extra)`}.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Desired Seat Count</label>
                    <input
                      type="number"
                      min={seatInfo.includedSeats}
                      value={desiredSeatCount}
                      onChange={(e) => setDesiredSeatCount(parseInt(e.target.value) || seatInfo.includedSeats)}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={manageSeats.isPending}
                    />
                    {desiredSeatCount > seatInfo.includedSeats && (
                      <p className="text-xs text-muted-foreground">
                        Extra seats: {desiredSeatCount - seatInfo.includedSeats} × ${PLANS.find((p) => p.id === subscription.planId)?.extraSeatPrice?.replace("/seat / month", "") || "0"}/month
                      </p>
                    )}
                    {desiredSeatCount < seatInfo.seatCount && (
                      <p className="text-xs text-yellow-600">
                        Warning: You have {seatInfo.seatCount} active billable seats. Reducing seats may require removing team members.
                      </p>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={manageSeats.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!currentOrg) return;
                  try {
                    const result = await manageSeats.mutateAsync({
                      organizationId: currentOrg.id,
                      seatCount: desiredSeatCount,
                    });
                    if (result.success) {
                      toast.success("Seats updated successfully!", result.message);
                      setShowSeatManage(false);
                    }
                  } catch (error) {
                    toast.error(
                      "Failed to update seats",
                      error instanceof Error ? error.message : "Please try again",
                    );
                  }
                }}
                disabled={manageSeats.isPending || desiredSeatCount === seatInfo.seatCount}
              >
                {manageSeats.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Update Seats"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
