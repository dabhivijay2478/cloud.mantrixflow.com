"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePipelineBuilderStore } from "../../store/pipelineStore";
import { cn } from "@/lib/utils";

function DestinationNodeComponent({ id, data }: NodeProps) {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const branches = usePipelineBuilderStore((s) => s.branches);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const getBranchColor = usePipelineBuilderStore((s) => s.getBranchColor);

  const branchId = data.branch_id as string | undefined;
  const branch = branches.find((b) => b.id === branchId);
  const branchIndex = branch ? branches.indexOf(branch) : 0;
  const color = getBranchColor(branchIndex);

  const destSchema = pipeline?.destinationSchema;
  const connectorType = String(data.connector_type ?? "postgres");
  const destSchemaName = String(data.dest_schema ?? destSchema?.destinationSchema ?? "public");
  const emitMethod = String(data.emit_method ?? destSchema?.writeMode ?? "append");
  const connectionName = String(destSchema?.name ?? "Destination connection");

  const handleClick = () => openDrawer("destination", id, branchId);

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border-2 bg-card p-3 shadow-md",
        "cursor-pointer hover:border-emerald-500 transition-colors",
        `border-${color}/50`,
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-500" />
          <span className="font-medium capitalize">{connectorType}</span>
        </div>
        <div className="flex items-center gap-1">
          {branch && (
            <span className="text-xs text-muted-foreground">{branch.label}</span>
          )}
          <Badge variant="outline" className="text-xs">
            DESTINATION
          </Badge>
        </div>
      </div>
      <div className="text-sm space-y-0.5">
        <div className="font-medium">{connectionName}</div>
        <div className="text-muted-foreground text-xs">
          Schema: {destSchemaName}
        </div>
        <Badge variant="secondary" className="text-xs uppercase">
          {emitMethod}
        </Badge>
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-background" />
    </div>
  );
}

export const DestinationNode = memo(DestinationNodeComponent);
