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
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useConnections, useSchemasWithTables } from "@/lib/api/hooks/use-data-sources";
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
  fieldMappings: Array<{ source: string; destination: string; isPrimaryKey?: boolean }>; // JSON array format with primary key flag
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
  const dataSources = connections?.map((conn) => ({
    id: conn.id,
    name: conn.name,
    type: "postgres" as const,
    status: conn.status === "active" ? ("connected" as const) : ("disconnected" as const),
    organizationId: conn.orgId,
    connectedAt: conn.lastConnectedAt || undefined,
    tables: [],
  })) || [];
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransform, setEditingTransform] = useState<string | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [selectedEmitterId, setSelectedEmitterId] = useState<string>("");
  const [selectedDestinationTable, setSelectedDestinationTable] = useState<string>("");
  const [transformName, setTransformName] = useState("");
  const [fieldMappings, setFieldMappings] = useState<Array<{ source: string; destination: string; isPrimaryKey?: boolean }>>([]);
  const [primaryKeyField, setPrimaryKeyField] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log when collectors prop changes
  useEffect(() => {
    console.log('TransformStep - Collectors prop changed:', {
      collectorsCount: collectors.length,
      collectors: collectors.map((c) => ({
        id: c.id,
        sourceId: c.sourceId,
        transformersCount: c.transformers?.length || 0,
        transformers: c.transformers?.map((t: any) => ({
          id: t.id,
          name: t.name,
          emitterId: t.emitterId,
          fieldMappingsCount: t.fieldMappings?.length || 0,
        })) || [],
      })),
    });
  }, [collectors]);

  // Get all emitters from all collectors (emitters are now stored at collector level)
  const allEmitters: Array<EmitterConfig & { collectorId: string; collectorName: string }> = 
    collectors.flatMap((collector) => {
      const source = dataSources.find((ds) => ds.id === collector.sourceId);
      const collectorName = source?.name || `Data Source ${collector.sourceId.slice(-6)}`;
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
      console.log('TransformStep - Found transformers for collector:', {
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
      const transform = (t as any) as TransformConfig;
      const emitter = allEmitters.find((e) => e.id === transform.emitterId);
      return {
        ...transform,
      collectorId: collector.id,
      collectorName: source?.name || `Data Source ${collector.sourceId.slice(-6)}`,
        emitterName: emitter?.destinationName || "Unknown",
        fieldMappings: transform.fieldMappings || [],
      };
    });
  });
  
  // Debug logging for all transforms
  console.log('TransformStep - All transforms:', {
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
    (c) => c.id === selectedCollectorId,
  );

  // Get available emitters for the selected collector
  const availableEmitters = useMemo(() => {
    if (!selectedCollectorId) return [];
    return allEmitters.filter((e) => e.collectorId === selectedCollectorId);
  }, [selectedCollectorId, allEmitters]);

  const selectedEmitter = availableEmitters.find((e) => e.id === selectedEmitterId);

  // Fetch schemas with tables for the destination connection
  const { data: destinationSchemas, isLoading: destinationSchemasLoading } = 
    useSchemasWithTables(selectedEmitter?.destinationId || "", orgId);

  // Flatten all tables from destination schemas
  const destinationTables = useMemo(() => {
    if (!destinationSchemas) return [];
    return destinationSchemas.flatMap((schema) =>
      schema.tables.map((table) => ({
        schema: schema.name,
        table: table.name,
        fullName: `${schema.name}.${table.name}`,
      }))
    );
  }, [destinationSchemas]);

  // Parse selected tables and prepare queries for source (collector)
  const sourceTableQueries = useMemo(() => {
    if (!selectedCollector || !selectedCollector.selectedTables || selectedCollector.selectedTables.length === 0) {
      return [];
    }
    
    return selectedCollector.selectedTables.map((tableName) => {
      const parts = tableName.includes('.') ? tableName.split('.') : ['public', tableName];
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
    queries: sourceTableQueries.map(({ tableName, schema, table, connectionId }) => ({
      queryKey: ['table-schema', connectionId, table, schema, 'source'],
      queryFn: () => DataSourcesService.getTableSchema(connectionId, table, schema, orgId),
      enabled: !!connectionId && !!table && !!orgId,
    })),
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
            type: col.dataType || 'unknown',
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
    
    const parts = selectedDestinationTable.includes('.') 
      ? selectedDestinationTable.split('.') 
      : ['public', selectedDestinationTable];
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
    queries: destinationTableQuery ? [{
      queryKey: ['table-schema', destinationTableQuery.connectionId, destinationTableQuery.table, destinationTableQuery.schema, 'destination'],
      queryFn: () => DataSourcesService.getTableSchema(
        destinationTableQuery.connectionId, 
        destinationTableQuery.table, 
        destinationTableQuery.schema, 
        orgId
      ),
      enabled: !!destinationTableQuery.connectionId && !!destinationTableQuery.table && !!orgId,
    }] : [],
  });

  // Build destination fields from fetched table schema
  const destinationFields = useMemo(() => {
    if (!destinationSchemaQuery[0]?.data?.columns) return [];
    
    return destinationSchemaQuery[0].data.columns.map((col) => ({
      name: col.name,
      type: col.dataType || 'unknown',
      table: destinationTableQuery?.tableName || '',
    }));
  }, [destinationSchemaQuery, destinationTableQuery]);

  const handleFieldMapping = (
    sourceField: string,
    destinationField: string,
  ) => {
    setFieldMappings((prev) => {
      const existing = prev.findIndex((m) => m.destination === destinationField);
      // Auto-set as primary key if this is the ID field
      const isPrimaryKey = destinationField.toLowerCase() === 'id' || destinationField === primaryKeyField;
      if (existing >= 0) {
        // Update existing mapping
        const updated = [...prev];
        updated[existing] = { source: sourceField, destination: destinationField, isPrimaryKey };
        // If this is ID field and no primary key set yet, set it
        if (destinationField.toLowerCase() === 'id' && !primaryKeyField) {
          setPrimaryKeyField(destinationField);
        }
        return updated;
      } else {
        // Add new mapping
        const newMapping = { source: sourceField, destination: destinationField, isPrimaryKey };
        // If this is ID field and no primary key set yet, set it
        if (destinationField.toLowerCase() === 'id' && !primaryKeyField) {
          setPrimaryKeyField(destinationField);
        }
        return [...prev, newMapping];
      }
    });
  };

  const handleRemoveMapping = (destinationField: string) => {
    setFieldMappings((prev) => prev.filter((m) => m.destination !== destinationField));
  };

  const handleAddTransform = () => {
    if (!selectedCollectorId || !selectedEmitterId || !transformName || !selectedDestinationTable) return;

    const newTransform: TransformConfig = {
      id: editingTransform || `transform_${Date.now()}`,
      name: transformName,
      collectorId: selectedCollectorId,
      emitterId: selectedEmitterId,
      fieldMappings,
      destinationTable: selectedDestinationTable, // Store selected destination table
      primaryKeyField: primaryKeyField || (fieldMappings.find(m => m.isPrimaryKey || m.destination.toLowerCase() === 'id')?.destination || ''),
    };

    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === selectedCollectorId) {
        const transformers = editingTransform
          ? collector.transformers.map((t) =>
              (t as any).id === editingTransform ? newTransform : t,
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
            (t) => (t as any).id !== transformId,
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
            (t as any).id === transformId ? { ...t, status: "published" as const } : t,
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
            (t as any).id === transformId ? { ...t, status: "paused" as const } : t,
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
    setPrimaryKeyField(transform.primaryKeyField || transform.fieldMappings?.find(m => m.isPrimaryKey || m.destination.toLowerCase() === 'id')?.destination || "");
    setShowAddDialog(true);
  };

  const handleContinue = () => {
    onComplete(collectors);
  };

  const filteredTransforms = allTransforms.filter((transform) => {
    if (!searchQuery) return true;
    return (
      transform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transform.collectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              disabled={!selectedCollectorId || !selectedEmitterId || !transformName || !selectedDestinationTable}
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
                        (ds) => ds.id === collector.sourceId,
                      );
                      const selectedTablesCount = collector.selectedTables?.length || 0;
                      const displayName = source?.name || `Data Source ${collector.sourceId.slice(-6)}`;
                      return (
                        <SelectItem key={collector.id} value={collector.id}>
                          <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1">{displayName}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {selectedTablesCount} table{selectedTablesCount !== 1 ? "s" : ""}
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
                          <span className="truncate flex-1">{emitter.destinationName}</span>
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
                            <span className="truncate flex-1">{table.fullName}</span>
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
                  <Label className="mb-4 block text-base font-semibold">Field Mapping</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20">
                    {/* Left: Fixed Destination Fields (Emitter) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <Label className="text-base font-semibold">Destination Fields (Fixed)</Label>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {destinationFields.length} fields
                        </Badge>
                      </div>
                      <ScrollArea className="h-[400px] md:h-[500px] rounded-lg border bg-card p-3">
                        {destinationSchemaQuery[0]?.isLoading ? (
                          <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-3 text-sm text-muted-foreground">Loading destination fields...</p>
                          </div>
                        ) : destinationSchemaQuery[0]?.isError ? (
                          <div className="py-12 text-center text-sm text-destructive">
                            <p className="font-medium">Error loading destination fields</p>
                            <p className="text-xs mt-1">Please try again</p>
                          </div>
                        ) : destinationFields.length === 0 ? (
                          <div className="py-12 text-center text-sm text-muted-foreground">
                            <p className="mb-2">No fields available.</p>
                            <p className="text-xs">
                              Select a destination table above to see available fields.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {destinationFields.map((field) => {
                              const mapping = fieldMappings.find((m) => m.destination === field.name);
                              return (
                                <div
                                  key={field.name}
                                  className={`group flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                                    mapping 
                                      ? "bg-primary/10 border-primary shadow-sm" 
                                      : "bg-card border-border"
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate text-foreground">
                                      {field.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {field.type}
                                    </p>
                                  </div>
                                  {mapping && (
                                    <Badge variant="default" className="shrink-0 text-xs">
                                      ✓ Mapped
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    {/* Right: Selectable Source Fields (Collector) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Label className="text-base font-semibold">Source Fields (Selectable)</Label>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {sourceFields.length} fields
                        </Badge>
                      </div>
                      <ScrollArea className="h-[400px] md:h-[500px] rounded-lg border bg-card p-3">
                        {sourceSchemaQueries.some(q => q.isLoading) ? (
                          <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-3 text-sm text-muted-foreground">Loading source fields...</p>
                          </div>
                        ) : sourceSchemaQueries.some(q => q.isError) ? (
                          <div className="py-12 text-center text-sm text-destructive">
                            <p className="font-medium">Error loading source fields</p>
                            <p className="text-xs mt-1">Please try again</p>
                      </div>
                    ) : sourceFields.length === 0 ? (
                          <div className="py-12 text-center text-sm text-muted-foreground">
                            <p>No fields available.</p>
                            <p className="text-xs mt-1">Make sure tables are selected in the collector.</p>
                      </div>
                    ) : (
                          <div className="space-y-2">
                            {sourceFields.map((field) => {
                              const mapping = fieldMappings.find((m) => m.source === field.name);
                              return (
                          <div
                            key={field.name}
                                  className={`group flex items-center gap-3 rounded-lg border-2 p-3 transition-all cursor-pointer ${
                                    mapping 
                                      ? "bg-primary/10 border-primary shadow-sm" 
                                      : "bg-card hover:bg-muted/50 hover:border-primary/50 border-border"
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate text-foreground">
                                  {field.name}
                                </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                  {field.table} • {field.type}
                                    </p>
                                  </div>
                                  {mapping && (
                                    <Badge variant="default" className="shrink-0 text-xs">
                                      ✓ Mapped
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Mapping Configuration - Destination to Source */}
                  <div className="mt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <Label className="text-base font-semibold">Map Source Fields to Destination Fields</Label>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {fieldMappings.length} mapping{fieldMappings.length !== 1 ? 's' : ''} created
                      </Badge>
                    </div>
                    <div className="space-y-3 max-h-[300px] md:max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2">
                      {destinationFields.map((destinationField) => {
                        const mapping = fieldMappings.find((m) => m.destination === destinationField.name);
                        const isIdField = destinationField.name.toLowerCase() === 'id';
                        return (
                          <div 
                            key={destinationField.name} 
                            className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 md:p-4 rounded-lg border-2 transition-all w-full ${
                              mapping 
                                ? "bg-primary/5 border-primary" 
                                : isIdField
                                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                                : "bg-card border-border hover:border-primary/50"
                            }`}
                          >
                            {/* Fixed Destination Field (Left) */}
                            <div className={`flex-1 rounded-lg border p-3 min-w-0 w-full lg:w-auto ${
                              isIdField 
                                ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" 
                                : "bg-green-50 dark:bg-green-900/10"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Database className={`h-3 w-3 shrink-0 ${
                                  isIdField 
                                    ? "text-amber-600 dark:text-amber-400" 
                                    : "text-green-600 dark:text-green-400"
                                }`} />
                                <p className={`text-xs font-medium ${
                                  isIdField 
                                    ? "text-amber-700 dark:text-amber-400" 
                                    : "text-green-700 dark:text-green-400"
                                }`}>
                                  {isIdField ? "ID (Required)" : "Destination"}
                                </p>
                              </div>
                              <p className="text-sm font-semibold truncate">{destinationField.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{destinationField.type}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 hidden lg:block self-center" />
                            {/* Selectable Source Field (Right) */}
                            <div className="flex-1 lg:flex-initial min-w-[200px] lg:min-w-[250px]">
                              <Select
                                value={mapping?.source || undefined}
                                onValueChange={(value) => {
                                  if (value && value.trim()) {
                                    handleFieldMapping(value, destinationField.name);
                                  }
                                }}
                                required={isIdField}
                              >
                                <SelectTrigger className={`w-full ${isIdField && !mapping ? "border-amber-300 dark:border-amber-700" : ""}`}>
                                  <SelectValue placeholder={isIdField ? "Select ID field (required)" : "Select source field"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {sourceFields.map((field) => {
                                    const isMappedToOther = fieldMappings.some(
                                      (m) => m.source === field.name && m.destination !== destinationField.name
                                    );
                                    return (
                                      <SelectItem 
                                        key={field.name} 
                                        value={field.name}
                                        disabled={isMappedToOther}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <span className="font-medium truncate">{field.name}</span>
                                          <span className="text-xs text-muted-foreground shrink-0">({field.type})</span>
                                          {isMappedToOther && (
                                            <Badge variant="outline" className="text-xs ml-auto shrink-0">
                                              Already mapped
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            {mapping && (
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Primary Key Toggle */}
                                <Button
                                  variant={mapping.isPrimaryKey ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 text-xs px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFieldMappings((prev) =>
                                      prev.map((m) =>
                                        m.destination === destinationField.name
                                          ? { ...m, isPrimaryKey: !m.isPrimaryKey }
                                          : m.destination === primaryKeyField
                                          ? { ...m, isPrimaryKey: false }
                                          : m,
                                      ),
                                    );
                                    if (mapping.isPrimaryKey) {
                                      setPrimaryKeyField("");
                                    } else {
                                      setPrimaryKeyField(destinationField.name);
                                    }
                                  }}
                                  title={mapping.isPrimaryKey ? "Remove as Primary Key" : "Set as Primary Key"}
                                >
                                  <Key className="h-3 w-3 mr-1" />
                                  {mapping.isPrimaryKey ? "PK" : "Set PK"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    if (mapping.isPrimaryKey) {
                                      setPrimaryKeyField("");
                                    }
                                    handleRemoveMapping(destinationField.name);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    {/* Primary Key Selection Info */}
                    {primaryKeyField && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Primary Key: <span className="font-mono">{primaryKeyField}</span>
                          </p>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          This field will be used to prevent duplicate entries during migration. Duplicate records with the same primary key value will be skipped.
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg bg-muted/50 p-3 border mt-4">
                      <p className="text-xs text-muted-foreground">
                        <strong>Note:</strong> Each destination field can be mapped to one source field. Mark a field as Primary Key (PK) to prevent duplicates. Mappings are stored as JSON array format: <code className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">[{"{source: \"field1\", destination: \"field2\", isPrimaryKey: true}"}]</code>
                      </p>
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
