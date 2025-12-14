/**
 * Data Pipelines API Service
 * Service layer for data pipeline endpoints
 */

import { ApiClient } from '../client';
import type {
  CreatePipelineDto,
  UpdatePipelineDto,
  Pipeline,
  PipelineRun,
  PipelineStats,
  ValidationResult,
  AutoMapResponse,
  DryRunResult,
} from '../types/data-pipelines';

export class DataPipelinesService {
  private static readonly BASE_PATH = 'api/data-pipelines';

  // Pipeline Management
  static async createPipeline(data: CreatePipelineDto): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(this.BASE_PATH, data);
  }

  static async listPipelines(): Promise<Pipeline[]> {
    return ApiClient.get<Pipeline[]>(this.BASE_PATH);
  }

  static async getPipeline(id: string): Promise<Pipeline> {
    return ApiClient.get<Pipeline>(`${this.BASE_PATH}/${id}`);
  }

  static async updatePipeline(
    id: string,
    data: UpdatePipelineDto,
  ): Promise<Pipeline> {
    return ApiClient.patch<Pipeline>(`${this.BASE_PATH}/${id}`, data);
  }

  static async deletePipeline(id: string): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(`${this.BASE_PATH}/${id}`);
  }

  // Pipeline Execution
  static async runPipeline(id: string): Promise<PipelineRun> {
    return ApiClient.post<PipelineRun>(`${this.BASE_PATH}/${id}/run`);
  }

  static async dryRunPipeline(id: string): Promise<DryRunResult> {
    return ApiClient.post<DryRunResult>(`${this.BASE_PATH}/${id}/dry-run`);
  }

  static async pausePipeline(id: string): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(`${this.BASE_PATH}/${id}/pause`);
  }

  static async resumePipeline(id: string): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(`${this.BASE_PATH}/${id}/resume`);
  }

  // Pipeline Configuration
  static async validatePipeline(
    id: string,
  ): Promise<ValidationResult> {
    return ApiClient.post<ValidationResult>(
      `${this.BASE_PATH}/${id}/validate`,
    );
  }

  static async autoMapColumns(id: string): Promise<AutoMapResponse> {
    return ApiClient.post<AutoMapResponse>(
      `${this.BASE_PATH}/${id}/auto-map`,
    );
  }

  // Pipeline Monitoring
  static async getPipelineRuns(
    id: string,
    limit?: number,
    offset?: number,
  ): Promise<PipelineRun[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get<PipelineRun[]>(
      `${this.BASE_PATH}/${id}/runs${queryString}`,
    );
  }

  static async getPipelineRun(
    id: string,
    runId: string,
  ): Promise<PipelineRun> {
    return ApiClient.get<PipelineRun>(
      `${this.BASE_PATH}/${id}/runs/${runId}`,
    );
  }

  static async getPipelineStats(id: string): Promise<PipelineStats> {
    return ApiClient.get<PipelineStats>(`${this.BASE_PATH}/${id}/stats`);
  }
}
