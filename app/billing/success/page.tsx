"use client";

export const dynamic = "force-dynamic";

import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CenteredCardLayout, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentOrganization, useOnboardingStatus } from "@/lib/api";
import { getAuthToken } from "@/lib/api/config";
import { OnboardingService } from "@/lib/api/services/onboarding.service";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function BillingSuccessPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { completeOnboarding } = useWorkspaceStore();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: onboardingStatus } = useOnboardingStatus();
  const [orgName, setOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "checking" | "form" | "creating" | "success" | "error"
  >("checking");

  // Check if user already has an organization
  useEffect(() => {
    const checkExistingOrg = async () => {
      // Wait for auth to load (give it time)
      if (!user) {
        // Wait up to 3 seconds for auth to load
        const authTimer = setTimeout(() => {
          if (!user) {
            router.push("/auth/login");
          }
        }, 3000);
        return () => clearTimeout(authTimer);
      }

      // If user already has an organization, redirect to workspace/billing
      // This handles the case when user checks out from billing page
      if (currentOrg || onboardingStatus?.currentOrgId) {
        completeOnboarding();
        // Redirect to billing page to show updated subscription
        router.push("/workspace/billing");
        return;
      }

      // Check if this is from billing page (not onboarding)
      // Users accessing billing page should already have an organization
      // If they don't, redirect them to workspace (not show org creation form)
      const urlParams = new URLSearchParams(window.location.search);
      const fromBilling =
        document.referrer.includes("/workspace/billing") ||
        document.referrer.includes("/billing") ||
        urlParams.get("from") === "billing";

      if (fromBilling) {
        // User came from billing page - they should already have org
        // If they don't have one, redirect to workspace (don't show org creation)
        // The org creation form is only for onboarding flow
        router.push("/workspace");
        return;
      }

      // Only show org creation form if coming from onboarding flow
      // If org_name is provided in URL, use it as default
      const urlOrgName = urlParams.get("org_name");
      if (urlOrgName) {
        setOrgName(urlOrgName);
      }

      setStatus("form");
    };

    // Small delay to ensure auth and org data are loaded
    const timer = setTimeout(() => {
      checkExistingOrg();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    user,
    router,
    currentOrg,
    onboardingStatus,
    completeOnboarding,
  ]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    setIsCreating(true);
    setStatus("creating");
    setError(null);

    try {
      const token = await getAuthToken();
      const response = await OnboardingService.createOrg(
        { name: orgName.trim() },
        { token },
      );

      if (response.success) {
        // Mark onboarding as complete
        completeOnboarding();
        setStatus("success");

        // Redirect to workspace after 2 seconds
        setTimeout(() => {
          router.push("/workspace");
        }, 2000);
      } else {
        setError("Failed to create organization. Please try again.");
        setStatus("form");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create organization:", error);

      // Handle specific error messages
      let errorMessage = "Failed to create organization. Please try again.";
      if (error instanceof Error) {
        if (
          error.message.includes("duplicate") ||
          error.message.includes("already exists")
        ) {
          errorMessage =
            "An organization with this name already exists. Please choose a different name.";
        } else if (error.message.includes("slug")) {
          errorMessage =
            "This organization name is already taken. Please choose a different name.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setStatus("form");
      setIsCreating(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Setting up your workspace..." />
      </div>
    );
  }

  // Only redirect to login if user is definitely not authenticated after waiting
  if (!user) {
    // Give auth more time to load before redirecting
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (status === "creating") {
    return (
      <CenteredCardLayout>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <CardTitle>Setting up your workspace...</CardTitle>
            <CardDescription>
              Please wait while we create your organization
            </CardDescription>
          </CardHeader>
        </Card>
      </CenteredCardLayout>
    );
  }

  if (status === "form") {
    return (
      <CenteredCardLayout>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Now let's create your organization to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="My Organization"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setError(null);
                  }}
                  disabled={isCreating}
                  required
                  minLength={1}
                  maxLength={255}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isCreating || !orgName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Organization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </CenteredCardLayout>
    );
  }

  if (status === "error") {
    return (
      <CenteredCardLayout>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {error ||
                "Failed to set up your workspace. Please contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                setStatus("form");
                setError(null);
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/workspace")}
              variant="outline"
              className="w-full"
            >
              Go to Workspace
            </Button>
          </CardContent>
        </Card>
      </CenteredCardLayout>
    );
  }

  return (
    <CenteredCardLayout>
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Welcome to {orgName}!</CardTitle>
          <CardDescription className="text-lg">
            Your subscription is active and your workspace is ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Redirecting you to your workspace...
          </p>
        </CardContent>
      </Card>
    </CenteredCardLayout>
  );
}
