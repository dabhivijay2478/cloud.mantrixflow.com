"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { cn } from "@/lib/utils";

function TransformNodeComponent({ id, data }: NodeProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
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

  const handleClick = () => openDrawer("transform", id, branchId);

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border-2 bg-card p-3 shadow-md",
        "cursor-pointer hover:border-violet-500 transition-colors",
        `border-${color}/50`,
      )}
      onClick={handleClick}
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
          <code className="text-xs text-muted-foreground line-clamp-2">
            {scriptPreview}
            {scriptPreview.length >= 40 ? "..." : ""}
          </code>
        ) : (
          <span className="text-muted-foreground text-xs">
            Data passes through unchanged
          </span>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-background" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !bg-background" />
    </div>
  );
}

export const TransformNode = memo(TransformNodeComponent);
