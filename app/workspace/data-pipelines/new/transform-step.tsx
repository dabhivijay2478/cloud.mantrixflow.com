"use client";

import {
  ArrowRight,
  Database,
  Edit,
  Key,
  Map as MapIcon,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormSheet } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import {
  useConnections,
  useSchemasWithTables,
} from "@/lib/api/hooks/use-data-sources";
import { DataSourcesService } from "@/lib/api/services/data-sources.service";
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
  }>; // JSON array format with primary key flag
  destinationTable?: string; // Selected destination table (schema.table format)
  primaryKeyField?: string; // Explicitly defined primary key field name
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
      type: "postgres" as const,
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
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log when collectors prop changes
  useEffect(() => {
    console.log("TransformStep - Collectors prop changed:", {
      collectorsCount: collectors.length,
      collectors: collectors.map((c) => ({
        id: c.id,
        sourceId: c.sourceId,
        transformersCount: c.transformers?.length || 0,
        transformers:
          c.transformers?.map((t: any) => ({
            id: t.id,
            name: t.name,
            emitterId: t.emitterId,
            fieldMappingsCount: t.fieldMappings?.length || 0,
          })) || [],
      })),
    });
  }, [collectors]);

  // Get all emitters from all collectors (emitters are now stored at collector level)
  const allEmitters: Array<
    EmitterConfig & { collectorId: string; collectorName: string }
  > = collectors.flatMap((collector) => {
    const source = dataSources.find((ds) => ds.id === collector.sourceId);
    const collectorName =
      source?.name || `Data Source ${collector.sourceId.slice(-6)}`;
    return ((collector as any).emitters || []).map((e: EmitterConfig) => ({
      ...e,
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

    // Debug logging
    if (collectorTransformers.length > 0) {
      console.log("TransformStep - Found transformers for collector:", {
        collectorId: collector.id,
        transformersCount: collectorTransformers.length,
        transformers: collectorTransformers.map((t: any) => ({
          id: t.id,
          name: t.name,
          emitterId: t.emitterId,
          fieldMappingsCount: t.fieldMappings?.length || 0,
        })),
      });
    }

    return collectorTransformers.map((t) => {
      const transform = t as any as TransformConfig;
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

  // Debug logging for all transforms
  console.log("TransformStep - All transforms:", {
    collectorsCount: collectors.length,
    allTransformsCount: allTransforms.length,
    allTransforms: allTransforms.map((t) => ({
      id: t.id,
      name: t.name,
      collectorId: t.collectorId,
      emitterId: t.emitterId,
      fieldMappingsCount: t.fieldMappings?.length || 0,
    })),
  });

  const selectedCollector = collectors.find(
    (c) => c.id === selectedCollectorId
  );

  // Get available emitters for the selected collector
  const availableEmitters = useMemo(() => {
    if (!selectedCollectorId) return [];
    return allEmitters.filter((e) => e.collectorId === selectedCollectorId);
  }, [selectedCollectorId, allEmitters]);

  const selectedEmitter = availableEmitters.find(
    (e) => e.id === selectedEmitterId
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
      }))
    );
  }, [destinationSchemas]);

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
      const parts = tableName.includes(".")
        ? tableName.split(".")
        : ["public", tableName];
      const schema = parts[0];
      const table = parts[1];

      return {
        tableName,
        schema,
        table,
        connectionId: selectedCollector.sourceId,
      };
    });
  }, [selectedCollector]);

  // Fetch schemas for source tables
  const sourceSchemaQueries = useQueries({
    queries: sourceTableQueries.map(
      ({ tableName, schema, table, connectionId }) => ({
        queryKey: ["table-schema", connectionId, table, schema, "source"],
        queryFn: () =>
          DataSourcesService.getTableSchema(connectionId, table, schema, orgId),
        enabled: !!connectionId && !!table && !!orgId,
      })
    ),
  });

  // Build source fields from fetched table schemas
  const sourceFields = useMemo(() => {
    const fields: Array<{ name: string; type: string; table: string }> = [];

    sourceSchemaQueries.forEach((query, index) => {
      if (query.data && query.data.columns) {
        const tableInfo = sourceTableQueries[index];
        query.data.columns.forEach((col) => {
          fields.push({
            name: `${tableInfo.tableName}.${col.name}`,
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
            return Promise.resolve({ columns: [] } as any);
          }
          return DataSourcesService.getTableSchema(
            destinationTableQuery.connectionId,
            destinationTableQuery.table,
            destinationTableQuery.schema,
            orgId
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
    if (!queryResult?.data?.columns) return [];

    return queryResult.data.columns.map(
      (col: { name: string; dataType?: string }) => ({
        name: col.name,
        type: col.dataType || "unknown",
        table: destinationTableQuery.tableName || "",
      })
    );
  }, [destinationSchemaQuery, destinationTableQuery]);

  const handleFieldMapping = (
    sourceField: string,
    destinationField: string
  ) => {
    setFieldMappings((prev) => {
      const existing = prev.findIndex(
        (m) => m.destination === destinationField
      );
      // Auto-set as primary key if this is the ID field
      const isPrimaryKey =
        destinationField.toLowerCase() === "id" ||
        destinationField === primaryKeyField;

      // If setting this as PK, remove PK from all other fields
      const shouldSetAsPK =
        isPrimaryKey || destinationField.toLowerCase() === "id";

      if (existing >= 0) {
        // Update existing mapping
        const updated = prev.map((m) => {
          if (m.destination === destinationField) {
            return {
              source: sourceField,
              destination: destinationField,
              isPrimaryKey: shouldSetAsPK,
            };
          }
          // Remove PK from all other fields if this one is being set as PK
          if (shouldSetAsPK && m.isPrimaryKey) {
            return { ...m, isPrimaryKey: false };
          }
          return m;
        });

        // Update primary key field state
        if (shouldSetAsPK) {
          setPrimaryKeyField(destinationField);
        } else if (destinationField === primaryKeyField) {
          setPrimaryKeyField("");
        }

        return updated;
      } else {
        // Add new mapping - remove PK from all existing fields if this is being set as PK
        const updated = prev.map((m) =>
          shouldSetAsPK && m.isPrimaryKey ? { ...m, isPrimaryKey: false } : m
        );

        const newMapping = {
          source: sourceField,
          destination: destinationField,
          isPrimaryKey: shouldSetAsPK,
        };

        // Update primary key field state
        if (shouldSetAsPK) {
          setPrimaryKeyField(destinationField);
        }

        return [...updated, newMapping];
      }
    });
  };

  const handleRemoveMapping = (destinationField: string) => {
    setFieldMappings((prev) =>
      prev.filter((m) => m.destination !== destinationField)
    );
  };

  const handleAddTransform = () => {
    if (
      !selectedCollectorId ||
      !selectedEmitterId ||
      !transformName ||
      !selectedDestinationTable
    )
      return;

    const newTransform: TransformConfig = {
      id: editingTransform || `transform_${Date.now()}`,
      name: transformName,
      collectorId: selectedCollectorId,
      emitterId: selectedEmitterId,
      fieldMappings,
      destinationTable: selectedDestinationTable, // Store selected destination table
      primaryKeyField:
        primaryKeyField ||
        fieldMappings.find(
          (m) => m.isPrimaryKey || m.destination.toLowerCase() === "id"
        )?.destination ||
        "",
    };

    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === selectedCollectorId) {
        const transformers = editingTransform
          ? collector.transformers.map((t) =>
              (t as any).id === editingTransform ? newTransform : t
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
  };

  const handleDeleteTransform = (collectorId: string, transformId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        return {
          ...collector,
          transformers: collector.transformers.filter(
            (t) => (t as any).id !== transformId
          ),
        };
      }
      return collector;
    });
    onComplete(updatedCollectors);
  };

  const handlePublishTransform = (collectorId: string, transformId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        return {
          ...collector,
          transformers: collector.transformers.map((t) =>
            (t as any).id === transformId
              ? { ...t, status: "published" as const }
              : t
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
            (t as any).id === transformId
              ? { ...t, status: "paused" as const }
              : t
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
          (m) => m.isPrimaryKey || m.destination.toLowerCase() === "id"
        )?.destination ||
        ""
    );
    setShowAddDialog(true);
  };

  const handleContinue = () => {
    onComplete(collectors);
  };

  const filteredTransforms = allTransforms.filter((transform) => {
    if (!searchQuery) return true;
    return (
      transform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transform.collectorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transform.emitterName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
      accessorKey: "fieldMappings",
      header: "Fields Mapped",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.fieldMappings?.length || 0} fields
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const transform = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {transform.status === "paused" || !transform.status ? (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePublishTransform(transform.collectorId, transform.id);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Publish</span>
                <span className="sm:hidden">Publish</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePauseTransform(transform.collectorId, transform.id);
                }}
              >
                <Pause className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Pause</span>
                <span className="sm:hidden">Pause</span>
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
      {/* Search and Add Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transformers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="sm:size-default"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Transformer</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Transforms Table */}
      {allTransforms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No transformers configured
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add transformers to map fields from collectors to emitters
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add First Transformer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <DataTable columns={columns} data={filteredTransforms} />
          </CardContent>
        </Card>
      )}

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
              className="w-full sm:w-auto"
            >
              {editingTransform ? "Update" : "Add"} Transformer
            </Button>
          </div>
        }
      >
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Collector</Label>
              <Select
                value={selectedCollectorId}
                onValueChange={(value) => {
                  setSelectedCollectorId(value);
                  setSelectedEmitterId("");
                  setFieldMappings([]);
                }}
                disabled={!!editingTransform}
              >
                <SelectTrigger>
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
                        (ds) => ds.id === collector.sourceId
                      );
                      const selectedTablesCount =
                        collector.selectedTables?.length || 0;
                      const displayName =
                        source?.name ||
                        `Data Source ${collector.sourceId.slice(-6)}`;
                      return (
                        <SelectItem key={collector.id} value={collector.id}>
                          <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1">
                              {displayName}
                            </span>
                            <Badge
                              variant="outline"
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
            <div className="space-y-2">
              <Label>Emitter</Label>
              <Select
                value={selectedEmitterId}
                onValueChange={(value) => {
                  setSelectedEmitterId(value);
                  setSelectedDestinationTable("");
                  setFieldMappings([]);
                }}
                disabled={!!editingTransform || !selectedCollectorId}
              >
                <SelectTrigger>
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
                          <Database className="h-4 w-4 shrink-0" />
                          <span className="truncate flex-1">
                            {emitter.destinationName}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transform Name</Label>
              <Input
                value={transformName}
                onChange={(e) => setTransformName(e.target.value)}
                placeholder="e.g., Customer Data Transform"
              />
            </div>
          </div>

          {selectedCollectorId && selectedEmitterId && (
            <div className="space-y-4">
              {/* Destination Table Selection */}
              <div className="space-y-2">
                <Label>Destination Table</Label>
                <Select
                  value={selectedDestinationTable}
                  onValueChange={(value) => {
                    setSelectedDestinationTable(value);
                    setFieldMappings([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination table" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationSchemasLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading tables...
                      </div>
                    ) : destinationTables.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tables available in destination
                      </div>
                    ) : (
                      destinationTables.map((table) => (
                        <SelectItem key={table.fullName} value={table.fullName}>
                          <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1">
                              {table.fullName}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the destination table to map fields to
                </p>
              </div>

              {/* Side-by-side Field Mapping */}
              {selectedDestinationTable && (
                <div>
                  {/* Mapping Configuration - Destination to Source */}
                  <div className="mt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <Label className="text-base font-semibold">
                        Map Source Fields to Destination Fields
                      </Label>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {fieldMappings.length} mapping
                        {fieldMappings.length !== 1 ? "s" : ""} created
                      </Badge>
                    </div>
                    {/* Table Layout */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10 border-b">
                            <TableRow>
                              <TableHead className="w-12 text-center">
                                #
                              </TableHead>
                              <TableHead className="min-w-[200px]">
                                Destination Field
                              </TableHead>
                              <TableHead className="min-w-[250px]">
                                Source Field
                              </TableHead>
                              <TableHead className="w-32 text-center">
                                Primary Key
                              </TableHead>
                              <TableHead className="w-20 text-center">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {destinationFields.map(
                              (
                                destinationField: {
                                  name: string;
                                  type: string;
                                  table: string;
                                },
                                index: number
                              ) => {
                                const mapping = fieldMappings.find(
                                  (m) => m.destination === destinationField.name
                                );
                                const isIdField =
                                  destinationField.name.toLowerCase() === "id";
                                const isPrimaryKey =
                                  mapping?.isPrimaryKey || false;
                                const hasPrimaryKey = !!primaryKeyField;
                                const canSetPrimaryKey =
                                  !hasPrimaryKey || isPrimaryKey;

                                return (
                                  <TableRow
                                    key={destinationField.name}
                                    className={`${
                                      mapping
                                        ? isPrimaryKey
                                          ? "bg-primary/5 hover:bg-primary/10"
                                          : "bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                                        : isIdField
                                        ? "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30"
                                        : "hover:bg-muted/50"
                                    } transition-colors`}
                                  >
                                    {/* Row Number */}
                                    <TableCell className="text-center text-muted-foreground font-medium">
                                      {index + 1}
                                    </TableCell>

                                    {/* Destination Field */}
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                                            isIdField
                                              ? "bg-amber-100 dark:bg-amber-900/40"
                                              : isPrimaryKey
                                              ? "bg-primary/20"
                                              : "bg-green-100 dark:bg-green-900/40"
                                          }`}
                                        >
                                          <Database
                                            className={`h-4 w-4 ${
                                              isIdField
                                                ? "text-amber-600 dark:text-amber-400"
                                                : isPrimaryKey
                                                ? "text-primary"
                                                : "text-green-600 dark:text-green-400"
                                            }`}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm truncate">
                                              {destinationField.name}
                                            </p>
                                            {isPrimaryKey && (
                                              <Badge
                                                variant="default"
                                                className="h-5 px-1.5 text-[10px] shrink-0"
                                              >
                                                PK
                                              </Badge>
                                            )}
                                            {isIdField && !mapping && (
                                              <Badge
                                                variant="outline"
                                                className="h-5 px-1.5 text-[10px] shrink-0 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                                              >
                                                Required
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                            {destinationField.type}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>

                                    {/* Source Field Select */}
                                    <TableCell>
                                      <Select
                                        value={mapping?.source || undefined}
                                        onValueChange={(value) => {
                                          if (value && value.trim()) {
                                            handleFieldMapping(
                                              value,
                                              destinationField.name
                                            );
                                          }
                                        }}
                                        required={isIdField}
                                      >
                                        <SelectTrigger
                                          className={`w-full ${
                                            isIdField && !mapping
                                              ? "border-amber-300 dark:border-amber-700"
                                              : mapping
                                              ? "border-primary/50"
                                              : ""
                                          }`}
                                        >
                                          <SelectValue
                                            placeholder={
                                              isIdField
                                                ? "Select ID field (required)"
                                                : "Select source field"
                                            }
                                          >
                                            {mapping && (
                                              <div className="flex flex-col items-start gap-0.5 text-left">
                                                <span className="font-medium text-sm">
                                                  {mapping.source
                                                    .split(".")
                                                    .pop() || mapping.source}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                  {mapping.source}
                                                </span>
                                              </div>
                                            )}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {sourceFields.map((field) => {
                                            // Allow same source field to be mapped to multiple destinations
                                            const mappedToOther =
                                              fieldMappings.filter(
                                                (m) =>
                                                  m.source === field.name &&
                                                  m.destination !==
                                                    destinationField.name
                                              );
                                            const isCurrentlyMapped =
                                              fieldMappings.some(
                                                (m) =>
                                                  m.source === field.name &&
                                                  m.destination ===
                                                    destinationField.name
                                              );
                                            return (
                                              <SelectItem
                                                key={field.name}
                                                value={field.name}
                                              >
                                                <div className="flex items-center gap-2 w-full">
                                                  <span className="font-medium truncate">
                                                    {field.name}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground shrink-0">
                                                    ({field.type})
                                                  </span>
                                                  {mappedToOther.length > 0 && (
                                                    <Badge
                                                      variant="secondary"
                                                      className="text-xs ml-auto shrink-0"
                                                    >
                                                      +{mappedToOther.length}
                                                    </Badge>
                                                  )}
                                                  {isCurrentlyMapped && (
                                                    <Badge
                                                      variant="default"
                                                      className="text-xs ml-auto shrink-0"
                                                    >
                                                      Current
                                                    </Badge>
                                                  )}
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>

                                    {/* Primary Key Toggle */}
                                    <TableCell className="text-center">
                                      {mapping ? (
                                        <Button
                                          variant={
                                            isPrimaryKey ? "default" : "outline"
                                          }
                                          size="sm"
                                          className={`h-8 w-8 p-0 ${
                                            isPrimaryKey
                                              ? "bg-primary hover:bg-primary/90"
                                              : canSetPrimaryKey
                                              ? "hover:border-primary/50"
                                              : "opacity-50 cursor-not-allowed"
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!canSetPrimaryKey) return;

                                            const willBePrimaryKey =
                                              !mapping.isPrimaryKey;

                                            setFieldMappings((prev) =>
                                              prev.map((m) => {
                                                // Toggle PK for this field
                                                if (
                                                  m.destination ===
                                                  destinationField.name
                                                ) {
                                                  return {
                                                    ...m,
                                                    isPrimaryKey:
                                                      willBePrimaryKey,
                                                  };
                                                }
                                                // Remove PK from all other fields if setting this as PK
                                                if (
                                                  willBePrimaryKey &&
                                                  m.isPrimaryKey
                                                ) {
                                                  return {
                                                    ...m,
                                                    isPrimaryKey: false,
                                                  };
                                                }
                                                return m;
                                              })
                                            );

                                            // Update primary key field state
                                            if (willBePrimaryKey) {
                                              setPrimaryKeyField(
                                                destinationField.name
                                              );
                                            } else {
                                              setPrimaryKeyField("");
                                            }
                                          }}
                                          disabled={!canSetPrimaryKey}
                                          title={
                                            isPrimaryKey
                                              ? "Remove as Primary Key"
                                              : hasPrimaryKey
                                              ? "Another field is already set as Primary Key"
                                              : "Set as Primary Key"
                                          }
                                        >
                                          <Key
                                            className={`h-4 w-4 ${
                                              isPrimaryKey
                                                ? "text-primary-foreground"
                                                : ""
                                            }`}
                                          />
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          -
                                        </span>
                                      )}
                                    </TableCell>

                                    {/* Delete Action */}
                                    <TableCell className="text-center">
                                      {mapping ? (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() => {
                                            if (mapping.isPrimaryKey) {
                                              setPrimaryKeyField("");
                                            }
                                            handleRemoveMapping(
                                              destinationField.name
                                            );
                                          }}
                                          title="Remove mapping"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          -
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
          
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormSheet>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          Create Pipeline
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
