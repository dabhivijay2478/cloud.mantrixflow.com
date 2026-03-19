"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PipelineBuilder } from "./PipelineBuilder";
import { usePipelineBuilderStore } from "./store/pipelineStore";
import { LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  usePipelineWithSchemas,
} from "@/lib/api/hooks/use-data-pipelines";
import { usePipelineRunsRealtime } from "@/lib/api/hooks/use-pipeline-runs-realtime";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function PipelineBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: pipelineData, isLoading } = usePipelineWithSchemas(
    organizationId,
    pipelineId,
  );
  const loadPipeline = usePipelineBuilderStore((s) => s.loadPipeline);
  const reset = usePipelineBuilderStore((s) => s.reset);

  usePipelineRunsRealtime(organizationId ?? undefined, pipelineId);

  useEffect(() => {
    if (pipelineData) {
      loadPipeline(pipelineData);
    }
    return () => reset();
  }, [pipelineData, loadPipeline, reset]);

  if (isLoading) {
    return <LoadingState fullScreen message="Loading pipeline..." />;
  }

  if (!pipelineData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Pipeline not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/workspace/data-pipelines")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workspace/data-pipelines/${pipelineId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <PipelineBuilder />
    </div>
  );
}
