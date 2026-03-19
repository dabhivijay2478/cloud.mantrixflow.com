"use client";

import { History, Loader2, Play, Save, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useRunPipeline,
  dataPipelinesKeys,
} from "@/lib/api/hooks/use-data-pipelines";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export type NodeTypeFilter = "all" | "source" | "transform" | "destination";
export type NodeStateFilter = "all" | "running" | "listening";

export function CanvasToolbar() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const aiAssist = usePipelineBuilderStore((s) => s.aiAssist);
  const openAIAssist = usePipelineBuilderStore((s) => s.openAIAssist);
  const closeAIAssist = usePipelineBuilderStore((s) => s.closeAIAssist);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const activeRunStore = usePipelineBuilderStore((s) => s.activeRun);
  const triggerRun = usePipelineBuilderStore((s) => s.triggerRun);
  const hasUnsavedChanges = usePipelineBuilderStore((s) => s.hasUnsavedChanges);
  const savePipeline = usePipelineBuilderStore((s) => s.savePipeline);

  const organizationId = pipeline?.pipeline.organizationId;
  const pipelineId = pipeline?.pipeline.id ?? "";
  const runPipeline = useRunPipeline(organizationId, pipelineId);
  const queryClient = useQueryClient();

  const isRunning =
    useMockData ? activeRunStore.status === "running" : runPipeline.isPending;
  const isRunPending = runPipeline.isPending;

  const handleRun = async () => {
    if (useMockData) {
      triggerRun();
      return;
    }
    try {
      await runPipeline.mutateAsync(undefined);
      toast.success("Pipeline started", "Run in progress.");
    } catch (error) {
      toast.error(
        "Run failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleSave = async () => {
    try {
      if (useMockData) {
        usePipelineBuilderStore.getState().setHasUnsavedChanges(false);
        toast.success("Saved", "Pipeline changes saved (mock).");
      } else {
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
      }
    } catch (error) {
      toast.error(
        "Save failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/95 px-1.5 py-1 shadow-lg backdrop-blur-sm">
      {/* Run */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white px-2"
        onClick={handleRun}
        disabled={isRunPending || isRunning}
        aria-busy={isRunPending || isRunning}
      >
        {(isRunPending || isRunning) ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        Run
      </Button>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Save */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white relative px-2"
        onClick={handleSave}
        title={hasUnsavedChanges ? "Unsaved changes" : undefined}
      >
        <Save className="h-3.5 w-3.5" />
        Save
        {hasUnsavedChanges && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white px-2"
        onClick={() => openDrawer("settings")}
      >
        <Settings className="h-3.5 w-3.5" />
        Settings
      </Button>

      {/* History */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white px-2"
        onClick={() => openDrawer("run_history")}
      >
        <History className="h-3.5 w-3.5" />
        History
      </Button>

      <div className="h-4 w-px bg-zinc-700" />

      {/* AI Assistant */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-1.5 text-xs px-2 transition-colors",
          aiAssist.isOpen
            ? "bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 hover:text-teal-300"
            : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
        )}
        onClick={() => aiAssist.isOpen ? closeAIAssist() : openAIAssist()}
        title="AI Assistant (⌘K)"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask AI
      </Button>

    </div>
  );
}
