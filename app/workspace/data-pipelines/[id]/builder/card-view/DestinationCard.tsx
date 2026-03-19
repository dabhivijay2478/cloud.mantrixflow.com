"use client";

import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  nodeId: string;
  branchId?: string;
  compact?: boolean;
}

export function DestinationCard({
  nodeId,
  branchId,
  compact = false,
}: DestinationCardProps) {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);

  const node = nodes.find((n) => n.id === nodeId);
  const destSchema = pipeline?.destinationSchema;

  if (!node || node.type !== "destination") return null;

  const data = node.data;
  const connectorType = data.connector_type ?? "postgres";
  const destSchemaName = data.dest_schema ?? destSchema?.destinationSchema ?? "public";
  const emitMethod = data.emit_method ?? destSchema?.writeMode ?? "append";
  const connectionName = destSchema?.name ?? "Destination connection";

  const handleClick = () => {
    openDrawer("destination", nodeId, branchId);
  };

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-colors hover:border-emerald-500/50 min-w-[160px]",
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <Database className="h-4 w-4 text-emerald-500" />
            <Badge variant="outline" className="text-xs uppercase">
              {emitMethod}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-1 text-xs">
          <div className="font-medium">{connectionName}</div>
          <div className="text-muted-foreground">Schema: {destSchemaName}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:border-emerald-500/50 min-w-[200px]",
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-500" />
            <span className="font-medium capitalize">{connectorType}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            DESTINATION
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="font-medium">{connectionName}</div>
        <div className="text-muted-foreground text-xs">
          Writing to: {destSchemaName}
        </div>
        <Badge variant="secondary" className="text-xs uppercase">
          {emitMethod}
        </Badge>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
}
