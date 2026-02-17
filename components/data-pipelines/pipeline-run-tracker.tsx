"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  RefreshCw,
  XCircle,
  XOctagon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCancelPipelineRun,
  usePipelineRun,
  usePipelineStats,
} from "@/lib/api/hooks/use-data-pipelines";
import type { PipelineRun } from "@/lib/api/types/data-pipelines";
import { toast } from "@/lib/utils/toast";

interface PipelineRunTrackerProps {
  organizationId: string;
  pipelineId: string;
  runId: string;
  onComplete?: (run: PipelineRun) => void;
  onCancel?: () => void;
}

export function PipelineRunTracker({
  organizationId,
  pipelineId,
  runId,
  onComplete,
  onCancel,
}: PipelineRunTrackerProps) {
  const { data: run, isLoading } = usePipelineRun(
    organizationId,
    pipelineId,
    runId,
  );
  const cancelRun = useCancelPipelineRun(organizationId, pipelineId);
  const { data: stats } = usePipelineStats(organizationId, pipelineId);

  const [hasCompleted, setHasCompleted] = useState(false);

  // Notify parent when run completes
  useEffect(() => {
    if (
      run &&
      !hasCompleted &&
      (run.status === "success" ||
        run.status === "failed" ||
        run.status === "cancelled")
    ) {
      setHasCompleted(true);
      onComplete?.(run);
    }
  }, [run, hasCompleted, onComplete]);

  const handleCancel = async () => {
    try {
      await cancelRun.mutateAsync(runId);
      onCancel?.();
    } catch (error) {
      console.error("Failed to cancel run:", error);
    }
  };

  if (isLoading || !run) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = () => {
    switch (run.status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          label: "Pending",
          description: "Pipeline run is queued and waiting to start",
        };
      case "running":
        return {
          icon: RefreshCw,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          label: "Running",
          description: "Pipeline is actively processing data",
        };
      case "success":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          label: "Completed",
          description: "Pipeline run completed successfully",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          label: "Failed",
          description: run.errorMessage || "Pipeline run encountered an error",
        };
      case "cancelled":
        return {
          icon: XOctagon,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          label: "Cancelled",
          description: "Pipeline run was cancelled",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          label: "Unknown",
          description: "Unknown status",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Calculate progress (rough estimate based on rows processed vs historical average)
  const calculateProgress = () => {
    if (run.status === "success" || run.status === "cancelled") return 100;
    if (run.status === "failed") return 0;
    if (run.status === "pending") return 0;

    // Estimate based on rows written vs average
    if (stats?.totalRowsProcessed && run.rowsWritten) {
      const avgRowsPerRun =
        stats.totalRowsProcessed / (stats.totalRunsSuccessful || 1);
      return Math.min(Math.round((run.rowsWritten / avgRowsPerRun) * 100), 95);
    }

    // Default progress animation for running state
    return 50;
  };

  const isRunning = run.status === "pending" || run.status === "running";
  const progress = calculateProgress();

  // Format duration
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate elapsed time for running jobs
  const getElapsedTime = () => {
    if (!run.startedAt) return "-";
    const startTime = new Date(run.startedAt).getTime();
    const endTime = run.completedAt
      ? new Date(run.completedAt).getTime()
      : Date.now();
    const elapsed = Math.round((endTime - startTime) / 1000);
    return formatDuration(elapsed);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon
                className={`h-5 w-5 ${statusConfig.color} ${run.status === "running" ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{statusConfig.label}</CardTitle>
              <CardDescription className="text-sm">
                {statusConfig.description}
              </CardDescription>
            </div>
          </div>
          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelRun.isPending}
              className="text-red-600 hover:text-red-600"
            >
              {cancelRun.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XOctagon className="h-4 w-4 mr-2" />
                  Cancel
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Rows Read</div>
            <div className="text-xl font-semibold">
              {run.rowsRead?.toLocaleString() || "0"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Rows Written</div>
            <div className="text-xl font-semibold text-green-600">
              {run.rowsWritten?.toLocaleString() || "0"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Rows Failed</div>
            <div className="text-xl font-semibold text-red-600">
              {run.rowsFailed?.toLocaleString() || "0"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="text-xl font-semibold">
              {run.durationSeconds
                ? formatDuration(run.durationSeconds)
                : getElapsedTime()}
            </div>
          </div>
        </div>

        {/* Time Details */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {run.startedAt && (
            <div>
              <span className="font-medium">Started:</span>{" "}
              {new Date(run.startedAt).toLocaleString()}
            </div>
          )}
          {run.completedAt && (
            <div>
              <span className="font-medium">Completed:</span>{" "}
              {new Date(run.completedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Error Details - user_message from ETL (CDC guidance, etc.) */}
        {run.status === "failed" && run.errorMessage && (
          <ErrorDetailsBlock errorMessage={run.errorMessage} errorStack={run.errorStack} />
        )}

        {/* Trigger Info */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {run.triggerType}
          </Badge>
          <span className="text-xs text-muted-foreground">Trigger Type</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorDetailsBlock({
  errorMessage,
  errorStack,
}: {
  errorMessage: string;
  errorStack?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const isCdcError =
    errorMessage.includes("replication") ||
    errorMessage.includes("binlog") ||
    errorMessage.includes("oplog");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [errorMessage]);

  return (
    <div
      className={isCdcError ? "p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900" : "p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isCdcError ? "text-amber-500" : "text-red-500"}`} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isCdcError ? "text-amber-800 dark:text-amber-200" : "text-red-800 dark:text-red-200"}`}>
              {isCdcError ? "CDC Setup Required" : "Error Details"}
            </span>
            {isCdcError && (
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                Replication not configured
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 ml-auto shrink-0"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {isCdcError && (
            <p className="text-xs text-muted-foreground">
              Run the SQL or configuration below in your database, then retry.
            </p>
          )}
          <div className={`text-sm whitespace-pre-wrap font-mono text-xs mt-1 ${isCdcError ? "text-amber-700 dark:text-amber-300" : "text-red-700 dark:text-red-300"}`}>
            {errorMessage}
          </div>
          {errorStack && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                Show stack trace
              </summary>
              <pre className="mt-2 text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                {errorStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
