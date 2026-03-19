"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { usePipelineBuilderStore } from "../store/pipelineStore";
import { cn } from "@/lib/utils";

interface TransformCardProps {
  nodeId: string;
  branchId?: string;
  compact?: boolean;
}

export function TransformCard({
  nodeId,
  branchId,
  compact = false,
}: TransformCardProps) {
  const nodes = usePipelineBuilderStore((s) => s.nodes);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);

  const node = nodes.find((n) => n.id === nodeId);
  if (!node || node.type !== "transform") return null;

  const data = node.data;
  const hasScript =
    data.transform_type === "python_script" && data.transform_script;
  const scriptPreview = hasScript
    ? (data.transform_script as string).split("\n")[0]?.slice(0, 50) ?? ""
    : "";

  const handleClick = () => {
    openDrawer("transform", nodeId, branchId);
  };

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-colors hover:border-violet-500/50 min-w-[160px]",
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <Zap className="h-4 w-4 text-violet-500" />
            <Badge variant="outline" className="text-xs">
              {hasScript ? "PYTHON" : "PASS-THROUGH"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-1 text-xs">
          {hasScript ? (
            <code className="line-clamp-2 text-muted-foreground">
              {scriptPreview}
              {scriptPreview.length >= 50 ? "..." : ""}
            </code>
          ) : (
            <span className="text-muted-foreground">
              Data passes through unchanged
            </span>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:border-violet-500/50 min-w-[200px]",
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
            <Zap className="h-5 w-5 text-violet-500" />
            <span className="font-medium">Transform</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {hasScript ? "PYTHON" : "NONE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {hasScript ? (
          <pre className="font-mono text-xs text-muted-foreground overflow-hidden text-ellipsis max-h-12">
            {scriptPreview}
            {(data.transform_script as string)?.length > 50 ? "..." : ""}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">
            No transform — data passes through unchanged
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          Edit Script
        </Button>
      </CardFooter>
    </Card>
  );
}
