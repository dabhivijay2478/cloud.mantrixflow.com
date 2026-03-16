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
import {
  useDestinationSchema,
  useUpdateDestinationSchema,
} from "@/lib/api/hooks/use-destination-schemas";
import {
  useSourceSchema,
  useUpdateSourceSchema,
} from "@/lib/api/hooks/use-source-schemas";
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

  // Load source and destination schemas
  const { data: sourceSchema } = useSourceSchema(
    orgId,
    pipeline?.sourceSchemaId,
  );
  const { data: destinationSchema } = useDestinationSchema(
    orgId,
    pipeline?.destinationSchemaId,
  );

  const updateSourceSchemaMutation = useUpdateSourceSchema(
    orgId,
    pipeline?.sourceSchemaId,
  );
  const updateDestinationSchemaMutation = useUpdateDestinationSchema(
    orgId,
    pipeline?.destinationSchemaId,
  );

  const [currentStep, setCurrentStep] = useState<PipelineStep>("collector");
  const [config, setConfig] = useState<PipelineConfig>({
    collectors: [],
  });

  // Load pipeline configuration from API response
  useEffect(() => {
    if (pipeline && sourceSchema && destinationSchema) {
      // Parse existing transformations from JSONB field
      const transformations =
        pipeline.transformations as unknown as TransformationsData;
      let collectors = transformations?.collectors || [];
      const existingEmitters = transformations?.emitters || [];

      // Build the authoritative destination table name from destinationSchema
      // CRITICAL: ALWAYS use "schema.table" format to match TransformStep dropdown
      // The dropdown's destinationTables uses fullName which is ALWAYS "schema.table" format
      const destinationTableName =
        destinationSchema.destinationTable &&
        destinationSchema.destinationSchema
          ? `${destinationSchema.destinationSchema}.${destinationSchema.destinationTable}`
          : destinationSchema.destinationTable
            ? `public.${destinationSchema.destinationTable}`
            : "";

      // Build the authoritative source table name from sourceSchema
      // Use same "schema.table" format for consistency
      const sourceTableName =
        sourceSchema.sourceTable && sourceSchema.sourceSchema
          ? `${sourceSchema.sourceSchema}.${sourceSchema.sourceTable}`
          : sourceSchema.sourceTable
            ? `public.${sourceSchema.sourceTable}`
            : "";

      // Script and dbt only - no column mapping. Use transformScript/customSql from destinationSchema.

      // Generate stable IDs (or use existing ones from transformations)
      const baseTimestamp = Date.now();
      const defaultCollectorId =
        collectors[0]?.id || `collector_${baseTimestamp}`;
      const defaultTransformerId =
        collectors[0]?.transformers?.[0]?.id || `transformer_${baseTimestamp}`;
      const defaultEmitterId =
        collectors[0]?.emitters?.[0]?.id ||
        collectors[0]?.transformers?.[0]?.emitterId ||
        `emitter_${baseTimestamp}`;

      // Build the authoritative Emitter from destinationSchema
      const reconstructedEmitter: Emitter = {
        id: defaultEmitterId,
        transformId: defaultTransformerId,
        destinationId: destinationSchema.dataSourceId || "",
        destinationName: "Destination",
        destinationType: "postgres",
      };

      if (collectors.length === 0) {
        // No existing collectors - fully reconstruct from schemas (Script/dbt only, no column mapping)
        const upsertKeyFromSchema = destinationSchema.upsertKey?.[0]
          ? destinationSchema.upsertKey
          : undefined;
        const destTransformType =
          (destinationSchema.transformType as "script" | "dbt") || "script";
        const transformers = [
          {
            id: defaultTransformerId,
            name: "Default Transformer",
            collectorId: defaultCollectorId,
            emitterId: defaultEmitterId,
            transformType: destTransformType,
            transformScript: destinationSchema.transformScript || undefined,
            customSql: destinationSchema.customSql || undefined,
            destinationTable: destinationTableName,
            upsertKey: upsertKeyFromSchema,
            syncMode: (pipeline.syncMode as "full" | "incremental" | "cdc") || "full",
            cursorField: pipeline.incrementalColumn || undefined,
            writeMode:
              (destinationSchema.writeMode as "append" | "upsert" | "replace") ||
              "append",
          },
        ];

        collectors = [
          {
            id: defaultCollectorId,
            sourceId: sourceSchema.dataSourceId || "",
            selectedTables: sourceTableName ? [sourceTableName] : [],
            transformers: transformers,
            emitters: [reconstructedEmitter],
          },
        ];
      } else {
        // Existing collectors - HYDRATE/ENRICH them with schema data
        // This is the key fix: always apply authoritative data from schemas
        collectors = collectors.map((c, _cIndex) => {
          // Ensure emitters exist on the collector
          let collectorEmitters = c.emitters || [];
          if (collectorEmitters.length === 0) {
            // No emitters stored - add the reconstructed one
            collectorEmitters = [reconstructedEmitter];
          }

          // Hydrate each transformer with schema data (Script/dbt only, no column mapping)
          const hydratedTransformers = (c.transformers || []).map(
            (t, _tIndex) => {
              const transformer = t as typeof t & {
                destinationTable?: string;
                transformScript?: string;
              };
              const destTransformType =
                (destinationSchema.transformType as "script" | "dbt") || "script";
              return {
                ...t,
                collectorId: t.collectorId || c.id,
                emitterId:
                  t.emitterId || collectorEmitters[0]?.id || defaultEmitterId,
                transformType: destTransformType,
                transformScript:
                  (transformer as { transformScript?: string }).transformScript ??
                  destinationSchema.transformScript ??
                  undefined,
                customSql:
                  (transformer as { customSql?: string }).customSql ??
                  destinationSchema.customSql ??
                  undefined,
                destinationTable:
                  transformer.destinationTable || destinationTableName,
                upsertKey:
                  (transformer as { upsertKey?: string[] }).upsertKey ??
                  destinationSchema.upsertKey,
                syncMode:
                  (transformer as { syncMode?: string }).syncMode ||
                  (pipeline.syncMode as "full" | "incremental" | "cdc") ||
                  "full",
                cursorField:
                  (transformer as { cursorField?: string }).cursorField ||
                  pipeline.incrementalColumn,
                writeMode:
                  (transformer as { writeMode?: string }).writeMode ||
                  (destinationSchema.writeMode as "append" | "upsert" | "replace") ||
                  "append",
              };
            },
          );

          // If no transformers exist, create one from schema
          const finalTransformers =
            hydratedTransformers.length > 0
              ? hydratedTransformers
              : [
                  {
                    id: defaultTransformerId,
                    name: "Default Transformer",
                    collectorId: c.id,
                    emitterId: collectorEmitters[0]?.id || defaultEmitterId,
                    destinationTable: destinationTableName,
                    transformType:
                      (destinationSchema.transformType as "script" | "dbt") || "script",
                    transformScript: destinationSchema.transformScript || undefined,
                    customSql: destinationSchema.customSql || undefined,
                    upsertKey: destinationSchema.upsertKey,
                    syncMode:
                      (pipeline.syncMode as "full" | "incremental" | "cdc") || "full",
                    cursorField: pipeline.incrementalColumn,
                    writeMode:
                      (destinationSchema.writeMode as "append" | "upsert" | "replace") ||
                      "append",
                  },
                ];

          return {
            ...c,
            sourceId: c.sourceId || sourceSchema.dataSourceId || "",
            selectedTables:
              c.selectedTables && c.selectedTables.length > 0
                ? c.selectedTables
                : sourceTableName
                  ? [sourceTableName]
                  : [],
            emitters: collectorEmitters,
            transformers: finalTransformers,
          };
        });
      }

      console.log("Pipeline data loaded for edit:", {
        transformations,
        collectors,
        existingEmitters,
        destinationTableName,
        sourceTableName,
        collectorsCount: collectors.length,
        collectorsWithData: collectors.map((c) => ({
          id: c.id,
          sourceId: c.sourceId,
          selectedTablesCount: c.selectedTables?.length || 0,
          emittersCount: c.emitters?.length || 0,
          transformersCount: (c.transformers || []).length,
          transformers: (c.transformers || []).map((t) => {
            const transformer = t as typeof t & { destinationTable?: string };
            return {
              id: t.id,
              name: t.name,
              emitterId: t.emitterId,
              destinationTable: transformer.destinationTable,
              transformType: (t as { transformType?: string }).transformType,
            };
          }),
        })),
      });

      // Set the hydrated config - collectors now have all data populated
      setConfig({ collectors: collectors as unknown as CollectorConfig[] });
    }
  }, [pipeline, sourceSchema, destinationSchema]);

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

    if (!pipeline || !sourceSchema || !destinationSchema) {
      toast.error(
        "Missing data",
        "Pipeline, source schema, or destination schema not loaded.",
      );
      return;
    }

    try {
      // Step 1: Update source schema if needed
      const firstCollector = collectors[0];
      if (firstCollector && sourceSchema) {
        const firstTable = firstCollector.selectedTables[0];
        if (firstTable) {
          const tableParts = firstTable.includes(".")
            ? firstTable.split(".")
            : ["public", firstTable];
          const sourceSchemaName = tableParts[0] || "public";
          const sourceTableName = tableParts[1] || tableParts[0] || firstTable;

          // Only update if changed
          if (
            sourceSchema.sourceSchema !== sourceSchemaName ||
            sourceSchema.sourceTable !== sourceTableName
          ) {
            await updateSourceSchemaMutation.mutateAsync({
              sourceSchema: sourceSchemaName,
              sourceTable: sourceTableName,
            });
          }
        }
      }

      // Step 2: Update destination schema if needed
      const firstTransformer = collectors
        .flatMap((c) => c.transformers || [])
        .find(
          (t) =>
            (t as { destinationTable?: string }).destinationTable?.trim(),
        );

      if (firstTransformer && destinationSchema) {
        // Extract destination table from transformer
        const transformerWithTable = firstTransformer as Transformer & {
          destinationTable?: string;
        };
        let destinationTable = destinationSchema.destinationTable;
        if (transformerWithTable.destinationTable) {
          destinationTable = transformerWithTable.destinationTable;
        }

        // Parse destination table
        const destTableParts = destinationTable.includes(".")
          ? destinationTable.split(".")
          : ["public", destinationTable];
        const destSchemaName = destTableParts[0] || "public";
        const destTableName =
          destTableParts[1] || destTableParts[0] || destinationTable;

        // Extract primary key from transformer (upsertKey or legacy primaryKeyField) or destination schema
        const transformerWithPk = firstTransformer as Transformer & {
          primaryKeyField?: string;
          upsertKey?: string[];
        };
        const primaryKeyFields: string[] =
          transformerWithPk.upsertKey?.length
            ? transformerWithPk.upsertKey
            : transformerWithPk.primaryKeyField
              ? [transformerWithPk.primaryKeyField]
              : (destinationSchema.upsertKey as string[] | undefined) || [];

        const writeMode: "append" | "upsert" | "replace" =
          primaryKeyFields.length > 0 ? "upsert" : "append";

        // Get transformType, transformScript, customSql from transformer (Script/dbt only)
        const transformerWithTransform = firstTransformer as Transformer & {
          transformType?: "script" | "dbt";
          transformScript?: string;
          customSql?: string;
        };
        const destTransformType =
          transformerWithTransform.transformType ||
          (destinationSchema.transformType as "script" | "dbt") ||
          "script";
        const transformScript =
          (transformerWithTransform.transformScript ??
            destinationSchema.transformScript ??
            "")?.trim() || undefined;
        const customSql =
          (transformerWithTransform.customSql ??
            destinationSchema.customSql ??
            "")?.trim() || undefined;

        if (destTransformType === "dbt" && !customSql) {
          toast.error(
            "Validation failed",
            "Custom SQL is required when using Custom SQL transform mode.",
          );
          return;
        }
        if (destTransformType === "script" && !transformScript) {
          toast.error(
            "Validation failed",
            "Python transform script is required when using Script transform mode.",
          );
          return;
        }

        // Only update if changed
        const upsertKeyChanged =
          JSON.stringify(destinationSchema.upsertKey || []) !==
          JSON.stringify(primaryKeyFields);
        if (
          destinationSchema.destinationSchema !== destSchemaName ||
          destinationSchema.destinationTable !== destTableName ||
          destinationSchema.transformType !== destTransformType ||
          destinationSchema.transformScript !== transformScript ||
          destinationSchema.customSql !== customSql ||
          destinationSchema.writeMode !== writeMode ||
          upsertKeyChanged
        ) {
          await updateDestinationSchemaMutation.mutateAsync({
            destinationSchema: destSchemaName,
            destinationTable: destTableName,
            transformType: destTransformType,
            transformScript:
              destTransformType === "script" ? transformScript : undefined,
            customSql: destTransformType === "dbt" ? customSql : undefined,
            writeMode: writeMode,
            upsertKey:
              primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
          });
        }
      }

      // Step 3: Update pipeline (no transformations/columnMap - Script/dbt only)
      const firstTransformerWithConfig = collectors
        .flatMap((c) => c.transformers || [])
        .find(
          (t) =>
            (t as { destinationTable?: string }).destinationTable?.trim(),
        ) as Transformer | undefined;

      const transformerWithSync = firstTransformerWithConfig as Transformer & {
        syncMode?: "full" | "incremental" | "cdc" | "log_based";
        cursorField?: string;
      };
      const rawSyncMode = transformerWithSync?.syncMode;
      const syncMode: "full" | "log_based" | "incremental" | undefined =
        rawSyncMode === "cdc"
          ? "log_based"
          : rawSyncMode === "incremental"
            ? "incremental"
            : rawSyncMode === "full" || rawSyncMode === "log_based"
              ? rawSyncMode
              : undefined;

      await updatePipelineMutation.mutateAsync({
        name: pipeline.name,
        description: pipeline.description || undefined,
        syncMode,
        incrementalColumn: transformerWithSync?.cursorField,
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
        description: "Script or Custom SQL",
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

    if (pipeline.status === "failed") {
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
          {pipeline.status === "running" ? "Running" : "Pending"}
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
