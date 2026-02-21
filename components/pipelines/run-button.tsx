"use client";

import { Loader2 } from "lucide-react";
import { usePipelineRunStatus } from "@/lib/api/hooks/use-pipeline-run-status";
import { useRunPipeline } from "@/lib/api/hooks/use-data-pipelines";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";

interface RunButtonProps {
  organizationId: string;
  pipelineId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function RunButton({
  organizationId,
  pipelineId,
  variant = "default",
  size = "default",
  className,
  children = "Run",
}: RunButtonProps) {
  const status = usePipelineRunStatus(pipelineId);
  const runPipeline = useRunPipeline(organizationId, pipelineId);

  const isBusy =
    status?.status === "pending" ||
    status?.status === "queued" ||
    status?.status === "running";

  const handleRun = async () => {
    try {
      await runPipeline.mutateAsync({});
      toast.success("Pipeline run started");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start pipeline"
      );
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleRun}
      disabled={isBusy || runPipeline.isPending}
    >
      {(isBusy || runPipeline.isPending) && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  );
}
