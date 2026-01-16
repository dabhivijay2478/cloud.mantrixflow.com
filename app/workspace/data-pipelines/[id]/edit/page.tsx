"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  usePipeline,
  useUpdatePipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import type { CollectorConfig } from "../../new/collector-step";
import { CollectorStep } from "../../new/collector-step";
import { EmitterStep } from "../../new/emitter-step";
import { TransformStep } from "../../new/transform-step";

type PipelineStep = "collector" | "emitter" | "transform";

interface PipelineConfig {
  collectors: CollectorConfig[];
}

type Emitter = NonNullable<CollectorConfig["emitters"]>[number];

type Transformer = CollectorConfig["transformers"][number];

type FieldMapping = {
  source: string;
  destination: string;
  isPrimaryKey?: boolean;
};

interface TransformationsData {
  collectors?: Array<{
    id: string;
    sourceId: string;
    selectedTables?: string[];
    emitters?: Emitter[];
    transformers?: Transformer[];
  }>;
  emitters?: Emitter[];
}

export default function EditPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;
  const pipelineId = params.id as string;
  const { data: pipeline, isLoading, error } = usePipeline(orgId, pipelineId);
  const updatePipelineMutation = useUpdatePipeline(orgId, pipelineId);

  if (!orgId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground">No organization selected</p>
        <Button
          variant="outline"
          onClick={() => router.push("/workspace/data-pipelines")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipelines
        </Button>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [config, setConfig] = useState<PipelineConfig>({
    collectors: [],
  });

  // Load pipeline configuration from API response
  useEffect(() => {
    if (pipeline) {
      // Parse collectors from transformations JSONB field
      const transformations =
        pipeline.transformations as unknown as TransformationsData;
      const collectors = transformations?.collectors || [];
      const emitters = transformations?.emitters || [];

      console.log("Pipeline data loaded for edit:", {
        transformations,
        collectors,
        emitters,
        pipeline,
        collectorsCount: collectors.length,
        emittersCount: emitters.length,
        collectorsWithEmitters: collectors.map((c) => ({
          id: c.id,
          hasEmitters: !!(c.emitters && c.emitters.length > 0),
          emittersCount: c.emitters?.length || 0,
          transformersCount: (c.transformers || []).length,
          transformers: (c.transformers || []).map((t) => ({
            id: t.id,
            name: t.name,
            emitterId: t.emitterId,
            fieldMappingsCount: t.fieldMappings?.length || 0,
            fieldMappings: t.fieldMappings,
          })),
        })),
      });

      // Map emitters to collectors
      // Strategy 1: If emitters are stored directly on collectors (from new pipeline flow)
      // Strategy 2: If emitters are in separate array, map via transformers
      const collectorEmittersMap = new Map<string, Emitter[]>();

      collectors.forEach((c) => {
        // First, check if emitters are already on the collector (from new pipeline creation)
        if (c.emitters && Array.isArray(c.emitters) && c.emitters.length > 0) {
          collectorEmittersMap.set(c.id, c.emitters);
        } else {
          // Otherwise, map emitters via transformer relationships
          const collectorEmitterIds = new Set<string>();
          (c.transformers || []).forEach((t) => {
            if (t.emitterId) {
              collectorEmitterIds.add(t.emitterId);
            }
          });

          // Find emitters that belong to this collector
          const collectorEmitters = emitters.filter((e) =>
            collectorEmitterIds.has(e.id),
          );
          if (collectorEmitters.length > 0) {
            collectorEmittersMap.set(c.id, collectorEmitters);
          }
        }
      });

      // Build the config with emitters attached to collectors
      const configWithEmitters: CollectorConfig[] = collectors.map((c) => ({
        id: c.id,
        sourceId: c.sourceId,
        selectedTables: c.selectedTables || [],
        emitters: collectorEmittersMap.get(c.id) || [],
        transformers: (c.transformers || []).map((t) => ({
          id: t.id,
          name: t.name,
          collectorId: t.collectorId || c.id,
          emitterId: t.emitterId || "",
          fieldMappings: Array.isArray(t.fieldMappings)
            ? t.fieldMappings
            : typeof t.fieldMappings === "object" && t.fieldMappings !== null
              ? Object.entries(t.fieldMappings).map(([source, destination]) => ({
                  source,
                  destination: String(destination),
                }))
              : [],
        })),
      }));

      setConfig({ collectors: configWithEmitters });
    }
  }, [pipeline]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-destructive">Failed to load pipeline</p>
        <Button
          variant="outline"
          onClick={() => router.push("/workspace/data-pipelines")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipelines
        </Button>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground">Pipeline not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/workspace/data-pipelines")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipelines
        </Button>
      </div>
    );
  }

  const handleCollectorComplete = (collectors: CollectorConfig[]) => {
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
    setCurrentStep("transform");
  };

  const handleTransformComplete = async (collectors: CollectorConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      collectors,
    }));

    try {
      // TODO: The new API requires updating schemas separately
      // This edit page needs to be refactored to work with the new schema-based approach
      // For now, we'll just update basic fields
      await updatePipelineMutation.mutateAsync({
        name: pipeline.name,
        description: pipeline.description || undefined,
        // Note: The new API structure uses sourceSchemaId and destinationSchemaId
        // This edit page needs to be refactored to work with the new schema-based approach
        // For now, we'll just update basic fields
      });

      toast.success(
        "Pipeline updated",
        "Your pipeline has been updated successfully.",
      );
      router.push("/workspace/data-pipelines");
    } catch (error) {
      console.error("Failed to update pipeline:", error);
      toast.error(
        "Failed to update pipeline",
        error instanceof Error ? error.message : "Unknown error occurred",
      );
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
        id: "emitter",
        label: "Emitter",
        description: "Configure destinations",
      },
      {
        id: "transform",
        label: "Transform",
        description: "Map fields to schema",
      },
    ];

  const _currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const getMigrationStateBadge = () => {
    if (!pipeline) return null;

    // Migration state is no longer part of the new schema
    // Use status and lastRunStatus instead
    if (pipeline.status === "paused") {
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-amber-300 dark:border-amber-700"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Paused
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "error") {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
            Error
          </div>
        </Badge>
      );
    }

    if (pipeline.lastRunStatus === "success") {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
            Active
          </div>
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:text-amber-400" />
          {pipeline.status === "active" ? "Active" : "Pending"}
        </div>
      </Badge>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <span>{`Edit Pipeline: ${pipeline?.name || ""}`}</span>
              {getMigrationStateBadge()}
            </div>
          }
          description="Update your data pipeline configuration"
          showBackIcon={true}
          onBack={() => router.push("/workspace/data-pipelines")}
          progressSteps={steps}
          currentStepId={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId as PipelineStep)}
        />
      </div>

      {/* Main Content - Single Scroll Area */}
      <div className="flex-1 overflow-y-auto ">
        <div className="mx-auto max-w-7xl">
          {currentStep === "collector" && (
            <CollectorStep
              onComplete={handleCollectorComplete}
              initialCollectors={config.collectors}
            />
          )}

          {currentStep === "emitter" && (
            <EmitterStep
              collectors={config.collectors}
              onComplete={handleEmitterComplete}
            />
          )}

          {currentStep === "transform" && (
            <TransformStep
              collectors={config.collectors}
              onComplete={handleTransformComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
