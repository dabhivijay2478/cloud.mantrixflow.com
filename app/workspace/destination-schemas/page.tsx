"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreVertical,
  Plus,
  Table,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable, PageHeader } from "@/components/shared";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCheckTableExists,
  useCreateDestinationTable,
  useDeleteDestinationSchema,
  useDestinationSchemas,
  useValidateDestinationSchema,
} from "@/lib/api/hooks/use-destination-schemas";
import type { PipelineDestinationSchema } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

export default function DestinationSchemasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: schemas, isLoading } = useDestinationSchemas(organizationId);
  const deleteSchema = useDeleteDestinationSchema(organizationId);

  // Support opening details from URL parameter
  const schemaIdFromUrl = searchParams.get("schemaId");
  const [detailSchemaId, setDetailSchemaId] = useState<string | null>(
    schemaIdFromUrl,
  );

  // Handle URL parameter changes
  useEffect(() => {
    if (schemaIdFromUrl) {
      setDetailSchemaId(schemaIdFromUrl);
    }
  }, [schemaIdFromUrl]);

  // Clear URL parameter when closing dialog
  const handleCloseDetails = () => {
    setDetailSchemaId(null);
    // Remove schemaId from URL if present
    if (schemaIdFromUrl) {
      router.replace("/workspace/destination-schemas");
    }
  };

  const handleDelete = useCallback(
    async (schema: PipelineDestinationSchema) => {
      if (
        confirm(
          `Are you sure you want to delete destination schema "${schema.name || schema.destinationTable}"?`,
        )
      ) {
        try {
          await deleteSchema.mutateAsync(schema.id);
          toast.success(
            "Destination schema deleted",
            "The destination schema has been removed.",
          );
        } catch (error) {
          toast.error(
            "Failed to delete",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }
    },
    [deleteSchema],
  );

  const getWriteModeBadge = useCallback((mode: string) => {
    const colors: Record<string, string> = {
      append: "bg-blue-500/10 text-blue-700",
      upsert: "bg-purple-500/10 text-purple-700",
      replace: "bg-amber-500/10 text-amber-700",
    };
    return (
      <Badge className={colors[mode] || "bg-gray-500/10 text-gray-700"}>
        {mode}
      </Badge>
    );
  }, []);

  const columns: ColumnDef<PipelineDestinationSchema>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const schema = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <Table className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">
                  {schema.name || schema.destinationTable}
                </div>
                <div className="text-xs text-muted-foreground">
                  {schema.destinationSchema}.{schema.destinationTable}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "transformScript",
        header: "Transform Script",
        cell: ({ row }) => {
          const hasScript = row.original.transformScript && row.original.transformScript.trim();
          return (
            <span className="text-sm text-muted-foreground">
              {hasScript ? (
                <Badge variant="outline" className="text-green-600">
                  Configured
                </Badge>
              ) : (
                "-"
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "writeMode",
        header: "Write Mode",
        cell: ({ row }) => getWriteModeBadge(row.original.writeMode),
      },
      {
        accessorKey: "destinationTableExists",
        header: "Table Status",
        cell: ({ row }) =>
          row.original.destinationTableExists ? (
            <Badge className="bg-green-500/10 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Exists
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600">
              <XCircle className="h-3 w-3 mr-1" />
              Not Created
            </Badge>
          ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge className="bg-green-500/10 text-green-700">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          ),
      },
      {
        accessorKey: "lastSyncedAt",
        header: "Last Synced",
        cell: ({ row }) => {
          const date = row.original.lastSyncedAt;
          return (
            <span className="text-sm text-muted-foreground">
              {date ? new Date(date).toLocaleDateString() : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const schema = row.original;

          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailSchemaId(schema.id);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDetailSchemaId(schema.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(schema)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [getWriteModeBadge, handleDelete],
  );

  // Find the selected schema for details
  const detailSchema = schemas?.find((s) => s.id === detailSchemaId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destination Schemas"
        description="Manage destination table schemas and column mappings for your pipelines"
        action={
          <Button onClick={() => router.push("/workspace/data-pipelines/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        }
      />

      <DataTable
        tableId={
          organizationId
            ? `destination-schemas-table-${organizationId}`
            : "destination-schemas-table"
        }
        columns={columns}
        data={schemas || []}
        isLoading={isLoading}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter destination schemas..."
        defaultVisibleColumns={[
          "name",
          "transformScript",
          "writeMode",
          "destinationTableExists",
          "isActive",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No destination schemas yet"
        emptyDescription="Destination schemas are created when you set up data pipelines."
      />

      {/* Details Dialog */}
      <DestinationSchemaDetailsDialog
        organizationId={organizationId}
        schema={detailSchema}
        onClose={handleCloseDetails}
      />
    </div>
  );
}

// Details Dialog Component
function DestinationSchemaDetailsDialog({
  organizationId,
  schema,
  onClose,
}: {
  organizationId?: string;
  schema?: PipelineDestinationSchema | null;
  onClose: () => void;
}) {
  const validateSchema = useValidateDestinationSchema(
    organizationId,
    schema?.id,
  );
  const createTable = useCreateDestinationTable(organizationId, schema?.id);
  const { data: tableExists, refetch: recheckTable } = useCheckTableExists(
    organizationId,
    schema?.id,
  );

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

  if (!schema) return null;

  return (
    <Dialog open={!!schema} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            {schema.name || schema.destinationTable}
          </DialogTitle>
          <DialogDescription>
            {schema.destinationSchema}.{schema.destinationTable}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 py-4">
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
                    {schema.destinationSchema}.{schema.destinationTable}
                  </div>
                </div>
                {tableExists?.exists || schema.destinationTableExists ? (
                  <Badge className="bg-green-500/10 text-green-700">
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
                    {schema.writeMode}
                  </span>
                </div>
                {schema.upsertKey && schema.upsertKey.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Upsert Key:</span>{" "}
                    <span className="font-medium">
                      {schema.upsertKey.join(", ")}
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
              {schema.transformScript && schema.transformScript.trim() ? (
                <div className="border rounded-lg overflow-auto">
                  <pre className="p-4 text-xs font-mono bg-muted/30 max-h-96 overflow-auto">
                    {schema.transformScript}
                  </pre>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No transform script configured
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Result */}
          {schema.validationResult && (
            <Card
              className={
                schema.validationResult.valid
                  ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              }
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {schema.validationResult.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {schema.validationResult.valid
                        ? "Schema Valid"
                        : "Validation Errors"}
                    </div>
                    {schema.validationResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                        {schema.validationResult.errors.map((err, i) => {
                          // biome-ignore lint/suspicious/noArrayIndexKey: Errors list is static
                          return <li key={i}>{err}</li>;
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleValidate} disabled={validateSchema.isPending}>
            {validateSchema.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Validate Schema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
