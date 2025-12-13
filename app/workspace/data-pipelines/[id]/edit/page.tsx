"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { CollectorConfig } from "../../new/collector-step";
import { CollectorStep } from "../../new/collector-step";
import { EmitterStep } from "../../new/emitter-step";
import { TransformStep } from "../../new/transform-step";

type PipelineStep = "collector" | "transform" | "emitter";

interface PipelineConfig {
  collectors: CollectorConfig[];
}

export default function EditPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const { pipelines, updatePipeline } = useWorkspaceStore();
  const pipelineId = params.id as string;

  const pipeline = pipelines.find((p) => p.id === pipelineId);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [config, setConfig] = useState<PipelineConfig>({
    collectors: [],
  });

  // Load pipeline configuration
  useEffect(() => {
    if (pipeline) {
      setConfig({
        collectors: (pipeline.config?.collectors as CollectorConfig[]) || [],
      });
    }
  }, [pipeline]);

  if (!pipeline) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pipeline not found</h2>
          <p className="text-muted-foreground mb-4">
            The pipeline you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/workspace/data-pipelines")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pipelines
          </Button>
        </div>
      </div>
    );
  }

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
    handleSavePipeline();
  };

  const handleSavePipeline = () => {
    if (pipeline) {
      const allDestinationIds = [
        ...new Set(
          config.collectors.flatMap((c) =>
            c.transformers.flatMap((t) =>
              ((t as any).emitters || []).map((e: any) => e.destinationId),
            ),
          ),
        ),
      ];
      const allSourceIds = [
        ...new Set(config.collectors.map((c) => c.sourceId)),
      ];

      updatePipeline(pipeline.id, {
        sourceId: allSourceIds[0] || "",
        destinationIds: allDestinationIds,
        config: {
          collectors: config.collectors,
        },
      });
      router.push("/workspace/data-pipelines");
    }
  };

  const steps: Array<{ id: PipelineStep; label: string; description: string }> =
    [
      {
        id: "collector",
        label: "Collector",
        description: "Select data source and tables",
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
          title={`Edit Pipeline: ${pipeline.name}`}
          description="Update your data pipeline configuration"
          showBackIcon={true}
          onBack={() => router.push("/workspace/data-pipelines")}
          progressSteps={steps}
          currentStepId={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId as PipelineStep)}
        />
      </div>

      {/* Main Content - Single Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
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
