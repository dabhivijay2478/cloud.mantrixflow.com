"use client";

import {
  ArrowRightLeft,
  Database,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePipelines,
  useDeletePipeline,
  useConnections,
  useCurrentOrganization,
  type Pipeline,
} from "@/lib/api";
import { toast } from "@/lib/utils/toast";

type PipelineType = "bulk" | "stream" | "emit";

export default function DataPipelinesPage() {
  // Use real API hooks instead of workspace store
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const { data: connections } = useConnections();
  const { data: currentOrganization } = useCurrentOrganization();
  const deletePipeline = useDeletePipeline();
  const router = useRouter();

  const getPipelineTypeInfo = (type: PipelineType) => {
    switch (type) {
      case "bulk":
        return {
          icon: Database,
          title: "Bulk Load",
          description: "One-time bulk imports from any system",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "stream":
        return {
          icon: Zap,
          title: "Stream & Transform",
          description: "Real-time pipelines with rewind capability",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
        };
      case "emit":
        return {
          icon: Sparkles,
          title: "Emit Fearlessly",
          description: "Fan out to any destination",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        };
    }
  };

  const getStatusBadge = (status: Pipeline["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Paused
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            Error
          </Badge>
        );
    }
  };

  const handleDelete = async (pipelineId: string, pipelineName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${pipelineName}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deletePipeline.mutateAsync(pipelineId);
        toast.success(
          "Pipeline deleted",
          `${pipelineName} has been deleted successfully.`,
        );
      } catch (error: any) {
        toast.error(
          "Failed to delete pipeline",
          error?.message || "Unable to delete the pipeline.",
        );
      }
    }
  };

  const columns: ColumnDef<Pipeline>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "sourceType",
      header: "Type",
      cell: ({ row }) => {
        // Map source type to pipeline type for display
        const sourceType = row.original.sourceType;
        const typeInfo = getPipelineTypeInfo("bulk"); // Default to bulk for now
        const Icon = typeInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}
            >
              <Icon className={`h-4 w-4 ${typeInfo.color}`} />
            </div>
            <span className="text-sm capitalize">{sourceType}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "sourceConnectionId",
      header: "Source",
      cell: ({ row }) => {
        const sourceConnectionId = row.original.sourceConnectionId;
        const source = connections?.find(
          (conn) => conn.id === sourceConnectionId,
        );
        return (
          <div className="text-sm text-muted-foreground">
            {source?.name || sourceConnectionId || "Unknown source"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "destinationConnectionId",
      header: "Destination",
      cell: ({ row }) => {
        const destConnectionId = row.original.destinationConnectionId;
        const dest = connections?.find(
          (conn) => conn.id === destConnectionId,
        );
        return (
          <div className="text-sm text-muted-foreground">
            {dest?.name || destConnectionId || "Unknown destination"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const pipeline = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workspace/data-pipelines/${pipeline.id}/edit`);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(pipeline.id, pipeline.name);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pipelines"
        description={
          currentOrganization
            ? `Connect any source to any destination for ${currentOrganization.name}`
            : "Connect any source to any destination"
        }
        action={
          <Button onClick={() => router.push("/workspace/data-pipelines/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Pipeline
          </Button>
        }
      />

      {/* Existing Pipelines */}
      {pipelinesLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading pipelines...</div>
          </CardContent>
        </Card>
      ) : pipelines && pipelines.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <DataTable columns={columns} data={pipelines} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pipelines yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Create your first data pipeline to start moving data from source
              to destination. Configure transformations, set up real-time
              streaming, or bulk load your data.
            </p>
            <Button
              onClick={() => router.push("/workspace/data-pipelines/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Pipeline
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
