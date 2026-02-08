"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Settings,
  TestTube,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  dataPipelinesKeys,
  useDeletePipeline,
  usePipelinesPaginated,
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
  const queryClient = useQueryClient();
  const router = useRouter();

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  // API hooks
  const { data: paginatedResult, isLoading: pipelinesLoading } =
    usePipelinesPaginated(organizationId, pagination);
  const pipelines = paginatedResult?.data;
  const deletePipeline = useDeletePipeline(organizationId);

  // Get user info for creators
  const userIds =
    pipelines?.map((pipeline) => pipeline.createdBy).filter(Boolean) || [];
  const { usersMap } = useUsers(userIds);

  // Mutation hooks for pipeline actions
  const runPipelineMutation = useMutation({
    mutationFn: ({
      pipelineId,
      batchSize,
    }: {
      pipelineId: string;
      batchSize?: number;
    }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return DataPipelinesService.runPipeline(organizationId, pipelineId, {
        batchSize,
      });
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

  const pausePipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return DataPipelinesService.pausePipeline(organizationId, pipelineId);
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
      if (!organizationId) throw new Error("Organization ID is required");
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

  const validatePipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return DataPipelinesService.validatePipeline(organizationId, pipelineId);
    },
  });

  const dryRunPipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return DataPipelinesService.dryRunPipeline(organizationId, pipelineId, {
        sampleSize: 10,
      });
    },
  });

  // Action handlers
  const handleRunPipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await runPipelineMutation.mutateAsync({ pipelineId });
      toast.success("Pipeline started", `${pipelineName} is now running.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start pipeline.";
      toast.error("Failed to run pipeline", message);
    }
  };

  const handlePausePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await pausePipelineMutation.mutateAsync({ pipelineId });
      toast.success("Pipeline paused", `${pipelineName} has been paused.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to pause pipeline.";
      toast.error("Failed to pause pipeline", message);
    }
  };

  const handleResumePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      await resumePipelineMutation.mutateAsync({ pipelineId });
      toast.success("Pipeline resumed", `${pipelineName} has been resumed.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to resume pipeline.";
      toast.error("Failed to resume pipeline", message);
    }
  };

  const handleValidatePipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      const result = await validatePipelineMutation.mutateAsync({ pipelineId });
      if (result.valid) {
        toast.success(
          "Validation passed",
          `${pipelineName} configuration is valid.`,
        );
      } else {
        toast.error("Validation failed", result.errors.join(", "));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to validate pipeline.";
      toast.error("Validation error", message);
    }
  };

  const handleDryRunPipeline = async (
    pipelineId: string,
    pipelineName: string,
  ) => {
    try {
      const result = await dryRunPipelineMutation.mutateAsync({ pipelineId });
      toast.success(
        "Dry run completed",
        `${pipelineName}: Would write ${result.wouldWrite} rows from ${result.sourceRowCount || "?"} source rows.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to dry run pipeline.";
      toast.error("Dry run failed", message);
    }
  };

  const handleDeleteClick = (pipelineId: string, pipelineName: string) => {
    setDeleteTarget({ id: pipelineId, name: pipelineName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deletePipeline.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(
        "Pipeline deleted",
        `${deleteTarget.name} has been deleted.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete pipeline.";
      toast.error("Failed to delete pipeline", message);
    }
  };

  // Status badge renderer
  const getStatusBadge = (pipeline: Pipeline) => {
    const baseClasses = "flex items-center gap-1.5";

    if (pipeline.status === "paused") {
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-300 dark:border-amber-700"
        >
          <div className={baseClasses}>
            <Pause className="h-3 w-3" />
            Paused
          </div>
        </Badge>
      );
    }

    if (pipeline.lastRunStatus === "success") {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <div className={baseClasses}>
            <CheckCircle2 className="h-3 w-3" />
            Success
          </div>
        </Badge>
      );
    }

    if (pipeline.lastRunStatus === "failed") {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          <div className={baseClasses}>
            <XCircle className="h-3 w-3" />
            Failed
          </div>
        </Badge>
      );
    }

    // Handle new lifecycle statuses
    if (pipeline.status === "idle") {
      // Check if auto-sync is enabled and has run before
      const hasAutoSync =
        pipeline.syncMode === "incremental" ||
        (pipeline.scheduleType && pipeline.scheduleType !== "none") ||
        pipeline.syncFrequency === "minutes";
      const hasRun =
        (pipeline.totalRowsProcessed && pipeline.totalRowsProcessed > 0) ||
        pipeline.lastRunAt;

      if (hasAutoSync && hasRun) {
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <div className={baseClasses}>
              <RefreshCw className="h-3 w-3" />
              Auto-syncing
            </div>
          </Badge>
        );
      }

      return (
        <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
          <div className={baseClasses}>
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400" />
            {hasAutoSync ? "Ready" : "Idle"}
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "running" || pipeline.status === "initializing") {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          <div className={baseClasses}>
            <Loader2 className="h-3 w-3 animate-spin" />
            {pipeline.status === "initializing" ? "Initializing" : "Running"}
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "listing") {
      return (
        <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
          <div className={baseClasses}>
            <RefreshCw className="h-3 w-3" />
            Polling
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "listening") {
      return (
        <Badge className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20">
          <div className={baseClasses}>
            <Radio className="h-3 w-3" />
            Listening
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "completed") {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <div className={baseClasses}>
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "failed") {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          <div className={baseClasses}>
            <XCircle className="h-3 w-3" />
            Failed
          </div>
        </Badge>
      );
    }

    if (pipeline.status === "paused") {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
          <div className={baseClasses}>
            <Pause className="h-3 w-3" />
            Paused
          </div>
        </Badge>
      );
    }

    // Fallback for any unhandled status (should not happen in normal cases)
    const statusText = String(pipeline.status || "unknown");
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </Badge>
    );
  };

  // Sync frequency badge
  const getSyncFrequencyBadge = (pipeline: Pipeline) => {
    const frequency = pipeline.syncFrequency;
    const scheduleType = pipeline.scheduleType;
    const scheduleValue = pipeline.scheduleValue;

    const colors: Record<string, string> = {
      manual: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      minutes: "bg-green-500/10 text-green-700 dark:text-green-400",
      hourly: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      daily: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      weekly: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    };

    // Format display text
    let displayText =
      frequency?.charAt(0).toUpperCase() + frequency?.slice(1) || "Manual";
    if (frequency === "minutes" || scheduleType === "minutes") {
      displayText = `Every ${scheduleValue || "2"} min`;
    } else if (scheduleType && scheduleType !== "none") {
      displayText =
        scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1);
    }

    return (
      <Badge className={colors[frequency || "manual"] || colors.manual}>
        {displayText}
      </Badge>
    );
  };

  // Table columns
  const columns: ColumnDef<Pipeline>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "sourceSchema",
      header: "Source",
      cell: ({ row }) => {
        const source = row.original.sourceSchema;
        const sourceId = row.original.sourceSchemaId;

        if (!source && !sourceId) {
          return <span className="text-muted-foreground">-</span>;
        }

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          router.push(`/workspace/source-schemas?schemaId=${sourceId}`);
        };

        if (source) {
          return (
            <button
              type="button"
              onClick={handleClick}
              className="text-left group hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <div className="text-sm">
                  <span className="font-medium text-primary group-hover:underline">
                    {source.sourceType}
                  </span>
                  {source.sourceTable && (
                    <span className="text-muted-foreground ml-1">
                      ({source.sourceSchema || "public"}.{source.sourceTable})
                    </span>
                  )}
                </div>
              </div>
              {source.name && (
                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {source.name}
                </div>
              )}
            </button>
          );
        }

        // Fallback: show just the ID as clickable
        return (
          <button
            type="button"
            onClick={handleClick}
            className="text-sm text-primary hover:underline"
          >
            {sourceId.slice(0, 8)}...
          </button>
        );
      },
    },
    {
      accessorKey: "destinationSchema",
      header: "Destination",
      cell: ({ row }) => {
        const dest = row.original.destinationSchema;
        const destId = row.original.destinationSchemaId;

        if (!dest && !destId) {
          return <span className="text-muted-foreground">-</span>;
        }

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          router.push(`/workspace/destination-schemas?schemaId=${destId}`);
        };

        if (dest) {
          return (
            <button
              type="button"
              onClick={handleClick}
              className="text-left group hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
            >
              <div className="text-sm">
                <span className="font-medium text-primary group-hover:underline">
                  {dest.destinationSchema || "public"}.{dest.destinationTable}
                </span>
              </div>
              {dest.name && (
                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {dest.name}
                </div>
              )}
            </button>
          );
        }

        // Fallback: show just the ID as clickable
        return (
          <button
            type="button"
            onClick={handleClick}
            className="text-sm text-primary hover:underline"
          >
            {destId.slice(0, 8)}...
          </button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      accessorKey: "syncFrequency",
      header: "Schedule",
      cell: ({ row }) => getSyncFrequencyBadge(row.original),
    },
    {
      accessorKey: "totalRowsProcessed",
      header: "Rows Processed",
      cell: ({ row }) => {
        const count = row.original.totalRowsProcessed;
        return (
          <span className="text-sm text-muted-foreground">
            {count ? count.toLocaleString() : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "lastRunAt",
      header: "Last Run",
      cell: ({ row }) => {
        const date = row.original.lastRunAt;
        return (
          <span className="text-sm text-muted-foreground">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const creatorId = row.original.createdBy;
        if (!creatorId) return <span className="text-muted-foreground">-</span>;
        const creator = usersMap.get(creatorId);
        const displayName =
          creator?.fullName || creator?.email?.split("@")[0] || "Unknown";
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
        const isRunning =
          pipeline.status === "running" ||
          pipeline.status === "initializing" ||
          pipeline.status === "listening";
        const isLoading =
          runPipelineMutation.isPending ||
          pausePipelineMutation.isPending ||
          resumePipelineMutation.isPending;

        // Check if auto-sync is enabled (incremental mode or has schedule)
        const hasAutoSync =
          pipeline.syncMode === "incremental" ||
          (pipeline.scheduleType && pipeline.scheduleType !== "none") ||
          pipeline.syncFrequency === "minutes";

        // Check if first run completed (has processed rows or last run exists)
        const hasRun =
          (pipeline.totalRowsProcessed && pipeline.totalRowsProcessed > 0) ||
          pipeline.lastRunAt;

        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              {isPaused ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumePipeline(pipeline.id, pipeline.name);
                      }}
                      disabled={isLoading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resume auto-sync</TooltipContent>
                </Tooltip>
              ) : isRunning ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePausePipeline(pipeline.id, pipeline.name);
                      }}
                      disabled={isLoading}
                      className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Running
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pipeline is syncing</TooltipContent>
                </Tooltip>
              ) : hasAutoSync && hasRun ? (
                // Auto-sync enabled and has run before - show Pause button
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePausePipeline(pipeline.id, pipeline.name);
                      }}
                      disabled={isLoading}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Pause auto-sync (checking every 2 min)
                  </TooltipContent>
                </Tooltip>
              ) : (
                // First time or manual mode - show Run button
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunPipeline(pipeline.id, pipeline.name);
                      }}
                      disabled={isLoading}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {hasAutoSync ? "Start" : "Run"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasAutoSync
                      ? "Start auto-sync (first full sync, then incremental)"
                      : "Execute pipeline now"}
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workspace/data-pipelines/${pipeline.id}`);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleValidatePipeline(pipeline.id, pipeline.name);
                  }}
                  disabled={validatePipelineMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Validate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDryRunPipeline(pipeline.id, pipeline.name);
                  }}
                  disabled={dryRunPipelineMutation.isPending}
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Dry Run
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isPaused ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResumePipeline(pipeline.id, pipeline.name);
                    }}
                    className="text-green-600 focus:text-green-600"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume Auto-Sync
                  </DropdownMenuItem>
                ) : (
                  !isRunning &&
                  hasRun && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePausePipeline(pipeline.id, pipeline.name);
                      }}
                      className="text-amber-600 focus:text-amber-600"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Auto-Sync
                    </DropdownMenuItem>
                  )
                )}
                {!isRunning && !hasRun && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunPipeline(pipeline.id, pipeline.name);
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Start Sync
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(pipeline.id, pipeline.name);
                  }}
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: dataPipelinesKeys.pipelines.list(
                    organizationId || "",
                  ),
                })
              }
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/workspace/data-pipelines/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Pipeline
            </Button>
          </div>
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
        filterPlaceholder="Filter pipelines..."
        defaultVisibleColumns={[
          "name",
          "sourceSchema",
          "destinationSchema",
          "status",
          "syncFrequency",
          "lastRunAt",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        onRowClick={(row) => router.push(`/workspace/data-pipelines/${row.id}`)}
        emptyMessage="No pipelines yet"
        emptyDescription="Create your first data pipeline to start moving data from source to destination."
        manualPagination
        pagination={pagination}
        onPaginationChange={setPagination}
        totalCount={paginatedResult?.total ?? 0}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        action="delete"
        itemName="Pipeline"
        itemValue={deleteTarget?.name}
        isLoading={deletePipeline.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
