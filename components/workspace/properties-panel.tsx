"use client";

import {
  Database,
  Eye,
  EyeOff,
  Grid3x3,
  Palette,
  Settings,
  Type,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { DashboardComponent, Dataset } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

interface PropertiesPanelProps {
  component: DashboardComponent | null;
  dataset: Dataset | null;
  onUpdate: (updates: Partial<DashboardComponent>) => void;
  onClose: () => void;
}

const colorSchemes = [
  { name: "Default", value: "default" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
];

export function PropertiesPanel({
  component,
  dataset,
  onUpdate,
  onClose,
}: PropertiesPanelProps) {
  const { propertiesPanelOpen, setPropertiesPanelOpen } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<"data" | "appearance">("data");

  const form = useForm({
    defaultValues: {
      title: "",
      xAxis: "",
      yAxis: "",
      grouping: "",
      colorScheme: "default",
      showLegend: true,
      showGrid: true,
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
        colorScheme: (component.config?.colorScheme as string) || "default",
        showLegend: (component.config?.showLegend as boolean) ?? true,
        showGrid: (component.config?.showGrid as boolean) ?? true,
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

  const selectedColumns = dataset?.columns.filter((c) => c.selected) || [];
  const stringColumns = selectedColumns.filter((c) => c.type === "string");
  const numberColumns = selectedColumns.filter((c) => c.type === "number");
  const dateColumns = selectedColumns.filter((c) => c.type === "date");

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
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Select a component to configure
          </p>
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
          <Settings className="h-8 w-8 mb-4 text-muted-foreground" />
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

      <div className="flex border-b shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "data"
              ? "bg-background border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Database className="h-4 w-4 inline mr-2" />
          Data
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "appearance"
              ? "bg-background border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Palette className="h-4 w-4 inline mr-2" />
          Appearance
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="p-4 space-y-6"
          >
            {activeTab === "data" && (
              <>
                {!dataset && (
                  <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        No dataset selected. Please select a dataset for this
                        dashboard.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {dataset && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Dataset
                      </p>
                      <p className="text-sm font-medium">{dataset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedColumns.length} columns available
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
                              field.onChange(value);
                              handleUpdate({ grouping: value });
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grouping column" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
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
                )}
              </>
            )}

            {activeTab === "appearance" && (
              <>
                <FormField
                  control={form.control}
                  name="colorScheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Scheme
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleUpdate({ colorScheme: value });
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorSchemes.map((scheme) => (
                            <SelectItem key={scheme.value} value={scheme.value}>
                              {scheme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a color palette for the chart
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="showLegend"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          {field.value ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          Show Legend
                        </FormLabel>
                        <FormDescription>
                          Display the chart legend
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleUpdate({ showLegend: checked });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showGrid"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Grid3x3 className="h-4 w-4" />
                          Show Grid
                        </FormLabel>
                        <FormDescription>
                          Display grid lines on the chart
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleUpdate({ showGrid: checked });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
}

