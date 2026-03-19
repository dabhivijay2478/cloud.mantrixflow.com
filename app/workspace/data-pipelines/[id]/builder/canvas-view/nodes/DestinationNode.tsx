"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const connectionName = String(data.connection_name ?? destSchema?.name ?? branch?.label ?? "Destination");

  const handleCardClick = () => openDrawer("destination", id, branchId);
  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer("destination", id, branchId);
  };

  const activeRun = usePipelineBuilderStore((s) => s.activeRun);
  const isRunning = activeRun.status === "running";
  const statusLabel = isRunning ? "RUNNING" : "LISTENING";
  const statusColor = isRunning ? "bg-blue-500" : "bg-green-500";

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border bg-zinc-800/90 p-3 shadow-lg",
        "cursor-pointer hover:border-emerald-500/50 transition-colors border-zinc-700",
      )}
      onClick={handleCardClick}
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
        <div className="font-medium text-white">{connectionName}</div>
        <div className="text-zinc-400 text-xs">
          Schema: {destSchemaName}
        </div>
        <Badge variant="secondary" className="text-xs uppercase">
          {emitMethod}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", statusColor)} />
          <span className="text-xs font-medium uppercase text-zinc-400">{statusLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700/50"
          onClick={handleSettings}
          title="Destination / emit settings"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-zinc-700" />
    </div>
  );
}

export const DestinationNode = memo(DestinationNodeComponent);
