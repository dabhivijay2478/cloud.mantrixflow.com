"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Settings, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { cn } from "@/lib/utils";

function TransformNodeComponent({ id, data }: NodeProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
  const activeRun = usePipelineBuilderStore((s) => s.activeRun);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const getBranchColor = usePipelineBuilderStore((s) => s.getBranchColor);

  const branchId = data.branch_id as string | undefined;
  const branch = branches.find((b) => b.id === branchId);
  const branchIndex = branch ? branches.indexOf(branch) : 0;
  const color = getBranchColor(branchIndex);

  const hasScript =
    data.transform_type === "python_script" && data.transform_script;
  const scriptPreview = hasScript
    ? String(data.transform_script ?? "").split("\n")[0]?.slice(0, 40) ?? ""
    : "";

  const isRunning = activeRun.status === "running";
  const statusLabel = isRunning ? "RUNNING" : "LISTENING";
  const statusColor = isRunning ? "bg-blue-500" : "bg-green-500";

  const handleCardClick = () => openDrawer("transform", id, branchId);
  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer("transform", id, branchId);
  };

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border bg-zinc-800/90 p-3 shadow-lg",
        "cursor-pointer hover:border-violet-500/50 transition-colors border-zinc-700",
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-violet-500" />
          <span className="font-medium">Transform</span>
        </div>
        <div className="flex items-center gap-1">
          {branch && (
            <span className="text-xs text-muted-foreground">{branch.label}</span>
          )}
          <Badge variant="outline" className="text-xs">
            {hasScript ? "PYTHON" : "PASS-THROUGH"}
          </Badge>
        </div>
      </div>
      <div className="text-sm">
        {hasScript ? (
          <code className="text-xs text-zinc-400 line-clamp-2">
            {scriptPreview}
            {scriptPreview.length >= 40 ? "..." : ""}
          </code>
        ) : (
          <span className="text-zinc-400 text-xs">
            Data passes through unchanged
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", statusColor)} />
          <span className="text-xs font-medium uppercase text-zinc-400">{statusLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-400 hover:text-violet-400 hover:bg-zinc-700/50"
          onClick={handleSettings}
          title="Transform settings"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-zinc-700" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !bg-zinc-700" />
    </div>
  );
}

export const TransformNode = memo(TransformNodeComponent);
