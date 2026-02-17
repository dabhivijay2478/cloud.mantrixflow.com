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

      // Clean Engine: dbt handles transforms in Meltano job
      const schemaFieldMappings: Array<{
        source: string;
        destination: string;
        isPrimaryKey: boolean;
      }> = [];

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
        // No existing collectors - fully reconstruct from schemas
        const transformers =
          schemaFieldMappings.length > 0
            ? [
                {
                  id: defaultTransformerId,
                  name: "Default Transformer",
                  collectorId: defaultCollectorId,
                  emitterId: defaultEmitterId,
                  destinationTable: destinationTableName,
                  fieldMappings: schemaFieldMappings,
                },
              ]
            : [];

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

          // Hydrate each transformer with schema data if missing
          const hydratedTransformers = (c.transformers || []).map(
            (t, _tIndex) => {
              const transformer = t as typeof t & {
                destinationTable?: string;
              };

              // Use existing values if present, otherwise fall back to schema data
              return {
                ...t,
                collectorId: t.collectorId || c.id,
                emitterId:
                  t.emitterId || collectorEmitters[0]?.id || defaultEmitterId,
                // CRITICAL: Always use schema's destinationTable if transformer doesn't have one
                destinationTable:
                  transformer.destinationTable || destinationTableName,
                // CRITICAL: Always use schema's fieldMappings if transformer doesn't have any
                fieldMappings:
                  t.fieldMappings && t.fieldMappings.length > 0
                    ? t.fieldMappings
                    : schemaFieldMappings,
              };
            },
          );

          // If no transformers exist, create one from schema
          const finalTransformers =
            hydratedTransformers.length > 0
              ? hydratedTransformers
              : schemaFieldMappings.length > 0
                ? [
                    {
                      id: defaultTransformerId,
                      name: "Default Transformer",
                      collectorId: c.id,
                      emitterId: collectorEmitters[0]?.id || defaultEmitterId,
                      destinationTable: destinationTableName,
                      fieldMappings: schemaFieldMappings,
                    },
                  ]
                : [];

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
        schemaFieldMappingsCount: schemaFieldMappings.length,
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
              fieldMappingsCount: t.fieldMappings?.length || 0,
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
        .find((t) => t.fieldMappings && t.fieldMappings.length > 0);

      if (firstTransformer?.fieldMappings && destinationSchema) {
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

        // Extract primary keys from field mappings if available
        const primaryKeyFields =
          firstTransformer.fieldMappings
            ?.filter((fm) => {
              const mapping = fm as { isPrimaryKey?: boolean };
              return mapping.isPrimaryKey === true;
            })
            .map((fm) => {
              const mapping = fm as { destination: string };
              return mapping.destination;
            }) || [];

        const writeMode: "append" | "upsert" | "replace" =
          primaryKeyFields.length > 0 ? "upsert" : "append";

        // Only update if changed (Clean Engine: dbt handles transforms)
        if (
          destinationSchema.destinationSchema !== destSchemaName ||
          destinationSchema.destinationTable !== destTableName ||
          destinationSchema.writeMode !== writeMode
        ) {
          await updateDestinationSchemaMutation.mutateAsync({
            destinationSchema: destSchemaName,
            destinationTable: destTableName,
            writeMode: writeMode,
            upsertKey:
              primaryKeyFields.length > 0 ? primaryKeyFields : undefined,
          });
        }
      }

      // Step 3: Update pipeline
      await updatePipelineMutation.mutateAsync({
        name: pipeline.name,
        description: pipeline.description || undefined,
        // Note: sourceSchemaId and destinationSchemaId remain the same
        // unless schemas were recreated (which would require more complex logic)
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
