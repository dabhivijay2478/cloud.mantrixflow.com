/**
 * Data Pipelines API Service
 * Service layer for data pipeline endpoints
 * Updated to match refactored backend API
 */

import { ApiClient, type PaginatedListResult } from "../client";
import { orgPath } from "../constants";
import type {
  CreatePipelineDto,
  DryRunPipelineDto,
  DryRunResult,
  Pipeline,
  PipelineRun,
  PipelineStats,
  PipelineWithSchemas,
  RunPipelineDto,
  UpdatePipelineDto,
  ValidationResult,
} from "../types/data-pipelines";

export class DataPipelinesService {
  // ============================================================================
  // PIPELINE CRUD
  // ============================================================================

  /**
   * Create a new pipeline.
   */
  static async createPipeline(
    organizationId: string,
    data: CreatePipelineDto,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${orgPath(organizationId)}/pipelines`,
      data,
    );
  }

  /**
   * List all pipelines for organization (unpaginated, backward-compatible)
   */
  static async listPipelines(organizationId: string): Promise<Pipeline[]> {
    return ApiClient.get<Pipeline[]>(
      `${orgPath(organizationId)}/pipelines`,
    );
  }

  /**
   * List pipelines with server-side pagination.
   * Use cursor for large orgs (1M+ pipelines) to avoid offset degradation.
   */
  static async listPipelinesPaginated(
    organizationId: string,
    limit: number = 20,
    offset: number = 0,
    cursor?: string,
  ): Promise<PaginatedListResult<Pipeline>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (cursor) {
      params.set("cursor", cursor);
    }
    return ApiClient.getList<Pipeline>(
      `${orgPath(organizationId)}/pipelines?${params}`,
    );
  }

  /**
   * Get pipeline by ID
   */
  static async getPipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.get<Pipeline>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}`,
    );
  }

  /**
   * Get pipeline with source and destination schemas
   */
  static async getPipelineWithSchemas(
    organizationId: string,
    pipelineId: string,
  ): Promise<PipelineWithSchemas> {
    return ApiClient.get<PipelineWithSchemas>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/full`,
    );
  }

  /**
   * Update pipeline.
   */
  static async updatePipeline(
    organizationId: string,
    pipelineId: string,
    data: UpdatePipelineDto,
  ): Promise<Pipeline> {
    return ApiClient.patch<Pipeline>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}`,
      data,
    );
  }

  /**
   * Delete pipeline (soft delete)
   */
  static async deletePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}`,
    );
  }

  // ============================================================================
  // PIPELINE EXECUTION
  // ============================================================================

  /**
   * Run pipeline.
   */
  static async runPipeline(
    organizationId: string,
    pipelineId: string,
    options?: RunPipelineDto,
  ): Promise<PipelineRun> {
    return ApiClient.post<PipelineRun>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/run`,
      options || {},
    );
  }

  /**
   * Pause pipeline.
   */
  static async pausePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/pause`,
      {},
    );
  }

  /**
   * Resume pipeline - calls NestJS API (may need to add Python endpoint later)
   */
  static async resumePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/resume`,
    );
  }

  /**
   * Cancel a running pipeline run
   */
  static async cancelPipelineRun(
    organizationId: string,
    pipelineId: string,
    runId: string,
  ): Promise<PipelineRun> {
    return ApiClient.post<PipelineRun>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/runs/${runId}/cancel`,
    );
  }

  // ============================================================================
  // PIPELINE VALIDATION
  // ============================================================================

  /**
   * Validate pipeline configuration
   */
  static async validatePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<ValidationResult> {
    return ApiClient.post<ValidationResult>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/validate`,
    );
  }

  /**
   * Dry run pipeline (test without writing)
   */
  static async dryRunPipeline(
    organizationId: string,
    pipelineId: string,
    options?: DryRunPipelineDto,
  ): Promise<DryRunResult> {
    return ApiClient.post<DryRunResult>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/dry-run`,
      options || {},
    );
  }

  // ============================================================================
  // PIPELINE RUNS
  // ============================================================================

  /**
   * Get pipeline runs with pagination
   */
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
      `${orgPath(organizationId)}/pipelines/${pipelineId}/runs${queryString}`,
    );
  }

  /**
   * Get pipeline run by ID
   */
  static async getPipelineRun(
    organizationId: string,
    pipelineId: string,
    runId: string,
  ): Promise<PipelineRun> {
    return ApiClient.get<PipelineRun>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/runs/${runId}`,
    );
  }

  // ============================================================================
  // PIPELINE STATISTICS
  // ============================================================================

  /**
   * Get sync state (cursor/LSN) for incremental/CDC pipelines.
   * NestJS owns state — stored in pipeline.checkpoint.
   */
  static async getSyncState(
    organizationId: string,
    pipelineId: string,
  ): Promise<{ pipeline_id: string; state: Record<string, unknown> | null; message: string }> {
    return ApiClient.get(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/sync-state`,
    );
  }

  /**
   * Reset sync state — next run will do a full sync.
   */
  static async resetSyncState(
    organizationId: string,
    pipelineId: string,
  ): Promise<{ pipeline_id: string; deleted: boolean; message: string }> {
    return ApiClient.delete(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/sync-state`,
    );
  }

  /**
   * Get pipeline statistics
   */
  static async getPipelineStats(
    organizationId: string,
    pipelineId: string,
  ): Promise<PipelineStats> {
    return ApiClient.get<PipelineStats>(
      `${orgPath(organizationId)}/pipelines/${pipelineId}/stats`,
    );
  }

}
