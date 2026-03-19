"use client";

import { Loader2, Play, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useRunPipeline,
  dataPipelinesKeys,
} from "@/lib/api/hooks/use-data-pipelines";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { usePipelineBuilderStore } from "../store/pipelineStore";

interface PipelineActionBarProps {
  pipelineId: string;
  organizationId: string | undefined;
  activeRun?: { id: string } | null;
}

export function PipelineActionBar({
  pipelineId,
  organizationId,
  activeRun,
}: PipelineActionBarProps) {
  const hasUnsavedChanges = usePipelineBuilderStore((s) => s.hasUnsavedChanges);
  const savePipeline = usePipelineBuilderStore((s) => s.savePipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);

  const runPipeline = useRunPipeline(organizationId, pipelineId);
  const isRunPending = runPipeline.isPending;
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      await savePipeline();
      if (organizationId && pipelineId) {
        await queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(organizationId, pipelineId),
        });
        await queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.full(organizationId, pipelineId),
        });
      }
      toast.success("Saved", "Pipeline changes saved successfully.");
    } catch (error) {
      toast.error(
        "Save failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleRun = async () => {
    try {
      await runPipeline.mutateAsync(undefined);
      openDrawer("run_status", null, null, undefined);
      toast.success("Pipeline started", "Run in progress.");
    } catch (error) {
      toast.error(
        "Run failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const scheduleText =
    pipeline?.pipeline.scheduleType && pipeline.pipeline.scheduleType !== "none"
      ? pipeline.pipeline.scheduleValue ?? pipeline.pipeline.scheduleType
      : "Manual";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <Button
        size="sm"
        onClick={handleRun}
        disabled={isRunPending || !!activeRun}
        aria-busy={isRunPending}
      >
        {isRunPending || activeRun ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        Run Now
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={!hasUnsavedChanges}
        title={hasUnsavedChanges ? "Unsaved changes — click to save" : undefined}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
        {hasUnsavedChanges && (
          <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openDrawer("schedule")}
      >
        Schedule: {scheduleText}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openDrawer("settings")}
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  );
}
