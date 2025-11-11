"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Sparkles, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const { onboarding, setOnboardingStep } = useWorkspaceStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (onboarding.completed) {
      router.push("/workspace");
    }
  }, [user, loading, onboarding.completed, router]);

  const handleGetStarted = () => {
    setOnboardingStep("organization");
    router.push("/onboarding/organization");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Your Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up your workspace and team
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Connect Your Data Source</h3>
                  <p className="text-sm text-muted-foreground">
                    Link your database, spreadsheet, or API
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Your First Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Use AI to generate insights from your data
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleGetStarted} className="w-full" size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

