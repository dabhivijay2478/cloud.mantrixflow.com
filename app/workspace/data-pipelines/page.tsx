"use client";

import {
  ArrowRightLeft,
  Database,
  Pause,
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
import { usePipelines, useDeletePipeline, useRunPipeline, usePausePipeline } from "@/lib/api/hooks/use-data-pipelines";
import { useConnections } from "@/lib/api/hooks/use-data-sources";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import type { Pipeline } from "@/lib/api/types/data-pipelines";

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

  const getStatusBadge = (pipeline: Pipeline) => {
    // Priority order: migrationState > lastRunStatus > status
    
    // Get migration state (default to pending if not set)
    const migrationState = pipeline.migrationState || 'pending';
    
    // Migration state badges (highest priority)
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
        // Check if pipeline is paused
        if (pipeline.status === "paused") {
          return (
            <Badge variant="outline" className="text-muted-foreground border-amber-300 dark:border-amber-700">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Paused
              </div>
            </Badge>
          );
        }
        // Show pending state
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

    // Fallback to pipeline status
    switch (pipeline.status) {
      case "active":
        // Show sync mode if available
        const syncMode = (pipeline as any).syncMode;
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
      case "paused":
        return (
          <Badge variant="outline" className="text-muted-foreground border-amber-300 dark:border-amber-700">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Paused
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
      } catch (error: any) {
        toast.error(
          "Failed to delete pipeline",
          error?.message || "Unable to delete the pipeline.",
        );
      }
    }
  };

  const handleRunPipeline = async (pipelineId: string, pipelineName: string) => {
    try {
      await runPipeline.mutateAsync(pipelineId);
      toast.success(
        "Pipeline execution started",
        `${pipelineName} is now running. Check the runs tab for progress.`,
      );
    } catch (error: any) {
      toast.error(
        "Failed to run pipeline",
        error?.message || "Unable to start the pipeline execution.",
      );
    }
  };

  const handlePausePipeline = async (pipelineId: string, pipelineName: string) => {
    try {
      await pausePipeline.mutateAsync(pipelineId);
      toast.success(
        "Pipeline paused",
        `${pipelineName} has been paused successfully.`,
      );
    } catch (error: any) {
      toast.error(
        "Failed to pause pipeline",
        error?.message || "Unable to pause the pipeline.",
      );
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
        let sourceConnectionId = (row.original as any).sourceConnectionId;
        
        // If not found, extract from transformations.collectors
        if (!sourceConnectionId && row.original.transformations) {
          const transformations = row.original.transformations as any;
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
        const migrationState = pipeline.migrationState || 'pending';
        const isRunning = migrationState === "running" || migrationState === "listing" || pipeline.lastRunStatus === "running";
        const isPaused = pipeline.status === "paused";
        const canPause = migrationState === "running" || migrationState === "listing";
        
        // Get button text based on actual migration state (matching status badge logic)
        const getButtonText = () => {
          if (migrationState === "running") return "Running...";
          if (migrationState === "listing") return "Listing...";
          if (pipeline.lastRunStatus === "running") return "Running...";
          if (isPaused) return "Paused";
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
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRunPipeline(pipeline.id, pipeline.name);
              }}
              disabled={
                runPipeline.isPending || 
                isPaused || 
                isRunning
              }
              title={
                runPipeline.isPending
                  ? "Pipeline execution in progress..."
                  : isPaused
                  ? "Pipeline is paused. Please activate it first."
                  : isRunning
                  ? "Pipeline is currently running. Please wait for it to complete."
                  : "Run pipeline"
              }
            >
              <Zap className="h-4 w-4 mr-2" />
              {getButtonText()}
            </Button>
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
