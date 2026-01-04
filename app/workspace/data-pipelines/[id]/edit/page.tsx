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
  const { data: pipeline, isLoading, error } = usePipeline(pipelineId, orgId);
  const updatePipelineMutation = useUpdatePipeline();

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

          const collectorEmitters = emitters.filter((e) =>
            collectorEmitterIds.has(e.id),
          );

          if (collectorEmitters.length > 0) {
            collectorEmittersMap.set(c.id, collectorEmitters);
          }
        }
      });

      // Also check if there are emitters without collector association (fallback)
      // In this case, associate them with the first collector
      if (collectors.length > 0 && emitters.length > 0) {
        const allMappedEmitterIds = new Set(
          Array.from(collectorEmittersMap.values())
            .flat()
            .map((e) => e.id),
        );
        const unmappedEmitters = emitters.filter(
          (e) => !allMappedEmitterIds.has(e.id),
        );
        if (
          unmappedEmitters.length > 0 &&
          !collectorEmittersMap.has(collectors[0].id)
        ) {
          collectorEmittersMap.set(collectors[0].id, unmappedEmitters);
        }
      }

      const finalConfig = {
        collectors: collectors.map((c) => {
          const collectorEmitters = collectorEmittersMap.get(c.id) || [];

          return {
            id: c.id,
            sourceId: c.sourceId,
            selectedTables: c.selectedTables || [],
            emitters: collectorEmitters.map((e) => ({
              id: e.id,
              transformId: e.transformId || "",
              destinationId: e.destinationId,
              destinationName: e.destinationName,
              destinationType: e.destinationType,
              connectionConfig: e.connectionConfig || {},
            })),
            transformers: (c.transformers || []).map((t) => ({
              id: t.id,
              name: t.name,
              collectorId: t.collectorId || c.id,
              emitterId: t.emitterId || "",
              destinationTable:
                (t as { destinationTable?: string }).destinationTable || "",
              primaryKeyField:
                (t as { primaryKeyField?: string }).primaryKeyField || "",
              fieldMappings: Array.isArray(t.fieldMappings)
                ? t.fieldMappings.map((fm): FieldMapping => {
                    if (
                      typeof fm === "object" &&
                      fm !== null &&
                      "source" in fm &&
                      "destination" in fm
                    ) {
                      return {
                        source: String(fm.source),
                        destination: String(fm.destination),
                        isPrimaryKey:
                          "isPrimaryKey" in fm
                            ? Boolean(fm.isPrimaryKey)
                            : false,
                      };
                    }
                    if (typeof fm === "string") {
                      return {
                        source: fm,
                        destination: fm,
                        isPrimaryKey: false,
                      };
                    }
                    return {
                      source: String(
                        (fm as { source?: unknown })?.source || "",
                      ),
                      destination: String(
                        (fm as { destination?: unknown })?.destination || "",
                      ),
                      isPrimaryKey: false,
                    };
                  })
                : t.fieldMappings &&
                    typeof t.fieldMappings === "object" &&
                    !Array.isArray(t.fieldMappings)
                  ? Object.entries(t.fieldMappings).map(
                      ([source, destination]): FieldMapping => ({
                        source: String(source),
                        destination: String(destination),
                        isPrimaryKey: false,
                      }),
                    )
                  : [],
            })),
          };
        }) as CollectorConfig[],
      };

      console.log("Config set for edit:", {
        collectorsCount: finalConfig.collectors.length,
        configCollectors: finalConfig.collectors.map((c) => ({
          id: c.id,
          sourceId: c.sourceId,
          selectedTables: c.selectedTables,
          emittersCount: c.emitters?.length || 0,
          emitters:
            c.emitters?.map((e) => ({
              id: e.id,
              destinationId: e.destinationId,
              destinationName: e.destinationName,
            })) || [],
          transformersCount: c.transformers?.length || 0,
          transformers:
            c.transformers?.map((t) => ({
              id: t.id,
              name: t.name,
              emitterId: t.emitterId,
              fieldMappingsCount: t.fieldMappings?.length || 0,
            })) || [],
        })),
      });

      setConfig(finalConfig);
    }
  }, [pipeline]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pipeline not found</h2>
          <p className="text-muted-foreground mb-4">
            {error
              ? "Failed to load pipeline"
              : "The pipeline you're looking for doesn't exist."}
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
    setCurrentStep("emitter");
  };

  const handleEmitterComplete = (collectors: CollectorConfig[]) => {
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
    handleSavePipeline();
  };

  const handleSavePipeline = async () => {
    if (!pipeline) return;

    try {
      // Extract emitters from collectors
      const allEmitters = config.collectors.flatMap((c) =>
        (c.emitters || []).map((e) => ({
          ...e,
          collectorId: c.id,
        })),
      );

      const _allDestinationIds = [
        ...new Set(allEmitters.map((e) => e.destinationId)),
      ];

      // Get transformers with emitters
      const transformersWithEmitters = config.collectors.flatMap((c) =>
        (c.transformers || []).map((t) => ({
          ...t,
          collectorId: t.collectorId || c.id,
          emitterId: t.emitterId || "",
        })),
      );

      // Map emitters to the format expected by the API
      const emitters = allEmitters.map((e) => {
        const transformer = transformersWithEmitters.find(
          (t) => t.emitterId === e.id,
        );
        return {
          id: e.id,
          transformId: transformer?.id || "",
          destinationId: e.destinationId,
          destinationName: e.destinationName,
          destinationType: e.destinationType,
        };
      });

      await updatePipelineMutation.mutateAsync({
        id: pipeline.id,
        data: {
          collectors: config.collectors.map((c) => ({
            id: c.id,
            sourceId: c.sourceId,
            selectedTables: c.selectedTables,
            transformers: c.transformers?.map((t) => ({
              id: t.id,
              name: t.name,
              collectorId: t.collectorId || c.id,
              emitterId: t.emitterId || "",
              fieldMappings: t.fieldMappings || [],
            })),
          })),
          emitters: emitters,
        },
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

    const migrationState = pipeline.migrationState || "pending";

    switch (migrationState) {
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 animate-pulse">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              Running
            </div>
          </Badge>
        );
      case "listing":
        return (
          <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:text-purple-400" />
              Listing
            </div>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:text-green-400" />
              Completed
            </div>
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:text-red-400" />
              Error
            </div>
          </Badge>
        );
      case "pending":
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
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:text-amber-400" />
              Pending
            </div>
          </Badge>
        );
      default:
        return null;
    }
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
