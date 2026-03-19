/**
 * Data Pipelines API Types
 * Type definitions for data pipeline endpoints (synced with backend DTOs)
 */

// ============================================================================
// ENUMS (matching backend)
// ============================================================================

export type PipelineDataSourceType = string;

export type SyncMode = "full" | "log_based" | "cdc" | "incremental";
export type SyncFrequency = "manual" | "hourly" | "daily" | "weekly";
export type WriteMode = "append" | "upsert" | "replace";
export type PipelineStatus =
  | "idle"
  | "initializing"
  | "running"
  | "listing"
  | "listening"
  | "paused"
  | "failed"
  | "completed";
export type RunStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "cancelled";
export type JobState = "pending" | "running" | "completed" | "failed";
export type TriggerType = "manual" | "scheduled" | "api";

export type ScheduleType =
  | "none"
  | "minutes"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom_cron";

export type TransformationType =
  | "rename"
  | "cast"
  | "concat"
  | "split"
  | "custom"
  | "filter"
  | "mask"
  | "hash";

// ============================================================================
// COLUMN MAPPING & TRANSFORMATION
// ============================================================================

export interface ColumnMapping {
  sourceColumn: string;
  destinationColumn: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  maxLength?: number;
}

export interface TransformConfig {
  targetType?: string;
  fields?: string[];
  separator?: string;
  index?: number;
  operator?:
    | "eq"
    | "ne"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "contains"
    | "startsWith"
    | "endsWith";
  value?: unknown;
  maskChar?: string;
  visibleChars?: number;
  algorithm?: "md5" | "sha256" | "sha512";
  expression?: string;
}

export interface Transformation {
  sourceColumn: string;
  transformType: TransformationType;
  transformConfig: TransformConfig;
  destinationColumn: string;
}

// ============================================================================
// PIPELINE DTOs
// ============================================================================

export interface CreatePipelineDto {
  name: string;
  description?: string;
  sourceSchemaId: string;
  destinationSchemaId: string;
  transformations?: Transformation[];
  syncMode?: SyncMode;
  incrementalColumn?: string;
  syncFrequency?: SyncFrequency;
  scheduleType?: ScheduleType;
  scheduleValue?: string;
  scheduleTimezone?: string;
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  status?: PipelineStatus;
  syncMode?: SyncMode;
  incrementalColumn?: string;
  syncFrequency?: SyncFrequency;
  transformations?: Transformation[];
  // Scheduling fields
  scheduleType?: ScheduleType;
  scheduleValue?: string;
  scheduleTimezone?: string;
  // Pipeline Builder (MANTrixFlow)
  pipelineGraph?: PipelineGraph;
  builderViewMode?: "card" | "canvas";
}

export interface RunPipelineDto {
  triggerType?: TriggerType;
  batchSize?: number;
  forceFullSync?: boolean;
}

export interface DryRunPipelineDto {
  sampleSize?: number;
}

// ============================================================================
// SOURCE SCHEMA
// ============================================================================

export interface SourceConfig {
  // PostgreSQL
  host?: string;
  port?: number;
  database?: string;
  schema?: string;

  // S3
  bucket?: string;
  region?: string;
  prefix?: string;
  fileFormat?: "csv" | "json" | "parquet";

  // API
  baseUrl?: string;
  endpoint?: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  rateLimit?: number;

  // BigQuery
  projectId?: string;
  dataset?: string;

  // Snowflake
  account?: string;
  warehouse?: string;

  // Common
  queryTimeout?: number;
}

