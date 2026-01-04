"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CenteredCardLayout,
  LoadingState,
  StepIndicator,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useOnboardingStatus, useUpdateOnboardingStep } from "@/lib/api";

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const { setOnboardingStep, completeOnboarding } = useWorkspaceStore();
  const { data: onboardingStatus } = useOnboardingStatus();
  const updateOnboardingStep = useUpdateOnboardingStep();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    // Only redirect if onboarding is actually completed (avoid redirect loop)
    if (!loading && user && onboardingStatus?.completed) {
      router.push("/workspace");
    }
  }, [user, loading, onboardingStatus?.completed, router]);

  const handleGetStarted = async () => {
    await updateOnboardingStep.mutateAsync("organization");
    setOnboardingStep("organization");
    router.push("/onboarding/organization");
  };

  const handleSkip = async () => {
    await updateOnboardingStep.mutateAsync("complete");
    completeOnboarding();
    router.push("/workspace");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const steps = [
    {
      number: 1,
      title: "Create Your Organization",
      description: "Set up your workspace and team",
    },
    {
      number: 2,
      title: "Connect Your Data Source",
      description: "Link your database, spreadsheet, or API",
    },
    {
      number: 3,
      title: "Create Your First Dashboard",
      description: "Use AI to generate insights from your data",
    },
  ];

  return (
    <CenteredCardLayout>
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to MantrixFlow</CardTitle>
          <CardDescription className="text-lg">
            Let's get you set up in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator steps={steps} currentStep={1} />
          <div className="space-y-2">
            <Button onClick={handleGetStarted} className="w-full" size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleSkip} variant="ghost" className="w-full">
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </CenteredCardLayout>
  );
}
