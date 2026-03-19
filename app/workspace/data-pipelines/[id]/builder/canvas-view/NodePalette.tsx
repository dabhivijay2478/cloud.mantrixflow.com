"use client";

import { Database, Zap } from "lucide-react";
import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { usePipelineBuilderStore } from "../store/pipelineStore";

const nodeTypes = [
  {
    type: "branch",
    label: "Add Branch",
    icon: Zap,
    description: "Add transform + destination",
  },
] as const;

export function NodePalette() {
  const addBranch = usePipelineBuilderStore((s) => s.addBranch);

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleAddBranch = () => {
    addBranch();
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 text-sm font-medium">Add Node</div>
      <div className="space-y-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted/50"
          onClick={handleAddBranch}
        >
          <Zap className="h-4 w-4 text-violet-500" />
          Branch
        </button>
      </div>
    </div>
  );
}
