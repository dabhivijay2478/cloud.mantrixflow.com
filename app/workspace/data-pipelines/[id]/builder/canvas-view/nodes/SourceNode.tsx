"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, Loader2, Play, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRunPipeline } from "@/lib/api/hooks/use-data-pipelines";
import { toast } from "@/lib/utils/toast";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { cn } from "@/lib/utils";

function SourceNodeComponent({ id, data }: NodeProps) {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const activeRun = usePipelineBuilderStore((s) => s.activeRun);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const getBranchColor = usePipelineBuilderStore((s) => s.getBranchColor);
  const triggerRun = usePipelineBuilderStore((s) => s.triggerRun);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);

  const organizationId = pipeline?.pipeline.organizationId;
  const pipelineId = pipeline?.pipeline.id ?? "";
  const runPipeline = useRunPipeline(organizationId, pipelineId);

  const sourceSchema = pipeline?.sourceSchema;
  const connectorType = String(data.connector_type ?? sourceSchema?.sourceType ?? "postgres");
  const selectedStreams = (data.selected_streams as string[]) ?? [];
  const connectionName = String(sourceSchema?.name ?? "Source connection");
  const isRunning = useMockData ? activeRun.status === "running" : runPipeline.isPending;
  const statusLabel = isRunning ? "RUNNING" : "LISTENING";
  const statusColor = isRunning ? "bg-blue-500" : "bg-green-500";

  const handleCardClick = () => openDrawer("source", id);
  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (useMockData) {
      triggerRun();
      return;
    }
    try {
      await runPipeline.mutateAsync(undefined);
      openDrawer("run_status", null, null, undefined);
      toast.success("Pipeline started", "Run in progress.");
    } catch (error) {
      toast.error("Run failed", error instanceof Error ? error.message : "Unknown error");
    }
  };
  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer("source", id);
  };

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border bg-zinc-800/90 p-3 shadow-lg",
        "cursor-pointer hover:border-blue-500/50 transition-colors border-zinc-700",
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <span className="font-medium capitalize">{connectorType}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          SOURCE
        </Badge>
      </div>
      <div className="text-sm space-y-0.5">
        <div className="font-medium text-white">{connectionName}</div>
        <div className="text-zinc-400 text-xs">
          {selectedStreams.length > 0
            ? `${selectedStreams.length} table(s)`
            : "No tables selected"}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", statusColor)} />
          <span className="text-xs font-medium uppercase text-zinc-400">{statusLabel}</span>
        </div>
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700/50"
            onClick={handleRun}
            disabled={isRunning}
            title="Run pipeline"
          >
            {isRunning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-blue-400 hover:bg-zinc-700/50"
            onClick={handleSettings}
            title="Source settings"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {branches.map((branch, i) => {
        const topPercent = ((i + 1) / (branches.length + 1)) * 100;
        const colourIndex = "colour_index" in branch ? (branch.colour_index as number) : i;
        const hex = ["#3b82f6", "#8b5cf6", "#f59e0b", "#f43f5e", "#10b981", "#0ea5e9", "#f97316"][colourIndex % 7];
        return (
          <Handle
            key={branch.id}
            type="source"
            position={Position.Right}
            id={branch.id}
            className="!w-3 !h-3 !border-2"
            style={{
              top: `${topPercent}%`,
              background: hex,
              borderColor: hex,
            }}
          />
        );
      })}
    </div>
  );
}

export const SourceNode = memo(SourceNodeComponent);
