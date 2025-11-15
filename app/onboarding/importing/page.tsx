"use client";

import { CheckCircle2, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function ImportingPage() {
  const router = useRouter();
  const { setOnboardingStep, completeOnboarding } = useWorkspaceStore();

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Connecting to data source...");

  useEffect(() => {
    const steps = [
      { progress: 20, status: "Connecting to data source..." },
      { progress: 40, status: "Fetching schema..." },
      { progress: 60, status: "Importing data..." },
      { progress: 80, status: "Processing data..." },
      { progress: 100, status: "Complete!" },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setOnboardingStep("first-dashboard");
          router.push("/onboarding/first-dashboard");
        }, 1000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [router, setOnboardingStep]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Importing Your Data</CardTitle>
                <CardDescription>
                  Step 2 of 3 - This may take a few moments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{status}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            {progress === 100 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Data imported successfully!
                </span>
              </div>
            )}
            <div className="pt-4">
              <Button variant="ghost" onClick={handleSkip} className="w-full">
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
