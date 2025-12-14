"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
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
      <div className=" bg-background px-6 py-4">
        <PageHeader
          title="Create New Pipeline"
          description="Build your data pipeline step by step"
          showBackIcon={true}
          onBack={() => router.push("/workspace/data-pipelines")}
          progressSteps={steps}
          currentStepId={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId as PipelineStep)}
        />
      </div>

      {/* Main Content - Single Scroll Area */}
      <div className="flex-1 overflow-y-auto ">
        <div className="mx-auto max-w-7xl px-6 py-6">
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
    </div>
  );
}
