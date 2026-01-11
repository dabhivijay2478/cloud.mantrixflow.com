"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Database,
  Edit,
  Loader2,
  Plus,
  Table,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SchemaTableNavigation } from "@/components/data-sources/schema-table-navigation";
import { DataTable, FormSheet } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useConnections,
  useSchemasWithTables,
} from "@/lib/api/hooks/use-data-sources";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export interface CollectorConfig {
  id: string;
  sourceId: string;
  selectedTables: string[];
  emitters?: Array<{
    id: string;
    transformId: string;
    destinationId: string;
    destinationName: string;
    destinationType: string;
    connectionConfig?: Record<string, string>;
  }>;
  transformers: Array<{
    id: string;
    name: string;
    collectorId?: string;
    emitterId?: string;
    fieldMappings?: Array<{ source: string; destination: string }>; // JSON array format
  }>;
}

interface CollectorStepProps {
  onComplete: (collectors: CollectorConfig[]) => void;
  initialCollectors?: CollectorConfig[];
}

export function CollectorStep({
  onComplete,
  initialCollectors = [],
}: CollectorStepProps) {
  // Get current organization from workspace store
  const { currentOrganization, datasets } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Fetch connections from API
  const { data: connections, isLoading: connectionsLoading } =
    useConnections(orgId);

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
      tables: [], // Will be populated when needed
    })) || [];

  const [collectors, setCollectors] =
    useState<CollectorConfig[]>(initialCollectors);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCollector, setEditingCollector] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  // Update collectors when initialCollectors prop changes (for edit mode)
  useEffect(() => {
    if (initialCollectors && initialCollectors.length > 0) {
      setCollectors(initialCollectors);
    }
  }, [initialCollectors]);

  const selectedSource = dataSources.find((ds) => ds.id === selectedSourceId);
  const _sourceDatasets = datasets.filter(
    (ds) => ds.dataSourceId === selectedSourceId,
  );

  // Fetch schemas with tables for the selected source
  const { data: schemas, isLoading: schemasLoading } = useSchemasWithTables(
    selectedSourceId,
    orgId,
  );

  // Flatten all tables from all schemas
  const _availableTables = schemas
    ? schemas.flatMap((schema) =>
        (schema.tables || []).map((table) => ({
          name:
            schema.name === "public"
              ? table.name
              : `${schema.name}.${table.name}`,
          schema: schema.name,
          tableName: table.name,
        })),
      )
    : [];

  const handleTableToggle = (tableName: string, schemaName: string) => {
    const fullTableName =
      schemaName === "public" ? tableName : `${schemaName}.${tableName}`;
    setSelectedTables((prev) =>
      prev.includes(fullTableName)
        ? prev.filter((t) => t !== fullTableName)
        : [...prev, fullTableName],
    );
  };

  const handleAddCollector = () => {
    if (selectedSourceId && selectedTables.length > 0) {
      const newCollector: CollectorConfig = {
        id: editingCollector || `collector_${Date.now()}`,
        sourceId: selectedSourceId,
        selectedTables,
        transformers: [],
      };

      if (editingCollector) {
        setCollectors((prev) =>
          prev.map((c) => (c.id === editingCollector ? newCollector : c)),
        );
      } else {
        setCollectors([...collectors, newCollector]);
      }

      setShowAddDialog(false);
      setEditingCollector(null);
      setSelectedSourceId("");
      setSelectedTables([]);
    }
  };

  const handleDeleteCollector = (id: string) => {
    setCollectors(collectors.filter((c) => c.id !== id));
  };

  const handleEditCollector = (collector: CollectorConfig) => {
    setEditingCollector(collector.id);
    setSelectedSourceId(collector.sourceId);
    setSelectedTables(collector.selectedTables);
    setShowAddDialog(true);
  };

  const handleContinue = () => {
    if (collectors.length > 0) {
      onComplete(collectors);
    }
  };

  const columns: ColumnDef<CollectorConfig>[] = [
    {
      accessorKey: "sourceId",
      header: "Source",
      cell: ({ row }) => {
        const source = dataSources.find(
          (ds) => ds.id === row.original.sourceId,
        );
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{source?.name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">
                {source?.type || ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "selectedTables",
      header: "Tables",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.selectedTables.map((table) => (
            <Badge key={table} variant="secondary" className="text-xs">
              <Table className="h-3 w-3 mr-1" />
              {table}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "transformers",
      header: "Transformers",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.transformers.length} transformer
          {row.original.transformers.length !== 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const collector = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleEditCollector(collector);
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
                handleDeleteCollector(collector.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Show loading or no org message
  if (!orgId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No organization selected
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please select an organization from the sidebar to view data sources
          </p>
        </CardContent>
      </Card>
    );
  }

  if (connectionsLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Loading data sources...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="cursor-pointer"
          disabled={dataSources.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Collector
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={collectors}
        isLoading={false}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter collectors..."
        defaultVisibleColumns={[
          "sourceId",
          "selectedTables",
          "transformers",
          "actions",
        ]}
        fixedColumns={["sourceId", "actions"]}
        emptyMessage="No collectors configured"
        emptyDescription="Add at least one collector to start your pipeline"
      />

      {/* Add/Edit Collector Sheet */}
      <FormSheet
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title={editingCollector ? "Edit Collector" : "Add Collector"}
        description="Select a data source and choose tables to collect"
        maxWidth="3xl"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddCollector}
              disabled={!selectedSourceId || selectedTables.length === 0}
              className="w-full sm:w-auto"
            >
              {editingCollector ? "Update" : "Add"} Collector
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-source-select">Data Source</Label>
            <Select
              value={selectedSourceId}
              onValueChange={(value) => {
                setSelectedSourceId(value);
                setSelectedTables([]);
              }}
            >
              <SelectTrigger id="data-source-select" className="w-full">
                <SelectValue placeholder="Select a data source">
                  {selectedSource && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 shrink-0" />
                      <span className="truncate">{selectedSource.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dataSources.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {connectionsLoading ? (
                      "Loading data sources..."
                    ) : (
                      <>
                        No data sources available.
                        <br />
                        <span className="text-xs">
                          Create a connection in Data Sources first.
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  dataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 shrink-0" />
                        <span className="truncate">{source.name}</span>
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs shrink-0"
                        >
                          {source.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedSourceId && (
            <div className="space-y-2">
              <Label htmlFor="tables-select">Select Tables</Label>
              {schemasLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading schemas and tables...
                </div>
              ) : !schemas || schemas.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No schemas or tables available for this source
                </div>
              ) : (
                <div className="border rounded-lg bg-muted/30 overflow-hidden flex flex-col h-[400px] sm:h-[500px]">
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <SchemaTableNavigation
                      schemas={schemas}
                      onTableSelect={(tableName, schemaName) => {
                        handleTableToggle(tableName, schemaName);
                      }}
                      selectedTables={new Set(selectedTables)}
                      searchable={true}
                      isLoading={false}
                    />
                  </div>
                  {selectedTables.length > 0 && (
                    <div className="border-t p-2 sm:p-3 bg-background shrink-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <span className="text-xs sm:text-sm font-medium">
                          Selected: {selectedTables.length} table
                          {selectedTables.length !== 1 ? "s" : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTables([])}
                          className="h-7 text-xs w-full sm:w-auto"
                        >
                          Clear All
                        </Button>
                      </div>
                      <ScrollArea className="max-h-[100px] sm:max-h-[120px]">
                        <div className="flex flex-wrap gap-1.5 pr-2">
                          {selectedTables.map((table) => (
                            <Badge
                              key={table}
                              variant="secondary"
                              className="text-xs flex items-center gap-1 max-w-full"
                            >
                              <Table className="h-3 w-3 shrink-0" />
                              <span className="truncate">{table}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTables((prev) =>
                                    prev.filter((t) => t !== table),
                                  );
                                }}
                                className="ml-1 hover:text-destructive shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </FormSheet>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleContinue}
          disabled={collectors.length === 0}
          size="lg"
          className="w-full sm:w-auto cursor-pointer"
        >
          Continue to Emitter
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
