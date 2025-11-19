"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Edit,
  GripVertical,
  Hash,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Square,
  ToggleRight,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import type { Dataset, DatasetColumn } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

const datasetSchema = z.object({
  name: z
    .string()
    .min(1, "Dataset name is required")
    .min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  sourceType: z.enum(["table", "saved_query"]),
  sourceName: z.string().min(1, "Please select a table or saved query"),
});

type DatasetFormValues = z.infer<typeof datasetSchema>;

// Mock function to fetch columns from a table or query
const fetchColumns = async (
  _dataSourceId: string,
  _sourceType: "table" | "saved_query",
  _sourceName: string,
): Promise<DatasetColumn[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockColumns: DatasetColumn[] = [
    { name: "id", type: "number", selected: false, order: 0 },
    { name: "name", type: "string", selected: false, order: 1 },
    { name: "email", type: "string", selected: false, order: 2 },
    { name: "created_at", type: "date", selected: false, order: 3 },
    { name: "status", type: "boolean", selected: false, order: 4 },
    { name: "revenue", type: "number", selected: false, order: 5 },
    { name: "category", type: "string", selected: false, order: 6 },
  ];

  return mockColumns;
};

function ColumnIcon({ type }: { type: DatasetColumn["type"] }) {
  switch (type) {
    case "string":
      return <Type className="h-4 w-4 text-blue-500" />;
    case "number":
      return <Hash className="h-4 w-4 text-green-500" />;
    case "date":
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case "boolean":
      return <ToggleRight className="h-4 w-4 text-orange-500" />;
    default:
      return <Type className="h-4 w-4" />;
  }
}

interface SortableColumnItemProps {
  column: DatasetColumn;
  onRemove: (name: string) => void;
  isSelected: boolean;
}

