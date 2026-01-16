/**
 * Data Pipelines TanStack Query Hooks
 * Reusable hooks for data pipeline API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataPipelinesService } from "../services/data-pipelines.service";
import type {
  CreatePipelineDto,
  UpdatePipelineDto,
} from "../types/data-pipelines";

// Query Keys
export const dataPipelinesKeys = {
  all: ["data-pipelines"] as const,
  pipelines: {
    all: ["data-pipelines", "pipelines"] as const,
    lists: () => [...dataPipelinesKeys.pipelines.all, "list"] as const,
    list: (organizationId: string, filters?: Record<string, unknown>) =>
      [
        ...dataPipelinesKeys.pipelines.lists(),
        organizationId,
        filters,
      ] as const,
    details: () => [...dataPipelinesKeys.pipelines.all, "detail"] as const,
    detail: (organizationId: string, pipelineId: string) =>
      [
        ...dataPipelinesKeys.pipelines.details(),
        organizationId,
        pipelineId,
      ] as const,
  },
  runs: (
    organizationId: string,
    pipelineId: string,
    limit?: number,
    offset?: number,
  ) =>
    [
      ...dataPipelinesKeys.all,
      "runs",
      organizationId,
      pipelineId,
      limit,
      offset,
    ] as const,
  run: (organizationId: string, pipelineId: string, runId: string) =>
    [
      ...dataPipelinesKeys.all,
      "runs",
      organizationId,
      pipelineId,
      runId,
    ] as const,
  stats: (organizationId: string, pipelineId: string) =>
    [...dataPipelinesKeys.all, "stats", organizationId, pipelineId] as const,
};

// Pipeline Management Hooks
export function useCreatePipeline(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePipelineDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.createPipeline(organizationId, data);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });
}

export function usePipelines(organizationId: string | undefined) {
  return useQuery({
    queryKey: dataPipelinesKeys.pipelines.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.listPipelines(organizationId);
    },
    enabled: !!organizationId,
  });
}

export function usePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.pipelines.detail(
      organizationId || "",
      pipelineId || "",
    ),
    queryFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.getPipeline(organizationId, pipelineId);
    },
    enabled: !!organizationId && !!pipelineId,
  });
}

export function useUpdatePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePipelineDto) => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.updatePipeline(
        organizationId,
        pipelineId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && pipelineId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            pipelineId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });
}

export function useDeletePipeline(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.deletePipeline(organizationId, pipelineId);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });
}

// Pipeline Execution Hooks
export function useRunPipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.runPipeline(organizationId, pipelineId);
    },
    onSuccess: () => {
      if (organizationId && pipelineId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            pipelineId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.runs(organizationId, pipelineId),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.stats(organizationId, pipelineId),
        });
      }
    },
  });
}

export function useDryRunPipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      // Note: dryRunPipeline endpoint may need to be updated in service
      return DataPipelinesService.dryRunPipeline(organizationId, pipelineId);
    },
  });
}

export function usePausePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.pausePipeline(organizationId, pipelineId);
    },
    onSuccess: (updatedPipeline) => {
      if (updatedPipeline?.id && organizationId) {
        queryClient.setQueryData(
          dataPipelinesKeys.pipelines.detail(
            organizationId,
            updatedPipeline.id,
          ),
          updatedPipeline,
        );
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });
}

export function useResumePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.resumePipeline(organizationId, pipelineId);
    },
    onSuccess: (updatedPipeline) => {
      if (updatedPipeline?.id && organizationId) {
        queryClient.setQueryData(
          dataPipelinesKeys.pipelines.detail(
            organizationId,
            updatedPipeline.id,
          ),
          updatedPipeline,
        );
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.list(organizationId),
        });
      }
    },
  });
}

// Pipeline Configuration Hooks
export function useValidatePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.validatePipeline(organizationId, pipelineId);
    },
  });
}

export function useAutoMapColumns(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.autoMapColumns(organizationId, pipelineId);
    },
    onSuccess: () => {
      if (organizationId && pipelineId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            pipelineId,
          ),
        });
      }
    },
  });
}

// Pipeline Monitoring Hooks
export function usePipelineRuns(
  organizationId: string | undefined,
  pipelineId: string | undefined,
  limit?: number,
  offset?: number,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.runs(
      organizationId || "",
      pipelineId || "",
      limit,
      offset,
    ),
    queryFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.getPipelineRuns(
        organizationId,
        pipelineId,
        limit,
        offset,
      );
    },
    enabled: !!organizationId && !!pipelineId,
  });
}

export function usePipelineRun(
  organizationId: string | undefined,
  pipelineId: string | undefined,
  runId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.run(
      organizationId || "",
      pipelineId || "",
      runId || "",
    ),
    queryFn: () => {
      if (!organizationId || !pipelineId || !runId) {
        throw new Error(
          "Organization ID, Pipeline ID, and Run ID are required",
        );
      }
      return DataPipelinesService.getPipelineRun(
        organizationId,
        pipelineId,
        runId,
      );
    },
    enabled: !!organizationId && !!pipelineId && !!runId,
  });
}

export function usePipelineStats(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.stats(organizationId || "", pipelineId || ""),
    queryFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.getPipelineStats(organizationId, pipelineId);
    },
    enabled: !!organizationId && !!pipelineId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
