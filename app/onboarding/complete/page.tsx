"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();
  const {
    completeOnboarding,
    currentOrganization,
    currentDataSource,
    dashboards,
  } = useWorkspaceStore();

  useEffect(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleGoToWorkspace = () => {
    router.push("/workspace");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">You're All Set!</CardTitle>
            <CardDescription className="text-lg">
              Your MantrixFlow workspace is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Organization Created</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentOrganization?.name || "Your organization"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Data Source Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentDataSource?.name || "Your data source"}
                  </p>
                </div>
              </div>
              {dashboards.length > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Dashboard Created</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboards[0]?.name || "Your first dashboard"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleGoToWorkspace} className="w-full" size="lg">
              Go to Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
