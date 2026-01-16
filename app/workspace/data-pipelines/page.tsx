"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Play, Plus, Trash2, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  dataPipelinesKeys,
  useDeletePipeline,
  usePipelines,
} from "@/lib/api/hooks/use-data-pipelines";
import { useUsers } from "@/lib/api/hooks/use-users";
import { DataPipelinesService } from "@/lib/api/services/data-pipelines.service";
import type { Pipeline } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

export default function DataPipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || undefined;

  // Use real API hooks instead of workspace store
  const { data: pipelines, isLoading: pipelinesLoading } =
    usePipelines(organizationId);
  const deletePipeline = useDeletePipeline(organizationId);
  const router = useRouter();

  // Get all unique user IDs from pipelines for fetching user names
  const userIds =
    pipelines?.map((pipeline) => pipeline.createdBy).filter(Boolean) || [];
  const { usersMap } = useUsers(userIds);

  const getStatusBadge = (pipeline: Pipeline) => {
    // Check if pipeline is paused first (highest priority)
    if (pipeline.status === "paused") {
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-amber-300 dark:border-amber-700"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Paused
          </div>
        </Badge>
      );
    }

    // Check lastRunStatus
    if (pipeline.lastRunStatus === "success") {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
            Success
          </div>
        </Badge>
      );
    }

    if (pipeline.lastRunStatus === "failed") {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
            Failed
          </div>
        </Badge>
      );
    }

    // Fallback to pipeline status (paused status is already handled at the top of the function)
    switch (pipeline.status) {
      case "active": {
        // Show sync mode if available
        const syncMode = pipeline.syncMode;
        if (syncMode === "incremental") {
          return (
            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
              Active (Incremental)
            </Badge>
          );
        }
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Active
          </Badge>
        );
      }
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
              Error
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unknown
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
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to delete the pipeline.";
        toast.error("Failed to delete pipeline", errorMessage);
      }
    }
  };

  const queryClient = useQueryClient();

  // Create hooks that can work with any pipeline (pipelineId passed in mutation)
  // We'll create wrapper hooks that accept pipelineId in the mutation function
  const runPipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.runPipeline(organizationId, pipelineId);
    },
    onSuccess: (_, variables) => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            variables.pipelineId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });

  const resumePipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.resumePipeline(organizationId, pipelineId);
    },
    onSuccess: (_, variables) => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            variables.pipelineId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });

  const handleRunPipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    if (!organizationId) {
      toast.error("Error", "Organization ID is required");
      return;
    }
    try {
      await runPipelineMutation.mutateAsync({ pipelineId });
      toast.success(
        "Pipeline execution started",
        `${pipelineName} is now running. Check the runs tab for progress.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to start the pipeline execution.";
      toast.error("Failed to run pipeline", errorMessage);
    }
  };

  const handleResumePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    if (!organizationId) {
      toast.error("Error", "Organization ID is required");
      return;
    }
    try {
      await resumePipelineMutation.mutateAsync({ pipelineId });
      toast.success(
        "Pipeline resumed",
        `${pipelineName} has been resumed successfully. You can now run it.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to resume the pipeline.";
      toast.error("Failed to resume pipeline", errorMessage);
    }
  };

  const columns: ColumnDef<Pipeline>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "sourceSchema",
      header: "Source",
      cell: ({ row }) => {
        const pipeline = row.original;
        const sourceSchema = pipeline.sourceSchema;

        if (sourceSchema) {
          return (
            <div className="text-sm text-muted-foreground">
              {sourceSchema.name ||
                (sourceSchema.sourceTable
                  ? `${sourceSchema.sourceSchema || "public"}.${sourceSchema.sourceTable}`
                  : "Unknown source")}
            </div>
          );
        }

        return (
          <div className="text-sm text-muted-foreground">Unknown source</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      accessorKey: "destinationSchema",
      header: "Destination",
      cell: ({ row }) => {
        const pipeline = row.original;
        const destinationSchema = pipeline.destinationSchema;

        if (destinationSchema) {
          return (
            <div className="text-sm text-muted-foreground">
              {destinationSchema.name ||
                `${destinationSchema.destinationSchema || "public"}.${destinationSchema.destinationTable}`}
            </div>
          );
        }

        return (
          <div className="text-sm text-muted-foreground">
            Unknown destination
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
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const pipeline = row.original;
        const creatorId = pipeline.createdBy;
        if (!creatorId) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        const creator = usersMap.get(creatorId);
        const displayName =
          creator?.fullName ||
          (creator?.firstName && creator?.lastName
            ? `${creator.firstName} ${creator.lastName}`
            : creator?.email?.split("@")[0] || "Unknown");
        return (
          <span className="text-sm text-muted-foreground">{displayName}</span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const pipeline = row.original;
        const isPaused = pipeline.status === "paused";

        // Get button text based on status
        const getButtonText = () => {
          if (isPaused) return "Run"; // Allow running even when paused (will resume)
          return "Run";
        };

        return (
          <div className="flex items-center justify-end gap-2">
            {isPaused ? (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumePipeline(pipeline.id, pipeline.name);
                }}
                disabled={resumePipelineMutation.isPending}
                title="Resume pipeline to active state"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRunPipeline(pipeline.id, pipeline.name);
                }}
                disabled={runPipelineMutation.isPending}
                title={
                  runPipelineMutation.isPending
                    ? "Pipeline execution in progress..."
                    : "Run pipeline"
                }
              >
                <Zap className="h-4 w-4 mr-2" />
                {getButtonText()}
              </Button>
            )}
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

      <DataTable
        tableId={
          organizationId
            ? `data-pipelines-table-${organizationId}`
            : "data-pipelines-table"
        }
        columns={columns}
        data={pipelines || []}
        isLoading={pipelinesLoading}
        enableSorting
        enableFiltering
        externalFilter={urlSearch}
        externalFilterColumnKey="name"
        filterPlaceholder="Filter pipelines ..."
        defaultVisibleColumns={[
          "name",
          "sourceSchema",
          "status",
          "destinationSchema",
          "createdAt",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No pipelines yet"
        emptyDescription="Create your first data pipeline to start moving data from source to destination. Configure transformations, set up real-time streaming, or bulk load your data."
      />
    </div>
  );
}
