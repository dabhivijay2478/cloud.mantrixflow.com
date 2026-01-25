/**
 * Data Pipelines API Service
 * Service layer for data pipeline endpoints
 * Updated to match refactored backend API
 */

import { ApiClient } from "../client";
import type {
  CreatePipelineDto,
  DryRunPipelineDto,
  DryRunResult,
  Pipeline,
  PipelineDestinationSchema,
  PipelineRun,
  PipelineSourceSchema,
  PipelineStats,
  PipelineWithSchemas,
  RunPipelineDto,
  UpdatePipelineDto,
  ValidationResult,
} from "../types/data-pipelines";

export class DataPipelinesService {
  private static readonly BASE_PATH = "api/organizations";

  // ============================================================================
  // PIPELINE CRUD
  // ============================================================================

  /**
   * Create a new pipeline - calls Python API directly
   * Python API handles source schema, destination schema, and pipeline creation
   */
  static async createPipeline(
    organizationId: string,
    data: CreatePipelineDto,
  ): Promise<Pipeline> {
    // Call Python API directly for pipeline creation
    const { PythonETLService } = await import('./python-etl.service');
    
    // Note: Python API expects a different format with source_schema and destination_schema
    // This method signature is kept for backward compatibility but should be updated
    // to match the Python API format in the future
    throw new Error('Use PythonETLService.createPipeline directly with source_schema and destination_schema');
  }

  /**
   * List all pipelines for organization
   */
  static async listPipelines(organizationId: string): Promise<Pipeline[]> {
    return ApiClient.get<Pipeline[]>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/full`,
    );
  }

  /**
   * Update pipeline - calls Python API directly
   * Python API handles pipeline updates
   */
  static async updatePipeline(
    organizationId: string,
    pipelineId: string,
    data: UpdatePipelineDto,
  ): Promise<Pipeline> {
    // Call Python API directly for pipeline updates
    const { PythonETLService } = await import('./python-etl.service');
    
    // Map frontend DTO to Python API format
    const pythonData: any = {};
    if (data.name !== undefined) pythonData.name = data.name;
    if (data.description !== undefined) pythonData.description = data.description;
    if (data.syncMode !== undefined) pythonData.sync_mode = data.syncMode;
    if (data.syncFrequency !== undefined) pythonData.sync_frequency = data.syncFrequency;
    if (data.incrementalColumn !== undefined) pythonData.incremental_column = data.incrementalColumn;
    if (data.scheduleType !== undefined) pythonData.schedule_type = data.scheduleType;
    if (data.scheduleValue !== undefined) pythonData.schedule_value = data.scheduleValue;
    if (data.scheduleTimezone !== undefined) pythonData.schedule_timezone = data.scheduleTimezone;
    if (data.transformations !== undefined) pythonData.transformations = data.transformations;
    
    return PythonETLService.updatePipeline(organizationId, pipelineId, pythonData);
  }

  /**
   * Delete pipeline (soft delete)
   */
  static async deletePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<{ deletedId: string }> {
    return ApiClient.delete<{ deletedId: string }>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}`,
    );
  }

  // ============================================================================
  // PIPELINE EXECUTION - Uses Python API directly to avoid NestJS proxy timeout
  // ============================================================================

  /**
   * Run pipeline - calls Python API directly to avoid timeout issues
   */
  static async runPipeline(
    organizationId: string,
    pipelineId: string,
    options?: RunPipelineDto,
  ): Promise<PipelineRun> {
    // Call Python API directly to bypass NestJS proxy and avoid timeout issues
    const { PythonETLService } = await import('./python-etl.service');
    
    const result = await PythonETLService.runPipeline(organizationId, pipelineId, {
      syncMode: options?.syncMode as 'full' | 'incremental' || 'full',
      limit: options?.limit,
    });
    
    // Map Python response to PipelineRun format
    return {
      id: result.runId,
      pipelineId: result.pipelineId,
      organizationId: organizationId,
      status: result.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
      triggerType: 'manual',
      rowsRead: result.rowsRead,
      rowsWritten: result.rowsWritten,
      rowsSkipped: result.rowsSkipped,
      rowsFailed: result.rowsFailed,
      errorMessage: result.errors?.length > 0 ? result.errors[0]?.error : undefined,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Pause pipeline - calls Python API directly
   */
  static async pausePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    // Call Python API directly
    const { PythonETLService } = await import('./python-etl.service');
    
    const result = await PythonETLService.pausePipeline(organizationId, pipelineId);
    
    // Return minimal pipeline object with updated status
    return {
      id: result.pipelineId,
      organizationId: organizationId,
      status: result.status as 'idle' | 'running' | 'paused' | 'failed' | 'completed',
    } as Pipeline;
  }

  /**
   * Resume pipeline - calls NestJS API (may need to add Python endpoint later)
   */
  static async resumePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<Pipeline> {
    return ApiClient.post<Pipeline>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/resume`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/runs/${runId}/cancel`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/validate`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/dry-run`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/runs${queryString}`,
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
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/runs/${runId}`,
    );
  }

  // ============================================================================
  // PIPELINE STATISTICS
  // ============================================================================

  /**
   * Get pipeline statistics
   */
  static async getPipelineStats(
    organizationId: string,
    pipelineId: string,
  ): Promise<PipelineStats> {
    return ApiClient.get<PipelineStats>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/pipelines/${pipelineId}/stats`,
    );
  }

  // ============================================================================
  // SOURCE SCHEMA
  // ============================================================================

  /**
   * Get source schema by ID
   */
  static async getSourceSchema(
    organizationId: string,
    schemaId: string,
  ): Promise<PipelineSourceSchema> {
    return ApiClient.get<PipelineSourceSchema>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/source-schemas/${schemaId}`,
    );
  }

  /**
   * List source schemas for organization
   */
  static async listSourceSchemas(
    organizationId: string,
  ): Promise<PipelineSourceSchema[]> {
    return ApiClient.get<PipelineSourceSchema[]>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/source-schemas`,
    );
  }

  // ============================================================================
  // DESTINATION SCHEMA
  // ============================================================================

  /**
   * Get destination schema by ID
   */
  static async getDestinationSchema(
    organizationId: string,
    schemaId: string,
  ): Promise<PipelineDestinationSchema> {
    return ApiClient.get<PipelineDestinationSchema>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/destination-schemas/${schemaId}`,
    );
  }

  /**
   * List destination schemas for organization
   */
  static async listDestinationSchemas(
    organizationId: string,
  ): Promise<PipelineDestinationSchema[]> {
    return ApiClient.get<PipelineDestinationSchema[]>(
      `${DataPipelinesService.BASE_PATH}/${organizationId}/destination-schemas`,
    );
  }
}
