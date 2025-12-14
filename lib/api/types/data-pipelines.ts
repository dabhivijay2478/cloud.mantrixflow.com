/**
 * Data Pipelines API Types
 * Type definitions for data pipeline endpoints
 */

export interface ColumnMapping {
  sourceColumn: string;
  destinationColumn: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  maxLength?: number;
}

export interface Transformation {
  sourceColumn: string;
  transformType: 'rename' | 'cast' | 'concat' | 'split' | 'custom';
  transformConfig: Record<string, unknown>;
  destinationColumn: string;
}

export interface CreatePipelineDto {
  name: string;
  description?: string;
  sourceType: string;
  sourceConnectionId?: string;
  sourceConfig?: Record<string, unknown>;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  destinationConnectionId: string;
  destinationSchema?: string;
  destinationTable: string;
  columnMappings?: ColumnMapping[];
  transformations?: Transformation[];
  writeMode?: 'append' | 'upsert' | 'replace';
  upsertKey?: string[];
  syncMode?: 'full' | 'incremental';
  incrementalColumn?: string;
  syncFrequency?: 'manual' | '15min' | '1hour' | '24hours';
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  columnMappings?: ColumnMapping[];
  transformations?: Transformation[];
  writeMode?: 'append' | 'upsert' | 'replace';
  upsertKey?: string[];
  syncMode?: 'full' | 'incremental';
  incrementalColumn?: string;
  syncFrequency?: 'manual' | '15min' | '1hour' | '24hours';
  status?: 'active' | 'paused';
}

export interface Pipeline {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  description?: string;
  sourceType: string;
  sourceConnectionId?: string;
  sourceConfig?: Record<string, unknown>;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  destinationConnectionId: string;
  destinationSchema: string;
  destinationTable: string;
  columnMappings?: ColumnMapping[];
  transformations?: Transformation[];
  writeMode: 'append' | 'upsert' | 'replace';
  upsertKey?: string[];
  syncMode: 'full' | 'incremental';
  incrementalColumn?: string;
  syncFrequency: 'manual' | '15min' | '1hour' | '24hours';
  status: 'active' | 'paused' | 'error';
  lastRunAt?: Date | string;
  nextRunAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  rowsProcessed?: number;
  rowsWritten?: number;
  executionTimeMs?: number;
  error?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
}

export interface PipelineStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalRowsProcessed: number;
  totalRowsWritten: number;
  averageExecutionTimeMs: number;
  lastRunAt?: Date | string;
  lastRunStatus?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AutoMapResponse {
  columnMappings: ColumnMapping[];
  confidence: number;
  warnings?: string[];
}

export interface DryRunResult {
  success: boolean;
  rowsToProcess?: number;
  estimatedTimeMs?: number;
  schemaValidation?: {
    valid: boolean;
    errors?: string[];
  };
  preview?: {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
  };
  error?: string;
}
