/**
 * Data Sources API Types
 * Type definitions for PostgreSQL data source endpoints
 */

// Connection Configuration Types
export interface SSLConfig {
  enabled: boolean;
  caCert?: string;
  rejectUnauthorized?: boolean;
}

export interface SSHTunnelConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

export interface TestConnectionDto {
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  ssl?: SSLConfig | null;
  sshTunnel?: SSHTunnelConfig | null;
  connectionTimeout?: number;
  queryTimeout?: number;
  poolSize?: number;
}

export interface TestConnectionResponse {
  success: boolean;
  error?: string;
  version?: string;
  responseTimeMs?: number;
}

export interface CreateConnectionDto {
  name: string;
  config: TestConnectionDto;
}

export interface UpdateConnectionDto {
  name?: string;
  config?: Partial<TestConnectionDto>;
}

export interface Connection {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  port: number;
  sslEnabled: boolean;
  sshTunnelEnabled: boolean;
  connectionPoolSize: number;
  queryTimeoutSeconds: number;
  lastConnectedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Schema Discovery Types
export interface Database {
  name: string;
  size?: string;
  owner?: string;
}

export interface Schema {
  name: string;
  owner?: string;
}

export interface Table {
  name: string;
  schema: string;
  type: 'table' | 'view' | 'materialized_view';
  rowCount?: number;
  size?: string;
}

export interface Column {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: string | null;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  maxLength?: number;
  numericPrecision?: number;
  numericScale?: number;
}

export interface TableSchema {
  table: string;
  schema: string;
  columns: Column[];
  primaryKeys: string[];
  indexes?: Array<{
    name: string;
    columns: string[];
    unique: boolean;
  }>;
  foreignKeys?: Array<{
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
  }>;
}

// Query Execution Types
export interface ExecuteQueryDto {
  query: string;
  params?: unknown[];
  timeout?: number;
  maxRows?: number;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  executionTimeMs: number;
}

export interface QueryExecutionResponse {
  success: boolean;
  result?: QueryResult;
  error?: string;
  executionTimeMs?: number;
}

export interface ExplainQueryResponse {
  plan: string;
  executionTimeMs: number;
}

// Sync Job Types
export interface CreateSyncJobDto {
  sourceTable: string;
  sourceSchema?: string;
  destinationTable: string;
  destinationSchema?: string;
  writeMode?: 'append' | 'upsert' | 'replace';
  columnMappings?: Array<{
    source: string;
    destination: string;
  }>;
  whereClause?: string;
  limit?: number;
}

export interface SyncJob {
  id: string;
  connectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  sourceTable: string;
  destinationTable: string;
  rowsProcessed?: number;
  rowsWritten?: number;
  error?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateSyncJobScheduleDto {
  frequency?: 'manual' | '15min' | '1hour' | '24hours';
  enabled?: boolean;
}

// Health & Monitoring Types
export interface ConnectionHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTimeMs: number;
  lastCheckedAt: Date | string;
  version?: string;
  activeConnections?: number;
  errors?: string[];
}

export interface QueryLog {
  id: string;
  query: string;
  executionTimeMs: number;
  rowCount?: number;
  success: boolean;
  error?: string;
  executedAt: Date | string;
}

export interface ConnectionMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTimeMs: number;
  totalRowsProcessed: number;
  activeConnections: number;
  poolSize: number;
  last24Hours?: {
    queries: number;
    averageExecutionTimeMs: number;
  };
}
