"use client";

import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { getAuthToken } from "@/lib/api/config";
import { OnboardingService } from "@/lib/api/services/onboarding.service";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function OrganizationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { completeOnboarding } = useWorkspaceStore();
  const [orgName, setOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Redirect to workspace
        router.push("/workspace");
      } else {
        setError("Failed to create organization. Please try again.");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create organization. Please try again.",
      );
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  return (
    <CenteredCardLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Create Your Organization</CardTitle>
          <CardDescription className="text-lg">
            Give your workspace a name to get started
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
