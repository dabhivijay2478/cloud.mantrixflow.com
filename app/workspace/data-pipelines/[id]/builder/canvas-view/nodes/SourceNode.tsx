"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { cn } from "@/lib/utils";

function SourceNodeComponent({ id, data }: NodeProps) {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const getBranchColor = usePipelineBuilderStore((s) => s.getBranchColor);

  const sourceSchema = pipeline?.sourceSchema;
  const connectorType = String(data.connector_type ?? sourceSchema?.sourceType ?? "postgres");
  const selectedStreams = (data.selected_streams as string[]) ?? [];
  const connectionName = String(sourceSchema?.name ?? "Source connection");

  const handleClick = () => openDrawer("source", id);

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border-2 border-blue-500/50 bg-card p-3 shadow-md",
        "cursor-pointer hover:border-blue-500 transition-colors",
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <span className="font-medium capitalize">{connectorType}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          SOURCE
        </Badge>
      </div>
      <div className="text-sm space-y-0.5">
        <div className="font-medium">{connectionName}</div>
        <div className="text-muted-foreground text-xs">
          {selectedStreams.length > 0
            ? `${selectedStreams.length} table(s)`
            : "No tables selected"}
        </div>
      </div>
      {branches.map((branch, i) => (
        <Handle
          key={branch.id}
          type="source"
          position={Position.Right}
          id={branch.id}
          className="!w-3 !h-3 !border-2 !bg-background"
          style={{
            top: branches.length === 1 ? "50%" : `${20 + (i / Math.max(branches.length - 1, 1)) * 60}%`,
          }}
        />
      ))}
    </div>
  );
}

export const SourceNode = memo(SourceNodeComponent);