export interface PipelineSourceSchema {
  id: string;
  organizationId: string;
  dataSourceId?: string | null;
  sourceType: PipelineDataSourceType;
  sourceConfig?: SourceConfig | null;
  sourceSchema?: string | null;
  sourceTable?: string | null;
  sourceQuery?: string | null;
  name?: string | null;
  isActive: boolean;
  discoveredColumns?: ColumnInfo[] | null;
  primaryKeys?: string[] | null;
  estimatedRowCount?: number | null;
  lastDiscoveredAt?: string | null;
  validationResult?: ValidationResult | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSourceSchemaDto {
  sourceType: PipelineDataSourceType;
  dataSourceId?: string;
  sourceConfig?: SourceConfig;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  name?: string;
}

export interface UpdateSourceSchemaDto {
  name?: string;
  sourceSchema?: string;
  sourceTable?: string;
  sourceQuery?: string;
  sourceConfig?: SourceConfig;
  isActive?: boolean;
  discoveredColumns?: Array<{ name: string; type?: string; nullable?: boolean }>;
  primaryKeys?: string[];
  estimatedRowCount?: number;
}

// ============================================================================
// DESTINATION SCHEMA
// ============================================================================

export interface PipelineDestinationSchema {
  id: string;
  organizationId: string;
  dataSourceId: string;
  destinationSchema: string;
  destinationTable: string;
  destinationTableExists: boolean;
  transformType?: string | null;
  transformScript?: string | null;
  dbtModel?: string | null;
  customSql?: string | null;
  writeMode: WriteMode;
  upsertKey?: string[] | null;
  name?: string | null;
  isActive: boolean;
  validationResult?: SchemaValidationResult | null;
  lastValidatedAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateDestinationSchemaDto {
  dataSourceId: string;
  destinationSchema?: string;
  destinationTable: string;
  destinationTableExists?: boolean;
  transformType?: string; // 'script' or 'dbt'
  dbtModel?: string; // only when transformType is dbt
  customSql?: string; // only when transformType is dbt
  transformScript?: string; // only when transformType is script
  writeMode?: WriteMode;
  upsertKey?: string[];
  name?: string;
}

export interface UpdateDestinationSchemaDto {
  name?: string;
  destinationSchema?: string;
  destinationTable?: string;
  transformType?: string;
  transformScript?: string;
  dbtModel?: string;
  customSql?: string;
  writeMode?: WriteMode;
  upsertKey?: string[];
  isActive?: boolean;
}

// ============================================================================
// PIPELINE
// ============================================================================

export interface Pipeline {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string | null;
  sourceSchemaId: string;
  destinationSchemaId: string;
  sourceSchema?: PipelineSourceSchema;
  destinationSchema?: PipelineDestinationSchema;
  transformations?: Transformation[] | null;
  syncMode: SyncMode;
  incrementalColumn?: string | null;
  lastSyncValue?: string | null;
  syncFrequency: SyncFrequency;
  status: PipelineStatus;
  migrationState?: string | null;
  nextSyncAt?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: "success" | "failed" | null;
  lastError?: string | null;
  totalRowsProcessed?: number | null;
  totalRunsSuccessful?: number | null;
  totalRunsFailed?: number | null;
  // Scheduling fields
  scheduleType?: ScheduleType | null;
  scheduleValue?: string | null;
  scheduleTimezone?: string | null;
  lastScheduledRunAt?: string | null;
  nextScheduledRunAt?: string | null;
  checkpoint?: Record<string, unknown> | null;
  // Singer ETL fields
  singerState?: Record<string, unknown> | null;
  fullRefreshCompletedAt?: string | null;
  replicationSlotName?: string | null;
  emitMethod?: string | null;
  transformType?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Pipeline Builder (MANTrixFlow)
  pipelineGraph?: PipelineGraph | null;
  builderViewMode?: "card" | "canvas" | null;
}

// ============================================================================
// PIPELINE GRAPH (Builder)
// ============================================================================

export interface PipelineGraphNodeData {
  connection_id?: string;
  connector_type?: string;
  selected_streams?: string[];
  stream_configs?: Record<string, unknown>;
  replication_method?: string;
  transform_type?: string;
  transform_script?: string | null;
  on_transform_error?: string;
  dest_schema?: string;
  dest_table?: string;
  emit_method?: string;
  // Filter node
  filter_expression?: string;
  filter_type?: "python" | "sql";
  sql_where?: string;
  rows_dropped_last_run?: number;
  // Join node
  join_type?: "inner" | "left" | "right" | "full";
  left_key?: string;
  right_key?: string;
  left_label?: string;
  right_label?: string;
  [key: string]: unknown;
}

export type PipelineGraphNodeType =
  | "source"
  | "transform"
  | "filter"
  | "join"
  | "destination";

export interface PipelineGraphNode {
  id: string;
  type: PipelineGraphNodeType;
  branch_id?: string;
  data: PipelineGraphNodeData;
  position?: { x: number; y: number };
}

export interface PipelineGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PipelineGraphBranch {
  id: string;
  label: string;
  transform_node_id: string;
  destination_node_id: string;
  colour_index?: number;
}

export interface PipelineGraph {
  nodes: PipelineGraphNode[];
  edges: PipelineGraphEdge[];
  branches: PipelineGraphBranch[];
}

export interface PipelineWithSchemas {
  pipeline: Pipeline;
  sourceSchema: PipelineSourceSchema;
  destinationSchema: PipelineDestinationSchema;
}

// ============================================================================
// PIPELINE RUN
// ============================================================================

export interface PipelineRun {
  id: string;
  pipelineId: string;
  organizationId: string;
  triggeredBy: string;
  triggerType: TriggerType;
  status: RunStatus;
  jobState: JobState;
  rowsRead?: number | null;
  rowsWritten?: number | null;
  rowsSkipped?: number | null;
  rowsFailed?: number | null;
  durationSeconds?: number | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  // Singer ETL fields
  rowsDeleted?: number | null;
  lsnStart?: number | null;
  lsnEnd?: number | null;
  collectionMethodUsed?: string | null;
  emitMethodUsed?: string | null;
  sourceTool?: string | null;
  destTool?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// RESPONSES & RESULTS
// ============================================================================

export interface PipelineStats {
  totalRowsProcessed: number;
  totalRunsSuccessful: number;
  totalRunsFailed: number;
  lastSuccessfulRun?: string | null;
  averageDuration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  missingColumns?: string[];
  typeMismatches?: Array<{
    column: string;
    expected: string;
    actual: string;
  }>;
}

export interface DryRunResult {
  wouldWrite: number;
  sourceRowCount?: number;
  sampleRows: unknown[];
  transformedSample?: unknown[];
  errors: string[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  defaultValue?: string | null;
  maxLength?: number;
}

export interface DiscoveredSchema {
  columns: ColumnInfo[];
  primaryKeys: string[];
  estimatedRowCount?: number;
}

export interface DiscoverSchemaResult {
  schema: PipelineSourceSchema;
  discovered: DiscoveredSchema;
}

export interface TableExistsResult {
  exists: boolean;
}

export interface CreateTableResult {
  created: boolean;
  tableName: string;
}

export interface PreviewDataResult {
  rows: unknown[];
  columns: ColumnInfo[];
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
