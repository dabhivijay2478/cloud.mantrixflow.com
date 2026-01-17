"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ChevronRight,
  Database,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteSourceSchema,
  useDiscoverSourceSchema,
  usePreviewSourceData,
  useSourceSchemas,
} from "@/lib/api/hooks/use-source-schemas";
import type { PipelineSourceSchema } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

export default function SourceSchemasPage() {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: schemas, isLoading } = useSourceSchemas(organizationId);
  const deleteSchema = useDeleteSourceSchema(organizationId);

  const [previewSchemaId, setPreviewSchemaId] = useState<string | null>(null);

  const handleDelete = async (schema: PipelineSourceSchema) => {
    if (confirm(`Are you sure you want to delete source schema "${schema.name || schema.sourceTable}"?`)) {
      try {
        await deleteSchema.mutateAsync(schema.id);
        toast.success("Source schema deleted", "The source schema has been removed.");
      } catch (error) {
        toast.error("Failed to delete", error instanceof Error ? error.message : "Unknown error");
      }
    }
  };

  const columns: ColumnDef<PipelineSourceSchema>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const schema = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{schema.name || schema.sourceTable || "Unnamed"}</div>
              <div className="text-xs text-muted-foreground uppercase">{schema.sourceType}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sourceTable",
      header: "Source",
      cell: ({ row }) => {
        const schema = row.original;
        if (schema.sourceTable) {
          return (
            <span className="text-sm">
              {schema.sourceSchema || "public"}.{schema.sourceTable}
            </span>
          );
        }
        if (schema.sourceQuery) {
          return <Badge variant="outline">Custom Query</Badge>;
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: "discoveredColumns",
      header: "Columns",
      cell: ({ row }) => {
        const count = row.original.discoveredColumns?.length || 0;
        return (
          <span className="text-sm text-muted-foreground">
            {count > 0 ? `${count} columns` : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "estimatedRowCount",
      header: "Est. Rows",
      cell: ({ row }) => {
        const count = row.original.estimatedRowCount;
        return (
          <span className="text-sm text-muted-foreground">
            {count ? count.toLocaleString() : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        row.original.isActive ? (
          <Badge className="bg-green-500/10 text-green-700">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        )
      ),
    },
    {
      accessorKey: "lastDiscoveredAt",
      header: "Last Discovered",
      cell: ({ row }) => {
        const date = row.original.lastDiscoveredAt;
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
                setPreviewSchemaId(schema.id);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPreviewSchemaId(schema.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Data
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
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Source Schemas"
        description="Manage and discover source data schemas for your pipelines"
        action={
          <Button onClick={() => router.push("/workspace/data-pipelines/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        }
      />

      <DataTable
        tableId={organizationId ? `source-schemas-table-${organizationId}` : "source-schemas-table"}
        columns={columns}
        data={schemas || []}
        isLoading={isLoading}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter source schemas..."
        defaultVisibleColumns={["name", "sourceTable", "discoveredColumns", "estimatedRowCount", "isActive", "actions"]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No source schemas yet"
        emptyDescription="Source schemas are created when you set up data pipelines."
      />

      {/* Preview Dialog */}
      <SourceSchemaPreviewDialog
        organizationId={organizationId}
        schemaId={previewSchemaId}
        onClose={() => setPreviewSchemaId(null)}
      />
    </div>
  );
}

// Preview Dialog Component
function SourceSchemaPreviewDialog({
  organizationId,
  schemaId,
  onClose,
}: {
  organizationId?: string;
  schemaId: string | null;
  onClose: () => void;
}) {
  const { data: previewData, isLoading } = usePreviewSourceData(organizationId, schemaId || undefined, 10);
  const discoverSchema = useDiscoverSourceSchema(organizationId, schemaId || undefined);

  const handleDiscover = async () => {
    try {
      await discoverSchema.mutateAsync();
      toast.success("Schema discovered", "Column information has been updated.");
    } catch (error) {
      toast.error("Discovery failed", error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (!schemaId) return null;

  return (
    <Dialog open={!!schemaId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Source Data Preview
          </DialogTitle>
          <DialogDescription>Preview sample data from this source schema</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 pb-4">
          <Button variant="outline" size="sm" onClick={handleDiscover} disabled={discoverSchema.isPending}>
            <Search className="h-4 w-4 mr-2" />
            Discover Schema
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : previewData?.rows && previewData.rows.length > 0 ? (
            <div className="border rounded-lg overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {previewData.columns?.map((col) => (
                      <th key={col.name} className="px-3 py-2 text-left font-medium border-b">
                        <div className="flex flex-col">
                          <span>{col.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">{col.type}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                      {previewData.columns?.map((col) => (
                        <td key={col.name} className="px-3 py-2 truncate max-w-[200px]">
                          {String((row as Record<string, unknown>)[col.name] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No preview data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Discover Schema" to fetch schema information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
