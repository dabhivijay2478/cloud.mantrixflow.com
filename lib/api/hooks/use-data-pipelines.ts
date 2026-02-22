/**
 * Data Pipelines TanStack Query Hooks
 * Reusable hooks for data pipeline API endpoints
 * Updated to match refactored backend API
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataPipelinesService } from "../services/data-pipelines.service";
import type {
  CreatePipelineDto,
  DryRunPipelineDto,
  Pipeline,
  RunPipelineDto,
  UpdatePipelineDto,
} from "../types/data-pipelines";
import { destinationSchemasKeys } from "./use-destination-schemas";
import { sourceSchemasKeys } from "./use-source-schemas";

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
    full: (organizationId: string, pipelineId: string) =>
      [
        ...dataPipelinesKeys.pipelines.all,
        "full",
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
  validation: (organizationId: string, pipelineId: string) =>
    [
      ...dataPipelinesKeys.all,
      "validation",
      organizationId,
      pipelineId,
    ] as const,
  syncState: (organizationId: string, pipelineId: string) =>
    [...dataPipelinesKeys.all, "sync-state", organizationId, pipelineId] as const,
};

// ============================================================================
// Pipeline CRUD Hooks
// ============================================================================

/**
 * Create a new pipeline
 * Invalidates: pipeline lists, dashboard, activity logs
 */
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
        // Invalidate all pipeline list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.lists(),
        });
        // Invalidate dashboard to reflect new pipeline count
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}

/**
 * List pipelines for organization (unpaginated, backward-compatible)
 */
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

/**
 * List pipelines with server-side pagination
 */
export function usePipelinesPaginated(
  organizationId: string | undefined,
  pagination: { pageIndex: number; pageSize: number },
) {
  const { pageIndex, pageSize } = pagination;
  const offset = pageIndex * pageSize;

  return useQuery({
    queryKey: [
      ...dataPipelinesKeys.pipelines.lists(),
      organizationId,
      { limit: pageSize, offset },
    ],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.listPipelinesPaginated(
        organizationId,
        pageSize,
        offset,
      );
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
  });
}

/**
 * Get pipeline by ID
 */
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

/**
 * Get pipeline with source and destination schemas
 * Schema data is essentially static - use aggressive caching.
 * Invalidated explicitly on pipeline update/delete.
 */
export function usePipelineWithSchemas(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.pipelines.full(
      organizationId || "",
      pipelineId || "",
    ),
    queryFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.getPipelineWithSchemas(
        organizationId,
        pipelineId,
      );
    },
    enabled: !!organizationId && !!pipelineId,
    staleTime: Infinity, // Schema data never auto-refetches; invalidated on mutation
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes after last use
  });
}

/**
 * Update pipeline
 * Invalidates: detail, full (with schemas), all list queries (including paginated),
 * associated source/destination schema caches, dashboard, activity logs
 */
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
    onSuccess: (updatedPipeline) => {
      if (organizationId && pipelineId) {
        // Update detail cache with new data
        queryClient.setQueryData(
          dataPipelinesKeys.pipelines.detail(organizationId, pipelineId),
          updatedPipeline,
        );
        // Invalidate full (pipeline + schemas) to reflect any schema changes
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.full(
            organizationId,
            pipelineId,
          ),
        });
        // Invalidate all pipeline list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.lists(),
        });
        // Invalidate associated source/destination schema caches
        if (updatedPipeline.sourceSchemaId) {
          queryClient.invalidateQueries({
            queryKey: sourceSchemasKeys.detail(
              organizationId,
              updatedPipeline.sourceSchemaId,
            ),
          });
        }
        if (updatedPipeline.destinationSchemaId) {
          queryClient.invalidateQueries({
            queryKey: destinationSchemasKeys.detail(
              organizationId,
              updatedPipeline.destinationSchemaId,
            ),
          });
        }
        // Invalidate dashboard
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}

/**
 * Delete pipeline
 * Cleans up all related caches: detail, full, list (all paginated variants), runs, stats,
 * validation, schema queries, dashboard, activity logs, global search
 */
