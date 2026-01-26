"use client";

import { ArrowLeft, ArrowRight, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

// Only PostgreSQL, MySQL, and MongoDB are supported
const dataSourceTypes = [
  {
    id: "postgres",
    name: "PostgreSQL",
    icon: Database,
    description: "Connect to your PostgreSQL database",
    color: "text-blue-600",
  },
  {
    id: "mysql",
    name: "MySQL",
    icon: Database,
    description: "Connect to your MySQL database",
    color: "text-orange-600",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    icon: Database,
    description: "Connect to your MongoDB database",
    color: "text-green-600",
  },
];

export default function DataSourcePage() {
  const router = useRouter();
  const { setOnboardingStep, updateOnboarding, completeOnboarding } =
    useWorkspaceStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };

  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Please select a data source");
      return;
    }
    updateOnboarding({ connectorType: selectedType });
    setOnboardingStep("connect");
    router.push(`/onboarding/connect/${selectedType}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Connect Your Data Source</CardTitle>
                <CardDescription>
                  Step 2 of 3 - Choose where your data lives
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {dataSourceTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${type.color} flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/onboarding/organization")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button onClick={handleContinue} disabled={!selectedType}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
