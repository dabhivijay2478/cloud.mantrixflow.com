"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Database,
  Edit,
  Loader2,
  Map as MapIcon,
  Pause,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import type { CollectorConfig } from "./collector-step";
import type { EmitterConfig } from "./emitter-step";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Statically parse the output keys of a Python transform script.
 *
 * Handles the common pattern:
 *   def transform(record):
 *       row_id = record.get("id")
 *       return { "id": row_id, "name": record.get("name") }
 *
 * Returns the list of string keys present in the return dict.
 * Falls back to [] when the script can't be parsed.
 */
function parseScriptOutputKeys(script: string): string[] {
  if (!script.trim()) return [];

  // Find the last `return {` block – handles both single-line and multi-line dicts.
  // We look for `return` followed by an opening brace and capture everything up to
  // the matching closing brace (simple single-level match, no nested dicts).
  const returnIdx = script.lastIndexOf("return");
  if (returnIdx === -1) return [];

  const afterReturn = script.slice(returnIdx + "return".length).trimStart();
  if (!afterReturn.startsWith("{")) return [];

  // Find matching closing brace
  let depth = 0;
  let end = -1;
  for (let i = 0; i < afterReturn.length; i++) {
    if (afterReturn[i] === "{") depth++;
    else if (afterReturn[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const dictBody =
    end !== -1 ? afterReturn.slice(1, end) : afterReturn.slice(1);

  // Extract string keys: "key": or 'key':
  const keys: string[] = [];
  const keyRegex = /["']([^"']+)["']\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = keyRegex.exec(dictBody)) !== null) {
    keys.push(match[1]);
  }

  return [...new Set(keys)];
}

interface TransformStepProps {
  collectors: CollectorConfig[];
  onComplete: (collectors: CollectorConfig[]) => void;
}

export interface TransformConfig {
  id: string;
  name: string;
  collectorId: string;
  emitterId: string;
  transformType: "script" | "dbt";
  destinationTable?: string; // Selected destination table (schema.table format)
  /** Primary keys for upsert (multi-select). Replaces primaryKeyField. */
  upsertKey?: string[];
  /** @deprecated Use upsertKey. Kept for migration from single primaryKeyField. */
  primaryKeyField?: string;
  syncMode?: "full" | "log_based";
  cursorField?: string;
  writeMode?: "append" | "upsert";
  transformScript?: string; // When transformType is script (Python)
  customSql?: string; // When transformType is dbt
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
      type: (conn.type || "postgres") as "postgres" | "redshift",
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
  const [upsertKey, setUpsertKey] = useState<string[]>([]);
  // transformMode is kept in state for future Custom SQL support, but the
  // Custom SQL tab button is hidden from the UI for now.
  const [transformMode, setTransformMode] = useState<"script" | "customSql">(
    "script",
  );
  const [transformScript, setTransformScript] = useState("");
  const [customSql, setCustomSql] = useState("");

  // Inner tab within the transformer form: "script" editor | "schema" (PK config)
  const [activeConfigTab, setActiveConfigTab] = useState<"script" | "schema">(
    "script",
  );

  // Transform preview state (5-row JSON preview)
  const [previewData, setPreviewData] = useState<
    Record<string, unknown>[] | null
  >(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  // Parse selected tables and prepare queries for source (collector) — PostgreSQL only
  const sourceTableQueries = useMemo(() => {
    if (
      !selectedCollector ||
      !selectedCollector.selectedTables ||
      selectedCollector.selectedTables.length === 0
    ) {
      return [];
    }

    return selectedCollector.selectedTables.map((tableName) => {
      if (tableName.includes(".")) {
        const parts = tableName.split(".");
        return {
          tableName,
          schema: parts[0],
          table: parts[1],
          connectionId: selectedCollector.sourceId,
        };
      }
      return {
        tableName,
        schema: "public",
        table: tableName,
        connectionId: selectedCollector.sourceId,
      };
    });
  }, [selectedCollector]);

  // Fetch schemas for source tables
  const sourceSchemaQueries = useQueries({
    queries: sourceTableQueries.map(
      ({ tableName: _tableName, schema, table, connectionId }) => ({
        queryKey: [
          "table-schema",
          connectionId,
          table,
          schema || "none",
          "source",
        ],
        queryFn: async () => {
          try {
            const result = await DataSourcesService.getTableSchema(
              connectionId,
              table,
              schema,
              orgId,
            );
            console.log(`Fetched schema for ${table}:`, {
              columnsCount: result.columns?.length || 0,
              columns: result.columns?.map((c: { name: string }) => c.name),
            });
            return result;
          } catch (error) {
            console.error(`Failed to fetch schema for ${table}:`, error);
            throw error;
          }
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
      if (query.isLoading) {
        console.log(
          `Loading schema for table ${sourceTableQueries[index]?.tableName}...`,
        );
        return;
      }

      if (query.error) {
        console.error(
          `Error loading schema for table ${sourceTableQueries[index]?.tableName}:`,
          query.error,
        );
        return;
      }

      if (query.data?.columns && query.data.columns.length > 0) {
        const tableInfo = sourceTableQueries[index];
        query.data.columns.forEach((col) => {
          const fieldName = `${tableInfo.tableName}.${col.name}`;
          fields.push({
            name: fieldName,
            type: col.dataType || "unknown",
            table: tableInfo.tableName,
          });
        });

        console.log(
          `Added ${query.data.columns.length} fields from ${tableInfo.tableName}`,
        );
      } else {
        console.warn(
          `No columns found for table ${sourceTableQueries[index]?.tableName}`,
          {
            data: query.data,
            hasData: !!query.data,
            columnsLength: query.data?.columns?.length,
          },
        );
      }
    });

    console.log(
      `Total source fields: ${fields.length}`,
      fields.map((f) => f.name),
    );
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

  // Build destination fields from fetched table schema (for primary key dropdown)
  const destinationFields = useMemo(() => {
    if (!destinationTableQuery) return [];
    const queryResult = destinationSchemaQuery[0];

    // If we have actual table columns, use them
    if (queryResult?.data?.columns && queryResult.data.columns.length > 0) {
      return queryResult.data.columns.map((col) => {
        // Handle both Column objects and string arrays
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

  // Keys derived from static parsing of the transform script.
  // Used to populate the primary-key selector in the Schema tab.
  const scriptOutputKeys = useMemo(
    () => parseScriptOutputKeys(transformScript),
    [transformScript],
  );

  // The pool of columns available for primary-key selection:
  // • If a script is present and parseable → use script output keys
  // • Otherwise fall back to destination table columns
  const primaryKeyPool = useMemo<string[]>(() => {
    if (transformScript.trim() && scriptOutputKeys.length > 0) {
      return scriptOutputKeys;
    }
    return destinationFields.map((f) => f.name);
  }, [transformScript, scriptOutputKeys, destinationFields]);

  // Fetch a 5-row JSON preview of the transform output.
  // Calls NestJS /data-sources/:id/preview with the transform_script so the
  // backend can decrypt the connection config and proxy to the Python ETL.
  const fetchTransformPreview = useCallback(async () => {
    if (!orgId || !selectedCollector || !transformScript.trim()) return;
    const firstTable = selectedCollector.selectedTables?.[0];
    if (!firstTable) return;

    // Convert "schema.table" → "schema-table" (Singer tap_stream_id format)
    const sourceStream = firstTable.includes(".")
      ? firstTable.replace(".", "-")
      : firstTable;

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await DataSourcesService.previewTransform(
        orgId,
        selectedCollector.sourceId,
        sourceStream,
        transformScript.trim(),
        5,
      );
      setPreviewData(result.records.slice(0, 5));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch preview";
      setPreviewError(msg);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [orgId, selectedCollector, transformScript]);

  const handleAddTransform = () => {
    if (
      !selectedCollectorId ||
      !selectedEmitterId ||
      !transformName ||
      !selectedDestinationTable
    )
      return;
    if (transformMode === "customSql") {
      if (!customSql?.trim()) return;
    }
    if (transformMode === "script") {
      if (!transformScript?.trim()) return;
    }
    if (upsertKey.length === 0) {
      toast.error(
        "Primary key required",
        "Select at least one column as primary key for upsert.",
      );
      return;
    }

    const newTransform: TransformConfig = {
      id: editingTransform || `transform_${Date.now()}`,
      name: transformName,
      collectorId: selectedCollectorId,
      emitterId: selectedEmitterId,
      transformType: transformMode === "customSql" ? "dbt" : "script",
      destinationTable: selectedDestinationTable,
      upsertKey: upsertKey.length > 0 ? upsertKey : undefined,
      transformScript:
        transformMode === "script" && transformScript.trim()
          ? transformScript.trim()
          : undefined,
      customSql:
        transformMode === "customSql" && customSql.trim()
          ? customSql.trim()
          : undefined,
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
    setUpsertKey([]);
    setTransformMode("script");
    setTransformScript("");
    setCustomSql("");
    setActiveConfigTab("script");
    setPreviewData(null);
    setPreviewError(null);
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
    setSelectedDestinationTable(transform.destinationTable || "");
    setUpsertKey(
      transform.upsertKey?.length
        ? transform.upsertKey
        : transform.primaryKeyField
          ? [transform.primaryKeyField]
          : [],
    );
    setTransformMode(
      transform.transformType === "dbt" ? "customSql" : "script",
    );
    setTransformScript(transform.transformScript || "");
    setCustomSql(transform.customSql || "");
    setActiveConfigTab("script");
    setPreviewData(null);
    setPreviewError(null);
    setShowAddDialog(true);
  };

  const handleContinue = () => {
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
    {
      accessorKey: "transformType",
      header: "Config",
      cell: ({ row }) => {
        const cfg = row.original as TransformConfig;
        const modeLabel = cfg.transformType === "dbt" ? "Custom SQL" : "Script";
        return <Badge variant="secondary">{modeLabel}</Badge>;
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
          "transformType",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No transformers configured"
        emptyDescription="Add transformers to map fields from collectors to emitters"
      />

      {/* Add/Edit Transform Sheet */}
      <FormSheet
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            // Reset all form state when dialog is dismissed
            setEditingTransform(null);
            setSelectedCollectorId("");
            setSelectedEmitterId("");
            setSelectedDestinationTable("");
            setTransformName("");
            setUpsertKey([]);
            setTransformMode("script");
            setTransformScript("");
            setCustomSql("");
            setActiveConfigTab("script");
            setPreviewData(null);
            setPreviewError(null);
          }
        }}
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
                !selectedDestinationTable ||
                (transformMode === "customSql" && !customSql?.trim()) ||
                (transformMode === "script" && !transformScript?.trim())
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

            {/* Destination Table Field - Conditionally Rendered (before Transform Name so user selects it first) */}
            {selectedCollectorId && selectedEmitterId && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Label className="text-sm font-medium text-foreground">
                  Destination Table
                </Label>
                <Select
                  value={selectedDestinationTable}
                  onValueChange={(value) => {
                    setSelectedDestinationTable(value);
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
          </div>

          {selectedCollectorId &&
            selectedEmitterId &&
            selectedDestinationTable && (
              <div className="space-y-4">
                {/* ── Inner config tabs: Script | Schema ──────────────────────
                    Custom SQL is intentionally hidden here. It is preserved in
                    state so that future incremental-sync SQL can be shown
                    automatically when a user provides a transform script.       */}
                <div className="flex gap-0 rounded-lg border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab("script")}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors border-r ${
                      activeConfigTab === "script"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveConfigTab("schema")}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      activeConfigTab === "schema"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Schema
                  </button>
                  {/* Custom SQL tab – hidden for now, kept for future use:
                  <button type="button" onClick={() => { setTransformMode("customSql"); setActiveConfigTab("script"); }}>
                    Custom SQL
                  </button> */}
                </div>

                {/* ── Script tab ───────────────────────────────────────────── */}
                {activeConfigTab === "script" && (
                  <div className="space-y-4">
                    {/* Python transform script editor */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Python transform script
                      </Label>
                      <textarea
                        value={transformScript}
                        onChange={(e) => {
                          setTransformScript(e.target.value);
                          // Reset preview whenever script changes
                          setPreviewData(null);
                          setPreviewError(null);
                        }}
                        placeholder={`def transform(record):
    """Transform incoming record. Return dict for output, None to skip."""
    # Skip record if required field missing
    key = record.get("id")
    if not key:
        return None
    # Map fields from source to destination
    return {
        "id": key,
        "name": record.get("company_name"),
        # Add more field mappings as needed
    }`}
                        className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={9}
                      />
                      <p className="text-xs text-muted-foreground">
                        Define{" "}
                        <code className="rounded bg-muted px-1">
                          def transform(record)
                        </code>{" "}
                        that receives each row as a dict. Return a dict for
                        output, or{" "}
                        <code className="rounded bg-muted px-1">None</code> to
                        skip the record.
                      </p>
                    </div>

                    {/* ── JSON Preview (5 rows) ──────────────────────────── */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Preview output{" "}
                          <span className="text-muted-foreground font-normal">
                            (up to 5 rows)
                          </span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={fetchTransformPreview}
                          disabled={previewLoading || !transformScript.trim()}
                          className="h-7 px-2 text-xs cursor-pointer"
                        >
                          {previewLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Loading…
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Run Preview
                            </>
                          )}
                        </Button>
                      </div>

                      {previewError && (
                        <div className="text-xs text-destructive bg-destructive/10 rounded p-2 border border-destructive/20">
                          {previewError}
                        </div>
                      )}

                      {previewData !== null && previewData.length === 0 && (
                        <div className="text-xs text-muted-foreground p-3 bg-muted rounded border">
                          No records returned. Check that the source table has
                          data and the script does not filter all rows.
                        </div>
                      )}

                      {previewData !== null && previewData.length > 0 && (
                        <pre className="text-xs bg-muted rounded-md border p-3 overflow-x-auto max-h-64 leading-relaxed">
                          {JSON.stringify(previewData, null, 2)}
                        </pre>
                      )}

                      {previewData === null && !previewError && (
                        <p className="text-xs text-muted-foreground">
                          {transformScript.trim()
                            ? "Click Run Preview to see transformed output as JSON."
                            : "Write a transform script above to enable the preview."}
                        </p>
                      )}
                    </div>

                    {/* Custom SQL editor – only shown when mode is customSql
                        (hidden from UI tabs, but functional for future use) */}
                    {transformMode === "customSql" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Custom SQL
                        </Label>
                        <textarea
                          value={customSql}
                          onChange={(e) => setCustomSql(e.target.value)}
                          placeholder="SELECT id, UPPER(name) as name FROM {{source_table}}"
                          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={5}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use {"{{source_table}}"} as placeholder for the source
                          table (e.g. public.my_table).
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Schema tab ───────────────────────────────────────────── */}
                {activeConfigTab === "schema" && (
                  <div className="space-y-4">
                    {/* Output fields derived from script (read-only info) */}
                    {scriptOutputKeys.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Output fields{" "}
                          <span className="text-muted-foreground font-normal">
                            (derived from script)
                          </span>
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-md border bg-muted/40">
                          {scriptOutputKeys.map((key) => (
                            <span
                              key={key}
                              className="inline-flex items-center rounded px-2 py-0.5 text-xs font-mono bg-background border"
                            >
                              {key}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          These are the fields your script will write to the
                          destination. Go to the{" "}
                          <button
                            type="button"
                            className="underline hover:text-foreground"
                            onClick={() => setActiveConfigTab("script")}
                          >
                            Script tab
                          </button>{" "}
                          to edit the transform.
                        </p>
                      </div>
                    )}

                    {/* Primary key (for upsert) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Primary key{" "}
                        <span className="text-muted-foreground font-normal">
                          (for upsert)
                        </span>
                      </Label>
                      <div className="rounded-md border border-input p-3 space-y-1 max-h-52 overflow-y-auto">
                        {primaryKeyPool.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {transformScript.trim()
                              ? "Could not parse output fields from the script. Make sure your transform function has a return { … } statement with string keys."
                              : "Write a transform script on the Script tab — the output fields will appear here for primary key selection."}
                          </p>
                        ) : (
                          primaryKeyPool.map((col) => {
                            const fieldInfo = destinationFields.find(
                              (f) => f.name === col,
                            );
                            return (
                              <label
                                key={col}
                                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={upsertKey.includes(col)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUpsertKey((prev) => [...prev, col]);
                                    } else {
                                      setUpsertKey((prev) =>
                                        prev.filter((k) => k !== col),
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-input"
                                />
                                <span className="text-sm font-mono">{col}</span>
                                {fieldInfo && fieldInfo.type !== "unknown" && (
                                  <span className="text-xs text-muted-foreground">
                                    ({fieldInfo.type})
                                  </span>
                                )}
                                {upsertKey.includes(col) && (
                                  <span className="ml-auto text-xs text-primary font-medium">
                                    PK
                                  </span>
                                )}
                              </label>
                            );
                          })
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select one or more columns as the upsert key. Records
                        with the same key value will be overwritten on each
                        sync.
                      </p>
                    </div>
                  </div>
                )}

                {/* Debug info (dev only) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    <div>Source Fields: {sourceFields.length}</div>
                    <div>Destination Fields: {destinationFields.length}</div>
                    <div>
                      Script Output Keys:{" "}
                      {scriptOutputKeys.join(", ") || "none"}
                    </div>
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
