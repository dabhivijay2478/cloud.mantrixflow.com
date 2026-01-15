"use client";

import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CenteredCardLayout, LoadingState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateCheckout } from "@/lib/api/hooks/use-billing";
import type { SubscriptionPlan } from "@/lib/api/types/billing";
import { useAuthStore } from "@/lib/stores/auth-store";

const PLANS: Array<{
  id: SubscriptionPlan;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  description?: string;
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
    popular: true,
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
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createCheckout = useCreateCheckout();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const handleSelectPlan = async (planId: SubscriptionPlan) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setSelectedPlan(planId);

    try {
      // Free plan doesn't need checkout - skip to organization creation
      if (planId === "free") {
        router.push("/onboarding/organization");
        return;
      }

      // Create checkout session - the hook will redirect to checkout URL
      const response = await createCheckout.mutateAsync({
        planId,
        returnUrl: `${window.location.origin}/billing/success`,
      });

      console.log(
        "Checkout session created - full response:",
        JSON.stringify(response, null, 2),
      );

      // Double-check we have checkoutUrl before redirecting
      if (response?.checkoutUrl) {
        console.log("Redirecting to checkout URL:", response.checkoutUrl);
        // Use replace instead of href to avoid back button issues
        window.location.replace(response.checkoutUrl);
      } else {
        console.error("No checkoutUrl in response:", response);
        setSelectedPlan(null);
        alert("Failed to get checkout URL. Please check console for details.");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      setSelectedPlan(null);
      // Show error to user
      alert(
        `Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  const handleSkipPlanSelection = () => {
    // Skip plan selection and go directly to organization creation
    router.push("/onboarding/organization");
  };

  return (
    <CenteredCardLayout>
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select a plan that fits your needs. You can change or cancel
            anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            Plan selection is optional - you can also set up billing later from
            your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isProcessing = createCheckout.isPending && isSelected;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg" : ""
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription className="text-sm mb-2">
                      {plan.description}
                    </CardDescription>
                  )}
                  <CardDescription>
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : plan.id === "enterprise" ? (
                      <>
                        <span className="text-3xl font-bold">Custom</span>
                        <span className="text-muted-foreground text-sm block">
                          Starts at ${plan.price}/month
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isProcessing}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleSkipPlanSelection}
            className="text-muted-foreground"
          >
            Skip for now - I'll set up billing later
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </CenteredCardLayout>
  );
}
