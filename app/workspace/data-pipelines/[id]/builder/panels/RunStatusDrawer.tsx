"use client";

import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { usePipelineRun } from "@/lib/api/hooks/use-data-pipelines";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function RunStatusDrawer() {
  const activeRun = usePipelineBuilderStore((s) => s.activeRun);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const organizationId = pipeline?.pipeline.organizationId;

  const { data: run, isLoading } = usePipelineRun(
    organizationId,
    pipelineId ?? undefined,
    activeRun.runId ?? undefined,
  );

  const isPending =
    !run || run.status === "pending" || run.status === "running" || isLoading;
  const isSuccess = run?.status === "success";
  const isFailed = run?.status === "failed" || run?.status === "cancelled";

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {isFailed && <XCircle className="h-4 w-4 text-red-500" />}
          {isPending ? "Run in Progress" : isSuccess ? "Run Complete" : "Run Failed"}
        </SheetTitle>
        <SheetDescription>
          {run?.id ? `Run ${run.id.slice(0, 8)}` : "Waiting for run to start…"}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5">
        {run ? (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize font-medium">{run.status}</span>
            </div>
            {run.rowsWritten != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rows written</span>
                <span className="font-medium tabular-nums">
                  {run.rowsWritten.toLocaleString()}
                </span>
              </div>
            )}
            {run.rowsRead != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rows read</span>
                <span className="font-medium tabular-nums">
                  {run.rowsRead.toLocaleString()}
                </span>
              </div>
            )}
            {run.rowsSkipped != null && run.rowsSkipped > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rows skipped</span>
                <span className="font-medium tabular-nums">
                  {run.rowsSkipped.toLocaleString()}
                </span>
              </div>
            )}
            {run.durationSeconds != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {run.durationSeconds < 60
                    ? `${Math.round(run.durationSeconds)}s`
                    : `${Math.floor(run.durationSeconds / 60)}m ${Math.round(run.durationSeconds % 60)}s`}
                </span>
              </div>
            )}
            {run.triggerType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger</span>
                <span className="capitalize font-medium">{run.triggerType}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Waiting for run to start…
          </div>
        )}

        {isFailed && run?.errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 break-words">
              {run.errorMessage}
            </p>
          </div>
        )}

        {isPending && run && (
          <p className="text-xs text-muted-foreground text-center">
            Live updates via Supabase Realtime
          </p>
        )}
      </div>
    </>
  );
}
