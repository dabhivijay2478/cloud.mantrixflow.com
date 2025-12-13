"use client";

import {
  CheckCircle2,
  Database,
  Edit,
  Map as MapIcon,
  Plus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import type { CollectorConfig } from "./collector-step";
import type { TransformConfig } from "./transform-step";

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

// Mock destinations - in real app, these would come from the store
const mockDestinations = [
  {
    id: "snowflake",
    name: "Snowflake",
    type: "data-warehouse",
    icon: Database,
    configFields: [
      { key: "account", label: "Account", required: true },
      { key: "warehouse", label: "Warehouse", required: true },
      { key: "database", label: "Database", required: true },
      { key: "schema", label: "Schema", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Password",
        required: true,
        type: "password",
      },
    ],
  },
  {
    id: "pinecone",
    name: "Pinecone",
    type: "vector-db",
    icon: Database,
    configFields: [
      { key: "apiKey", label: "API Key", required: true, type: "password" },
      { key: "environment", label: "Environment", required: true },
      { key: "index", label: "Index Name", required: true },
    ],
  },
  {
    id: "redshift",
    name: "Amazon Redshift",
    type: "data-warehouse",
    icon: Database,
    configFields: [
      { key: "host", label: "Host", required: true },
      { key: "port", label: "Port", required: true },
      { key: "database", label: "Database", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Password",
        required: true,
        type: "password",
      },
    ],
  },
  {
    id: "bigquery",
    name: "Google BigQuery",
    type: "data-warehouse",
    icon: Database,
    configFields: [
      { key: "projectId", label: "Project ID", required: true },
      { key: "dataset", label: "Dataset", required: true },
      {
        key: "credentials",
        label: "Service Account JSON",
        required: true,
        type: "textarea",
      },
    ],
  },
  {
    id: "s3",
    name: "Amazon S3",
    type: "storage",
    icon: Database,
    configFields: [
      { key: "bucket", label: "Bucket Name", required: true },
      { key: "region", label: "Region", required: true },
      { key: "accessKeyId", label: "Access Key ID", required: true },
      {
        key: "secretAccessKey",
        label: "Secret Access Key",
        required: true,
        type: "password",
      },
    ],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    type: "database",
    icon: Database,
    configFields: [
      { key: "host", label: "Host", required: true },
      { key: "port", label: "Port", required: true },
      { key: "database", label: "Database", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Password",
        required: true,
        type: "password",
      },
    ],
  },
  {
    id: "mysql",
    name: "MySQL",
    type: "database",
    icon: Database,
    configFields: [
      { key: "host", label: "Host", required: true },
      { key: "port", label: "Port", required: true },
      { key: "database", label: "Database", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Password",
        required: true,
        type: "password",
      },
    ],
  },
];

export function EmitterStep({ collectors, onComplete }: EmitterStepProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmitter, setEditingEmitter] = useState<string | null>(null);
  const [selectedTransformId, setSelectedTransformId] = useState<string>("");
  const [selectedDestinationId, setSelectedDestinationId] =
    useState<string>("");
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  // Get all transforms from all collectors
  const allTransforms: Array<TransformConfig & { collectorName: string }> =
    collectors.flatMap((collector) => {
      return (collector.transformers || []).map((t) => ({
        ...t,
        collectorId: collector.id,
        collectorName: `Collector ${collector.id.slice(-6)}`,
        fieldMappings: (t as any).fieldMappings || {},
        jsonSchema: (t as any).jsonSchema || "",
        emitters: (t as any).emitters || [],
      }));
    });

  // Get all emitters from all transforms
  const allEmitters: Array<EmitterConfig & { transformName: string }> =
    allTransforms.flatMap((transform) => {
      return ((transform as any).emitters || []).map((e: EmitterConfig) => ({
        ...e,
        transformName: transform.name,
      }));
    });

  const selectedDestination = mockDestinations.find(
    (d) => d.id === selectedDestinationId,
  );

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddEmitter = () => {
    if (!selectedTransformId || !selectedDestination) return;

    const isConfigValid = selectedDestination.configFields.every(
      (field) => !field.required || configValues[field.key],
    );

    if (!isConfigValid) return;

    const newEmitter: EmitterConfig = {
      id: editingEmitter || `emitter_${Date.now()}`,
      transformId: selectedTransformId,
      destinationId: selectedDestination.id,
      destinationName: selectedDestination.name,
      destinationType: selectedDestination.type,
      connectionConfig: configValues,
    };

    const updatedCollectors = collectors.map((collector) => ({
      ...collector,
      transformers: collector.transformers.map((transform) => {
        if (transform.id === selectedTransformId) {
          const emitters = editingEmitter
            ? (transform as any).emitters?.map((e: EmitterConfig) =>
                e.id === editingEmitter ? newEmitter : e,
              ) || []
            : [...((transform as any).emitters || []), newEmitter];
          return { ...transform, emitters };
        }
        return transform;
      }),
    }));

    onComplete(updatedCollectors);
    setShowAddDialog(false);
    setEditingEmitter(null);
    setSelectedTransformId("");
    setSelectedDestinationId("");
    setConfigValues({});
  };

  const handleDeleteEmitter = (transformId: string, emitterId: string) => {
    const updatedCollectors = collectors.map((collector) => ({
      ...collector,
      transformers: collector.transformers.map((transform) => {
        if (transform.id === transformId) {
          const emitters = ((transform as any).emitters || []).filter(
            (e: EmitterConfig) => e.id !== emitterId,
          );
          return { ...transform, emitters };
        }
        return transform;
      }),
    }));
    onComplete(updatedCollectors);
  };

  const handleEditEmitter = (emitter: EmitterConfig) => {
    setEditingEmitter(emitter.id);
    setSelectedTransformId(emitter.transformId);
    setSelectedDestinationId(emitter.destinationId);
    setConfigValues(emitter.connectionConfig);
    setShowAddDialog(true);
  };

  const handleCreate = () => {
    onComplete(collectors);
  };

  const isConfigValid = () => {
    if (!selectedDestination) return false;
    return selectedDestination.configFields.every(
      (field) => !field.required || configValues[field.key],
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add Emitter Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="sm:size-default"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Emitter</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Emitters Table */}
      {allEmitters.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No emitters configured
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md px-4">
              Add emitters to send transformed data to destinations
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              size="sm"
              className="sm:size-default"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Emitter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Configured Emitters
                </CardTitle>
                <CardDescription className="mt-1">
                  {allEmitters.length} emitter
                  {allEmitters.length !== 1 ? "s" : ""} configured
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <TableComponent>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Transformer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEmitters.map((emitter) => {
                    const destination = mockDestinations.find(
                      (d) => d.id === emitter.destinationId,
                    );
                    const Icon = destination?.icon || Database;
                    return (
                      <TableRow
                        key={emitter.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {emitter.transformName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-medium">
                              {emitter.destinationName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {emitter.destinationType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(emitter.connectionConfig)
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
                            {Object.keys(emitter.connectionConfig).filter(
                              (k) =>
                                k !== "password" &&
                                k !== "secretAccessKey" &&
                                k !== "apiKey" &&
                                k !== "credentials",
                            ).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +
                                {Object.keys(emitter.connectionConfig).length -
                                  3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditEmitter(emitter)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                handleDeleteEmitter(
                                  emitter.transformId,
                                  emitter.id,
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableComponent>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {allEmitters.map((emitter) => {
                const destination = mockDestinations.find(
                  (d) => d.id === emitter.destinationId,
                );
                const Icon = destination?.icon || Database;
                return (
                  <Card
                    key={emitter.id}
                    className="border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {emitter.destinationName}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xs mt-1 font-normal"
                            >
                              {emitter.destinationType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEmitter(emitter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleDeleteEmitter(
                                emitter.transformId,
                                emitter.id,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Transformer:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {emitter.transformName}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(emitter.connectionConfig)
                            .filter(
                              ([key]) =>
                                key !== "password" &&
                                key !== "secretAccessKey" &&
                                key !== "apiKey" &&
                                key !== "credentials",
                            )
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {key}: {value?.toString().slice(0, 8)}
                                {value && value.length > 8 ? "..." : ""}
                              </Badge>
                            ))}
                          {Object.keys(emitter.connectionConfig).filter(
                            (k) =>
                              k !== "password" &&
                              k !== "secretAccessKey" &&
                              k !== "apiKey" &&
                              k !== "credentials",
                          ).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +
                              {Object.keys(emitter.connectionConfig).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Emitter Sheet */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {editingEmitter ? "Edit Emitter" : "Add Emitter"}
            </SheetTitle>
            <SheetDescription>
              Select a transformer and configure destination connection
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transformer</Label>
              <Select
                value={selectedTransformId}
                onValueChange={(value) => {
                  setSelectedTransformId(value);
                  setSelectedDestinationId("");
                  setConfigValues({});
                }}
                disabled={!!editingEmitter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a transformer" />
                </SelectTrigger>
                <SelectContent>
                  {allTransforms.map((transform) => (
                    <SelectItem key={transform.id} value={transform.id}>
                      {transform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTransformId && (
              <div className="space-y-2">
                <Label>Destination</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockDestinations.map((destination) => {
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
              </div>
            )}

            {selectedDestination && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label>Connection Configuration</Label>
                  {selectedDestination.configFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.key}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={configValues[field.key] || ""}
                          onChange={(e) =>
                            handleConfigChange(field.key, e.target.value)
                          }
                          className="min-h-[100px] font-mono text-sm"
                        />
                      ) : (
                        <Input
                          id={field.key}
                          type={field.type || "text"}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={configValues[field.key] || ""}
                          onChange={(e) =>
                            handleConfigChange(field.key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <SheetFooter className="border-t pt-4 mt-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleAddEmitter}
                disabled={!isConfigValid()}
                className="w-full sm:w-auto"
              >
                {editingEmitter ? "Update" : "Add"} Emitter
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create Pipeline Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </div>
    </div>
  );
}
