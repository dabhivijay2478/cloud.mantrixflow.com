"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  Edit,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
  Zap,
  Save,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDeletePipeline,
  usePausePipeline,
  usePipelineWithSchemas,
  usePipelineRuns,
  usePipelineStats,
  useResumePipeline,
  useRunPipeline,
  useValidatePipeline,
  useUpdatePipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import type { PipelineRun, ScheduleType } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { ScheduleEditor } from "@/components/data-pipelines";

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  // Schedule editing state
  const [scheduleConfig, setScheduleConfig] = useState<{
    scheduleType: ScheduleType;
    scheduleValue: string;
    scheduleTimezone: string;
  } | null>(null);
  const [isScheduleModified, setIsScheduleModified] = useState(false);

  // Fetch pipeline data with schemas
  const { data: pipelineData, isLoading: pipelineLoading, refetch } = usePipelineWithSchemas(
    organizationId,
    pipelineId,
  );
  const pipeline = pipelineData ? {
    ...pipelineData.pipeline,
    sourceSchema: pipelineData.sourceSchema,
    destinationSchema: pipelineData.destinationSchema,
  } : null;
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
  const updatePipeline = useUpdatePipeline(organizationId, pipelineId);

  // Handle schedule save
  const handleSaveSchedule = async () => {
    if (!scheduleConfig) return;
    
    try {
      await updatePipeline.mutateAsync({
        scheduleType: scheduleConfig.scheduleType,
        scheduleValue: scheduleConfig.scheduleValue,
        scheduleTimezone: scheduleConfig.scheduleTimezone,
      });
      toast.success("Schedule updated", "Pipeline schedule has been updated successfully.");
      setIsScheduleModified(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update schedule", error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Handle schedule change
  const handleScheduleChange = (config: {
    scheduleType: ScheduleType;
    scheduleValue: string;
    scheduleTimezone: string;
  }) => {
    setScheduleConfig(config);
    setIsScheduleModified(true);
  };

  // Real-time updates via Socket.io
  // ROOT FIX: No polling - all updates come via Socket.io from Postgres NOTIFY
  const socketRef = useRef<Socket | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<string | null>(null);
  const [realTimeRowsProcessed, setRealTimeRowsProcessed] = useState<number | null>(null);
  const [newRowsCount, setNewRowsCount] = useState<number>(0);

  useEffect(() => {
    if (!pipelineId || !organizationId) return;

    // Get API URL from environment or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api prefix if present

    // Connect to Socket.io
    const socket = io(`${socketUrl}/pipelines`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Join pipeline room
    socket.emit('join_pipeline', {
      pipelineId,
      organizationId,
    });

    // Listen for pipeline updates
    socket.on('update', (data: {
      type: 'pipeline';
      pipeline_id: string;
      status?: string;
      last_run_status?: string;
      total_rows_processed?: number;
      last_sync_at?: string;
      checkpoint?: any;
    }) => {
      if (data.pipeline_id === pipelineId) {
        // Update real-time state
        if (data.status) {
          setRealTimeStatus(data.status);
        }
        if (data.total_rows_processed !== undefined) {
          const previousRows = realTimeRowsProcessed || pipeline?.totalRowsProcessed || 0;
          const newRows = data.total_rows_processed - previousRows;
          if (newRows > 0) {
            setNewRowsCount((prev) => prev + newRows);
            toast.success(
              "New rows processed",
              `+${newRows.toLocaleString()} new rows synced`,
            );
          }
          setRealTimeRowsProcessed(data.total_rows_processed);
        }

        // Refetch to get latest data
        refetch();
      }
    });

    // Listen for run updates
    socket.on('run_update', (data: {
      type: 'run';
      run_id: string;
      pipeline_id: string;
      status?: string;
      rows_written?: number;
      rows_read?: number;
      rows_failed?: number;
      error_message?: string;
    }) => {
      if (data.pipeline_id === pipelineId) {
        // Show progress updates
        if (data.status === 'running' && data.rows_written) {
          toast.info(
            "Pipeline running",
            `${data.rows_written.toLocaleString()} rows written so far...`,
          );
        } else if (data.status === 'success') {
          toast.success(
            "Pipeline completed",
            `Successfully processed ${data.rows_written?.toLocaleString() || 0} rows`,
          );
          refetch();
        } else if (data.status === 'failed') {
          toast.error(
            "Pipeline failed",
            data.error_message || "Unknown error",
          );
          refetch();
        }

        // Refetch runs to show latest
        refetch();
      }
    });

    // Handle connection events
    socket.on('joined', () => {
      console.log('[Socket.io] Joined pipeline room:', pipelineId);
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to pipeline updates');
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from pipeline updates');
    });

    socket.on('error', (error: any) => {
      console.error('[Socket.io] Error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave_pipeline', { pipelineId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pipelineId, organizationId, refetch]);

  // Reset new rows count when pipeline changes
  useEffect(() => {
    setNewRowsCount(0);
    setRealTimeStatus(null);
    setRealTimeRowsProcessed(null);
  }, [pipelineId]);

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
              {realTimeStatus && realTimeStatus !== pipeline.status && (
                <Badge variant="outline" className="text-blue-600 animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  {realTimeStatus}
                </Badge>
              )}
              {newRowsCount > 0 && (
                <Badge className="bg-green-500/10 text-green-700">
                  +{newRowsCount.toLocaleString()} new rows
                </Badge>
              )}
            </div>
            {pipeline.description && (
              <p className="text-muted-foreground mt-1">
                {pipeline.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pipeline.status === "running" ? (
            <Button disabled variant="outline">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </Button>
          ) : pipeline.status === "paused" ? (
            <Button onClick={handleResume} disabled={resumePipeline.isPending}>
              <Play className="h-4 w-4 mr-2" />
              Resume Auto-Sync
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={pausePipeline.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Auto-Sync
              </Button>
              <Button onClick={handleRun} disabled={runPipeline.isPending} variant="secondary">
                <Zap className="h-4 w-4 mr-2" />
                Sync Now
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
              {realTimeRowsProcessed?.toLocaleString() ||
                stats?.totalRowsProcessed?.toLocaleString() ||
                pipeline.totalRowsProcessed?.toLocaleString() ||
                "0"}
            </div>
            {realTimeRowsProcessed && (
              <div className="text-xs text-muted-foreground mt-1">
                Live updates enabled
              </div>
            )}
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
                <span className="text-muted-foreground">Schedule Type</span>
                <span className="font-medium capitalize">
                  {pipeline.scheduleType === "none" || !pipeline.scheduleType
                    ? "Manual"
                    : pipeline.scheduleType === "custom_cron"
                      ? "Custom Cron"
                      : pipeline.scheduleType}
                </span>
              </div>
              {pipeline.scheduleType && pipeline.scheduleType !== "none" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Schedule Value</span>
                    <span className="font-medium">
                      {pipeline.scheduleValue || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timezone</span>
                    <span className="font-medium">
                      {pipeline.scheduleTimezone || "UTC"}
                    </span>
                  </div>
                  {pipeline.nextScheduledRunAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Run</span>
                      <span className="font-medium text-primary">
                        {new Date(pipeline.nextScheduledRunAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {pipeline.lastScheduledRunAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Scheduled Run</span>
                      <span className="font-medium">
                        {new Date(pipeline.lastScheduledRunAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}
              {pipeline.status === "listing" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    CDC Column (Auto-detected)
                  </span>
                  <span className="font-medium font-mono text-xs">
                    {(pipeline.checkpoint as any)?.watermarkField || pipeline.incrementalColumn || "-"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule Configuration
              </CardTitle>
              <CardDescription>
                Configure automatic pipeline runs on a schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScheduleEditor
                scheduleType={(scheduleConfig?.scheduleType || pipeline.scheduleType || "none") as ScheduleType}
                scheduleValue={scheduleConfig?.scheduleValue || pipeline.scheduleValue || ""}
                scheduleTimezone={scheduleConfig?.scheduleTimezone || pipeline.scheduleTimezone || "UTC"}
                onChange={handleScheduleChange}
              />
              {isScheduleModified && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveSchedule}
                    disabled={updatePipeline.isPending}
                  >
                    {updatePipeline.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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

