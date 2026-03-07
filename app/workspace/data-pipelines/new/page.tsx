"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-handler";
import { useConnections } from "@/lib/api/hooks/use-data-sources";
import { DataPipelinesService } from "@/lib/api/services/data-pipelines.service";
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
import { DestinationSchemasService } from "@/lib/api/services/destination-schemas.service";
import { SourceSchemasService } from "@/lib/api/services/source-schemas.service";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { XCircle } from "lucide-react";
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
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreatePipeline = async (
    collectorsOverride?: CollectorConfig[],
  ) => {
    // Use the provided collectors if available, otherwise fall back to state
    // This fixes the issue where newly created transformers aren't detected on first save
    const collectorsToUse = collectorsOverride || config.collectors;

    // dlt: require at least one config (destination table + sync settings)
    const hasValidConfig = collectorsToUse.some((collector) => {
      if (!collector.transformers || collector.transformers.length === 0) {
        return false;
      }
      return collector.transformers.some(
        (t) => (t as { destinationTable?: string }).destinationTable?.trim(),
      );
    });

    if (!hasValidConfig) {
      toast.error(
        "Missing config",
        "Please configure at least one mapping (collector → emitter → destination table) in the Config step.",
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
    setCreateError(null);

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

      // Extract destination information from first configured transformer
      const firstTransformer = collectorsToUse
        .flatMap((c) => c.transformers || [])
        .find((t) => (t as { destinationTable?: string }).destinationTable?.trim());

      if (!firstTransformer) {
        toast.error(
          "No config",
          "Please configure destination table in the Config step.",
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

      const transformerWithConfig = firstTransformer as {
        transformType?: "script" | "dbt";
        transformScript?: string;
        customSql?: string;
        primaryKeyField?: string;
        upsertKey?: string[];
        syncMode?: "full" | "incremental" | "cdc" | "log_based";
        cursorField?: string;
        writeMode?: "append" | "upsert" | "replace";
      };

      const destTransformType =
        transformerWithConfig.transformType === "dbt" ? "dbt" : "script";
      const customSql = transformerWithConfig.customSql?.trim();
      const transformScript = transformerWithConfig.transformScript?.trim();

      if (destTransformType === "dbt" && !customSql) {
        toast.error(
          "Validation failed",
          "Custom SQL is required when using Custom SQL transform mode.",
        );
        setIsCreating(false);
        return;
      }
      if (destTransformType === "script" && !transformScript) {
        toast.error(
          "Validation failed",
          "Python transform script is required when using Script transform mode.",
        );
        setIsCreating(false);
        return;
      }

      // Primary key from transformer (for upsert) — support upsertKey (multi) or legacy primaryKeyField
      const primaryKeyFields: string[] =
        transformerWithConfig.upsertKey?.length
          ? transformerWithConfig.upsertKey
          : transformerWithConfig.primaryKeyField
            ? [transformerWithConfig.primaryKeyField]
            : [];

      // Write mode: from config or derive from primary key
      const writeMode: "append" | "upsert" | "replace" =
        transformerWithConfig.writeMode ||
        (primaryKeyFields.length > 0 ? "upsert" : "append");

      // Sync mode and cursor for incremental/CDC — map to API SyncMode
      const rawSyncMode = transformerWithConfig.syncMode || "full";
      const syncMode: "full" | "log_based" =
        rawSyncMode === "incremental" || rawSyncMode === "cdc" || rawSyncMode === "log_based"
          ? "log_based"
          : "full";
      const incrementalColumn = transformerWithConfig.cursorField;

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

      // Create destination schema in NestJS
      // User selects from existing tables only, so destinationTableExists is always true
      const destinationSchema =
        await DestinationSchemasService.createDestinationSchema(
          organizationId,
          {
            dataSourceId: destinationConnectionId,
            destinationSchema: destSchemaName,
            destinationTable: destTableName,
            transformType: destTransformType,
            transformScript: destTransformType === "script" ? transformScript : undefined,
            customSql: destTransformType === "dbt" ? customSql : undefined,
            writeMode,
            upsertKey:
              primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
            name: `Destination: ${destTableName}`,
            destinationTableExists: true,
          },
        );

      // Create pipeline referencing created schemas (no transformations - use script/dbt only)
      await DataPipelinesService.createPipeline(organizationId, {
        name: pipelineName.trim(),
        description: `Pipeline with ${collectorsToUse.length} collector(s)`,
        sourceSchemaId: sourceSchema.id,
        destinationSchemaId: destinationSchema.id,
        syncMode,
        incrementalColumn: incrementalColumn || undefined,
        scheduleType: syncMode === "full" ? "none" : "minutes",
        scheduleValue: syncMode === "full" ? "" : "2",
        scheduleTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });

      toast.success(
        "Pipeline created",
        "Your pipeline has been created successfully.",
      );
      router.push("/workspace/data-pipelines");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setCreateError(message);
      toast.error("Failed to create pipeline", message);
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
        label: "Config",
        description: "Sync mode, write mode, primary key",
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
                    onChange={(e) => {
                      setPipelineName(e.target.value);
                      if (createError) setCreateError(null);
                    }}
                    className="mt-1.5"
                    autoFocus
                  />
                  {!pipelineName.trim() && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Enter a name to enable the Create Pipeline button.
                    </p>
                  )}
                </div>
                {createError && (
                  <Card className="mt-6 border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Validation Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-sans max-h-48 overflow-y-auto">
                        {createError}
                      </pre>
                    </CardContent>
                  </Card>
                )}
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
