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
import { PropertyControl } from "./property-control";
import {
  getComponentProperties,
  validateComponentProps,
  type ValidationError,
} from "@/components/bi/component-schemas";

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

  // Schema-based properties
  const [propertyValues, setPropertyValues] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  // Get schema properties for the selected component
  const schemaProperties = component ? getComponentProperties(component.type) : [];

  // Get the connected data source and selected table
  const connectedDataSource = currentDashboard?.dataSourceId
    ? dataSources.find((ds) => ds.id === currentDashboard.dataSourceId)
    : null;
  const selectedTable = connectedDataSource?.selectedTable || "";

  // Initialize property values from component config
  useEffect(() => {
    if (component?.config) {
      setPropertyValues(component.config as Record<string, unknown>);
    }
  }, [component]);

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

  // Handle property change with schema validation
  const handlePropertyChange = (key: string, value: unknown) => {
    const newValues = { ...propertyValues, [key]: value };
    setPropertyValues(newValues);

    // Validate in real-time
    if (component) {
      const validation = validateComponentProps(component.type, newValues);
      if (validation.errors) {
        const errorMap = new Map<string, string>();
        validation.errors.forEach((error: ValidationError) => {
          errorMap.set(error.property, error.message);
        });
        setValidationErrors(errorMap);
      } else {
        setValidationErrors(new Map());
      }
    }

    // Update component immediately for live preview
    onUpdate({
      config: newValues,
    });
  };

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

                  {/* Schema-based dynamic property controls */}
                  {schemaProperties.length > 0 ? (
                    <div className="space-y-4">
                      {schemaProperties.map((property) => (
                        <PropertyControl
                          key={property.key}
                          property={property}
                          value={propertyValues[property.key]}
                          onChange={(value) =>
                            handlePropertyChange(property.key, value)
                          }
                          error={validationErrors.get(property.key)}
                          availableColumns={availableColumns}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No schema properties available for this component type
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Component type: {component.type}
                      </p>
                    </div>
                  )}

                  {/* Validation error summary */}
                  {validationErrors.size > 0 && (
                    <Card className="border-destructive/50 bg-destructive/10">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-destructive mb-2">
                          Validation Errors ({validationErrors.size})
                        </p>
                        <ul className="text-xs text-destructive/90 space-y-1">
                          {Array.from(validationErrors.values()).map(
                            (error, idx) => (
                              <li key={idx}>• {error}</li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              ))}
          </form>
        </Form>
      </ScrollArea>
      <DataDialog open={dataDialogOpen} onOpenChange={setDataDialogOpen} />
    </div>
  );
}
