/**
 * Python ETL Service Client
 * Direct client for calling Python FastAPI ETL microservice
 * Used for ETL operations: discover schema, collect, transform, emit
 * Also handles data source and connection CRUD operations (create, update, delete)
 */

import type { ColumnInfo } from "../types/data-pipelines";

const PYTHON_SERVICE_URL =
  process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || "http://localhost:8001";

export interface DiscoverSchemaRequest {
  source_type: string;
  connection_config: Record<string, unknown>;
  source_config?: Record<string, unknown>;
  table_name?: string;
  schema_name?: string;
  query?: string;
}

export interface DiscoverSchemaResponse {
  columns: ColumnInfo[];
  primary_keys: string[];
  estimated_row_count?: number;
}

export interface CollectRequest {
  source_type: string;
  connection_config: Record<string, unknown>;
  source_config?: Record<string, unknown>;
  table_name?: string;
  schema_name?: string;
  query?: string;
  sync_mode?: "full" | "incremental";
  checkpoint?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface CollectResponse {
  rows: Record<string, unknown>[];
  total_rows?: number;
  next_cursor?: string;
  has_more?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TransformRequest {
  rows: Record<string, unknown>[];
  transform_script: string;
}

export interface TransformResponse {
  transformed_rows: Record<string, unknown>[];
  errors: Array<{ message: string; row?: number; error?: string }>;
}

export interface EmitRequest {
  destination_type: string;
  connection_config: Record<string, unknown>;
  destination_config?: Record<string, unknown>;
  table_name: string;
  schema_name?: string;
  rows: Record<string, unknown>[];
  write_mode?: "append" | "upsert" | "replace";
  upsert_key?: string[];
}

export interface EmitResponse {
  rows_written: number;
  rows_skipped: number;
  rows_failed: number;
  errors: Array<{ message: string; row?: number; error?: string }>;
}

export class PythonETLService {
  /**
   * Get auth token from Supabase session
   * Made public so it can be used by other services
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        console.warn(
          "getAuthToken called on server-side - token should be passed explicitly",
        );
        return null;
      }

      // Use the existing Supabase client from the app
      // This ensures we use the same client instance that manages the session
      const { supabase } = await import("@/lib/supabase/client");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to get session:", error);
        return null;
      }

      if (!session?.access_token) {
        console.warn("No active session - user may not be logged in");
        return null;
      }

      return session.access_token;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Make authenticated request to Python service
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await PythonETLService.getAuthToken();

    if (!token) {
      console.error("No auth token available - user may not be logged in");
      throw new Error("Authentication required. Please log in.");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${PYTHON_SERVICE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: response.statusText }));
      throw new Error(
        error.detail || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Discover schema from source
   */
  static async discoverSchema(
    sourceType: string,
    request: DiscoverSchemaRequest,
  ): Promise<DiscoverSchemaResponse> {
    return PythonETLService.request<DiscoverSchemaResponse>(
      `/discover-schema/${sourceType}`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  /**
   * Collect data from source
   */
  static async collect(
    sourceType: string,
    request: CollectRequest,
  ): Promise<CollectResponse> {
    return PythonETLService.request<CollectResponse>(`/collect/${sourceType}`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Transform data
   */
  static async transform(
    request: TransformRequest,
  ): Promise<TransformResponse> {
    return PythonETLService.request<TransformResponse>("/transform", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Emit data to destination
   */
  static async emit(
    destinationType: string,
    request: EmitRequest,
  ): Promise<EmitResponse> {
    return PythonETLService.request<EmitResponse>(`/emit/${destinationType}`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Delta check for changes
   */
  static async deltaCheck(
    sourceType: string,
    connectionConfig: Record<string, unknown>,
    sourceConfig: Record<string, unknown>,
    tableName?: string,
    schemaName?: string,
    checkpoint?: Record<string, unknown>,
  ): Promise<{ has_changes: boolean; checkpoint?: Record<string, unknown> }> {
    return PythonETLService.request<{
      has_changes: boolean;
      checkpoint?: Record<string, unknown>;
    }>(`/delta-check/${sourceType}`, {
      method: "POST",
      body: JSON.stringify({
        connection_config: connectionConfig,
        source_config: sourceConfig,
        table_name: tableName,
        schema_name: schemaName,
        checkpoint,
      }),
    });
  }

  /**
   * Create a data source
   * Calls Python API to create a new data source
   */
  static async createDataSource(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      source_type: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<{
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    source_type: string;
    is_active: boolean;
    metadata?: Record<string, unknown>;
    created_by: string;
    created_at: string;
    updated_at: string;
  }> {
    return PythonETLService.request<{
      id: string;
      organization_id: string;
      name: string;
      description?: string;
      source_type: string;
      is_active: boolean;
      metadata?: Record<string, unknown>;
      created_by: string;
      created_at: string;
      updated_at: string;
    }>("/data-sources", {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        name: data.name,
        description: data.description,
        source_type: data.source_type,
        metadata: data.metadata,
      }),
    });
  }

  /**
   * Delete a data source
   * Calls Python API which validates and calls NestJS for database deletion
   */
  static async deleteDataSource(
    organizationId: string,
    dataSourceId: string,
  ): Promise<{ success: boolean; deleted_id: string }> {
    return PythonETLService.request<{ success: boolean; deleted_id: string }>(
      `/data-sources/${dataSourceId}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          organization_id: organizationId,
          data_source_id: dataSourceId,
        }),
      },
    );
  }

  /**
   * Create or update a connection
   * Calls Python API to create/update connection configuration
   */
  static async createOrUpdateConnection(
    organizationId: string,
    dataSourceId: string,
    data: {
      connection_type: string;
      config: Record<string, unknown>;
    },
  ): Promise<{
    id: string;
    data_source_id: string;
    connection_type: string;
    config: Record<string, unknown>;
    status: string;
    created_at: string;
    updated_at: string;
  }> {
    return PythonETLService.request<{
      id: string;
      data_source_id: string;
      connection_type: string;
      config: Record<string, unknown>;
      status: string;
      created_at: string;
      updated_at: string;
    }>("/connections", {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        data_source_id: dataSourceId,
        connection_type: data.connection_type,
        config: data.config,
      }),
    });
  }

  /**
   * Delete a connection
   * Calls Python API which validates and calls NestJS for database deletion
   */
  static async deleteConnection(
    organizationId: string,
    connectionId: string,
    dataSourceId?: string,
  ): Promise<{ success: boolean; deleted_id: string }> {
    return PythonETLService.request<{ success: boolean; deleted_id: string }>(
      `/connections/${connectionId}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          organization_id: organizationId,
          connection_id: connectionId,
          data_source_id: dataSourceId || connectionId, // Use connectionId as fallback
        }),
      },
    );
  }

  /**
   * Test a data source connection
   * Calls Python API to test connection configuration
   */
  static async testConnection(connectionData: {
    type: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    connection_string?: string;
    connection_string_mongo?: string;
    ssl?: { enabled?: boolean; [key: string]: unknown };
    auth_source?: string;
    replica_set?: string;
    tls?: boolean;
    database_type?: string;
    [key: string]: unknown;
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    version?: string;
    response_time_ms?: number;
    details?: Record<string, unknown>;
  }> {
    // Map connection_string to connection_string_mongo for MongoDB
    const requestData: Record<string, unknown> = { ...connectionData };
    if (connectionData.type === "mongodb" && connectionData.connection_string) {
      requestData.connection_string_mongo = connectionData.connection_string;
      delete requestData.connection_string;
    }

    return PythonETLService.request<{
      success: boolean;
      message?: string;
      error?: string;
      version?: string;
      response_time_ms?: number;
      details?: Record<string, unknown>;
    }>("/test-connection", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  }

  /**
   * Get connection details for a data source
   * Calls Python API to fetch from Supabase
   */
  static async getConnection(
    organizationId: string,
    dataSourceId: string,
    includeSensitive: boolean = false,
  ): Promise<{
    id: string;
    data_source_id: string;
    connection_type: string;
    config: Record<string, unknown>;
    status: string;
    last_connected_at?: string;
    last_error?: string;
    created_at: string;
    updated_at: string;
  } | null> {
    const params = includeSensitive ? "?includeSensitive=true" : "";
    return PythonETLService.request<{
      id: string;
      data_source_id: string;
      connection_type: string;
      config: Record<string, unknown>;
      status: string;
      last_connected_at?: string;
      last_error?: string;
      created_at: string;
      updated_at: string;
    } | null>(
      `/organizations/${organizationId}/data-sources/${dataSourceId}/connection${params}`,
      {
        method: "GET",
      },
    );
  }

  /**
   * List all schemas and tables for a data source
   * Calls Python API to discover schemas using tap-postgres
   */
  static async listSchemasWithTables(
    organizationId: string,
    dataSourceId: string,
  ): Promise<{
    schemas: Array<{
      name: string;
      tables: Array<{
        name: string;
        schema: string;
        type: "table" | "view" | "materialized_view";
        rowCount?: number;
        columns?: Array<{
          name: string;
          type: string;
          nullable: boolean;
        }>;
        primaryKeys?: string[];
      }>;
    }>;
    type: string;
  }> {
    return PythonETLService.request<{
      schemas: Array<{
        name: string;
        tables: Array<{
          name: string;
          schema: string;
          type: "table" | "view" | "materialized_view";
          rowCount?: number;
          columns?: Array<{
            name: string;
            type: string;
            nullable: boolean;
          }>;
          primaryKeys?: string[];
        }>;
      }>;
      type: string;
    }>(
      `/organizations/${organizationId}/data-sources/${dataSourceId}/schemas`,
      {
        method: "GET",
      },
    );
  }

  /**
   * Create a pipeline with source and destination schemas
   * Python API handles the complete pipeline creation flow
   */
  static async createPipeline(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      source_schema: {
        source_type: string;
        data_source_id: string;
        source_schema?: string;
        source_table: string;
        source_query?: string;
        name?: string;
        is_active?: boolean;
      };
      destination_schema: {
        data_source_id: string;
        destination_schema?: string;
        destination_table: string;
        transform_script: string;
        write_mode?: "append" | "upsert" | "replace";
        upsert_key?: string[];
        name?: string;
        is_active?: boolean;
      };
      sync_mode?: "full" | "incremental" | "cdc";
      sync_frequency?: "manual" | "minutes" | "hourly" | "daily" | "weekly";
      incremental_column?: string;
      schedule_type?:
        | "none"
        | "minutes"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "custom_cron";
      schedule_value?: string;
      schedule_timezone?: string;
      transformations?: Record<string, unknown>[];
    },
  ): Promise<{
    id: string;
    organizationId: string;
    createdBy: string;
    name: string;
    description?: string;
    sourceSchemaId: string;
    destinationSchemaId: string;
    transformations?: Record<string, unknown>[];
    syncMode: string;
    incrementalColumn?: string;
    syncFrequency: string;
    scheduleType: string;
    scheduleValue?: string;
    scheduleTimezone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
  }> {
    return PythonETLService.request(
      `/organizations/${organizationId}/pipelines`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  /**
   * Update a pipeline
   * Python API handles pipeline updates
   */
  static async updatePipeline(
    organizationId: string,
    pipelineId: string,
    data: {
      name?: string;
      description?: string;
      sync_mode?: "full" | "incremental" | "cdc";
      sync_frequency?: "manual" | "minutes" | "hourly" | "daily" | "weekly";
      incremental_column?: string;
      schedule_type?:
        | "none"
        | "minutes"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "custom_cron";
      schedule_value?: string;
      schedule_timezone?: string;
      transformations?: Record<string, unknown>[];
    },
  ): Promise<{
    id: string;
    organizationId: string;
    createdBy: string;
    name: string;
    description?: string;
    sourceSchemaId: string;
    destinationSchemaId: string;
    transformations?: Record<string, unknown>[];
    syncMode: string;
    incrementalColumn?: string;
    syncFrequency: string;
    scheduleType: string;
    scheduleValue?: string;
    scheduleTimezone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
  }> {
    return PythonETLService.request(
      `/organizations/${organizationId}/pipelines/${pipelineId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  }

  /**
   * Run a pipeline directly via Python API
   * This bypasses NestJS proxy to avoid timeout issues
   */
  static async runPipeline(
    organizationId: string,
    pipelineId: string,
    options?: {
      syncMode?: "full" | "incremental";
      limit?: number;
    },
  ): Promise<{
    success: boolean;
    runId: string;
    pipelineId: string;
    status: string;
    rowsRead: number;
    rowsWritten: number;
    rowsSkipped: number;
    rowsFailed: number;
    errors: Array<{ message: string; row?: number; error?: string }>;
  }> {
    return PythonETLService.request(
      `/organizations/${organizationId}/pipelines/${pipelineId}/run`,
      {
        method: "POST",
        body: JSON.stringify({
          sync_mode: options?.syncMode || "full",
          limit: options?.limit,
        }),
      },
    );
  }

  /**
   * Pause a running pipeline
   */
  static async pausePipeline(
    organizationId: string,
    pipelineId: string,
  ): Promise<{
    success: boolean;
    pipelineId: string;
    status: string;
  }> {
    return PythonETLService.request(
      `/organizations/${organizationId}/pipelines/${pipelineId}/pause`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  }
}
