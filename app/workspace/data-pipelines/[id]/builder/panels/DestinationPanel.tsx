"use client";

import {
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Table,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCheckTableExists,
  useCreateDestinationTable,
  usePreviewDestinationData,
  useValidateDestinationSchema,
} from "@/lib/api/hooks/use-destination-schemas";
import type { WriteMode } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import { usePipelineBuilderStore } from "../store/pipelineStore";

const WRITE_MODES: { value: WriteMode; label: string; desc: string }[] = [
  { value: "append", label: "Append", desc: "Add new rows only" },
  { value: "upsert", label: "Merge", desc: "Update existing, insert new" },
  { value: "replace", label: "Overwrite", desc: "Replace table contents" },
];

interface DestinationPanelProps {
  branchId: string | null;
  nodeId: string | null;
}

export function DestinationPanel({ branchId, nodeId }: DestinationPanelProps) {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const branches = usePipelineBuilderStore((s) => s.branches);
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const updateNode = usePipelineBuilderStore((s) => s.updateNode);
  const deleteBranch = usePipelineBuilderStore((s) => s.deleteBranch);

  const branch = branches.find((b) => b.id === branchId);
  const node = nodes.find((n) => n.id === nodeId);
  const data = node?.data ?? {};
  const destSchema = pipeline?.destinationSchema;
  const destSchemaId = destSchema?.id;

  const validateSchema = useValidateDestinationSchema(
    organizationId,
    destSchemaId,
  );
  const createTable = useCreateDestinationTable(organizationId, destSchemaId);
  const { data: tableExists, refetch: recheckTable } = useCheckTableExists(
    organizationId,
    destSchemaId,
  );
  const { data: previewData, isLoading: previewLoading } =
    usePreviewDestinationData(organizationId, destSchemaId, 10);

  const handleValidate = async () => {
    try {
      const result = await validateSchema.mutateAsync();
      if (result.valid) {
        toast.success("Validation passed", "Schema configuration is valid.");
      } else {
        toast.error("Validation failed", result.errors.join(", "));
      }
    } catch (error) {
      toast.error(
        "Validation error",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleCreateTable = async () => {
    try {
      await createTable.mutateAsync();
      toast.success(
        "Table created",
        "Destination table has been created successfully.",
      );
      recheckTable();
    } catch (error) {
      toast.error(
        "Failed to create table",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const [schema, setSchema] = useState(
    (data.dest_schema as string) ?? destSchema?.destinationSchema ?? "public",
  );
  const [table, setTable] = useState(
    (data.dest_table as string) ?? destSchema?.destinationTable ?? "",
  );
  const [writeMode, setWriteMode] = useState<WriteMode>(
    (data.emit_method as WriteMode) ?? destSchema?.writeMode ?? "append",
  );

  useEffect(() => {
    const d = node?.data ?? {};
    setSchema(
      (d.dest_schema as string) ?? destSchema?.destinationSchema ?? "public",
    );
    setTable(
      (d.dest_table as string) ?? destSchema?.destinationTable ?? "",
    );
    setWriteMode(
      (d.emit_method as WriteMode) ?? destSchema?.writeMode ?? "append",
    );
  }, [nodeId, node?.data, destSchema]);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    updateNode(nodeId, {
      data: {
        ...data,
        dest_schema: schema || "public",
        dest_table: table,
        emit_method: writeMode,
      },
    });
  }, [nodeId, schema, table, writeMode, data, updateNode]);

  const handleDeleteBranch = useCallback(() => {
    if (branchId && branches.length > 1) {
      deleteBranch(branchId);
    }
  }, [branchId, branches.length, deleteBranch]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Destination
          <Badge variant="outline">DESTINATION</Badge>
        </SheetTitle>
        <SheetDescription>
          {branch ? `Branch: ${branch.label}` : "Configure destination"}
        </SheetDescription>
      </SheetHeader>
      <Tabs defaultValue="config" className="flex-1">
        <TabsList>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="preview">Schema Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="config" className="mt-4">
          <div className="flex flex-1 flex-col gap-5">
            <div className="space-y-2">
              <Label>Connection</Label>
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {destSchema?.name ?? "Use pipeline destination connection"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dest-schema">Schema</Label>
                <Input
                  id="dest-schema"
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  placeholder="public"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-table">Table</Label>
                <Input
                  id="dest-table"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="my_table"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Write Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {WRITE_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setWriteMode(m.value)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      writeMode === m.value
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          {!destSchemaId ? (
            <p className="text-sm text-muted-foreground py-6">
              Save the pipeline with a destination connection to preview schema.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Table Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Table Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Destination Table</div>
                      <div className="text-sm text-muted-foreground">
                        {destSchema.destinationSchema}.{destSchema.destinationTable}
                      </div>
                    </div>
                    {tableExists?.exists || destSchema.destinationTableExists ? (
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Table Exists
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-amber-600">
                          Not Created
                        </Badge>
                        <Button
                          size="sm"
                          onClick={handleCreateTable}
                          disabled={createTable.isPending}
                        >
                          {createTable.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Create Table
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Write Mode:</span>{" "}
                      <span className="font-medium capitalize">
                        {destSchema.writeMode}
                      </span>
                    </div>
                    {destSchema.upsertKey && destSchema.upsertKey.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Upsert Key:</span>{" "}
                        <span className="font-medium">
                          {destSchema.upsertKey.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transform Script */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Transform Script</CardTitle>
                  <CardDescription>
                    Python script for data transformation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {destSchema.transformScript?.trim() ? (
                    <div className="border rounded-lg overflow-auto">
                      <pre className="p-4 text-xs font-mono bg-muted/30 max-h-96 overflow-auto">
                        {destSchema.transformScript}
                      </pre>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No transform script configured
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Destination Data Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Destination Data Preview</CardTitle>
                  <CardDescription>
                    Sample data from the destination table
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-auto">
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-12 border rounded-lg">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : previewData?.rows && previewData.rows.length > 0 ? (
                      <div className="border rounded-lg overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {previewData.columns?.map((col) => (
                                <th
                                  key={col.name}
                                  className="px-3 py-2 text-left font-medium border-b"
                                >
                                  <div className="flex flex-col">
                                    <span>{col.name}</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                      {col.type}
                                    </span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.rows.map((row, i) => {
                              const rowKey = previewData.columns?.[0]
                                ? `${String((row as Record<string, unknown>)[previewData.columns[0].name] ?? "")}-${i}`
                                : `row-${i}`;
                              return (
                                <tr
                                  key={rowKey}
                                  className="border-b last:border-0 hover:bg-muted/30"
                                >
                                  {previewData.columns?.map((col) => (
                                    <td
                                      key={col.name}
                                      className="px-3 py-2 truncate max-w-[200px]"
                                    >
                                      {String(
                                        (row as Record<string, unknown>)[col.name] ?? "-",
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground border rounded-lg">
                        <Table className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>No preview data available</p>
                        <p className="text-sm mt-1">
                          Table may not exist yet or no data has been synced
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Validation Result */}
              {destSchema.validationResult && (
                <Card
                  className={cn(
                    destSchema.validationResult.valid
                      ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
                  )}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {destSchema.validationResult.valid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {destSchema.validationResult.valid
                            ? "Schema Valid"
                            : "Validation Errors"}
                        </div>
                        {(destSchema.validationResult?.errors ?? []).length > 0 ? (
                          <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                            {(destSchema.validationResult?.errors ?? []).map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleValidate}
                  disabled={validateSchema.isPending}
                >
                  {validateSchema.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Validate Schema
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <SheetFooter>
        <Button onClick={handleSave}>Save</Button>
        {branches.length > 1 && branchId && (
          <Button variant="destructive" onClick={handleDeleteBranch}>
            Remove this branch
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
