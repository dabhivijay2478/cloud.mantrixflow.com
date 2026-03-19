"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

const BRANCH_EDGE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#f43f5e", "#10b981", "#0ea5e9", "#f97316"];

export function DataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data?.label as string | undefined;
  const branchIndex = (data?.branch_index as number) ?? 0;
  const strokeColor = BRANCH_EDGE_COLORS[branchIndex % BRANCH_EDGE_COLORS.length];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 1.5, stroke: strokeColor }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-background px-2 py-0.5 text-xs shadow-sm border"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
