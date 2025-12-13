"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader, ProgressSteps } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { CollectorConfig } from "./collector-step";
import { CollectorStep } from "./collector-step";
import { EmitterStep } from "./emitter-step";
import { TransformStep } from "./transform-step";

type PipelineStep = "collector" | "transform" | "emitter";

interface PipelineConfig {
  collectors: CollectorConfig[];
}

export default function NewPipelinePage() {
  const router = useRouter();
  const { addPipeline } = useWorkspaceStore();
  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [config, setConfig] = useState<PipelineConfig>({
    collectors: [],
  });

  const handleCollectorComplete = (collectors: CollectorConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      collectors,
    }));
    setCurrentStep("transform");
  };

  const handleTransformComplete = (collectors: CollectorConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      collectors,
    }));
    setCurrentStep("emitter");
  };

  const handleEmitterComplete = (collectors: CollectorConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      collectors,
    }));
    handleCreatePipeline();
  };

  const handleCreatePipeline = () => {
    // Get all unique source IDs and destination IDs
    const allSourceIds = [...new Set(config.collectors.map((c) => c.sourceId))];
    const allDestinationIds = [
      ...new Set(
        config.collectors.flatMap((c) =>
          (c.transformers || []).flatMap((t) =>
            ((t as any).emitters || []).map((e: any) => e.destinationId),
          ),
        ),
      ),
    ];

    const newPipeline = {
      id: `pipeline_${Date.now()}`,
      name: `Pipeline ${new Date().toLocaleDateString()}`,
      type: "stream" as const,
      sourceId: allSourceIds[0] || "",
      destinationIds: allDestinationIds,
      status: "paused" as const,
      createdAt: new Date().toISOString(),
      description: `Pipeline with ${config.collectors.length} collector(s)`,
      config: {
        collectors: config.collectors,
      },
    };
    addPipeline(newPipeline);
    router.push("/workspace/data-pipelines");
  };

  const steps: Array<{ id: PipelineStep; label: string; description: string }> =
    [
      {
        id: "collector",
        label: "Collector",
        description: "Configure data sources",
      },
      {
        id: "transform",
        label: "Transform",
        description: "Map fields to schema",
      },
      {
        id: "emitter",
        label: "Emitter",
        description: "Configure destinations",
      },
    ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <PageHeader
          title="Create New Pipeline"
          description="Build your data pipeline step by step"
          backButton={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/workspace/data-pipelines")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <ProgressSteps steps={steps} currentStepId={currentStep} />

      {/* Main Content - Single Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {currentStep === "collector" && (
            <CollectorStep
              onComplete={handleCollectorComplete}
              initialCollectors={config.collectors}
            />
          )}

          {currentStep === "transform" && (
            <TransformStep
              collectors={config.collectors}
              onComplete={handleTransformComplete}
            />
          )}

          {currentStep === "emitter" && (
            <EmitterStep
              collectors={config.collectors}
              onComplete={handleEmitterComplete}
            />
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-background px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default"
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(steps[currentStepIndex - 1].id);
              } else {
                router.push("/workspace/data-pipelines");
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {currentStepIndex > 0 ? "Previous" : "Cancel"}
            </span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
