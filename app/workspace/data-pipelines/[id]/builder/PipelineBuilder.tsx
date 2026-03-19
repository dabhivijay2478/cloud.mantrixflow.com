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

  const organizationId = pipeline?.pipeline.organizationId;
  const { data: runs } = usePipelineRuns(organizationId, pipelineId ?? "", 10);
  const activeRun = runs?.find((r) => r.status === "running");
  const lastRun = runs?.[0];

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
        isSuccess={lastRun?.status === "success"}
        isFailed={lastRun?.status === "failed"}
        rowsProcessed={lastRun?.rowsWritten ?? 0}
        duration={
          lastRun?.durationSeconds
            ? `${Math.floor(lastRun.durationSeconds / 60)}m ${lastRun.durationSeconds % 60}s`
            : undefined
        }
        errorMessage={lastRun?.errorMessage ?? undefined}
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
