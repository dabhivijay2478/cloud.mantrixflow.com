"use client";

import { Filter, GitMerge, Zap } from "lucide-react";
import { useCallback } from "react";
import { usePipelineBuilderStore } from "../store/pipelineStore";

export function NodePalette() {
  const addBranch = usePipelineBuilderStore((s) => s.addBranch);

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
        Add to Canvas
      </div>
      <div className="space-y-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted/50"
          onClick={addBranch}
        >
          <Zap className="h-4 w-4 text-violet-500" />
          Branch
        </button>
        <DraggableNode type="filter" label="Filter" icon={Filter} />
        <DraggableNode type="join" label="Join" icon={GitMerge} />
      </div>
    </div>
  );
}

function DraggableNode({
  type,
  label,
  icon: Icon,
}: {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("application/reactflow", type);
      e.dataTransfer.effectAllowed = "move";
    },
    [type],
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted/50 active:cursor-grabbing"
    >
      <Icon className="h-4 w-4 text-amber-500" />
      {label}
    </div>
  );
}
