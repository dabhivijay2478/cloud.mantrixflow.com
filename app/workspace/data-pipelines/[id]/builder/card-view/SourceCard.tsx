"use client";

import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { cn } from "@/lib/utils";

interface SourceCardProps {
  nodeId: string;
}

export function SourceCard({ nodeId }: SourceCardProps) {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);

  const node = nodes.find((n) => n.id === nodeId);
  const sourceSchema = pipeline?.sourceSchema;

  if (!node || node.type !== "source") return null;

  const data = node.data;
  const connectorType = data.connector_type ?? sourceSchema?.sourceType ?? "postgres";
  const selectedStreams = data.selected_streams ?? [];
  const connectionName =
    sourceSchema?.name ?? "Source connection";
  const hostSummary = sourceSchema
    ? "Configure in connection"
    : "Not configured";

  const handleClick = () => {
    openDrawer("source", nodeId);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:border-blue-500/50 min-w-[200px]",
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
            <Database className="h-5 w-5 text-blue-500" />
            <span className="font-medium capitalize">{connectorType}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            SOURCE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="font-medium">{connectionName}</div>
        <div className="text-muted-foreground text-xs">{hostSummary}</div>
        <div className="text-muted-foreground text-xs">
          {selectedStreams.length > 0
            ? `${selectedStreams.length} table(s) selected`
            : "No tables selected"}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
}
