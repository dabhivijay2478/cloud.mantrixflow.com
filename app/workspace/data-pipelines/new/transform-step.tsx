"use client";

import {
  ArrowRight,
  Database,
  Edit,
  FileJson,
  Map as MapIcon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { CollectorConfig } from "./collector-step";

interface TransformStepProps {
  collectors: CollectorConfig[];
  onComplete: (collectors: CollectorConfig[]) => void;
}

export interface TransformConfig {
  id: string;
  name: string;
  collectorId?: string;
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
}

export function TransformStep({ collectors, onComplete }: TransformStepProps) {
  const { datasets, dataSources } = useWorkspaceStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransform, setEditingTransform] = useState<string | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [transformName, setTransformName] = useState("");
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(
    {},
  );
  const [jsonSchema, setJsonSchema] = useState("");

  // Get all transforms from all collectors
  const allTransforms: Array<TransformConfig & { collectorName: string }> =
    collectors.flatMap((collector) => {
      const source = dataSources.find((ds) => ds.id === collector.sourceId);
      return (collector.transformers || []).map((t) => ({
        ...t,
        collectorId: collector.id,
        collectorName: source?.name || "Unknown",
        fieldMappings: (t as any).fieldMappings || {},
        jsonSchema: (t as any).jsonSchema || "",
        emitters: (t as any).emitters || [],
      }));
    });

  const selectedCollector = collectors.find(
    (c) => c.id === selectedCollectorId,
  );
  const sourceDatasets = selectedCollector
    ? datasets.filter(
        (ds) =>
          ds.dataSourceId === selectedCollector.sourceId &&
          selectedCollector.selectedTables.includes(ds.sourceName),
      )
    : [];

  const sourceFields = useMemo(() => {
    const fields: Array<{ name: string; type: string; table: string }> = [];
    sourceDatasets.forEach((dataset) => {
      dataset.columns.forEach((col) => {
        if (col.selected) {
          fields.push({
            name: `${dataset.sourceName}.${col.name}`,
            type: col.type,
            table: dataset.sourceName,
          });
        }
      });
    });
    return fields;
  }, [sourceDatasets]);

  const handleFieldMapping = (
    sourceField: string,
    destinationField: string,
  ) => {
    setFieldMappings((prev) => ({
      ...prev,
      [sourceField]: destinationField,
    }));
  };

  const generateJsonSchema = () => {
    const schema: Record<string, { type: string; source: string }> = {};
    Object.entries(fieldMappings).forEach(([sourceField, destField]) => {
      const field = sourceFields.find((f) => f.name === sourceField);
      if (field && destField) {
        schema[destField] = {
          type: field.type,
          source: sourceField,
        };
      }
    });

    const jsonSchemaObj = {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(schema).map(([key, value]) => [
          key,
          {
            type:
              value.type === "number"
                ? "number"
                : value.type === "date"
                  ? "string"
                  : "string",
            description: `Mapped from ${value.source}`,
          },
        ]),
      ),
    };

    setJsonSchema(JSON.stringify(jsonSchemaObj, null, 2));
  };

  const handleAddTransform = () => {
    if (!selectedCollectorId || !transformName) return;

    const newTransform = {
      id: editingTransform || `transform_${Date.now()}`,
      name: transformName,
      fieldMappings,
      jsonSchema,
      emitters: [],
    };

    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === selectedCollectorId) {
        const transformers = editingTransform
          ? collector.transformers.map((t) =>
              t.id === editingTransform ? newTransform : t,
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
    setTransformName("");
    setFieldMappings({});
    setJsonSchema("");
  };

  const handleDeleteTransform = (collectorId: string, transformId: string) => {
    const updatedCollectors = collectors.map((collector) => {
      if (collector.id === collectorId) {
        return {
          ...collector,
          transformers: collector.transformers.filter(
            (t) => t.id !== transformId,
          ),
        };
      }
      return collector;
    });
    onComplete(updatedCollectors);
  };

  const handleEditTransform = (transform: TransformConfig) => {
    setEditingTransform(transform.id);
    setSelectedCollectorId(transform.collectorId || "");
    setTransformName(transform.name);
    setFieldMappings(transform.fieldMappings || {});
    setJsonSchema(transform.jsonSchema || "");
    setShowAddDialog(true);
  };

  const handleContinue = () => {
    onComplete(collectors);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Transform - Field Mapping
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create transformers to map source fields to destination schema
        </p>
      </div>

      {/* Add Transform Button */}
      <div className="flex justify-end">
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
              Add transformers to map fields from collectors to destinations
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add First Transformer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Transformers</CardTitle>
            <CardDescription>
              {allTransforms.length} transformer
              {allTransforms.length !== 1 ? "s" : ""} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Fields Mapped</TableHead>
                    <TableHead>Emitters</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransforms.map((transform) => (
                    <TableRow key={transform.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <MapIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="font-medium">{transform.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transform.collectorName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {
                            Object.keys(transform.fieldMappings || {}).filter(
                              (k) => transform.fieldMappings?.[k],
                            ).length
                          }{" "}
                          fields
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transform.emitters?.length || 0} emitter
                          {(transform.emitters?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditTransform(transform)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleDeleteTransform(
                                transform.collectorId || "",
                                transform.id,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Transform Sheet */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-5xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {editingTransform ? "Edit Transformer" : "Add Transformer"}
            </SheetTitle>
            <SheetDescription>
              Configure field mappings from source to destination schema
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collector</Label>
                <Select
                  value={selectedCollectorId}
                  onValueChange={(value) => {
                    setSelectedCollectorId(value);
                    setFieldMappings({});
                    setJsonSchema("");
                  }}
                  disabled={!!editingTransform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectors.map((collector) => {
                      const source = dataSources.find(
                        (ds) => ds.id === collector.sourceId,
                      );
                      return (
                        <SelectItem key={collector.id} value={collector.id}>
                          {source?.name || "Unknown"}
                        </SelectItem>
                      );
                    })}
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

            {selectedCollectorId && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Source Fields</Label>
                    <ScrollArea className="h-[400px] rounded-lg border p-4">
                      {sourceFields.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No fields available
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sourceFields.map((field) => (
                            <div
                              key={field.name}
                              className="rounded-lg border p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">
                                    {field.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.table} • {field.type}
                                  </p>
                                </div>
                                <Badge variant="outline">{field.type}</Badge>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`dest-${field.name}`}
                                  className="text-xs"
                                >
                                  Map to:
                                </Label>
                                <Input
                                  id={`dest-${field.name}`}
                                  placeholder="destination_field"
                                  value={fieldMappings[field.name] || ""}
                                  onChange={(e) =>
                                    handleFieldMapping(
                                      field.name,
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>JSON Schema</Label>
                    <Textarea
                      placeholder='{"type": "object", "properties": {...}}'
                      value={jsonSchema}
                      onChange={(e) => setJsonSchema(e.target.value)}
                      className="min-h-[400px] font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateJsonSchema}
                      className="w-full mt-2"
                    >
                      <MapIcon className="mr-2 h-4 w-4" />
                      Generate Schema from Mappings
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="border-t pt-4 mt-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingTransform(null);
                  setSelectedCollectorId("");
                  setTransformName("");
                  setFieldMappings({});
                  setJsonSchema("");
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTransform}
                disabled={!selectedCollectorId || !transformName}
                className="w-full sm:w-auto"
              >
                {editingTransform ? "Update" : "Add"} Transformer
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          Continue to Emitter
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