export function useDeletePipeline(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pipelineId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataPipelinesService.deletePipeline(organizationId, pipelineId);
    },
    onMutate: async (deletedPipelineId) => {
      if (!organizationId) return {};

      // Snapshot the pipeline before deletion so we can clean up schema caches
      const pipeline = queryClient.getQueryData<Pipeline>(
        dataPipelinesKeys.pipelines.detail(organizationId, deletedPipelineId),
      );

      // Optimistic update: remove from list immediately
      const listKey = dataPipelinesKeys.pipelines.list(organizationId);
      await queryClient.cancelQueries({ queryKey: listKey });
      const previousPipelines = queryClient.getQueryData<Pipeline[]>(listKey);
      if (previousPipelines) {
        queryClient.setQueryData<Pipeline[]>(
          listKey,
          previousPipelines.filter((p) => p.id !== deletedPipelineId),
        );
      }

      return { previousPipelines, pipeline, listKey };
    },
    onError: (_error, _deletedPipelineId, context) => {
      // Rollback optimistic update on error
      if (context?.previousPipelines && context.listKey) {
        queryClient.setQueryData(context.listKey, context.previousPipelines);
      }
    },
    onSuccess: (_, deletedPipelineId, context) => {
      if (!organizationId) return;

      // Remove all pipeline-specific caches
      queryClient.removeQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(
          organizationId,
          deletedPipelineId,
        ),
      });
      queryClient.removeQueries({
        queryKey: dataPipelinesKeys.pipelines.full(
          organizationId,
          deletedPipelineId,
        ),
      });
      queryClient.removeQueries({
        queryKey: dataPipelinesKeys.runs(organizationId, deletedPipelineId),
      });
      queryClient.removeQueries({
        queryKey: dataPipelinesKeys.stats(organizationId, deletedPipelineId),
      });
      queryClient.removeQueries({
        queryKey: dataPipelinesKeys.validation(
          organizationId,
          deletedPipelineId,
        ),
      });

      // Invalidate schema caches associated with this pipeline
      const pipeline = context?.pipeline;
      if (pipeline?.sourceSchemaId) {
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.detail(
            organizationId,
            pipeline.sourceSchemaId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.list(organizationId),
        });
      }
      if (pipeline?.destinationSchemaId) {
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.detail(
            organizationId,
            pipeline.destinationSchemaId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.list(organizationId),
        });
      }

      // Invalidate ALL pipeline list queries (including all paginated variants)
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
      // Invalidate dashboard to reflect updated counts
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
      // Invalidate global search
      queryClient.invalidateQueries({
        queryKey: ["global-search"],
      });
    },
  });
}

// ============================================================================
// Pipeline Execution Hooks
// ============================================================================

/**
 * Run pipeline
 * Invalidates: pipeline detail + list, runs, stats, dashboard, activity logs
 */
export function useRunPipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: RunPipelineDto) => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.runPipeline(
        organizationId,
        pipelineId,
        options,
      );
    },
    onMutate: async () => {
      if (!organizationId || !pipelineId) return {};

      const detailKey = dataPipelinesKeys.pipelines.detail(
        organizationId,
        pipelineId,
      );
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousPipeline = queryClient.getQueryData<Pipeline>(detailKey);

      if (previousPipeline) {
        queryClient.setQueryData<Pipeline>(detailKey, {
          ...previousPipeline,
          status: "running",
        });
      }

      return { previousPipeline, detailKey };
    },
    onError: (_error, _vars, context) => {
      if (
        context?.previousPipeline &&
        context.detailKey &&
        Array.isArray(context.detailKey)
      ) {
        queryClient.setQueryData(context.detailKey, context.previousPipeline);
      }
    },
    onSettled: () => {
      if (!organizationId || !pipelineId) return;
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(
          organizationId,
          pipelineId,
        ),
      });
      // Invalidate all pipeline list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.runs(organizationId, pipelineId),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.stats(organizationId, pipelineId),
      });
      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

/**
 * Pause pipeline
 * Invalidates: pipeline detail + all list queries, dashboard, activity logs
 */
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
    onMutate: async () => {
      if (!organizationId || !pipelineId) return {};
      const detailKey = dataPipelinesKeys.pipelines.detail(
        organizationId,
        pipelineId,
      );
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousPipeline = queryClient.getQueryData<Pipeline>(detailKey);
      if (previousPipeline) {
        queryClient.setQueryData<Pipeline>(detailKey, {
          ...previousPipeline,
          status: "paused",
        });
      }
      return { previousPipeline, detailKey };
    },
    onError: (_error, _vars, context) => {
      if (
        context?.previousPipeline &&
        context.detailKey &&
        Array.isArray(context.detailKey)
      ) {
        queryClient.setQueryData(context.detailKey, context.previousPipeline);
      }
    },
    onSettled: () => {
      if (!organizationId || !pipelineId) return;
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(
          organizationId,
          pipelineId,
        ),
      });
      // Invalidate all pipeline list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

