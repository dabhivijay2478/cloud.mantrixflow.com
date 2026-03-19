"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { GitMerge } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { usePipelineBuilderStore } from "../../store/pipelineStore";

function JoinNodeComponent({ data, id }: NodeProps) {
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);

  const joinType = (data.join_type as string) ?? "inner";
  const leftKey = (data.left_key as string) ?? "—";
  const rightKey = (data.right_key as string) ?? "—";

  return (
    <div
      className="min-w-[220px] rounded-lg border-2 border-violet-500/50 bg-card shadow-md"
      onClick={() => openDrawer("join", id, null)}
    >
      <div className="border-b border-violet-500/30 bg-violet-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-violet-600" />
          <span className="font-medium text-sm">Join</span>
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-xs font-medium">
            {joinType.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="space-y-1 p-3 text-xs">
        <div className="flex gap-2">
          <span className="text-muted-foreground">Left:</span>
          <span>{leftKey}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">Right:</span>
          <span>{rightKey}</span>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!top-1/3 !bg-violet-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="right"
        className="!top-2/3 !bg-violet-500"
      />
      <Handle type="source" position={Position.Right} className="!bg-violet-500" />
    </div>
  );
}

export const JoinNode = memo(JoinNodeComponent);
