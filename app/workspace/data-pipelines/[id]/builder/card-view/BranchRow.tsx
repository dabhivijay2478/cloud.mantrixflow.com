"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { CardArrow } from "./CardArrow";
import { DestinationCard } from "./DestinationCard";
import { TransformCard } from "./TransformCard";
import { cn } from "@/lib/utils";

interface BranchRowProps {
  branch: {
    id: string;
    label: string;
    transform_node_id: string;
    destination_node_id: string;
  };
  branchIndex: number;
  canDelete: boolean;
}

export function BranchRow({ branch, branchIndex, canDelete }: BranchRowProps) {
  const updateBranchLabel = usePipelineBuilderStore((s) => s.updateBranchLabel);
  const deleteBranch = usePipelineBuilderStore((s) => s.deleteBranch);
  const getBranchColor = usePipelineBuilderStore((s) => s.getBranchColor);

  const color = getBranchColor(branchIndex);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        `border-${color}/30`,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "font-medium",
            color === "blue-500" && "text-blue-600",
            color === "violet-500" && "text-violet-600",
            color === "amber-500" && "text-amber-600",
            color === "rose-500" && "text-rose-600",
            color === "emerald-500" && "text-emerald-600",
            color === "sky-500" && "text-sky-600",
            color === "orange-500" && "text-orange-600",
          )}
        >
          {branch.label}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const newLabel = prompt("Branch name:", branch.label);
              if (newLabel?.trim()) updateBranchLabel(branch.id, newLabel.trim());
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => deleteBranch(branch.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TransformCard
          nodeId={branch.transform_node_id}
          branchId={branch.id}
          compact
        />
        <CardArrow />
        <DestinationCard
          nodeId={branch.destination_node_id}
          branchId={branch.id}
          compact
        />
      </div>
    </div>
  );
}
