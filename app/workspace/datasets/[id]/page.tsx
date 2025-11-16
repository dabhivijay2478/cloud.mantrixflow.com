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
  Database,
  GripVertical,
  Hash,
  Loader2,
  Save,
  Square,
  ToggleRight,
  Type,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
  dataSourceId: z.string().min(1, "Please select a data source"),
  sourceType: z.enum(["table", "custom_query"]),
  sourceName: z.string().min(1, "Please select a table or query"),
});

type DatasetFormValues = z.infer<typeof datasetSchema>;

// Mock function to fetch columns from a table or query
const fetchColumns = async (
  _dataSourceId: string,
  _sourceType: "table" | "custom_query",
  _sourceName: string,
): Promise<DatasetColumn[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock columns based on source
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
    <button
      type="button"
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
    </button>
  );
}

export default function DatasetConfigurationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = params.id as string;
  const dataSourceIdFromQuery = searchParams.get("dataSourceId");
  const isEmbedded = searchParams.get("embedded") === "true";
  const {
    dataSources,
    datasets,
    savedQueries,
    currentDataset,
    setCurrentDataset,
    addDataset,
    updateDataset,
    currentOrganization,
  } = useWorkspaceStore();

  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<DatasetColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingColumns, setFetchingColumns] = useState(false);

  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      name: "",
      description: "",
      dataSourceId: dataSourceIdFromQuery || "",
      sourceType: "table",
      sourceName: "",
    },
  });

  // Update form when dataSourceId from query changes
  useEffect(() => {
    if (dataSourceIdFromQuery && !datasetId) {
      form.setValue("dataSourceId", dataSourceIdFromQuery);
    }
  }, [dataSourceIdFromQuery, form, datasetId]);

  const sourceType = form.watch("sourceType");
  const dataSourceId = form.watch("dataSourceId");
  const sourceName = form.watch("sourceName");

  const selectedDataSource = dataSources.find((ds) => ds.id === dataSourceId);
  
  // Get saved queries for the selected data source
  const availableSavedQueries = savedQueries.filter(
    (q) => q.dataSourceId === dataSourceId,
  );

  // Get datasets that use the current table/query
  const datasetsUsingSource = datasets.filter(
    (ds) =>
      ds.dataSourceId === dataSourceId &&
      ds.sourceType === sourceType &&
      ds.sourceName === sourceName,
  );

  // Load existing dataset if editing
  useEffect(() => {
    if (datasetId && datasetId !== "new") {
      const existing = datasets.find((d) => d.id === datasetId);
      if (existing) {
        setCurrentDataset(existing);
        form.reset({
          name: existing.name,
          description: existing.description || "",
          dataSourceId: existing.dataSourceId,
          sourceType: existing.sourceType,
          sourceName: existing.sourceName,
        });
        setColumns(existing.columns);
        setSelectedColumns(
          existing.columns
            .filter((c) => c.selected)
            .sort((a, b) => a.order - b.order),
        );
      }
    }
  }, [datasetId, datasets, form, setCurrentDataset]);

  // Fetch columns when source changes
  useEffect(() => {
    if (dataSourceId && sourceName) {
      setFetchingColumns(true);
      // For custom queries, get the query text from saved queries
      const actualSourceName = sourceType === "custom_query" 
        ? savedQueries.find((q) => q.id === sourceName)?.query || sourceName
        : sourceName;
      
      fetchColumns(dataSourceId, sourceType, actualSourceName)
        .then((cols) => {
          setColumns(cols);
          // Preserve selected columns if they exist
          if (selectedColumns.length > 0) {
            const existingSelected = selectedColumns.map((sc) => sc.name);
            const updated = cols.map((col) => ({
              ...col,
              selected: existingSelected.includes(col.name),
            }));
            setColumns(updated);
            setSelectedColumns(
              updated
                .filter((c) => c.selected)
                .sort((a, b) => a.order - b.order),
            );
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch columns", error.message);
        })
        .finally(() => {
          setFetchingColumns(false);
        });
    }
  }, [dataSourceId, sourceType, sourceName, selectedColumns, savedQueries]);

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
      // Remove from selected
      setSelectedColumns((prev) => prev.filter((c) => c.name !== columnName));
      setColumns((prev) =>
        prev.map((c) =>
          c.name === columnName ? { ...c, selected: false } : c,
        ),
      );
    } else {
      // Add to selected
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
        // Update order values
        const updated = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        // Update columns array
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
      toast.error("Please select at least one column");
      return;
    }

    setLoading(true);
    try {
      // For custom queries, store the query text
      const queryText = data.sourceType === "custom_query"
        ? savedQueries.find((q) => q.id === data.sourceName)?.query
        : undefined;

      const dataset: Dataset = {
        id: datasetId === "new" ? `dataset_${Date.now()}` : datasetId,
        name: data.name,
        description: data.description,
        dataSourceId: data.dataSourceId,
        sourceType: data.sourceType,
        sourceName: data.sourceName,
        query: queryText,
        columns: columns.map((col) => ({
          ...col,
          order: selectedColumns.findIndex((sc) => sc.name === col.name),
        })),
        organizationId: currentOrganization?.id || "",
        createdAt: currentDataset?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (datasetId === "new") {
        addDataset(dataset);
        toast.success("Dataset created successfully");
      } else {
        updateDataset(datasetId, dataset);
        toast.success("Dataset updated successfully");
      }

      // Redirect to query page if embedded or if dataSourceId is in query params
      if (isEmbedded || dataSourceIdFromQuery) {
        router.push(`/workspace/data-sources/${data.dataSourceId}/query?tab=dataset`);
      } else {
        router.push("/workspace/data-sources");
      }
    } catch (error) {
      toast.error("Failed to save dataset");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableColumns = columns.filter((c) => !c.selected);
  const connectedDataSources = dataSources.filter(
    (ds) => ds.status === "connected",
  );

  return (
    <div className={cn("space-y-6", isEmbedded ? "p-6" : "p-6 max-w-6xl mx-auto")}>
      {!isEmbedded && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (dataSourceIdFromQuery) {
                router.push(`/workspace/data-sources/${dataSourceIdFromQuery}/query`);
              } else {
                router.push("/workspace/data-sources");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dataset Configuration</h1>
            <p className="text-muted-foreground">
              Configure which columns will be available for analytics
            </p>
          </div>
        </div>
      )}

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
                  name="dataSourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a data source">
                              {selectedDataSource && (
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  <span>{selectedDataSource.name}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {connectedDataSources.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No connected data sources
                            </div>
                          ) : (
                            connectedDataSources.map((source) => (
                              <SelectItem key={source.id} value={source.id}>
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  <span>{source.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading || !dataSourceId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="custom_query">
                            Custom Query
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sourceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {sourceType === "table" ? "Table" : "Query"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading || !dataSourceId}
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
                          selectedDataSource?.tables?.map((table) => (
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
                            No saved queries available. Save a query from the Query tab first.
                          </div>
                        ) : (
                          availableSavedQueries.map((savedQuery) => (
                            <SelectItem key={savedQuery.id} value={savedQuery.id}>
                              {savedQuery.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {sourceType === "table"
                        ? "Select the table to use as the data source"
                        : "Select a saved query to use as the data source"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Show datasets using this source */}
          {sourceName && datasetsUsingSource.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Datasets Using This {sourceType === "table" ? "Table" : "Query"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {datasetsUsingSource.length} dataset{datasetsUsingSource.length !== 1 ? "s" : ""} configured
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {datasetsUsingSource.map((ds) => (
                    <div
                      key={ds.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{ds.name}</p>
                        {ds.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {ds.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          router.push(`/workspace/datasets/${ds.id}?dataSourceId=${dataSourceId}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show current dataset info if editing */}
          {datasetId && datasetId !== "new" && currentDataset && (
            <Card>
              <CardHeader>
                <CardTitle>Current Dataset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{currentDataset.name}</p>
                  </div>
                  {currentDataset.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{currentDataset.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Source</p>
                    <p className="text-sm text-muted-foreground">
                      {currentDataset.sourceType === "table" ? "Table" : "Custom Query"}: {currentDataset.sourceName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Columns</p>
                    <p className="text-sm text-muted-foreground">
                      {currentDataset.columns.filter((c) => c.selected).length} selected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              {/* Available Columns */}
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

              {/* Selected Columns */}
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
                              onToggle={handleToggleColumn}
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
              onClick={() => {
                if (dataSourceIdFromQuery) {
                  router.push(`/workspace/data-sources/${dataSourceIdFromQuery}/query`);
                } else {
                  router.push("/workspace/data-sources");
                }
              }}
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
                  Save Dataset Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
