/**
 * Data Pipelines API Service
 * Service layer for data pipeline endpoints
 */

import { ApiClient } from "../client";
import type {
  CreatePipelineDto,
  DryRunResult,
  Pipeline,
  PipelineRun,
  PipelineStats,
  UpdatePipelineDto,
  ValidationResult,
} from "../types/data-pipelines";

export class DataPipelinesService {
  private static readonly BASE_PATH = "api/organizations";

  // Pipeline Management
  static async createPipeline(
    organizationId: string,
    data: CreatePipelineDto,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines`,
      data,
    );
  }

  static async listPipelines(organizationId: string): Promise<Pipeline[]> {
    return ApiClient.get<Pipeline[]>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines`,
    );
  }

  static async getPipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.get<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}`,
    );
  }

  static async updatePipeline(
    organizationId: string,
    pipelineId: string,
    data: UpdatePipelineDto,
  ): Promise<Pipeline> {
    return ApiClient.patch<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}`,
      data,
    );
  }

  static async deletePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}`,
    );
  }

  // Pipeline Execution
  static async runPipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<PipelineRun> {
    return ApiClient.post<PipelineRun>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/run`,
    );
  }

  static async dryRunPipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<DryRunResult> {
    return ApiClient.post<DryRunResult>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/dry-run`,
    );
  }

  static async pausePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/pause`,
    );
  }

  static async resumePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/resume`,
    );
  }

  // Pipeline Configuration
  static async validatePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<ValidationResult> {
    return ApiClient.post<ValidationResult>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/validate`,
    );
  }

  // Pipeline Monitoring
  static async getPipelineRuns(
    organizationId: string,
    pipelineId: string,
    limit?: number,
    offset?: number,
  ): Promise<PipelineRun[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return ApiClient.get<PipelineRun[]>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/runs${queryString}`,
    );
  }

  static async getPipelineRun(
    organizationId: string,
    pipelineId: string,
    runId: string,
  ): Promise<PipelineRun> {
    return ApiClient.get<PipelineRun>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/runs/${runId}`,
    );
  }

  static async getPipelineStats(
    organizationId: string,
    pipelineId: string,
  ): Promise<PipelineStats> {
    return ApiClient.get<PipelineStats>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/stats`,
    );
  }
}
