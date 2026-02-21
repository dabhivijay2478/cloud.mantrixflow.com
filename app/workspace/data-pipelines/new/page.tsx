"use client";

import { toTransformations } from "@/components/data-pipelines/column-mapping-editor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnections } from "@/lib/api/hooks/use-data-sources";
import { DataPipelinesService } from "@/lib/api/services/data-pipelines.service";
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
import { DestinationSchemasService } from "@/lib/api/services/destination-schemas.service";
import { SourceSchemasService } from "@/lib/api/services/source-schemas.service";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import type { CollectorConfig } from "./collector-step";
import { CollectorStep } from "./collector-step";
import { EmitterStep } from "./emitter-step";
import { TransformStep } from "./transform-step";

type PipelineStep = "collector" | "emitter" | "transform" | "configure";

interface PipelineConfig {
  collectors: CollectorConfig[];
}

type Transformer = CollectorConfig["transformers"][number];
type SourceType = "postgres" | "mysql" | "mongodb";

function normalizeSourceType(sourceType: string | undefined): SourceType {
  const normalized = sourceType?.toLowerCase() || "postgres";
  if (normalized === "postgresql") {
    return "postgres";
  }
  if (normalized === "mysql") {
    return "mysql";
  }
  if (normalized === "mongodb") {
    return "mongodb";
  }
  return "postgres";
}

export default function NewPipelinePage() {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const { data: connections } = useConnections(organizationId);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [pipelineName, setPipelineName] = useState("");
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
    setCurrentStep("configure");
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePipeline = async (
    collectorsOverride?: CollectorConfig[],
  ) => {
    // Use the provided collectors if available, otherwise fall back to state
    // This fixes the issue where newly created transformers aren't detected on first save
    const collectorsToUse = collectorsOverride || config.collectors;

    // Validate that at least one transformer exists (Clean Engine: dbt handles transforms)
    const hasValidTransformers = collectorsToUse.some(
      (collector) =>
        collector.transformers && collector.transformers.length > 0,
    );

    if (!hasValidTransformers) {
      toast.error(
        "Missing transformers",
        "Please configure at least one transformer (collector → emitter) before creating the pipeline.",
      );
      return;
    }

    // Prevent double submission
    if (isCreating) {
      return;
    }

    if (!pipelineName.trim()) {
      toast.error(
        "Pipeline name required",
        "Please enter a unique name for this pipeline.",
      );
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

      // Get data source to determine source type.
      let sourceType: SourceType = "postgres";
      try {
        if (!organizationId) {
          throw new Error("Organization ID is required");
        }
        const dataSource = await DataSourcesService.getDataSource(
          organizationId,
          primarySourceId,
        );
        // Handle both camelCase and snake_case from API
        sourceType = normalizeSourceType(
          dataSource.sourceType ||
            (dataSource as { source_type?: string }).source_type,
        );
      } catch (error) {
        console.error(
          "Failed to fetch data source, using default type:",
          error,
        );
        // Try to get from connections cache if available
        const cachedConnection = connections?.find(
          (c) => c.id === primarySourceId,
        );
        if (cachedConnection?.type) {
          sourceType = normalizeSourceType(cachedConnection.type);
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
        .find(() => true); // Any transformer; dbt handles transforms

      if (!firstTransformer) {
        toast.error(
          "No transformation configured",
          "Please configure at least one transformer in the transform step.",
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

      // Convert fieldMappings to transformations (rename only) for column_renames in ETL
      const fieldMappings = (firstTransformer as Transformer & { fieldMappings?: Array<{ source: string; destination: string }> }).fieldMappings ?? [];
      const columnRenames = Object.fromEntries(
        fieldMappings
          .filter((m) => m.source !== m.destination)
          .map((m) => [m.source, m.destination]),
      );
      const transformations = toTransformations(columnRenames);

      // Extract primary keys from field mappings
      const primaryKeyFields = fieldMappings
        .filter((m) => m.destination?.toLowerCase() === "id")
        .map((m) => m.destination);

      // Determine write mode (default to append, could be enhanced)
      const writeMode: "append" | "upsert" | "replace" =
        primaryKeyFields.length > 0 ? "upsert" : "append";

      if (!organizationId) {
        toast.error("Error", "Organization ID is required");
        return;
      }

      // Create source schema in NestJS.
      const sourceSchema = await SourceSchemasService.createSourceSchema(
        organizationId,
        {
          sourceType,
          dataSourceId: primarySourceId,
          sourceSchema: sourceSchemaName,
          sourceTable: sourceTableName,
          name: `Source: ${sourceTableName}`,
        },
      );

      // Create destination schema in NestJS.
      const destinationSchema =
        await DestinationSchemasService.createDestinationSchema(
          organizationId,
          {
            dataSourceId: destinationConnectionId,
            destinationSchema: destSchemaName,
            destinationTable: destTableName,
            writeMode,
            upsertKey:
              primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
            name: `Destination: ${destTableName}`,
            dbtModels: (firstTransformer as Transformer & { dbtModels?: string[] }).dbtModels,
          },
        );

      // Create pipeline referencing created schemas.
      await DataPipelinesService.createPipeline(organizationId, {
        name: pipelineName.trim(),
        description: `Pipeline with ${collectorsToUse.length} collector(s)`,
        sourceSchemaId: sourceSchema.id,
        destinationSchemaId: destinationSchema.id,
        syncMode: "incremental",
        scheduleType: "minutes",
        scheduleValue: "2",
        scheduleTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        transformations,
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
      {
        id: "configure",
        label: "Configure",
        description: "Name and create",
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
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          {currentStep === "configure" && (
            <div className="mx-auto max-w-2xl px-6 py-8">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight">
                  Name your pipeline
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Give your pipeline a unique, descriptive name so you can find
                  it easily.
                </p>
                <div className="mt-6">
                  <Label
                    htmlFor="pipeline-name"
                    className="text-sm font-medium"
                  >
                    Pipeline Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pipeline-name"
                    type="text"
                    placeholder="e.g. Company Roles Sync, Daily Users Import..."
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    className="mt-1.5"
                    autoFocus
                  />
                  {!pipelineName.trim() && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Enter a name to enable the Create Pipeline button.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("transform")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => handleCreatePipeline()}
                    disabled={!pipelineName.trim() || isCreating}
                  >
                    {isCreating ? "Creating…" : "Create Pipeline"}
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {config.collectors.length} collector
                {config.collectors.length !== 1 ? "s" : ""} configured
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
