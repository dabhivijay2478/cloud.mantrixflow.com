"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Columns3,
  Edit,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  CdcSetupModal,
  DataPreviewTable,
  ScheduleEditor,
  SchemaView,
  TransformCodeView,
} from "@/components/data-pipelines";
import { LoadingState } from "@/components/shared";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCancelPipelineRun,
  useDeletePipeline,
  usePausePipeline,
  usePipelineRuns,
  usePipelineStats,
  usePipelineWithSchemas,
  useResumePipeline,
  useRunPipeline,
  useUpdatePipeline,
  useValidatePipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import { useCdcStatus } from "@/lib/api/hooks/use-data-source";
import { usePreviewDestinationData } from "@/lib/api/hooks/use-destination-schemas";
import { usePreviewSourceData } from "@/lib/api/hooks/use-source-schemas";
import type { PipelineRun, ScheduleType } from "@/lib/api/types/data-pipelines";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // CDC setup modal (when LOG_BASED and CDC not verified)
  const [showCdcSetup, setShowCdcSetup] = useState(false);
  // Expanded error for run history (runId -> expanded)
  const [expandedRunErrors, setExpandedRunErrors] = useState<
    Record<string, boolean>
  >({});

  // Schedule editing state
  const [scheduleConfig, setScheduleConfig] = useState<{
    scheduleType: ScheduleType;
    scheduleValue: string;
    scheduleTimezone: string;
  } | null>(null);
  const [isScheduleModified, setIsScheduleModified] = useState(false);

  // Fetch pipeline data with schemas
  const {
    data: pipelineData,
    isLoading: pipelineLoading,
    refetch,
  } = usePipelineWithSchemas(organizationId, pipelineId);
  const pipeline = pipelineData
    ? {
        ...pipelineData.pipeline,
        sourceSchema: pipelineData.sourceSchema,
        destinationSchema: pipelineData.destinationSchema,
      }
    : null;
  const { data: runs, isLoading: runsLoading } = usePipelineRuns(
    organizationId,
    pipelineId,
    10,
  );
  const { data: stats } = usePipelineStats(organizationId, pipelineId);

  // CDC status for LOG_BASED pipelines (source data source)
  const sourceDataSourceId = pipeline?.sourceSchema?.dataSourceId;
  const { data: cdcStatus } = useCdcStatus(
    organizationId,
    sourceDataSourceId ?? undefined,
    !!(
      organizationId &&
      sourceDataSourceId &&
      (pipeline?.syncMode === "cdc" || pipeline?.syncMode === "log_based")
    ),
  );
  const cdcVerified =
    cdcStatus?.cdc_prerequisites_status?.overall === "verified";

  // Mutations
  const runPipeline = useRunPipeline(organizationId, pipelineId);
  const pausePipeline = usePausePipeline(organizationId, pipelineId);
  const resumePipeline = useResumePipeline(organizationId, pipelineId);
  const validatePipeline = useValidatePipeline(organizationId, pipelineId);
  const cancelPipelineRun = useCancelPipelineRun(organizationId, pipelineId);
  const deletePipeline = useDeletePipeline(organizationId);
  const updatePipeline = useUpdatePipeline(organizationId, pipelineId);

  const activeRun = runs?.find((r) => r.status === "running");

  // Source & destination data previews (top 10 rows, lazy-loaded)
  const sourceSchemaId = pipelineData?.pipeline?.sourceSchemaId;
  const destinationSchemaId = pipelineData?.pipeline?.destinationSchemaId;

  const {
    data: sourcePreview,
    isLoading: sourcePreviewLoading,
    error: sourcePreviewError,
    refetch: refetchSourcePreview,
    isFetching: sourcePreviewRefreshing,
  } = usePreviewSourceData(
    organizationId,
    sourceSchemaId,
    10,
    !!sourceSchemaId,
  );

  const {
    data: destinationPreview,
    isLoading: destPreviewLoading,
    error: destPreviewError,
    refetch: refetchDestPreview,
    isFetching: destPreviewRefreshing,
  } = usePreviewDestinationData(
    organizationId,
    destinationSchemaId,
    10,
    !!destinationSchemaId,
  );

  // Handle schedule save
  const handleSaveSchedule = async () => {
    if (!scheduleConfig) return;

    try {
      await updatePipeline.mutateAsync({
        scheduleType: scheduleConfig.scheduleType,
        scheduleValue: scheduleConfig.scheduleValue,
        scheduleTimezone: scheduleConfig.scheduleTimezone,
      });
      toast.success(
        "Schedule updated",
        "Pipeline schedule has been updated successfully.",
      );
      setIsScheduleModified(false);
      refetch();
    } catch (error) {
      toast.error(
        "Failed to update schedule",
        error instanceof Error ? error.message : "Unknown error",
      );
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
  const [realTimeRowsProcessed, setRealTimeRowsProcessed] = useState<
    number | null
  >(null);
  const [newRowsCount, setNewRowsCount] = useState<number>(0);

  // Use refs to track values without causing effect re-runs
  const realTimeRowsProcessedRef = useRef<number | null>(null);
  const pipelineTotalRowsRef = useRef<number | undefined>(undefined);

  // Update refs when values change (without triggering effect re-run)
  useEffect(() => {
    realTimeRowsProcessedRef.current = realTimeRowsProcessed;
  }, [realTimeRowsProcessed]);

  useEffect(() => {
    pipelineTotalRowsRef.current = pipeline?.totalRowsProcessed ?? undefined;
  }, [pipeline?.totalRowsProcessed]);

  useEffect(() => {
    if (!pipelineId || !organizationId) return;

    // WebSocket base URL: NEXT_PUBLIC_WS_URL when set, else derive from NEXT_PUBLIC_API_URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const socketUrl = wsUrl || (apiUrl ? apiUrl.replace(/\/api\/?$/, "") : "");
    if (!socketUrl) return;

    // Connect to Socket.io
    const socket = io(`${socketUrl}/pipelines`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Join pipeline room
    socket.emit("join_pipeline", {
      pipelineId,
      organizationId,
    });

    // Listen for pipeline updates
    socket.on(
      "update",
      (data: {
        type: "pipeline";
        pipeline_id: string;
        status?: string;
        last_run_status?: string;
        total_rows_processed?: number;
        last_sync_at?: string;
        checkpoint?: Record<string, unknown>;
      }) => {
        if (data.pipeline_id === pipelineId) {
          // Update real-time state
          if (data.status) {
            setRealTimeStatus(data.status);
          }
          if (data.total_rows_processed !== undefined) {
            const previousRows =
              realTimeRowsProcessedRef.current ??
              pipelineTotalRowsRef.current ??
              0;
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
      },
    );

    // Listen for run updates
    socket.on(
      "run_update",
      (data: {
        type: "run";
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
          if (data.status === "running" && data.rows_written) {
            toast.info(
              "Pipeline running",
              `${data.rows_written.toLocaleString()} rows written so far...`,
            );
          } else if (data.status === "success") {
            toast.success(
              "Pipeline completed",
              `Successfully processed ${data.rows_written?.toLocaleString() || 0} rows`,
            );
            refetch();
          } else if (data.status === "failed") {
            toast.error(
              "Pipeline failed",
              data.error_message || "Unknown error",
            );
            refetch();
          }

          // Refetch runs to show latest
          refetch();
        }
      },
    );

    // Handle connection events
    socket.on("joined", () => {
      console.log("[Socket.io] Joined pipeline room:", pipelineId);
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected to pipeline updates");
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected from pipeline updates");
    });

    socket.on("error", (error: Error) => {
      console.error("[Socket.io] Error:", error);
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave_pipeline", { pipelineId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pipelineId, organizationId, refetch]);

  // Reset new rows count when pipeline changes
  useEffect(() => {
    setNewRowsCount(0);
    setRealTimeStatus(null);
    setRealTimeRowsProcessed(null);
  }, []);

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
    const isCdcOrLogBased =
      pipeline.syncMode === "cdc" || pipeline.syncMode === "log_based";
    if (isCdcOrLogBased && !cdcVerified) {
      setShowCdcSetup(true);
      return;
    }
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

  const handleCancelRun = async () => {
    if (!activeRun?.id) return;
    try {
      await cancelPipelineRun.mutateAsync(activeRun.id);
      toast.success("Run cancelled", "The pipeline run has been cancelled.");
    } catch (error) {
      toast.error(
        "Failed to cancel",
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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePipeline.mutateAsync(pipelineId);
      setShowDeleteConfirm(false);
      toast.success("Pipeline deleted", `${pipeline.name} has been deleted.`);
      router.push("/workspace/data-pipelines");
    } catch (error) {
      toast.error(
        "Failed to delete",
        error instanceof Error ? error.message : "Unknown error",
      );
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
                <Badge
                  variant="outline"
                  className="text-blue-600 animate-pulse"
                >
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
          {pipeline.status === "running" && activeRun ? (
            <Button
              variant="outline"
              onClick={handleCancelRun}
              disabled={cancelPipelineRun.isPending}
            >
              {cancelPipelineRun.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {cancelPipelineRun.isPending ? "Cancelling…" : "Cancel Run"}
            </Button>
          ) : pipeline.status === "running" ? (
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
              {(pipeline.syncMode === "cdc" ||
                pipeline.syncMode === "log_based") &&
                !cdcVerified && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCdcSetup(true)}
                  >
                    Set Up CDC
                  </Button>
                )}
              <Button
                onClick={handleRun}
                disabled={runPipeline.isPending}
                variant="secondary"
              >
                <Zap className="h-4 w-4 mr-2" />
                {(pipeline.syncMode === "cdc" ||
                  pipeline.syncMode === "log_based") &&
                !pipeline.fullRefreshCompletedAt
                  ? "Run Initial Sync"
                  : "Sync Now"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline-level error when status is failed */}
      {pipeline.status === "failed" && pipeline.lastError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Last Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-sans max-h-48 overflow-y-auto">
              {pipeline.lastError}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Sync</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {pipeline.destinationSchema?.lastSyncedAt
                ? new Date(
                    pipeline.destinationSchema.lastSyncedAt,
                  ).toLocaleDateString()
                : pipeline.lastRunAt
                  ? new Date(pipeline.lastRunAt).toLocaleDateString()
                  : "-"}
            </div>
            {(pipeline.destinationSchema?.lastSyncedAt ||
              pipeline.lastRunAt) && (
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(
                  pipeline.destinationSchema?.lastSyncedAt ||
                    pipeline.lastRunAt ||
                    "",
                ).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="incoming">Incoming Data</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing Data</TabsTrigger>
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
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3">
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
                      {run.status === "failed" &&
                        (() => {
                          const errMsg =
                            run.errorMessage ??
                            (run as { error_message?: string }).error_message ??
                            "Unknown error";
                          return (
                            <div className="border-t bg-destructive/5 px-3 py-2">
                              <div className="flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-destructive mb-1">
                                    Error
                                  </p>
                                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-sans">
                                    {expandedRunErrors[run.id]
                                      ? errMsg
                                      : errMsg.length > 500
                                        ? `${errMsg.slice(0, 500)}...`
                                        : errMsg}
                                  </pre>
                                  {errMsg.length > 500 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-7 text-xs"
                                      onClick={() =>
                                        setExpandedRunErrors((prev) => ({
                                          ...prev,
                                          [run.id]: !prev[run.id],
                                        }))
                                      }
                                    >
                                      {expandedRunErrors[run.id]
                                        ? "Show less"
                                        : "Show more"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
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

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transform Code</CardTitle>
              <CardDescription>
                Python function applied to each record before writing to
                destination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline.destinationSchema?.transformScript ? (
                <TransformCodeView
                  script={pipeline.destinationSchema.transformScript}
                  onEditClick={() =>
                    router.push(`/workspace/data-pipelines/${pipelineId}/edit`)
                  }
                />
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/30">
                  No transform script. Add one in the{" "}
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() =>
                      router.push(
                        `/workspace/data-pipelines/${pipelineId}/edit`,
                      )
                    }
                    type="button"
                  >
                    pipeline editor
                  </Button>
                  .
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sample Records</h3>
            <p className="text-sm text-muted-foreground">
              Preview transformed data (top 10 rows)
            </p>
            <DataPreviewTable
              title="Incoming Data Preview"
              description={
                pipeline.sourceSchema?.sourceTable
                  ? `${pipeline.sourceSchema.sourceSchema || "public"}.${pipeline.sourceSchema.sourceTable}`
                  : undefined
              }
              rows={sourcePreview?.rows || []}
              isLoading={sourcePreviewLoading}
              error={sourcePreviewError?.message ?? null}
              onRefresh={() => refetchSourcePreview()}
              isRefreshing={sourcePreviewRefreshing}
              showRecordCountLabel
            />
            <DataPreviewTable
              title="Transformed Output Preview"
              description={
                pipeline.destinationSchema
                  ? `${pipeline.destinationSchema.destinationSchema}.${pipeline.destinationSchema.destinationTable}`
                  : undefined
              }
              rows={destinationPreview?.rows || []}
              isLoading={destPreviewLoading}
              error={destPreviewError?.message ?? null}
              onRefresh={() => refetchDestPreview()}
              isRefreshing={destPreviewRefreshing}
              showRecordCountLabel
            />
          </div>
        </TabsContent>

        {/* Incoming Data Tab */}
        <TabsContent value="incoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Data Schema</CardTitle>
              <CardDescription>
                Read-only schema from source (discovered automatically)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaView
                title="Incoming"
                streamName={
                  pipeline.sourceSchema?.sourceTable
                    ? `${pipeline.sourceSchema.sourceSchema || "public"}.${pipeline.sourceSchema.sourceTable}`
                    : undefined
                }
                fields={
                  pipeline.sourceSchema?.discoveredColumns?.length
                    ? pipeline.sourceSchema.discoveredColumns.map((c) => ({
                        name: c.name,
                        type: c.type ?? "string",
                        nullable: c.nullable,
                        isPrimaryKey: c.primaryKey ?? false,
                      }))
                    : (sourcePreview?.columns ?? []).map((column) => ({
                        name: column.name,
                        type: column.type ?? "string",
                        nullable: column.nullable ?? true,
                        isPrimaryKey: column.primaryKey ?? false,
                      }))
                }
                lastRefreshedAt={pipeline.sourceSchema?.lastDiscoveredAt}
                emptyMessage="Run schema discovery in the pipeline editor to populate."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outgoing Data Tab */}
        <TabsContent value="outgoing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Data Schema</CardTitle>
              <CardDescription>
                Schema derived from transform output (what lands in destination)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaView
                title="Outgoing"
                streamName={
                  pipeline.destinationSchema
                    ? `${pipeline.destinationSchema.destinationSchema}.${pipeline.destinationSchema.destinationTable}`
                    : undefined
                }
                fields={
                  destinationPreview?.columns?.length
                    ? destinationPreview.columns.map((c) => ({
                        name: c.name,
                        type: c.type ?? "String",
                        nullable: c.nullable ?? true,
                        isPrimaryKey: c.primaryKey ?? false,
                      }))
                    : destinationPreview?.rows?.[0]
                      ? Object.keys(
                          destinationPreview.rows[0] as Record<string, unknown>,
                        ).map((k) => ({
                          name: k,
                          type: "String",
                          nullable: true,
                        }))
                      : []
                }
                lastRefreshedAt={pipeline.destinationSchema?.updatedAt}
                emptyMessage="Run preview or sync to populate outgoing schema."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Card */}
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
                {/* Discovered columns */}
                {pipeline.sourceSchema?.discoveredColumns &&
                  pipeline.sourceSchema.discoveredColumns.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Columns3 className="h-3 w-3" />
                        Discovered Columns
                      </span>
                      <span className="font-medium">
                        {pipeline.sourceSchema.discoveredColumns.length}
                      </span>
                    </div>
                  )}
                {/* Estimated row count */}
                {pipeline.sourceSchema?.estimatedRowCount != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Rows</span>
                    <span className="font-medium">
                      {pipeline.sourceSchema.estimatedRowCount.toLocaleString()}
                    </span>
                  </div>
                )}
                {/* Last discovered */}
                {pipeline.sourceSchema?.lastDiscoveredAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Last Discovered
                    </span>
                    <span className="font-medium text-xs">
                      {new Date(
                        pipeline.sourceSchema.lastDiscoveredAt,
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Destination Card */}
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
                {pipeline.destinationSchema?.upsertKey &&
                  pipeline.destinationSchema.upsertKey.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upsert Key</span>
                      <span className="font-medium font-mono text-xs">
                        {pipeline.destinationSchema.upsertKey.join(", ")}
                      </span>
                    </div>
                  )}
                {pipeline.destinationSchema?.lastSyncedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Synced</span>
                    <span className="font-medium text-xs">
                      {new Date(
                        pipeline.destinationSchema.lastSyncedAt,
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                {/* Transform script indicator */}
                {pipeline.destinationSchema?.transformScript && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Code2 className="h-3 w-3" />
                      Transform Script
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transformation Script Section */}
          {pipeline.destinationSchema?.transformScript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Transformation Script
                </CardTitle>
                <CardDescription>
                  Python transform applied to each record before writing to
                  destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-zinc-950 p-4 overflow-auto max-h-[300px]">
                  <pre className="text-sm font-mono text-zinc-100 whitespace-pre-wrap">
                    {pipeline.destinationSchema.transformScript}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Edit this script from the{" "}
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    onClick={() =>
                      router.push(
                        `/workspace/data-pipelines/${pipelineId}/edit`,
                      )
                    }
                    type="button"
                  >
                    pipeline editor
                  </Button>
                  .
                </p>
              </CardContent>
            </Card>
          )}

          {/* Data Previews */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Data Previews</h3>
            <p className="text-sm text-muted-foreground">
              Sample data from source and destination (top 10 rows)
            </p>

            <DataPreviewTable
              title="Source Data Preview"
              description={
                pipeline.sourceSchema?.sourceTable
                  ? `${pipeline.sourceSchema.sourceSchema || "public"}.${pipeline.sourceSchema.sourceTable}`
                  : undefined
              }
              rows={sourcePreview?.rows || []}
              isLoading={sourcePreviewLoading}
              error={sourcePreviewError?.message ?? null}
              onRefresh={() => refetchSourcePreview()}
              isRefreshing={sourcePreviewRefreshing}
            />

            <DataPreviewTable
              title="Destination Data Preview"
              description={
                pipeline.destinationSchema
                  ? `${pipeline.destinationSchema.destinationSchema}.${pipeline.destinationSchema.destinationTable}`
                  : undefined
              }
              rows={destinationPreview?.rows || []}
              isLoading={destPreviewLoading}
              error={destPreviewError?.message ?? null}
              onRefresh={() => refetchDestPreview()}
              isRefreshing={destPreviewRefreshing}
            />
          </div>

          <Separator />

          {/* Sync Settings */}
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
                    <span className="text-muted-foreground">
                      Schedule Value
                    </span>
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
                      <span className="text-muted-foreground">
                        Last Scheduled Run
                      </span>
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
                    {(pipeline.checkpoint &&
                    (pipeline.checkpoint as Record<string, unknown>)
                      ?.watermarkField
                      ? String(
                          (pipeline.checkpoint as Record<string, unknown>)
                            .watermarkField,
                        )
                      : null) ||
                      pipeline.incrementalColumn ||
                      "-"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* Pipeline Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Settings</CardTitle>
              <CardDescription>
                Name and description for this pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="pipeline-name-input"
                  className="text-sm font-medium"
                >
                  Name *
                </label>
                <input
                  id="pipeline-name-input"
                  type="text"
                  defaultValue={pipeline.name}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Pipeline name"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== pipeline.name) {
                      updatePipeline.mutate({ name: v });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="pipeline-description-input"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="pipeline-description-input"
                  defaultValue={pipeline.description ?? ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional description"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (pipeline.description ?? "")) {
                      updatePipeline.mutate({ description: v || undefined });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

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
                scheduleType={
                  (scheduleConfig?.scheduleType ||
                    pipeline.scheduleType ||
                    "none") as ScheduleType
                }
                scheduleValue={
                  scheduleConfig?.scheduleValue || pipeline.scheduleValue || ""
                }
                scheduleTimezone={
                  scheduleConfig?.scheduleTimezone ||
                  pipeline.scheduleTimezone ||
                  "UTC"
                }
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
                  onClick={handleDeleteClick}
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

      {/* CDC Setup Modal */}
      <CdcSetupModal
        open={showCdcSetup}
        onOpenChange={setShowCdcSetup}
        organizationId={organizationId ?? undefined}
        dataSourceId={sourceDataSourceId ?? undefined}
        dataSourceName={pipeline?.sourceSchema?.name ?? pipeline?.name}
        onVerified={() => refetch()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        action="delete"
        itemName="Pipeline"
        itemValue={pipeline.name}
        isLoading={deletePipeline.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
