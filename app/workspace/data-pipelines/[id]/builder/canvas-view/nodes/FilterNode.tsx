"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Filter } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { getBranchColour } from "../../shared/BranchColour";

function FilterNodeComponent({ data, id }: NodeProps) {
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const branches = usePipelineBuilderStore((s) => s.branches);

  const branchId = data.branch_id as string | undefined;
  const branchIndex = branches.findIndex((b) => b.id === branchId);
  const colour = getBranchColour(branchIndex >= 0 ? branchIndex : 0);

  const filterType = (data.filter_type as string) ?? "python";
  const expression = (data.filter_expression as string) ?? "";
  const preview = expression.slice(0, 30) + (expression.length > 30 ? "..." : "");

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 bg-card shadow-md ${colour.border}`}
      onClick={() => openDrawer("filter", id, branchId)}
    >
      <div className={`border-b px-3 py-2 ${colour.bg}`}>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium text-sm">Filter</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${colour.bg}`}
          >
            {filterType.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-3">
        <code className="block truncate text-xs text-muted-foreground">
          {preview || "No expression"}
        </code>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

export const FilterNode = memo(FilterNodeComponent);
