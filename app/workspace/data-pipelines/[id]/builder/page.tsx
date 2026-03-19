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

/** Wave 1: Set to true to use mock data (no API calls). Set to false for real API. */
const USE_MOCK_DATA = true;

export default function PipelineBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: pipelineData, isLoading } = usePipelineWithSchemas(
    USE_MOCK_DATA ? undefined : organizationId,
    USE_MOCK_DATA ? undefined : pipelineId,
  );
  const loadPipeline = usePipelineBuilderStore((s) => s.loadPipeline);
  const loadMockPipeline = usePipelineBuilderStore((s) => s.loadMockPipeline);
  const reset = usePipelineBuilderStore((s) => s.reset);

  usePipelineRunsRealtime(
    USE_MOCK_DATA ? undefined : organizationId ?? undefined,
    USE_MOCK_DATA ? undefined : pipelineId,
  );

  useEffect(() => {
    if (USE_MOCK_DATA) {
      loadMockPipeline();
    } else if (pipelineData) {
      loadPipeline(pipelineData);
    }
    return () => reset();
  }, [USE_MOCK_DATA, pipelineData, loadPipeline, loadMockPipeline, reset]);

  if (!USE_MOCK_DATA && isLoading) {
    return <LoadingState fullScreen message="Loading pipeline..." />;
  }

  if (!USE_MOCK_DATA && !pipelineData) {
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
