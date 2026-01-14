"use client";

import { ArrowRight, Building2, Sparkles } from "lucide-react";
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
import {
  useCurrentOrganization,
  useOnboardingStatus,
  useUpdateOnboardingStep,
} from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const { setOnboardingStep, completeOnboarding } = useWorkspaceStore();
  const { data: onboardingStatus } = useOnboardingStatus();
  const { data: currentOrganization } = useCurrentOrganization();
  const updateOnboardingStep = useUpdateOnboardingStep();

  // Check if user is invited (has currentOrgId)
  const isInvitedUser =
    !!onboardingStatus?.currentOrgId || !!currentOrganization;

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
    // Check if user already has an organization - if so, skip plan selection
    if (currentOrganization || onboardingStatus?.currentOrgId) {
      // User already has organization, go directly to organization creation
      await updateOnboardingStep.mutateAsync("organization");
      setOnboardingStep("organization");
      router.push("/onboarding/organization");
    } else {
      // New user - show plan selection (optional)
      await updateOnboardingStep.mutateAsync("plans");
      setOnboardingStep("plans");
      router.push("/onboarding/plans");
    }
  };

  const handleSkip = async () => {
    await updateOnboardingStep.mutateAsync("complete");
    completeOnboarding();
    router.push("/workspace");
  };

  const handleContinueToDashboard = async () => {
    // Mark onboarding as completed for invited users
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

  // Show different welcome page for invited users
  if (isInvitedUser && currentOrganization) {
    return (
      <CenteredCardLayout>
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">
              Welcome to {currentOrganization.name}
            </CardTitle>
            <CardDescription className="text-lg">
              You've been invited to join this organization. Let's get you
              started!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                You're now part of <strong>{currentOrganization.name}</strong>.
                You can start exploring dashboards, connecting data sources, and
                collaborating with your team.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleContinueToDashboard}
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </CenteredCardLayout>
    );
  }

  // Regular welcome page for new users (creating their own organization)
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
