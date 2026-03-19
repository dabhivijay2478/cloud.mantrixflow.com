"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipelineRuns } from "@/lib/api/hooks/use-data-pipelines";
import { usePipelineBuilderStore } from "./store/pipelineStore";
import { CardView } from "./card-view/CardView";
import { CanvasView } from "./canvas-view/CanvasView";
import { DrawerContainer } from "./shared/DrawerContainer";
import { ModeToggle } from "./shared/ModeToggle";
import { PipelineActionBar } from "./shared/PipelineActionBar";
import { RunHistoryPanel } from "./shared/RunHistoryPanel";
import { RunStatusBanner } from "./shared/RunStatusBanner";

export function PipelineBuilder() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const viewMode = usePipelineBuilderStore((s) => s.viewMode);
  const addBranch = usePipelineBuilderStore((s) => s.addBranch);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const activeRunStore = usePipelineBuilderStore((s) => s.activeRun);
  const runHistory = usePipelineBuilderStore((s) => s.runHistory);

  const organizationId = pipeline?.pipeline.organizationId;
  const { data: apiRuns } = usePipelineRuns(
    useMockData ? undefined : organizationId,
    useMockData ? undefined : pipelineId ?? "",
    10,
  );

  const runs = useMockData ? runHistory : apiRuns;
  const activeRun = useMockData
    ? activeRunStore.status === "running" && activeRunStore.runId
      ? { id: activeRunStore.runId }
      : null
    : apiRuns?.find((r) => r.status === "running");
  const lastRun = runs?.[0];

  const totalRowsFromStore =
    useMockData && activeRunStore.status === "running"
      ? activeRunStore.branchProgress.reduce((s, b) => s + b.rows_synced, 0)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pipeline?.pipeline.name}</h1>
          {pipeline?.pipeline.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {pipeline.pipeline.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button size="sm" variant="outline" onClick={addBranch}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>
      </div>

      <RunStatusBanner
        isRunning={!!activeRun}
        isSuccess={
          useMockData
            ? activeRunStore.status === "success"
            : lastRun?.status === "success"
        }
        isFailed={
          useMockData
            ? activeRunStore.status === "failed"
            : lastRun?.status === "failed"
        }
        rowsProcessed={
          useMockData && activeRunStore.status === "running"
            ? totalRowsFromStore
            : useMockData && lastRun && "rows_written" in lastRun
              ? lastRun.rows_written
              : (lastRun as { rowsWritten?: number })?.rowsWritten ?? 0
        }
        duration={
          useMockData && activeRunStore.status === "running"
            ? `${Math.floor(activeRunStore.elapsedSeconds)}s elapsed`
            : lastRun
              ? "duration_seconds" in lastRun
                ? `${Math.floor((lastRun as { duration_seconds: number }).duration_seconds / 60)}m ${(lastRun as { duration_seconds: number }).duration_seconds % 60}s`
                : (lastRun as { durationSeconds?: number }).durationSeconds != null
                  ? `${Math.floor((lastRun as { durationSeconds: number }).durationSeconds / 60)}m ${(lastRun as { durationSeconds: number }).durationSeconds % 60}s`
                  : undefined
              : undefined
        }
        errorMessage={
          lastRun && "error" in lastRun
            ? (lastRun as { error?: string }).error
            : (lastRun as { errorMessage?: string })?.errorMessage
        }
      />

      {viewMode === "card" ? <CardView /> : <CanvasView />}

      <PipelineActionBar
        pipelineId={pipelineId ?? ""}
        organizationId={organizationId}
        activeRun={activeRun}
      />

      <RunHistoryPanel />

      <DrawerContainer />
    </div>
  );
}