/**
 * Resume pipeline
 * Invalidates: pipeline detail + all list queries, dashboard, activity logs
 */
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
    onMutate: async () => {
      if (!organizationId || !pipelineId) return {};
      const detailKey = dataPipelinesKeys.pipelines.detail(
        organizationId,
        pipelineId,
      );
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousPipeline = queryClient.getQueryData<Pipeline>(detailKey);
      if (previousPipeline) {
        queryClient.setQueryData<Pipeline>(detailKey, {
          ...previousPipeline,
          status: "idle",
        });
      }
      return { previousPipeline, detailKey };
    },
    onError: (_error, _vars, context) => {
      if (
        context?.previousPipeline &&
        context.detailKey &&
        Array.isArray(context.detailKey)
      ) {
        queryClient.setQueryData(context.detailKey, context.previousPipeline);
      }
    },
    onSettled: () => {
      if (!organizationId || !pipelineId) return;
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(
          organizationId,
          pipelineId,
        ),
      });
      // Invalidate all pipeline list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

/**
 * Cancel a running pipeline run
 * Invalidates: run detail, runs list, pipeline detail + list, dashboard, activity logs
 */
export function useCancelPipelineRun(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.cancelPipelineRun(
        organizationId,
        pipelineId,
        runId,
      );
    },
    onSuccess: (updatedRun, runId) => {
      if (organizationId && pipelineId) {
        // Update run in cache
        queryClient.setQueryData(
          dataPipelinesKeys.run(organizationId, pipelineId, runId),
          updatedRun,
        );
        // Invalidate runs list
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.runs(organizationId, pipelineId),
        });
        // Invalidate pipeline to update status
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(
            organizationId,
            pipelineId,
          ),
        });
        // Invalidate all pipeline list queries
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.lists(),
        });
        // Invalidate dashboard
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}

// ============================================================================
// Pipeline Validation Hooks
// ============================================================================

/**
 * Validate pipeline configuration
 */
export function useValidatePipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.validatePipeline(organizationId, pipelineId);
    },
    onSuccess: (result) => {
      if (organizationId && pipelineId) {
        // Cache validation result
        queryClient.setQueryData(
          dataPipelinesKeys.validation(organizationId, pipelineId),
          result,
        );
      }
    },
  });
}

/**
 * Dry run pipeline (test without writing)
 */
export function useDryRunPipeline(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useMutation({
    mutationFn: (options?: DryRunPipelineDto) => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.dryRunPipeline(
        organizationId,
        pipelineId,
        options,
      );
    },
  });
}

// ============================================================================
// Pipeline Runs Hooks
// ============================================================================

/**
 * Get pipeline runs with pagination
 */
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

/**
 * Get pipeline run by ID
 */
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
    refetchInterval: (data) => {
      // Poll every 5 seconds if run is still in progress
      const status = data?.state?.data?.status;
      if (status === "running" || status === "pending") {
        return 5000;
      }
      return false;
    },
  });
}

/**
 * Get sync state (cursor/LSN) for incremental/CDC pipelines
 */
export function useGetSyncState(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.syncState(organizationId || "", pipelineId || ""),
    queryFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.getSyncState(organizationId, pipelineId);
    },
    enabled: !!organizationId && !!pipelineId,
  });
}

/**
 * Reset sync state — next run will do full sync
 */
export function useResetSyncState(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !pipelineId) {
        throw new Error("Organization ID and Pipeline ID are required");
      }
      return DataPipelinesService.resetSyncState(organizationId, pipelineId);
    },
    onSuccess: () => {
      if (organizationId && pipelineId) {
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.syncState(organizationId, pipelineId),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.detail(organizationId, pipelineId),
        });
        queryClient.invalidateQueries({
          queryKey: dataPipelinesKeys.pipelines.full(organizationId, pipelineId),
        });
      }
    },
  });
}

/**
 * Get pipeline statistics
 */
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
