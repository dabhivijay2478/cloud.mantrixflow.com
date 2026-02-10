/**
 * Python ETL Service Client
 * Direct client for calling Python FastAPI ETL microservice
 * Used ONLY for ETL operations: discover schema, collect, transform, emit, delta-check, test-connection
 *
 * CRUD operations (data sources, connections, pipelines) go through the NestJS API
 * via ApiClient / DataSourcesService / DataPipelinesService.
 */

import type { ColumnInfo } from "../types/data-pipelines";

const PYTHON_SERVICE_URL = process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL;

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
  schemas?: Array<{
    name: string;
    tables: Array<{
      name: string;
      schema: string;
      type: "table" | "view" | "materialized_view";
      rowCount?: number;
    }>;
  }>;
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

  // =========================================================================
  // NOTE: Data source CRUD, connection CRUD, and pipeline CRUD operations
  // are handled by the NestJS API (via ApiClient / DataSourcesService /
  // DataPipelinesService). Do NOT add CRUD methods here — this service
  // is exclusively for ETL operations (discover, collect, transform, emit,
  // delta-check, test-connection) that run on the Python FastAPI service.
  // =========================================================================

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
}
