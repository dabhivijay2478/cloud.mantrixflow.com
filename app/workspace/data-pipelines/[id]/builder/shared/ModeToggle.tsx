"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const viewMode = usePipelineBuilderStore((s) => s.viewMode);
  const setViewMode = usePipelineBuilderStore((s) => s.setViewMode);

  return (
    <div className="flex rounded-lg border p-0.5" role="group" aria-label="View mode">
      <Button
        variant={viewMode === "card" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "gap-1.5 rounded-md",
          viewMode === "card" && "shadow-sm",
        )}
        onClick={() => setViewMode("card")}
        aria-pressed={viewMode === "card"}
      >
        <LayoutList className="h-4 w-4" />
        Card View
      </Button>
      <Button
        variant={viewMode === "canvas" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "gap-1.5 rounded-md",
          viewMode === "canvas" && "shadow-sm",
        )}
        onClick={() => setViewMode("canvas")}
        aria-pressed={viewMode === "canvas"}
      >
        <LayoutGrid className="h-4 w-4" />
        Canvas View
      </Button>
    </div>
  );
}
