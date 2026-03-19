"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 2 }}
        className="stroke-muted-foreground/70"
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
