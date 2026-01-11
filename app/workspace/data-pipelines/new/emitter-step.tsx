"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Edit,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { DataTable, FormSheet } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useConnections } from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import type { CollectorConfig } from "./collector-step";

interface EmitterStepProps {
  collectors: CollectorConfig[];
  onComplete: (collectors: CollectorConfig[]) => void;
}

export interface EmitterConfig {
  id: string;
  transformId: string;
  destinationId: string;
  destinationName: string;
  destinationType: string;
  connectionConfig: Record<string, string>;
}

export function EmitterStep({ collectors, onComplete }: EmitterStepProps) {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Fetch connections from API instead of workspace store
  const { data: connections, isLoading: connectionsLoading } =
    useConnections(orgId);

  // Convert API connections to destination format
  // All connections from the PostgreSQL endpoint are PostgreSQL connections
  // Emitters don't need connection config fields - they use existing connections
  const availableDestinations = (connections || []).map((conn) => ({
    id: conn.id,
    name: conn.name,
    type: "database",
    icon: Database,
  }));

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
  const [editingEmitter, setEditingEmitter] = useState<string | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [selectedDestinationId, setSelectedDestinationId] =
    useState<string>("");
  const [_configValues, setConfigValues] = useState<Record<string, string>>({});

  // Get all emitters from all collectors (emitters are now stored at collector level)
  const allEmitters: Array<
    EmitterConfig & { collectorName: string; collectorId: string }
  > = collectors.flatMap((collector) => {
    const source = dataSources.find((ds) => ds.id === collector.sourceId);
    const collectorName =
      source?.name || `Data Source ${collector.sourceId.slice(-6)}`;
    // Emitters are stored directly on collectors, not on transformers
    return (collector.emitters || []).map((e) => ({
      ...e,
      connectionConfig: e.connectionConfig || {},
      collectorId: collector.id,
      collectorName,
    }));
  });

  const selectedDestination = availableDestinations.find(
    (d) => d.id === selectedDestinationId,
  );

  const _handleConfigChange = (key: string, value: string) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddEmitter = () => {
    if (!selectedCollectorId || !selectedDestination) return;

    // Emitters don't need connection config - they use the existing connection via destinationId
    // Emitters are now associated with collectors, not transformers
    const newEmitter: EmitterConfig = {
      id: editingEmitter || `emitter_${Date.now()}`,
      transformId: "", // Will be set when transformer is created
      destinationId: selectedDestination.id,
      destinationName: selectedDestination.name,
      destinationType: selectedDestination.type,
      connectionConfig: {}, // Empty - connection is referenced by destinationId
    };

    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === selectedCollectorId) {
        const emitters = editingEmitter
          ? (collector.emitters || []).map((e) =>
              e.id === editingEmitter
                ? newEmitter
                : { ...e, connectionConfig: e.connectionConfig || {} },
            )
          : [...(collector.emitters || []), newEmitter];
        return { ...collector, emitters };
      }
      return collector;
    });

    onComplete(updatedCollectors);
    setShowAddDialog(false);
    setEditingEmitter(null);
    setSelectedCollectorId("");
    setSelectedDestinationId("");
    setConfigValues({});
  };

  const handleDeleteEmitter = (collectorId: string, emitterId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        const emitters = (collector.emitters || []).filter(
          (e) => e.id !== emitterId,
        );
        return { ...collector, emitters };
      }
      return collector;
    });
    onComplete(updatedCollectors);
  };

  const handleEditEmitter = (
    emitter: EmitterConfig & { collectorId: string },
  ) => {
    setEditingEmitter(emitter.id);
    setSelectedCollectorId(emitter.collectorId);
    setSelectedDestinationId(emitter.destinationId);
    setConfigValues(emitter.connectionConfig);
    setShowAddDialog(true);
  };

  const handleCreate = () => {
    onComplete(collectors);
  };

  const isConfigValid = () => {
    // Emitters only need a collector and destination selected - no connection config required
    return !!selectedCollectorId && !!selectedDestination;
  };

  type EmitterTableRow = EmitterConfig & {
    collectorName: string;
    collectorId: string;
  };

  const columns: ColumnDef<EmitterTableRow>[] = [
    {
      accessorKey: "collectorName",
      header: "Collector",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.collectorName}
        </Badge>
      ),
    },
    {
      accessorKey: "destinationName",
      header: "Destination",
      cell: ({ row }) => {
        const destination = availableDestinations.find(
          (d) => d.id === row.original.destinationId,
        );
        const Icon = destination?.icon || Database;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium">{row.original.destinationName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "destinationType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {row.original.destinationType}
        </Badge>
      ),
    },
    {
      accessorKey: "connectionConfig",
      header: "Configuration",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(row.original.connectionConfig)
            .filter(
              ([key]) =>
                key !== "password" &&
                key !== "secretAccessKey" &&
                key !== "apiKey" &&
                key !== "credentials",
            )
            .slice(0, 3)
            .map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="text-xs font-normal"
              >
                {key}: {value?.toString().slice(0, 10)}
                {value && value.length > 10 ? "..." : ""}
              </Badge>
            ))}
          {Object.keys(row.original.connectionConfig).filter(
            (k) =>
              k !== "password" &&
              k !== "secretAccessKey" &&
              k !== "apiKey" &&
              k !== "credentials",
          ).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{Object.keys(row.original.connectionConfig).length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const emitter = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleEditEmitter(emitter);
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
                handleDeleteEmitter(emitter.collectorId, emitter.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredEmitters = allEmitters.filter((emitter) => {
    if (!searchQuery) return true;
    return (
      emitter.destinationName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      emitter.collectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emitter.destinationType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
          Add Emitter
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={allEmitters}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter emitters..."
        defaultVisibleColumns={[
          "collectorName",
          "destinationName",
          "destinationType",
          "connectionConfig",
          "actions",
        ]}
        fixedColumns={["collectorName", "actions"]}
        emptyMessage="No emitters configured"
        emptyDescription="Add emitters to send transformed data to destinations"
      />

      {/* Add/Edit Emitter Sheet */}
      <FormSheet
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title={editingEmitter ? "Edit Emitter" : "Add Emitter"}
        description="Select a transformer and configure destination connection"
        maxWidth="2xl"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddEmitter}
              disabled={!isConfigValid()}
              className="w-full sm:w-auto"
            >
              {editingEmitter ? "Update" : "Add"} Emitter
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Collector</Label>
            <Select
              value={selectedCollectorId}
              onValueChange={(value) => {
                setSelectedCollectorId(value);
                setSelectedDestinationId("");
                setConfigValues({});
              }}
              disabled={!!editingEmitter}
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
                    const selectedTablesCount =
                      collector.selectedTables?.length || 0;
                    const displayName =
                      source?.name ||
                      `Data Source ${collector.sourceId.slice(-6)}`;
                    return (
                      <SelectItem key={collector.id} value={collector.id}>
                        <div className="flex items-center gap-2 w-full">
                          <Database className="h-4 w-4 shrink-0" />
                          <span className="truncate flex-1">{displayName}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
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

          {selectedCollectorId && (
            <div className="space-y-2">
              <Label>Destination</Label>
              {!orgId ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No organization selected. Please select an organization from
                  the sidebar.
                </div>
              ) : connectionsLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading data sources...
                </div>
              ) : availableDestinations.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No PostgreSQL data sources available. Please connect a
                  PostgreSQL data source first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableDestinations.map((destination) => {
                    const Icon = destination.icon;
                    const isSelected = selectedDestinationId === destination.id;
                    return (
                      <Card
                        key={destination.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          isSelected && "ring-2 ring-primary border-primary",
                        )}
                        onClick={() => {
                          setSelectedDestinationId(destination.id);
                          setConfigValues({});
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-primary/10" : "bg-muted",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-5 w-5",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {destination.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {destination.type}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 ml-auto" />
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

          {selectedDestination && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    This emitter will use the connection "
                    {selectedDestination.name}" that you've already configured.
                    No additional connection settings are needed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </FormSheet>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleCreate}
          size="lg"
          className="w-full sm:w-auto cursor-pointer"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue to Transform
        </Button>
      </div>
    </div>
  );
}
