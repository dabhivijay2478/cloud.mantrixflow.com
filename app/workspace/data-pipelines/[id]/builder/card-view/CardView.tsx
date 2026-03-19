"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { BranchRow } from "./BranchRow";
import { CardArrow } from "./CardArrow";
import { DestinationCard } from "./DestinationCard";
import { SourceCard } from "./SourceCard";
import { TransformCard } from "./TransformCard";
import { cn } from "@/lib/utils";

export function CardView() {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const addBranch = usePipelineBuilderStore((s) => s.addBranch);

  const sourceNode = nodes.find((n) => n.type === "source");
  if (!sourceNode) return null;

  const isSingleBranch = branches.length === 1;
  const branch = branches[0];

  if (isSingleBranch && branch) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SourceCard nodeId={sourceNode.id} />
          <CardArrow />
          <TransformCard
            nodeId={branch.transform_node_id}
            branchId={branch.id}
          />
          <CardArrow />
          <DestinationCard
            nodeId={branch.destination_node_id}
            branchId={branch.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex shrink-0 flex-col items-center md:min-h-[200px]">
        <SourceCard nodeId={sourceNode.id} />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {branches.map((b, i) => (
          <BranchRow
            key={b.id}
            branch={b}
            branchIndex={i}
            canDelete={branches.length > 1}
          />
        ))}
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6",
            "text-muted-foreground hover:border-primary/50 hover:text-primary",
          )}
          onClick={addBranch}
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>
    </div>
  );
}
