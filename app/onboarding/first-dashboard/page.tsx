"use client";

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PromptInput } from "@/components/bi/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function FirstDashboardPage() {
  const router = useRouter();
  const { addDashboard, setOnboardingStep, currentOrganization } =
    useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    "Show me sales trends for the last 6 months",
    "Create a customer demographics breakdown",
    "Display revenue by product category",
    "Show monthly user growth",
  ];

  const handleGenerate = async (promptText: string) => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
      // Simulate AI dashboard generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const dashboard = {
        id: `dash_${Date.now()}`,
        name: "My First Dashboard",
        description: promptText,
        organizationId: currentOrganization?.id || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [],
      };

      addDashboard(dashboard);
      toast.success("Dashboard generated successfully!");
      setOnboardingStep("complete");
      router.push("/onboarding/complete");
    } catch (error) {
      toast.error("Failed to generate dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setOnboardingStep("complete");
    router.push("/onboarding/complete");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Create Your First Dashboard</CardTitle>
                <CardDescription>
                  Step 3 of 3 - Use AI to generate insights from your data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Describe what you'd like to see in your dashboard. Our AI will
                create visualizations based on your data.
              </p>
            </div>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              loading={loading}
              suggestions={suggestions}
              placeholder="e.g., Show me sales trends for the last 6 months with revenue breakdown by product category"
            />
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleSkip} disabled={loading}>
                Skip for now
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/onboarding/importing")}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => handleGenerate(prompt)}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
