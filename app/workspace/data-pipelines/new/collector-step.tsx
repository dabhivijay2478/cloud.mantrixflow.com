"use client";

import {
  ArrowRight,
  CheckCircle2,
  Database,
  Edit,
  Plus,
  Search,
  Table,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormSheet } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

export interface CollectorConfig {
  id: string;
  sourceId: string;
  selectedTables: string[];
  transformers: Array<{
    id: string;
    name: string;
    fieldMappings?: Record<string, string>;
    jsonSchema?: string;
    emitters?: Array<{
      id: string;
      transformId: string;
      destinationId: string;
      destinationName: string;
      destinationType: string;
      connectionConfig: Record<string, string>;
    }>;
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
  const { dataSources, datasets } = useWorkspaceStore();
  const [collectors, setCollectors] =
    useState<CollectorConfig[]>(initialCollectors);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCollector, setEditingCollector] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const selectedSource = dataSources.find((ds) => ds.id === selectedSourceId);
  const sourceDatasets = datasets.filter(
    (ds) => ds.dataSourceId === selectedSourceId,
  );

  const availableTables = selectedSource
    ? sourceDatasets.length > 0
      ? sourceDatasets.map((ds) => ds.sourceName)
      : selectedSource.tables || []
    : [];

  const handleTableToggle = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName],
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

  const filteredCollectors = collectors.filter((collector) => {
    if (!searchQuery) return true;
    const source = dataSources.find((ds) => ds.id === collector.sourceId);
    return (
      source?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collector.selectedTables.some((table) =>
        table.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search collectors..."
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
          <span className="hidden sm:inline">Add Collector</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Collectors Table */}
      {collectors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No collectors configured
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add at least one collector to start your pipeline
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add First Collector
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <DataTable columns={columns} data={filteredCollectors} />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Collector Sheet */}
      <FormSheet
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title={editingCollector ? "Edit Collector" : "Add Collector"}
        description="Select a data source and choose tables to collect"
        maxWidth="2xl"
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
            <label className="text-sm font-medium">Data Source</label>
            <Select
              value={selectedSourceId}
              onValueChange={(value) => {
                setSelectedSourceId(value);
                setSelectedTables([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a data source">
                  {selectedSource && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{selectedSource.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dataSources.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No data sources available
                  </div>
                ) : (
                  dataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>{source.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
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
              <label className="text-sm font-medium">Select Tables</label>
              {availableTables.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No tables available for this source
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
                  {availableTables.map((tableName) => {
                    const isSelected = selectedTables.includes(tableName);
                    return (
                      <Card
                        key={tableName}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md relative",
                          isSelected && "ring-2 ring-primary border-primary",
                        )}
                        onClick={() => handleTableToggle(tableName)}
                      >
                        {isSelected && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-5 w-5 text-destructive hover:text-destructive z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTableToggle(tableName);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Table
                              className={cn(
                                "h-4 w-4",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span className="text-sm font-medium">
                              {tableName}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
          className="w-full sm:w-auto"
        >
          Continue to Transform
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
