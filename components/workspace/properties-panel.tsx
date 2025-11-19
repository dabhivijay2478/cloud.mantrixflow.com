"use client";

import { Database, Type, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Separator } from "@/components/ui/separator";
import type {
  DashboardComponent,
  Dataset,
  DatasetColumn,
} from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { DataDialog } from "./data-dialog";

// Mock function to fetch columns from a table
const fetchTableColumns = async (
  _dataSourceId: string,
  _tableName: string,
): Promise<DatasetColumn[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock columns based on table
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

interface PropertiesPanelProps {
  component: DashboardComponent | null;
  dataset: Dataset | null;
  onUpdate: (updates: Partial<DashboardComponent>) => void;
  onClose?: () => void;
}

export function PropertiesPanel({
  component,
  dataset,
  onUpdate,
}: PropertiesPanelProps) {
  const {
    propertiesPanelOpen,
    setPropertiesPanelOpen,
    currentDashboard,
    dataSources,
    selectedDatasetId,
  } = useWorkspaceStore();
  const [tableColumns, setTableColumns] = useState<DatasetColumn[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);

  // Get the connected data source and selected table
  const connectedDataSource = currentDashboard?.dataSourceId
    ? dataSources.find((ds) => ds.id === currentDashboard.dataSourceId)
    : null;
  const selectedTable = connectedDataSource?.selectedTable || "";

  // Fetch columns when table changes
  useEffect(() => {
    if (connectedDataSource?.id && selectedTable) {
      setLoadingColumns(true);
      fetchTableColumns(connectedDataSource.id, selectedTable)
        .then((cols) => {
          setTableColumns(cols);
        })
        .catch((error) => {
          console.error("Failed to fetch columns:", error);
          setTableColumns([]);
        })
        .finally(() => {
          setLoadingColumns(false);
        });
    } else {
      setTableColumns([]);
    }
  }, [connectedDataSource?.id, selectedTable]);

  const form = useForm({
    defaultValues: {
      title: "",
      xAxis: "",
      yAxis: "",
      grouping: "",
      ...(component?.config || {}),
    },
  });

  useEffect(() => {
    if (component) {
      form.reset({
        title: (component.config?.title as string) || "",
        xAxis: (component.config?.xAxis as string) || "",
        yAxis: (component.config?.yAxis as string) || "",
        grouping: (component.config?.grouping as string) || "",
      });
    }
  }, [component, form]);

  const handleUpdate = (values: Record<string, unknown>) => {
    if (component) {
      onUpdate({
        config: {
          ...component.config,
          ...values,
        },
      });
    }
  };

  // Use table columns if available, otherwise fall back to dataset columns
  const availableColumns =
    tableColumns.length > 0 ? tableColumns : dataset?.columns || [];
  const stringColumns = availableColumns.filter((c) => c.type === "string");
  const numberColumns = availableColumns.filter((c) => c.type === "number");
  const dateColumns = availableColumns.filter((c) => c.type === "date");

  // Determine available columns based on component type
  const getAvailableXAxisColumns = () => {
    if (!component) return [];
    // For most charts, X-axis can be string or date
    return [...stringColumns, ...dateColumns];
  };

  const getAvailableYAxisColumns = () => {
    if (!component) return [];
    // Y-axis should be numeric
    return numberColumns;
  };

  const getAvailableGroupingColumns = () => {
    if (!component) return [];
    // Grouping is typically string columns
    return stringColumns;
  };

  if (!component) {
    return (
      <div className="h-full w-full border-l bg-muted/30 flex flex-col items-center justify-center">
        <div className="text-center p-6">
          <span
            className="text-xs text-muted-foreground select-none"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textOrientation: "mixed",
            }}
          >
            Properties
          </span>
        </div>
      </div>
    );
  }

  if (!propertiesPanelOpen) {
    return (
      <button
        type="button"
        className="h-full w-full border-l bg-muted/30 flex flex-col items-center relative cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setPropertiesPanelOpen(true)}
      >
        <div className="absolute right-0 top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col items-center justify-center flex-1 w-full py-4">
          <span
            className="text-xs text-muted-foreground select-none"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textOrientation: "mixed",
            }}
          >
            Properties
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="h-full w-full border-l bg-muted/30 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-semibold text-sm">Properties</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setPropertiesPanelOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="p-4 space-y-6"
          >
            {!connectedDataSource && (
              <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    No data source connected. Please connect a data source
                    first.
                  </p>
                </CardContent>
              </Card>
            )}

            {connectedDataSource && !selectedTable && !selectedDatasetId && (
              <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    No dataset selected. Please select a dataset to configure
                    this component.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDataDialogOpen(true)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Select Dataset
                  </Button>
                </CardContent>
              </Card>
            )}

            {connectedDataSource &&
              (selectedTable || selectedDatasetId) &&
              (loadingColumns ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Loading columns...
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {selectedTable ? "Table" : "Dataset"}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setDataDialogOpen(true)}
                      >
                        <Database className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedTable || dataset?.name || "No dataset selected"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connectedDataSource.name} • {availableColumns.length}{" "}
                      columns available
                    </p>
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Component title"
                            onChange={(e) => {
                              field.onChange(e);
                              handleUpdate({ title: e.target.value });
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Display title for this component
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="xAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X-Axis</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleUpdate({ xAxis: value });
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select X-axis column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailableXAxisColumns().map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </SelectItem>
                            ))}
                            {getAvailableXAxisColumns().length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground">
                                No available columns
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Column to use for the X-axis
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y-Axis</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleUpdate({ yAxis: value });
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Y-axis column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailableYAxisColumns().map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </SelectItem>
                            ))}
                            {getAvailableYAxisColumns().length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground">
                                No numeric columns available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Column to use for the Y-axis (must be numeric)
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grouping"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grouping (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const finalValue =
                              value === "__none__" ? "" : value;
                            field.onChange(finalValue);
                            handleUpdate({ grouping: finalValue });
                          }}
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grouping column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {getAvailableGroupingColumns().map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.name} ({col.type})
                              </SelectItem>
                            ))}
                            {getAvailableGroupingColumns().length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground">
                                No grouping columns available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Optional column to group data by (creates series)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </>
              ))}
          </form>
        </Form>
      </ScrollArea>
      <DataDialog open={dataDialogOpen} onOpenChange={setDataDialogOpen} />
    </div>
  );
}
