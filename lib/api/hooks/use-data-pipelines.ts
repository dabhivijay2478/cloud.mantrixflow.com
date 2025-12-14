/**
 * Data Pipelines TanStack Query Hooks
 * Reusable hooks for data pipeline API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataPipelinesService } from '../services/data-pipelines.service';
import type {
  CreatePipelineDto,
  UpdatePipelineDto,
} from '../types/data-pipelines';

// Query Keys
export const dataPipelinesKeys = {
  all: ['data-pipelines'] as const,
  pipelines: {
    all: ['data-pipelines', 'pipelines'] as const,
    lists: () => [...dataPipelinesKeys.pipelines.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...dataPipelinesKeys.pipelines.lists(), filters] as const,
    details: () => [...dataPipelinesKeys.pipelines.all, 'detail'] as const,
    detail: (id: string) =>
      [...dataPipelinesKeys.pipelines.details(), id] as const,
  },
  runs: (pipelineId: string, limit?: number, offset?: number) =>
    [...dataPipelinesKeys.all, 'runs', pipelineId, limit, offset] as const,
  run: (pipelineId: string, runId: string) =>
    [...dataPipelinesKeys.all, 'runs', pipelineId, runId] as const,
  stats: (pipelineId: string) =>
    [...dataPipelinesKeys.all, 'stats', pipelineId] as const,
};

// Pipeline Management Hooks
export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePipelineDto) =>
      DataPipelinesService.createPipeline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
    },
  });
}

export function usePipelines() {
  return useQuery({
    queryKey: dataPipelinesKeys.pipelines.lists(),
    queryFn: () => DataPipelinesService.listPipelines(),
  });
}

export function usePipeline(id: string | undefined) {
  return useQuery({
    queryKey: dataPipelinesKeys.pipelines.detail(id!),
    queryFn: () => DataPipelinesService.getPipeline(id!),
    enabled: !!id,
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePipelineDto }) =>
      DataPipelinesService.updatePipeline(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.deletePipeline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
    },
  });
}

// Pipeline Execution Hooks
export function useRunPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.runPipeline(id),
    onSuccess: (_, pipelineId) => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(pipelineId),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.runs(pipelineId),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.stats(pipelineId),
      });
    },
  });
}

export function useDryRunPipeline() {
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.dryRunPipeline(id),
  });
}

export function usePausePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.pausePipeline(id),
    onSuccess: (_, pipelineId) => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(pipelineId),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
    },
  });
}

export function useResumePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.resumePipeline(id),
    onSuccess: (_, pipelineId) => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(pipelineId),
      });
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.lists(),
      });
    },
  });
}

// Pipeline Configuration Hooks
export function useValidatePipeline() {
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.validatePipeline(id),
  });
}

export function useAutoMapColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataPipelinesService.autoMapColumns(id),
    onSuccess: (_, pipelineId) => {
      queryClient.invalidateQueries({
        queryKey: dataPipelinesKeys.pipelines.detail(pipelineId),
      });
    },
  });
}

// Pipeline Monitoring Hooks
export function usePipelineRuns(
  pipelineId: string | undefined,
  limit?: number,
  offset?: number,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.runs(pipelineId!, limit, offset),
    queryFn: () =>
      DataPipelinesService.getPipelineRuns(pipelineId!, limit, offset),
    enabled: !!pipelineId,
  });
}

export function usePipelineRun(
  pipelineId: string | undefined,
  runId: string | undefined,
) {
  return useQuery({
    queryKey: dataPipelinesKeys.run(pipelineId!, runId!),
    queryFn: () => DataPipelinesService.getPipelineRun(pipelineId!, runId!),
    enabled: !!pipelineId && !!runId,
  });
}

export function usePipelineStats(pipelineId: string | undefined) {
  return useQuery({
    queryKey: dataPipelinesKeys.stats(pipelineId!),
    queryFn: () => DataPipelinesService.getPipelineStats(pipelineId!),
    enabled: !!pipelineId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
