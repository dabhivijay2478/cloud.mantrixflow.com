"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Database,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDeletePipeline,
  usePausePipeline,
  usePipelines,
  useResumePipeline,
  useRunPipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import { useConnections } from "@/lib/api/hooks/use-data-sources";
import { useUsers } from "@/lib/api/hooks/use-users";
import type { Pipeline } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

type PipelineType = "bulk" | "stream" | "emit";

export default function DataPipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Use real API hooks instead of workspace store
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines(orgId);
  const { data: connections } = useConnections(orgId);
  const deletePipeline = useDeletePipeline();
  const runPipeline = useRunPipeline();
  const pausePipeline = usePausePipeline();
  const resumePipeline = useResumePipeline();
  const router = useRouter();

  // Get all unique user IDs from pipelines for fetching user names
  const userIds = pipelines?.map((pipeline) => pipeline.userId).filter(Boolean) || [];
  const { usersMap } = useUsers(userIds);

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

  const getStatusBadge = (pipeline: Pipeline) => {
    // Priority order: paused status > migrationState > lastRunStatus > status

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

    // Get migration state (default to pending if not set)
    const migrationState = pipeline.migrationState || "pending";

    // Migration state badges (second priority)
    switch (migrationState) {
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 animate-pulse">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              Running
            </div>
          </Badge>
        );
      case "listing":
        return (
          <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
              Listing
            </div>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
              Completed
            </div>
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
              Error
            </div>
          </Badge>
        );
      case "pending":
        // Show pending state (paused status is already handled at the top of the function)
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
              Pending
            </div>
          </Badge>
        );
    }

    // Fallback to lastRunStatus if migrationState is not set
    if (pipeline.lastRunStatus === "running") {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 animate-pulse">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            Running
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

  const handleRunPipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await runPipeline.mutateAsync(pipelineId);
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

  const handlePausePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await pausePipeline.mutateAsync(pipelineId);
      toast.success(
        "Pipeline paused",
        `${pipelineName} has been paused successfully.`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to pause the pipeline.";
      toast.error("Failed to pause pipeline", errorMessage);
    }
  };

  const handleResumePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await resumePipeline.mutateAsync(pipelineId);
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
        // Try to get sourceConnectionId from pipeline object first
        let sourceConnectionId = (
          row.original as { sourceConnectionId?: string }
        ).sourceConnectionId;

        // If not found, extract from transformations.collectors
        if (!sourceConnectionId && row.original.transformations) {
          const transformations = row.original.transformations as {
            collectors?: Array<{ sourceId?: string }>;
          };
          const collectors = transformations?.collectors || [];
          if (collectors.length > 0 && collectors[0].sourceId) {
            sourceConnectionId = collectors[0].sourceId;
          }
        }

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
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      accessorKey: "destinationConnectionId",
      header: "Destination",
      cell: ({ row }) => {
        const destConnectionId = row.original.destinationConnectionId;
        const dest = connections?.find((conn) => conn.id === destConnectionId);
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
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const pipeline = row.original;
        if (!pipeline.userId) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        const creator = usersMap.get(pipeline.userId);
        const displayName = creator?.fullName || 
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
        const migrationState = pipeline.migrationState || "pending";
        const isRunning =
          migrationState === "running" ||
          migrationState === "listing" ||
          pipeline.lastRunStatus === "running";
        const isPaused = pipeline.status === "paused";
        // Only show pause button when running/listing AND not paused
        const canPause =
          (migrationState === "running" || migrationState === "listing") &&
          !isPaused;

        // Get button text based on actual migration state (matching status badge logic)
        const getButtonText = () => {
          if (migrationState === "running") return "Running...";
          if (migrationState === "listing") return "Listing...";
          if (pipeline.lastRunStatus === "running") return "Running...";
          if (isPaused) return "Run"; // Allow running even when paused (will resume)
          if (migrationState === "pending") return "Run";
          if (migrationState === "completed") return "Run";
          if (migrationState === "error") return "Run";
          return "Run";
        };

        return (
          <div className="flex items-center justify-end gap-2">
            {canPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePausePipeline(pipeline.id, pipeline.name);
                }}
                disabled={pausePipeline.isPending}
                title="Pause pipeline execution"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {isPaused ? (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumePipeline(pipeline.id, pipeline.name);
                }}
                disabled={resumePipeline.isPending}
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
                disabled={runPipeline.isPending || isRunning}
                title={
                  runPipeline.isPending
                    ? "Pipeline execution in progress..."
                    : isRunning
                      ? "Pipeline is currently running. Please wait for it to complete."
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
        columns={columns}
        data={pipelines || []}
        isLoading={pipelinesLoading}
        enableSorting
        enableFiltering
        filterPlaceholder="Filter pipelines ..."
        defaultVisibleColumns={[
          "name",
          "sourceType",
          "sourceConnectionId",
          "status",
          "destinationConnectionId",
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
