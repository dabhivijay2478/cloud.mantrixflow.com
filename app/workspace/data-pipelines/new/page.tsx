"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { useCreatePipeline } from "@/lib/api/hooks/use-data-pipelines";
import { useCreateDestinationSchema } from "@/lib/api/hooks/use-destination-schemas";
import { useCreateSourceSchema } from "@/lib/api/hooks/use-source-schemas";
import { useConnections } from "@/lib/api/hooks/use-data-sources";
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
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
  const createSourceSchemaMutation = useCreateSourceSchema(organizationId);
  const createDestinationSchemaMutation =
    useCreateDestinationSchema(organizationId);
  const { data: connections } = useConnections(organizationId);
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

    // Note: emitters mapping is no longer needed for schema-based API
    // The destination schema is created directly from transformer field mappings

    try {
      // Step 1: Create source schema from collector data
      const firstCollector = collectorsToUse[0];
      const primarySourceId = firstCollector.sourceId;
      const firstTable = firstCollector.selectedTables[0];

      if (!firstTable) {
        toast.error(
          "No table selected",
          "Please select at least one table in the collector step.",
        );
        setIsCreating(false);
        return;
      }

      // Get data source to determine source type
      let sourceType = "postgres"; // Default fallback
      try {
        const dataSource = await DataSourcesService.getDataSource(
          organizationId!,
          primarySourceId,
        );
        // Handle both camelCase and snake_case from API
        sourceType = dataSource.sourceType || (dataSource as any).source_type || "postgres";
      } catch (error) {
        console.error("Failed to fetch data source, using default type:", error);
        // Try to get from connections cache if available
        const cachedConnection = connections?.find((c) => c.id === primarySourceId);
        if (cachedConnection?.type) {
          sourceType = cachedConnection.type;
        } else {
          // Last resort: show error to user
          toast.error(
            "Failed to determine source type",
            "Could not fetch data source information. Please try again.",
          );
          setIsCreating(false);
          return;
        }
      }

      // Parse table name based on source type
      // For MongoDB: format is "database.collection" or just "collection"
      // For SQL: format is "schema.table" or just "table"
      const isMongoDB = sourceType === "mongodb";
      let sourceSchemaName: string | undefined;
      let sourceTableName: string;

      if (firstTable.includes(".")) {
        const parts = firstTable.split(".");
        if (isMongoDB) {
          // MongoDB: "database.collection"
          sourceSchemaName = parts[0]; // database name
          sourceTableName = parts[1]; // collection name
        } else {
          // SQL: "schema.table"
          sourceSchemaName = parts[0] || "public";
          sourceTableName = parts[1] || parts[0] || firstTable;
        }
      } else {
        // No prefix - handle based on source type
        if (isMongoDB) {
          // MongoDB: just collection name, no database specified
          sourceSchemaName = undefined; // Will search all databases
          sourceTableName = firstTable;
        } else {
          // SQL: just table name, default to public schema
          sourceSchemaName = "public";
          sourceTableName = firstTable;
        }
      }

      // Create source schema
      const sourceSchema = await createSourceSchemaMutation.mutateAsync({
        sourceType: sourceType as any, // Use actual data source type
        dataSourceId: primarySourceId,
        sourceSchema: sourceSchemaName,
        sourceTable: sourceTableName,
        name: `Source: ${sourceTableName}`,
      });

      // Step 2: Create destination schema from emitter/transformer data
      // Get destination connection ID from emitters
      const destinationConnectionId = allDestinationIds[0];

      // Extract destination information from transformers
      const firstTransformer = collectorsToUse
        .flatMap((c) => c.transformers || [])
        .find((t) => t.fieldMappings && t.fieldMappings.length > 0);

      if (
        !firstTransformer?.fieldMappings ||
        firstTransformer.fieldMappings.length === 0
      ) {
        toast.error(
          "No field mappings",
          "Please configure field mappings in the transform step.",
        );
        setIsCreating(false);
        return;
      }

      // Extract destination table from transformer (may be stored in destinationTable field)
      // Format: "schema.table" or just "table" (defaults to "public")
      let destinationTable = `pipeline_${Date.now()}`;
      const transformerWithTable = firstTransformer as Transformer & {
        destinationTable?: string;
      };
      if (transformerWithTable.destinationTable) {
        destinationTable = transformerWithTable.destinationTable;
      }

      // Parse destination table (format: "schema.table" or just "table")
      const destTableParts = destinationTable.includes(".")
        ? destinationTable.split(".")
        : ["public", destinationTable];
      const destSchemaName = destTableParts[0] || "public";
      const destTableName =
        destTableParts[1] || destTableParts[0] || destinationTable;

      // Convert field mappings to column mappings format
      // Field mappings may have isPrimaryKey flag
      const columnMappings = firstTransformer.fieldMappings.map((fm) => {
        const mapping = fm as {
          source: string;
          destination: string;
          isPrimaryKey?: boolean;
        };
        return {
          sourceColumn: mapping.source,
          destinationColumn: mapping.destination,
          dataType: "text", // Default type, could be enhanced with type detection
          nullable: true,
          isPrimaryKey: mapping.isPrimaryKey || false,
        };
      });

      // Extract primary keys from field mappings
      const primaryKeyFields = firstTransformer.fieldMappings
        .filter((fm) => {
          const mapping = fm as { isPrimaryKey?: boolean };
          return mapping.isPrimaryKey === true;
        })
        .map((fm) => {
          const mapping = fm as { destination: string };
          return mapping.destination;
        });

      // Determine write mode (default to append, could be enhanced)
      const writeMode: "append" | "upsert" | "replace" =
        primaryKeyFields.length > 0 ? "upsert" : "append";

      // Create destination schema
      const destinationSchema =
        await createDestinationSchemaMutation.mutateAsync({
          dataSourceId: destinationConnectionId,
          destinationSchema: destSchemaName,
          destinationTable: destTableName,
          columnMappings: columnMappings,
          writeMode: writeMode,
          upsertKey: primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
          name: `Destination: ${destTableName}`,
        });

      // Step 3: Create pipeline with schema IDs
      await createPipelineMutation.mutateAsync({
        name: `Pipeline ${new Date().toLocaleDateString()}`,
        description: `Pipeline with ${collectorsToUse.length} collector(s)`,
        sourceSchemaId: sourceSchema.id,
        destinationSchemaId: destinationSchema.id,
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
