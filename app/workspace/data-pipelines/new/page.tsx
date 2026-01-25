"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
// Pipeline creation now handled by Python API - no need for these hooks
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
  // Pipeline creation now handled by Python API directly
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

    // Validate that at least one transformer with transform script exists
    // Only script-based transformations are allowed for now (field mappings are commented out)
    const hasValidTransformers = collectorsToUse.some((collector) => {
      if (!collector.transformers || collector.transformers.length === 0) {
        return false;
      }

      return collector.transformers.some((t) => {
        // Check if transformScript exists and is not empty
        return t.transformScript && t.transformScript.trim().length > 0;
      });
    });

    if (!hasValidTransformers) {
      toast.error(
        "Missing transform script",
        "Please configure at least one transformer with a Python transform script before creating the pipeline.",
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

      // Get destination connection ID from emitters
      const destinationConnectionId = allDestinationIds[0];

      // Extract destination information from transformers
      // Only script-based transformations are allowed for now
      const firstTransformer = collectorsToUse
        .flatMap((c) => c.transformers || [])
        .find((t) => t.transformScript && t.transformScript.trim());

      // Check if transformer has transformScript
      const hasTransformScript = firstTransformer?.transformScript && firstTransformer.transformScript.trim();

      if (!hasTransformScript) {
        toast.error(
          "No transformation configured",
          "Please configure a Python transform script in the transform step.",
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

      // Transform script is already in firstTransformer.transformScript

      // Extract primary keys from field mappings (commented out - field mappings not used for now)
      const primaryKeyFields: string[] = []; // Empty for now - can be extracted from script if needed

      // Determine write mode (default to append, could be enhanced)
      const writeMode: "append" | "upsert" | "replace" =
        primaryKeyFields.length > 0 ? "upsert" : "append";

      // Create pipeline using Python API (handles source schema, destination schema, and pipeline creation)
      const { PythonETLService } = await import('@/lib/api/services/python-etl.service');
      
      await PythonETLService.createPipeline(organizationId!, {
        name: `Pipeline ${new Date().toLocaleDateString()}`,
        description: `Pipeline with ${collectorsToUse.length} collector(s)`,
        source_schema: {
          source_type: sourceType,
          data_source_id: primarySourceId,
          source_schema: sourceSchemaName,
          source_table: sourceTableName,
          name: `Source: ${sourceTableName}`,
          is_active: true,
        },
        destination_schema: {
          data_source_id: destinationConnectionId,
          destination_schema: destSchemaName,
          destination_table: destTableName,
          transform_script: firstTransformer.transformScript || '',
          write_mode: writeMode,
          upsert_key: primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
          name: `Destination: ${destTableName}`,
          is_active: true,
        },
        sync_mode: "incremental",  // Auto CDC - first run is full, subsequent runs are incremental
        sync_frequency: "minutes",  // Auto-run every 2 minutes for CDC
        schedule_type: "minutes",
        schedule_value: "2",  // 2 minutes default for CDC polling
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
