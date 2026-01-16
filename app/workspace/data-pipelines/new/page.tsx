"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { useCreatePipeline } from "@/lib/api/hooks/use-data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import type { CollectorConfig } from "./collector-step";
import { CollectorStep } from "./collector-step";
import { EmitterStep } from "./emitter-step";
import { TransformStep } from "./transform-step";

type PipelineStep = "collector" | "transform" | "emitter";

interface PipelineConfig {
  collectors: CollectorConfig[];
}

type Transformer = CollectorConfig["transformers"][number];

export default function NewPipelinePage() {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const createPipelineMutation = useCreatePipeline(organizationId);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [config, setConfig] = useState<PipelineConfig>({
    collectors: [],
  });

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
    // Pass the updated collectors directly to avoid stale state issue
    handleCreatePipeline(collectors);
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePipeline = async (
    collectorsOverride?: CollectorConfig[],
  ) => {
    // Use the provided collectors if available, otherwise fall back to state
    // This fixes the issue where newly created transformers aren't detected on first save
    const collectorsToUse = collectorsOverride || config.collectors;

    // Validate that at least one transformer with field mappings exists
    // Check all collectors and their transformers, ensuring fieldMappings is properly structured
    const hasValidTransformers = collectorsToUse.some((collector) => {
      if (!collector.transformers || collector.transformers.length === 0) {
        return false;
      }

      return collector.transformers.some((t) => {
        // Check if fieldMappings exists and is a non-empty array
        const fieldMappings = t.fieldMappings;
        if (!fieldMappings) {
          return false;
        }

        // Handle both array format and object format
        if (Array.isArray(fieldMappings)) {
          return (
            fieldMappings.length > 0 &&
            fieldMappings.some((fm) => {
              // Ensure each mapping has required fields
              return (
                fm &&
                typeof fm === "object" &&
                ("source" in fm || "destination" in fm)
              );
            })
          );
        }

        // If it's an object, check if it has any entries
        if (typeof fieldMappings === "object") {
          return Object.keys(fieldMappings).length > 0;
        }

        return false;
      });
    });

    if (!hasValidTransformers) {
      toast.error(
        "Missing field mappings",
        "Please configure at least one transformer with field mappings before creating the pipeline.",
      );
      return;
    }

    // Prevent double submission
    if (isCreating) {
      return;
    }

    if (!organizationId) {
      toast.error(
        "No organization selected",
        "Please select an organization from the sidebar.",
      );
      return;
    }

    if (collectorsToUse.length === 0) {
      toast.error("No collectors", "Please add at least one collector.");
      return;
    }

    setIsCreating(true);

    // Get all unique source IDs and destination IDs
    const _allSourceIds = [...new Set(collectorsToUse.map((c) => c.sourceId))];

    // Extract emitters from collectors (emitters are now stored at collector level, not transformer level)
    const allEmitters = collectorsToUse.flatMap((c) =>
      (c.emitters || []).map((e) => ({
        ...e,
        collectorId: c.id,
      })),
    );

    const allDestinationIds = [
      ...new Set(allEmitters.map((e) => e.destinationId)),
    ];

    // Validate that we have emitters
    if (allEmitters.length === 0) {
      toast.error(
        "No emitters configured",
        "Please add at least one emitter before creating the pipeline.",
      );
      return;
    }

    // Validate that all emitters have destination IDs
    const emittersWithoutDestination = allEmitters.filter(
      (e) => !e.destinationId,
    );
    if (emittersWithoutDestination.length > 0) {
      toast.error(
        "Invalid emitter configuration",
        "Some emitters are missing destination connections. Please check your emitter configuration.",
      );
      return;
    }

    // Validate that we have destination IDs
    if (allDestinationIds.length === 0) {
      toast.error(
        "No destination connections",
        "Please ensure emitters have valid destination connections.",
      );
      return;
    }

    // Map transformers to emitters - set transformId on emitters
    const transformersWithEmitters = collectorsToUse.flatMap((c) =>
      (c.transformers || []).map((t) => ({
        ...t,
        collectorId: t.collectorId || c.id,
        emitterId: t.emitterId || "",
      })),
    );

    // Map emitters to the format expected by the API
    // Set transformId for emitters that are referenced by transformers
    const emitters = allEmitters.map((e) => {
      // Find transformer that references this emitter
      const transformer = transformersWithEmitters.find(
        (t) => t.emitterId === e.id,
      );
      return {
        id: e.id,
        transformId: transformer?.id || "", // Set transformId if transformer references this emitter
        destinationId: e.destinationId,
        destinationName: e.destinationName,
        destinationType: e.destinationType,
        connectionConfig: e.connectionConfig || {}, // Include connectionConfig (required by API)
      };
    });

    try {
      // Use the first collector's source as the primary source
      const firstCollector = collectorsToUse[0];
      const primarySourceId = firstCollector.sourceId;

      // Get destination connection ID from emitters
      const destinationConnectionId = allDestinationIds[0];

      // Extract destination table from transformers (use first transformer's destinationTable if available)
      // Format: "schema.table" or just "table" (defaults to "public")
      let destinationTable = `pipeline_${Date.now()}`;
      let destinationSchema = "public";

      const firstTransformer = collectorsToUse
        .flatMap((c) => c.transformers || [])
        .find(
          (t): t is Transformer & { destinationTable: string } =>
            !!(t as { destinationTable?: string }).destinationTable,
        );

      if (firstTransformer?.destinationTable) {
        const tableParts = firstTransformer.destinationTable.includes(".")
          ? firstTransformer.destinationTable.split(".")
          : ["public", firstTransformer.destinationTable];
        destinationSchema = tableParts[0] || "public";
        destinationTable =
          tableParts[1] || tableParts[0] || `pipeline_${Date.now()}`;
      }

      // TODO: The new API requires creating source and destination schemas first
      // This page needs to be refactored to:
      // 1. Create source schema(s) using SourceSchemasService
      // 2. Create destination schema(s) using DestinationSchemasService
      // 3. Then create pipeline with sourceSchemaId and destinationSchemaId
      //
      // For now, this is a placeholder that shows the structure needed
      // The actual implementation should create schemas first, then the pipeline

      // Example structure (needs actual implementation):
      // const sourceSchema = await SourceSchemasService.createSourceSchema(organizationId, {
      //   sourceType: "postgres",
      //   dataSourceId: primarySourceId,
      //   sourceTable: firstCollector.selectedTables[0],
      // });
      //
      // const destinationSchema = await DestinationSchemasService.createDestinationSchema(organizationId, {
      //   dataSourceId: destinationConnectionId,
      //   destinationTable: destinationTable,
      //   destinationSchema: destinationSchema,
      // });

      // Then create pipeline:
      await createPipelineMutation.mutateAsync({
        name: `Pipeline ${new Date().toLocaleDateString()}`,
        description: `Pipeline with ${collectorsToUse.length} collector(s)`,
        // TODO: These need to be actual schema IDs from the steps above
        sourceSchemaId: "TEMP_SOURCE_SCHEMA_ID", // Replace with actual source schema ID
        destinationSchemaId: "TEMP_DEST_SCHEMA_ID", // Replace with actual destination schema ID
        syncMode: "full",
        syncFrequency: "manual",
        // Transformations can be extracted from the collectors/transformers structure
        transformations: [],
      });

      toast.success(
        "Pipeline created",
        "Your pipeline has been created successfully.",
      );
      router.push("/workspace/data-pipelines");
    } catch (error) {
      toast.error(
        "Failed to create pipeline",
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const steps: Array<{ id: PipelineStep; label: string; description: string }> =
    [
      {
        id: "collector",
        label: "Collector",
        description: "Configure data sources",
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="space-y-6">
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
        <div className="mx-auto max-w-7xl ">
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
