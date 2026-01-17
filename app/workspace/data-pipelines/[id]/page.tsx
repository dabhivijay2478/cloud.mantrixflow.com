"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeletePipeline,
  usePausePipeline,
  usePipeline,
  usePipelineRuns,
  usePipelineStats,
  useResumePipeline,
  useRunPipeline,
  useValidatePipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import type { PipelineRun } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  // Fetch pipeline data
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(
    organizationId,
    pipelineId,
  );
  const { data: runs, isLoading: runsLoading } = usePipelineRuns(
    organizationId,
    pipelineId,
    10,
  );
  const { data: stats } = usePipelineStats(organizationId, pipelineId);

  // Mutations
  const runPipeline = useRunPipeline(organizationId, pipelineId);
  const pausePipeline = usePausePipeline(organizationId, pipelineId);
  const resumePipeline = useResumePipeline(organizationId, pipelineId);
  const validatePipeline = useValidatePipeline(organizationId, pipelineId);
  const deletePipeline = useDeletePipeline(organizationId);

  if (pipelineLoading) {
    return <LoadingState fullScreen message="Loading pipeline..." />;
  }

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Pipeline not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/workspace/data-pipelines")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
        </div>
      </div>
    );
  }

  const handleRun = async () => {
    try {
      await runPipeline.mutateAsync(undefined);
      toast.success("Pipeline started", `${pipeline.name} is now running.`);
    } catch (error) {
      toast.error(
        "Failed to run",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handlePause = async () => {
    try {
      await pausePipeline.mutateAsync();
      toast.success("Pipeline paused", `${pipeline.name} has been paused.`);
    } catch (error) {
      toast.error(
        "Failed to pause",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleResume = async () => {
    try {
      await resumePipeline.mutateAsync();
      toast.success("Pipeline resumed", `${pipeline.name} has been resumed.`);
    } catch (error) {
      toast.error(
        "Failed to resume",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleValidate = async () => {
    try {
      const result = await validatePipeline.mutateAsync();
      if (result.valid) {
        toast.success("Validation passed", "Pipeline configuration is valid.");
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

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${pipeline.name}"?`)) {
      try {
        await deletePipeline.mutateAsync(pipelineId);
        toast.success("Pipeline deleted", `${pipeline.name} has been deleted.`);
        router.push("/workspace/data-pipelines");
      } catch (error) {
        toast.error(
          "Failed to delete",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }
  };

  const getStatusBadge = () => {
    if (pipeline.status === "paused") {
      return (
        <Badge variant="outline" className="text-amber-600">
          <Pause className="h-3 w-3 mr-1" />
          Paused
        </Badge>
      );
    }
    if (pipeline.status === "failed") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const getRunStatusBadge = (run: PipelineRun) => {
    const statusConfig: Record<
      string,
      { icon: React.ReactNode; className: string }
    > = {
      pending: {
        icon: <Clock className="h-3 w-3" />,
        className: "bg-gray-500/10 text-gray-600",
      },
      running: {
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        className: "bg-blue-500/10 text-blue-600",
      },
      success: {
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: "bg-green-500/10 text-green-600",
      },
      failed: {
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-red-500/10 text-red-600",
      },
      cancelled: {
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-amber-500/10 text-amber-600",
      },
    };
    const config = statusConfig[run.status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1 capitalize">{run.status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workspace/data-pipelines")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pipeline.name}</h1>
              {getStatusBadge()}
            </div>
            {pipeline.description && (
              <p className="text-muted-foreground mt-1">
                {pipeline.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pipeline.status === "paused" ? (
            <Button onClick={handleResume} disabled={resumePipeline.isPending}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={pausePipeline.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={handleRun} disabled={runPipeline.isPending}>
                <Zap className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rows Processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRowsProcessed?.toLocaleString() ||
                pipeline.totalRowsProcessed?.toLocaleString() ||
                "0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful Runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalRunsSuccessful || pipeline.totalRunsSuccessful || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.totalRunsFailed || pipeline.totalRunsFailed || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageDuration ? `${stats.averageDuration}s` : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Run History Tab */}
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>Last 10 pipeline executions</CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading runs...
                </div>
              ) : runs && runs.length > 0 ? (
                <div className="space-y-3">
                  {runs.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getRunStatusBadge(run)}
                        <div>
                          <div className="text-sm font-medium">
                            {run.startedAt
                              ? new Date(run.startedAt).toLocaleString()
                              : "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Triggered: {run.triggerType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">
                            {run.rowsWritten?.toLocaleString() || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Written
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">
                            {run.rowsFailed?.toLocaleString() || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Failed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">
                            {run.durationSeconds
                              ? `${run.durationSeconds}s`
                              : "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Duration
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No runs yet. Click "Run Now" to execute the pipeline.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
                <CardDescription>Data source configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium uppercase">
                    {pipeline.sourceSchema?.sourceType || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium">
                    {pipeline.sourceSchema?.sourceTable
                      ? `${pipeline.sourceSchema.sourceSchema || "public"}.${pipeline.sourceSchema.sourceTable}`
                      : pipeline.sourceSchema?.sourceQuery
                        ? "Custom Query"
                        : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destination</CardTitle>
                <CardDescription>Target configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-medium">
                    {pipeline.destinationSchema
                      ? `${pipeline.destinationSchema.destinationSchema}.${pipeline.destinationSchema.destinationTable}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Write Mode</span>
                  <span className="font-medium capitalize">
                    {pipeline.destinationSchema?.writeMode || "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sync Mode</span>
                <span className="font-medium capitalize">
                  {pipeline.syncMode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Schedule</span>
                <span className="font-medium capitalize">
                  {pipeline.syncFrequency}
                </span>
              </div>
              {pipeline.syncMode === "incremental" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Incremental Column
                  </span>
                  <span className="font-medium">
                    {pipeline.incrementalColumn || "-"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Validate Configuration</div>
                  <div className="text-sm text-muted-foreground">
                    Check if the pipeline configuration is valid
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleValidate}
                  disabled={validatePipeline.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validate
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Edit Pipeline</div>
                  <div className="text-sm text-muted-foreground">
                    Modify pipeline settings and mappings
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/workspace/data-pipelines/${pipelineId}/edit`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-900">
                <div>
                  <div className="font-medium text-red-600">
                    Delete Pipeline
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete this pipeline and all run history
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletePipeline.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