function SortableColumnItem({
  column,
  onRemove,
  isSelected,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isDragging && "shadow-lg",
        isSelected && "border-primary bg-primary/5",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <ColumnIcon type={column.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{column.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {column.type}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onRemove(column.name)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface AvailableColumnItemProps {
  column: DatasetColumn;
  onToggle: (name: string) => void;
  isSelected: boolean;
}

function AvailableColumnItem({
  column,
  onToggle,
  isSelected,
}: AvailableColumnItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(column.name);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors w-full text-left",
        isSelected && "border-primary bg-primary/5",
      )}
      onClick={() => onToggle(column.name)}
      onKeyDown={handleKeyDown}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(column.name)}
      />
      <ColumnIcon type={column.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{column.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {column.type}
        </p>
      </div>
    </Button>
  );
}

interface DatasetConfigurationEmbeddedProps {
  dataSourceId: string;
  onBack: () => void;
}

export function DatasetConfigurationEmbedded({
  dataSourceId,
  onBack,
}: DatasetConfigurationEmbeddedProps) {
  const router = useRouter();
  const {
    dataSources,
    datasets,
    savedQueries,
    dashboards,
    addDataset,
    removeDataset,
    updateDataset,
    currentOrganization,
  } = useWorkspaceStore();

  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<DatasetColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(
    new Set(),
  );
  const [savingDatasets, setSavingDatasets] = useState(false);

  // Mock sync status - in real app, this would come from the dataset or a separate sync status store
  const getSyncStatus = (dataset: Dataset) => {
    // Mock: randomly determine if synced (in real app, this would be from dataset.lastSyncAt)
    const lastSync = dataset.updatedAt; // Using updatedAt as proxy for lastSync
    const syncTime = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync =
      (now.getTime() - syncTime.getTime()) / (1000 * 60 * 60);

    // Consider synced if updated within last 24 hours
    const isSynced = hoursSinceSync < 24;

    return {
      isSynced,
      lastSyncAt: lastSync,
      hoursSinceSync: Math.floor(hoursSinceSync),
    };
  };

  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);

  // Get datasets for this data source
  const dataSourceDatasets = datasets.filter(
    (ds) => ds.dataSourceId === dataSourceId,
  );

  // Show form by default if no datasets exist, otherwise show table
  const [showForm, setShowForm] = useState(false);

  // Update showForm when datasets change
  useEffect(() => {
    if (dataSourceDatasets.length === 0) {
      setShowForm(true);
    }
  }, [dataSourceDatasets.length]);

  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      name: "",
      description: "",
      sourceType: "table",
      sourceName: "",
    },
  });

  const sourceType = form.watch("sourceType");
  const sourceName = form.watch("sourceName");

  // Get saved queries for the selected data source
  const availableSavedQueries = savedQueries.filter(
    (q) => q.dataSourceId === dataSourceId,
  );

  // Fetch columns when source changes
  useEffect(() => {
    if (dataSourceId && sourceName) {
      setFetchingColumns(true);
      const actualSourceName =
        sourceType === "saved_query"
          ? savedQueries.find((q) => q.id === sourceName)?.query || sourceName
          : sourceName;

      fetchColumns(dataSourceId, sourceType, actualSourceName)
        .then((cols) => {
          setColumns(cols);
          setSelectedColumns([]);
        })
        .catch((error) => {
          toast.error("Failed to fetch columns", {
            description:
              error.message ||
              "Unable to load columns from the selected source.",
            className: "bg-red-50 border-red-200 text-red-900",
          });
        })
        .finally(() => {
          setFetchingColumns(false);
        });
    }
  }, [dataSourceId, sourceType, sourceName, savedQueries]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleToggleColumn = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName);
    if (!column) return;

    const isSelected = selectedColumns.some((c) => c.name === columnName);

    if (isSelected) {
      setSelectedColumns((prev) => prev.filter((c) => c.name !== columnName));
      setColumns((prev) =>
        prev.map((c) =>
          c.name === columnName ? { ...c, selected: false } : c,
        ),
      );
    } else {
      const newOrder = selectedColumns.length;
      const updatedColumn = { ...column, selected: true, order: newOrder };
      setSelectedColumns((prev) => [...prev, updatedColumn]);
      setColumns((prev) =>
        prev.map((c) =>
          c.name === columnName ? { ...c, selected: true, order: newOrder } : c,
        ),
      );
    }
  };

  const handleRemoveColumn = (columnName: string) => {
    handleToggleColumn(columnName);
  };

  const handleSelectAll = () => {
    const allSelected = columns.map((col, index) => ({
      ...col,
      selected: true,
      order: index,
    }));
    setSelectedColumns(allSelected);
    setColumns(allSelected);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
    setColumns((prev) => prev.map((col) => ({ ...col, selected: false })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedColumns((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        const updated = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        setColumns((prev) =>
          prev.map((col) => {
            const updatedCol = updated.find((uc) => uc.name === col.name);
            return updatedCol || col;
          }),
        );

        return updated;
      });
    }
  };

  const onSubmit = async (data: DatasetFormValues) => {
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column", {
        description:
          "You need to select at least one column to create a dataset.",
        className: "bg-red-50 border-red-200 text-red-900",
      });
      return;
    }

    setLoading(true);
    try {
      const queryText =
        data.sourceType === "saved_query"
          ? savedQueries.find((q) => q.id === data.sourceName)?.query
          : undefined;

      const dataset: Dataset = {
        id: `dataset_${Date.now()}`,
        name: data.name,
        description: data.description,
        dataSourceId: dataSourceId,
        sourceType:
          data.sourceType === "saved_query" ? "custom_query" : "table",
        sourceName: data.sourceName,
        query: queryText,
        columns: columns.map((col) => ({
          ...col,
          order: selectedColumns.findIndex((sc) => sc.name === col.name),
        })),
        organizationId: currentOrganization?.id || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addDataset(dataset);
      toast.success("Dataset created successfully", {
        description: `"${data.name}" has been added to your datasets.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      setShowForm(false);
      form.reset();
      setColumns([]);
      setSelectedColumns([]);
    } catch (error) {
      toast.error("Failed to save dataset", {
        description:
          "An error occurred while creating the dataset. Please try again.",
        className: "bg-red-50 border-red-200 text-red-900",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = (datasetId: string, datasetName: string) => {
    if (confirm(`Are you sure you want to delete "${datasetName}"?`)) {
      removeDataset(datasetId);
      setSelectedDatasets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(datasetId);
        return newSet;
      });
      toast.success("Dataset deleted successfully", {
        description: `"${datasetName}" has been removed from your datasets.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
    }
  };

  // Check if a dataset is used in any dashboard
  const isDatasetUsedInDashboard = (datasetId: string): boolean => {
    return dashboards.some(
      (dashboard) =>
        dashboard.dataSourceId === dataSourceId &&
        dashboard.components.some(
          (component) =>
            component.config &&
            typeof component.config === "object" &&
            "datasetId" in component.config &&
            component.config.datasetId === datasetId,
        ),
    );
  };

  const handleToggleDatasetSelection = (datasetId: string) => {
    setSelectedDatasets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  const handleSelectAllDatasets = () => {
    const allDatasetIds = new Set(dataSourceDatasets.map((ds) => ds.id));
    setSelectedDatasets(allDatasetIds);
    toast.info("All datasets selected", {
      description: `${allDatasetIds.size} dataset(s) are now selected.`,
      className: "bg-blue-50 border-blue-200 text-blue-900",
    });
  };

  const handleDeselectAllDatasets = () => {
    setSelectedDatasets(new Set());
    toast.info("All datasets deselected", {
      description: "No datasets are currently selected.",
      className: "bg-blue-50 border-blue-200 text-blue-900",
    });
  };

  const handleSaveSelectedDatasets = async () => {
    if (selectedDatasets.size === 0) {
      toast.warning("No datasets selected", {
        description: "Please select at least one dataset to save.",
        className: "bg-yellow-50 border-yellow-200 text-yellow-900",
      });
      return;
    }

    setSavingDatasets(true);
    try {
      // Simulate saving process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update datasets with current timestamp
      selectedDatasets.forEach((datasetId) => {
        updateDataset(datasetId, {
          updatedAt: new Date().toISOString(),
        });
      });

      toast.success("Datasets saved successfully", {
        description: `${selectedDatasets.size} dataset(s) have been saved.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });

      setSelectedDatasets(new Set());
    } catch (error) {
      toast.error("Failed to save datasets", {
        description: "An error occurred while saving the datasets.",
        className: "bg-red-50 border-red-200 text-red-900",
      });
      console.error(error);
    } finally {
      setSavingDatasets(false);
    }
  };

  const availableColumns = columns.filter((c) => !c.selected);

  if (!dataSource) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Data source not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show table view if datasets exist and form is not shown
  if (dataSourceDatasets.length > 0 && !showForm) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Datasets</h1>
              <p className="text-muted-foreground">
                Manage datasets for this data source
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedDatasets.size > 0 && (
              <Button
                onClick={handleSaveSelectedDatasets}
                disabled={savingDatasets}
                variant="default"
              >
                {savingDatasets ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Dataset{selectedDatasets.size > 1 ? "s" : ""} (
                    {selectedDatasets.size})
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Dataset
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Existing Datasets</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllDatasets}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAllDatasets}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        dataSourceDatasets.length > 0 &&
                        selectedDatasets.size === dataSourceDatasets.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectAllDatasets();
                        } else {
                          handleDeselectAllDatasets();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Used in Dashboard</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSourceDatasets.map((dataset) => {
                  const selectedCols = dataset.columns.filter(
                    (c) => c.selected,
                  );
                  const isUsed = isDatasetUsedInDashboard(dataset.id);
                  const isSelected = selectedDatasets.has(dataset.id);
                  const syncStatus = getSyncStatus(dataset);
                  const isTableSource = dataset.sourceType === "table";

                  // Get the specific table(s) used by this dataset
                  const datasetTables = isTableSource
                    ? [dataset.sourceName]
                    : [];

                  return (
                    <TableRow
                      key={dataset.id}
                      className={cn(
                        isSelected && "bg-primary/5 border-primary/20",
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleToggleDatasetSelection(dataset.id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {dataset.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs w-fit",
                              isTableSource
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200",
                            )}
                          >
                            {isTableSource ? "Table" : "Custom Query"}
                          </Badge>
                          {isTableSource ? (
                            <div className="text-sm text-muted-foreground">
                              {datasetTables.join(", ")}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              {dataset.sourceName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {selectedCols.length} selected
                      </TableCell>
                      <TableCell>
                        {isUsed ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <RefreshCw
                              className={cn(
                                "h-3.5 w-3.5",
                                syncStatus.isSynced
                                  ? "text-green-600"
                                  : "text-yellow-600",
                              )}
                            />
                            <Badge
                              variant={
                                syncStatus.isSynced ? "secondary" : "outline"
                              }
                              className={cn(
                                "text-xs",
                                syncStatus.isSynced
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200",
                              )}
                            >
                              {syncStatus.isSynced ? "Synced" : "Not Synced"}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground pl-5">
                            Last sync:{" "}
                            {syncStatus.hoursSinceSync < 1
                              ? "Just now"
                              : syncStatus.hoursSinceSync < 24
                                ? `${syncStatus.hoursSinceSync}h ago`
                                : `${Math.floor(syncStatus.hoursSinceSync / 24)}d ago`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(dataset.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to edit page
                              router.push(
                                `/workspace/datasets/${dataset.id}?dataSourceId=${dataSourceId}`,
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteDataset(dataset.id, dataset.name)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form for creating new dataset
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (dataSourceDatasets.length > 0) {
                setShowForm(false);
              } else {
                onBack();
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Dataset</h1>
            <p className="text-muted-foreground">
              Select a table or saved query result to create a dataset
            </p>
          </div>
        </div>
        {dataSourceDatasets.length > 0 && (
          <Button variant="outline" onClick={() => setShowForm(false)}>
            View Datasets
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Sales Dataset" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what this dataset contains..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="saved_query">
                            Saved Query Result
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {sourceType === "table" ? "Table" : "Saved Query"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                sourceType === "table"
                                  ? "Select a table"
                                  : "Select a saved query"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceType === "table" ? (
                            dataSource?.tables?.map((table) => (
                              <SelectItem key={table} value={table}>
                                {table}
                              </SelectItem>
                            )) || (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No tables available
                              </div>
                            )
                          ) : availableSavedQueries.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No saved queries available. Save a query from the
                              Query tab first.
                            </div>
                          ) : (
                            availableSavedQueries.map((savedQuery) => (
                              <SelectItem
                                key={savedQuery.id}
                                value={savedQuery.id}
                              >
                                {savedQuery.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {sourceType === "table"
                          ? "Select the table to use as the data source"
                          : "Select a saved query result to use as the data source"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {fetchingColumns && (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading columns...
                </p>
              </CardContent>
            </Card>
          )}

          {!fetchingColumns && columns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Available Columns</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Add All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Remove All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {availableColumns.map((column) => (
                        <AvailableColumnItem
                          key={column.name}
                          column={column}
                          onToggle={handleToggleColumn}
                          isSelected={false}
                        />
                      ))}
                      {availableColumns.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          All columns selected
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Selected for Analytics ({selectedColumns.length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Drag to reorder columns
                  </p>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedColumns.map((c) => c.name)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {selectedColumns.map((column) => (
                            <SortableColumnItem
                              key={column.name}
                              column={column}
                              onRemove={handleRemoveColumn}
                              isSelected={true}
                            />
                          ))}
                          {selectedColumns.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No columns selected. Select columns from the left
                              panel.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedColumns.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Dataset
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
