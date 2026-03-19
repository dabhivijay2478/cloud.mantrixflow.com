"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { getBranchColour } from "../shared/BranchColour";

/**
 * BranchGroupNode: Faint coloured rectangle behind a branch's
 * transform + destination nodes. Rendered as a non-draggable, non-selectable node.
 */
function BranchGroupNodeComponent({ data }: NodeProps) {
  const branches = usePipelineBuilderStore((s) => s.branches);
  const branchId = data.branch_id as string;
  const branch = branches.find((b) => b.id === branchId);
  if (!branch) return null;

  const branchIndex =
    "colour_index" in branch
      ? (branch.colour_index as number)
      : branches.findIndex((b) => b.id === branchId);
  const colour = getBranchColour(branchIndex >= 0 ? branchIndex : 0);

  const width = (data.width as number) ?? 380;
  const height = (data.height as number) ?? 92;

  return (
    <div
      className="pointer-events-none select-none rounded-xl"
      style={{
        width,
        height,
        background: `${colour.hex}0D`,
        border: `1px dashed ${colour.hex}33`,
        zIndex: -1,
      }}
    />
  );
}

export const BranchGroupNode = memo(BranchGroupNodeComponent);
