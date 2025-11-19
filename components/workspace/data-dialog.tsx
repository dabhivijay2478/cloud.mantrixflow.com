"use client";

import { Calendar, Database, Hash, ToggleLeft, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DatasetColumn,
  useWorkspaceStore,
} from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

function ColumnIcon({
  type,
  className,
}: {
  type: DatasetColumn["type"];
  className?: string;
}) {
  switch (type) {
    case "number":
      return <Hash className={className || "h-3.5 w-3.5"} />;
    case "date":
      return <Calendar className={className || "h-3.5 w-3.5"} />;
    case "boolean":
      return <ToggleLeft className={className || "h-3.5 w-3.5"} />;
    default:
      return <Type className={className || "h-3.5 w-3.5"} />;
  }
}

function getTypeColor(type: DatasetColumn["type"]) {
  switch (type) {
    case "number":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "date":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "boolean":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    default:
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
  }
}

interface DataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataDialog({ open, onOpenChange }: DataDialogProps) {
  const {
    currentDashboard,
    datasets,
    selectedDatasetId,
    setSelectedDatasetId,
    dataSources,
  } = useWorkspaceStore();

  const [columns, setColumns] = useState<DatasetColumn[]>([]);

  // Get available datasets for the current dashboard's data source
  const dashboardDataSourceId = currentDashboard?.dataSourceId;
  const availableDatasets = dashboardDataSourceId
    ? datasets.filter((ds) => ds.dataSourceId === dashboardDataSourceId)
    : datasets;

  const selectedDataset = selectedDatasetId
    ? datasets.find((ds) => ds.id === selectedDatasetId)
    : null;

  // Get the connected data source for display purposes
  const connectedDataSource = currentDashboard?.dataSourceId
    ? dataSources.find((ds) => ds.id === currentDashboard.dataSourceId)
    : null;

  const handleDatasetChange = (value: string) => {
    if (value && value !== "__none__") {
      setSelectedDatasetId(value);
    } else {
      setSelectedDatasetId(null);
    }
  };

  // Update columns when selected dataset changes
  useEffect(() => {
    if (selectedDataset) {
      // Use columns from the selected dataset
      setColumns(selectedDataset.columns || []);
    } else {
      setColumns([]);
    }
  }, [selectedDataset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source & Datasets
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Dataset Selection */}
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={selectedDatasetId || "__none__"}
              onValueChange={handleDatasetChange}
              disabled={availableDatasets.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {availableDatasets.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No datasets available
                  </div>
                ) : (
                  <>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">None</span>
                    </SelectItem>
                    {availableDatasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Data View */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pr-4">
              {!selectedDataset ? (
                <Card className="border-yellow-500/50 bg-yellow-500/10">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      No dataset selected. Please select a dataset from the
                      dropdown above.
                    </p>
                  </CardContent>
                </Card>
              ) : columns.length === 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      No columns available for this dataset.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Dataset
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {columns.length} columns
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedDataset.name}
                    </p>
                    {selectedDataset.description && (
                      <p className="text-xs text-muted-foreground">
                        {selectedDataset.description}
                      </p>
                    )}
                    {connectedDataSource && (
                      <p className="text-xs text-muted-foreground">
                        Data Source: {connectedDataSource.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Columns
                    </p>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-1">
                        {columns.map((column) => (
                          <div
                            key={column.name}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md border bg-background hover:bg-accent transition-colors",
                              column.selected && "ring-2 ring-primary",
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <ColumnIcon
                                type={column.type}
                                className="shrink-0 text-muted-foreground"
                              />
                              <span className="text-sm font-medium truncate">
                                {column.name}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs shrink-0",
                                getTypeColor(column.type),
                              )}
                            >
                              {column.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
