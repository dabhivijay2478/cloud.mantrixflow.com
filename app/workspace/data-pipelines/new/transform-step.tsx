"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Code,
  Database,
  Edit,
  Map as MapIcon,
  Pause,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, FormSheet } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useConnections,
  useSchemasWithTables,
} from "@/lib/api/hooks/use-data-sources";
import { useDbtModels } from "@/lib/api/hooks/use-data-pipelines";
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { CollectorConfig } from "./collector-step";
import type { EmitterConfig } from "./emitter-step";

interface TransformStepProps {
  collectors: CollectorConfig[];
  onComplete: (collectors: CollectorConfig[]) => void;
}

export interface TransformConfig {
  id: string;
  name: string;
  collectorId: string;
  emitterId: string;
  fieldMappings: Array<{
    source: string;
    destination: string;
    isPrimaryKey?: boolean;
  }>;
  destinationTable?: string; // Selected destination table (schema.table format)
  primaryKeyField?: string; // Explicitly defined primary key field name
  dbtModels?: string[]; // Selected dbt models (empty = run all)
  status?: "published" | "paused";
}

export function TransformStep({ collectors, onComplete }: TransformStepProps) {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Fetch connections from API
  const { data: connections } = useConnections(orgId);

  // Convert API connections to DataSource format for compatibility
  const dataSources =
    connections?.map((conn) => ({
      id: conn.id,
      name: conn.name,
      type: (conn.type || "postgres") as
        | "postgres"
        | "mysql"
        | "mongodb"
        | "s3"
        | "api"
        | "bigquery"
        | "snowflake"
        | "redshift"
        | "clickhouse",
      status:
        conn.status === "active"
          ? ("connected" as const)
          : ("disconnected" as const),
      organizationId: conn.orgId,
      connectedAt: conn.lastConnectedAt || undefined,
      tables: [],
    })) || [];

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransform, setEditingTransform] = useState<string | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [selectedEmitterId, setSelectedEmitterId] = useState<string>("");
  const [selectedDestinationTable, setSelectedDestinationTable] =
    useState<string>("");
  const [transformName, setTransformName] = useState("");
  const [fieldMappings, setFieldMappings] = useState<
    Array<{ source: string; destination: string; isPrimaryKey?: boolean }>
  >([]);
  const [primaryKeyField, setPrimaryKeyField] = useState<string>("");
  const [selectedDbtModels, setSelectedDbtModels] = useState<string[]>([]);

  const { data: dbtModelsData } = useDbtModels();
  const dbtModels = dbtModelsData?.models ?? [];

  // Get all emitters from all collectors (emitters are now stored at collector level)
  const allEmitters: Array<
    EmitterConfig & { collectorId: string; collectorName: string }
  > = collectors.flatMap((collector) => {
    const source = dataSources.find((ds) => ds.id === collector.sourceId);
    const collectorName =
      source?.name || `Data Source ${collector.sourceId.slice(-6)}`;
    return (collector.emitters || []).map((e) => ({
      ...e,
      connectionConfig: e.connectionConfig || {},
      collectorId: collector.id,
      collectorName,
    }));
  });

  // Get all transforms from all collectors
  const allTransforms: Array<
    TransformConfig & { collectorName: string; emitterName: string }
  > = collectors.flatMap((collector) => {
    const source = dataSources.find((ds) => ds.id === collector.sourceId);
    const collectorTransformers = collector.transformers || [];

    return collectorTransformers.map((t) => {
      const transform = t as TransformConfig;
      const emitter = allEmitters.find((e) => e.id === transform.emitterId);
      return {
        ...transform,
        collectorId: collector.id,
        collectorName:
          source?.name || `Data Source ${collector.sourceId.slice(-6)}`,
        emitterName: emitter?.destinationName || "Unknown",
        fieldMappings: transform.fieldMappings || [],
      };
    });
  });

  const selectedCollector = collectors.find(
    (c) => c.id === selectedCollectorId,
  );

  // Get available emitters for the selected collector
  const availableEmitters = useMemo(() => {
    if (!selectedCollectorId) return [];
    return allEmitters.filter((e) => e.collectorId === selectedCollectorId);
  }, [selectedCollectorId, allEmitters]);

  const selectedEmitter = availableEmitters.find(
    (e) => e.id === selectedEmitterId,
  );

  // Fetch schemas with tables for the destination connection
  const { data: destinationSchemas, isLoading: destinationSchemasLoading } =
    useSchemasWithTables(selectedEmitter?.destinationId || "", orgId);

  // Flatten all tables from destination schemas
  const destinationTables = useMemo(() => {
    if (!destinationSchemas) return [];
    return destinationSchemas.flatMap((schema) =>
      (schema.tables || []).map((table) => ({
        schema: schema.name,
        table: table.name,
        fullName: `${schema.name}.${table.name}`,
      })),
    );
  }, [destinationSchemas]);

  // Get source data source type to handle MongoDB differently
  const sourceDataSource = useMemo(() => {
    if (!selectedCollector) return null;
    return dataSources.find((ds) => ds.id === selectedCollector.sourceId);
  }, [selectedCollector, dataSources]);

  // Parse selected tables and prepare queries for source (collector)
  const sourceTableQueries = useMemo(() => {
    if (
      !selectedCollector ||
      !selectedCollector.selectedTables ||
      selectedCollector.selectedTables.length === 0
    ) {
      return [];
    }

    return selectedCollector.selectedTables.map((tableName) => {
      // For MongoDB: format is "database.collection" or just "collection"
      // For SQL: format is "schema.table" or just "table"
      const isMongoDB = sourceDataSource?.type === "mongodb";

      if (tableName.includes(".")) {
        const parts = tableName.split(".");
        return {
          tableName,
          schema: parts[0], // database for MongoDB, schema for SQL
          table: parts[1], // collection for MongoDB, table for SQL
          connectionId: selectedCollector.sourceId,
          isMongoDB,
        };
      } else {
        // No schema/database prefix
        return {
          tableName,
          schema: isMongoDB ? undefined : "public", // MongoDB: search all, SQL: default to public
          table: tableName,
          connectionId: selectedCollector.sourceId,
          isMongoDB,
        };
      }
    });
  }, [selectedCollector, sourceDataSource]);

  // Fetch schemas for source tables
  const sourceSchemaQueries = useQueries({
    queries: sourceTableQueries.map(
      ({ tableName: _tableName, schema, table, connectionId, isMongoDB }) => ({
        queryKey: [
          "table-schema",
          connectionId,
          table,
          schema || "none",
          "source",
          isMongoDB ? "mongodb" : "sql",
        ],
        queryFn: async () => {
          return DataSourcesService.getTableSchema(
            connectionId,
            table,
            schema,
            orgId,
          );
        },
        enabled: !!connectionId && !!table && !!orgId,
        retry: 2,
      }),
    ),
  });

  // Build source fields from fetched table schemas
  const sourceFields = useMemo(() => {
    const fields: Array<{ name: string; type: string; table: string }> = [];

    sourceSchemaQueries.forEach((query, index) => {
      if (query.isLoading) return;
      if (query.error) return;

      if (query.data?.columns && query.data.columns.length > 0) {
        const tableInfo = sourceTableQueries[index];
        query.data.columns.forEach((col) => {
          // For MongoDB, use field name directly (may include nested paths like "address.city")
          // For SQL, prefix with table name
          const fieldName = tableInfo.isMongoDB
            ? col.name
            : `${tableInfo.tableName}.${col.name}`;

          fields.push({
            name: fieldName,
            type: col.dataType || "unknown",
            table: tableInfo.tableName,
          });
        });
      }
    });

    return fields;
  }, [sourceSchemaQueries, sourceTableQueries]);

  // Parse destination table and prepare query for destination (emitter)
  const destinationTableQuery = useMemo(() => {
    if (!selectedEmitter || !selectedDestinationTable) return null;

    const parts = selectedDestinationTable.includes(".")
      ? selectedDestinationTable.split(".")
      : ["public", selectedDestinationTable];
    const schema = parts[0];
    const table = parts[1];

    return {
      tableName: selectedDestinationTable,
      schema,
      table,
      connectionId: selectedEmitter.destinationId,
    };
  }, [selectedEmitter, selectedDestinationTable]);

  // Fetch schema for destination table
  const destinationSchemaQuery = useQueries({
    queries: [
      {
        queryKey: [
          "table-schema",
          destinationTableQuery?.connectionId || "",
          destinationTableQuery?.table || "",
          destinationTableQuery?.schema || "",
          "destination",
        ],
        queryFn: () => {
          if (!destinationTableQuery) {
            return Promise.resolve({
              columns: [],
              table: "",
              schema: "",
              primaryKeys: [],
            });
          }
          return DataSourcesService.getTableSchema(
            destinationTableQuery.connectionId,
            destinationTableQuery.table,
            destinationTableQuery.schema,
            orgId,
          );
        },
        enabled:
          !!destinationTableQuery?.connectionId &&
          !!destinationTableQuery?.table &&
          !!orgId,
      },
    ],
  });

  // Build destination fields from fetched table schema
  const destinationFields = useMemo(() => {
    if (!destinationTableQuery) return [];
    const queryResult = destinationSchemaQuery[0];

    if (queryResult?.data?.columns && queryResult.data.columns.length > 0) {
      return queryResult.data.columns.map((col) => {
        if (typeof col === "string") {
          return {
            name: col,
            type: "unknown",
            table: destinationTableQuery.tableName || "",
          };
        }
        return {
          name: col.name,
          type: col.dataType || "unknown",
          table: destinationTableQuery.tableName || "",
        };
      });
    }

    return [];
  }, [destinationSchemaQuery, destinationTableQuery]);

  const handleAddTransform = () => {
    if (
      !selectedCollectorId ||
      !selectedEmitterId ||
      !transformName ||
      !selectedDestinationTable
    )
      return;

    // Clean Engine: Transformations handled by dbt in Meltano job.

    // Ensure fieldMappings is always an array
    const validFieldMappings = Array.isArray(fieldMappings)
      ? fieldMappings
      : [];

    const newTransform: TransformConfig = {
      id: editingTransform || `transform_${Date.now()}`,
      name: transformName,
      collectorId: selectedCollectorId,
      emitterId: selectedEmitterId,
      fieldMappings: [], // dbt handles transforms in Meltano job
      destinationTable: selectedDestinationTable,
      dbtModels: selectedDbtModels.length > 0 ? selectedDbtModels : undefined,
      primaryKeyField:
        primaryKeyField ||
        validFieldMappings.find(
          (m) => m.isPrimaryKey || m.destination.toLowerCase() === "id",
        )?.destination ||
        "",
    };

    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === selectedCollectorId) {
        const transformers = editingTransform
          ? collector.transformers.map((t) =>
              t.id === editingTransform ? newTransform : t,
            )
          : [...collector.transformers, newTransform];
        return { ...collector, transformers };
      }
      return collector;
    });

    onComplete(updatedCollectors);
    setShowAddDialog(false);
    setEditingTransform(null);
    setSelectedCollectorId("");
    setSelectedEmitterId("");
    setSelectedDestinationTable("");
    setTransformName("");
    setFieldMappings([]);
    setSelectedDbtModels([]);
  };

  const handleDeleteTransform = (collectorId: string, transformId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        return {
          ...collector,
          transformers: collector.transformers.filter(
            (t) => t.id !== transformId,
          ),
        };
      }
      return collector;
    });
    onComplete(updatedCollectors);
  };

  const handlePauseTransform = (collectorId: string, transformId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        return {
          ...collector,
          transformers: collector.transformers.map((t) =>
            t.id === transformId ? { ...t, status: "paused" as const } : t,
          ),
        };
      }
      return collector;
    });
    onComplete(updatedCollectors);
  };

  const handleEditTransform = (transform: TransformConfig) => {
    setEditingTransform(transform.id);
    setSelectedCollectorId(transform.collectorId);
    setSelectedEmitterId(transform.emitterId);
    setTransformName(transform.name);
    setFieldMappings(transform.fieldMappings || []);
    setSelectedDestinationTable(transform.destinationTable || "");
    setPrimaryKeyField(
      transform.primaryKeyField ||
        transform.fieldMappings?.find(
          (m) => m.isPrimaryKey || m.destination.toLowerCase() === "id",
        )?.destination ||
        "",
    );
    setSelectedDbtModels(transform.dbtModels ?? []);
    setShowAddDialog(true);
  };

  const handleContinue = () => {
    // Validate that at least one transformer has transform script
    // Field mappings validation removed - only scripts allowed for now
    const hasValidTransformers = collectors.some((collector) => {
      return (
        collector.transformers &&
        collector.transformers.length > 0 &&
        collector.transformers.some((t) => {
          return true; // Clean Engine: transformers valid without script (dbt handles)
        })
      );
    });

    onComplete(collectors);
  };

  const columns: ColumnDef<
    TransformConfig & { collectorName: string; emitterName: string }
  >[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MapIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "collectorName",
      header: "Collector",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.collectorName}</Badge>
      ),
    },
    {
      accessorKey: "emitterName",
      header: "Emitter",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.emitterName}</Badge>
      ),
    },
    // Field mappings column commented out - only scripts allowed for now
    // {
    //   accessorKey: "fieldMappings",
    //   header: "Fields Mapped",
    //   cell: ({ row }) => (
    //     <Badge variant="secondary">
    //       {row.original.fieldMappings?.length || 0} fields
    //     </Badge>
    //   ),
    // },
    {
      accessorKey: "dbtModels",
      header: "Transform",
      cell: ({ row }) => {
        const models = row.original.dbtModels;
        return (
          <Badge variant="secondary">
            {models && models.length > 0
              ? `${models.length} model${models.length !== 1 ? "s" : ""}`
              : "dbt (all)"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const transform = row.original;
        const isPaused = transform.status === "paused";
        return (
          <div className="flex items-center justify-end gap-2">
            {isPaused && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePauseTransform(transform.collectorId, transform.id);
                }}
                title="Pause transformer"
              >
                <Pause className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Paused</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleEditTransform(transform);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTransform(transform.collectorId, transform.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Transformer
        </Button>
      </div>

      <DataTable
        tableId="pipeline-transform-step-table"
        columns={columns}
        data={allTransforms}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter transformers..."
        defaultVisibleColumns={[
          "name",
          "collectorName",
          "emitterName",
          "dbtModels",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No transformers configured"
        emptyDescription="Add transformers to map fields from collectors to emitters"
      />

      {/* Add/Edit Transform Sheet */}
      <FormSheet
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title={editingTransform ? "Edit Transformer" : "Add Transformer"}
        description="Map fields from collector to emitter destination"
        maxWidth="7xl"
        className="sm:max-w-[95vw]"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddTransform}
              disabled={
                !selectedCollectorId ||
                !selectedEmitterId ||
                !transformName ||
                !selectedDestinationTable
              }
              className="w-full sm:w-auto cursor-pointer"
            >
              {editingTransform ? "Update" : "Add"} Transformer
            </Button>
          </div>
        }
      >
        <div className="space-y-6 w-full">
          {/* Combined Configuration Row - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Collector Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Collector
              </Label>
              <Select
                value={selectedCollectorId}
                onValueChange={(value) => {
                  setSelectedCollectorId(value);
                  setSelectedEmitterId("");
                  setFieldMappings([]);
                }}
                disabled={!!editingTransform}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select a collector" />
                </SelectTrigger>
                <SelectContent>
                  {collectors.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No collectors available. Please add collectors first.
                    </div>
                  ) : (
                    collectors.map((collector) => {
                      const source = dataSources.find(
                        (ds) => ds.id === collector.sourceId,
                      );
                      const selectedTablesCount =
                        collector.selectedTables?.length || 0;
                      const displayName =
                        source?.name ||
                        `Data Source ${collector.sourceId.slice(-6)}`;
                      return (
                        <SelectItem key={collector.id} value={collector.id}>
                          <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate flex-1 font-medium">
                              {displayName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0"
                            >
                              {selectedTablesCount} table
                              {selectedTablesCount !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Emitter Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Emitter
              </Label>
              <Select
                value={selectedEmitterId}
                onValueChange={(value) => {
                  setSelectedEmitterId(value);
                  setSelectedDestinationTable("");
                  setFieldMappings([]);
                }}
                disabled={!!editingTransform || !selectedCollectorId}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select an emitter" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmitters.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {!selectedCollectorId
                        ? "Select a collector first"
                        : "No emitters available for this collector. Please add emitters first."}
                    </div>
                  ) : (
                    availableEmitters.map((emitter) => (
                      <SelectItem key={emitter.id} value={emitter.id}>
                        <div className="flex items-center gap-2 w-full">
                          <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate flex-1 font-medium">
                            {emitter.destinationName}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Transform Name Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Transform Name
              </Label>
              <Input
                value={transformName}
                onChange={(e) => setTransformName(e.target.value)}
                placeholder="e.g., Customer Data Transform"
                className="h-10 w-full"
              />
            </div>

            {/* Destination Table Field - Conditionally Rendered */}
            {selectedCollectorId && selectedEmitterId && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Label className="text-sm font-medium text-foreground">
                  Destination Table
                </Label>
                <Select
                  value={selectedDestinationTable}
                  onValueChange={(value) => {
                    setSelectedDestinationTable(value);
                    setFieldMappings([]);
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select destination table" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationSchemasLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                          Loading tables...
                        </div>
                      </div>
                    ) : destinationTables.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tables available in destination
                      </div>
                    ) : (
                      destinationTables.map((table, index) => (
                        <SelectItem
                          key={`${table.fullName}-${index}`}
                          value={table.fullName}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate flex-1 font-medium">
                              {table.fullName}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedCollectorId &&
            selectedEmitterId &&
            selectedDestinationTable && (
              <div className="space-y-4">
                {/* Debug info */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    <div>Source Fields: {sourceFields.length}</div>
                    <div>Destination Fields: {destinationFields.length}</div>
                    <div>
                      Source Queries: {sourceSchemaQueries.length} (loading:{" "}
                      {sourceSchemaQueries.filter((q) => q.isLoading).length},
                      errors:{" "}
                      {sourceSchemaQueries.filter((q) => q.error).length})
                    </div>
                    <div>
                      Destination Query:{" "}
                      {destinationSchemaQuery[0]?.isLoading
                        ? "loading"
                        : destinationSchemaQuery[0]?.error
                          ? "error"
                          : "ready"}
                    </div>
                  </div>
                )}

                {/* Clean Engine: Transformations handled by dbt in Meltano job */}
                <div className="rounded-lg border border-muted bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">
                      Transformations
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transformations are handled by <strong>dbt</strong> in the
                    Meltano pipeline. Column mapping and data quality rules run
                    as part of the sync job. No Python script required.
                  </p>
                  {dbtModels.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        dbt Models (optional)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to run all models. Select specific models to
                        run (backend support coming soon).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dbtModels.map((model) => {
                          const isSelected =
                            selectedDbtModels.includes(model);
                          return (
                            <Badge
                              key={model}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() =>
                                setSelectedDbtModels((prev) =>
                                  isSelected
                                    ? prev.filter((m) => m !== model)
                                    : [...prev, model],
                                )
                              }
                            >
                              {model}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </FormSheet>

      {/* Continue to Configure step */}
      <div className="flex justify-end">
        <Button onClick={handleContinue} className="cursor-pointer">
          Continue to name & create
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
