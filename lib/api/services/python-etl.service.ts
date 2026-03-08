/**
 * Python ETL Service Client
 * Direct client for calling Python FastAPI ETL microservice (apps/new-etl)
 * Used for: discover schema, preview, test-connection.
 *
 * Pipeline runs use NestJS runSync → Python POST /sync/run-sync.
 * CRUD (data sources, connections, pipelines) goes through NestJS API.
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
   * Calls new-etl POST /discover-schema/{sourceType}
   */
  static async discoverSchema(
    sourceType: string,
    request: DiscoverSchemaRequest,
  ): Promise<DiscoverSchemaResponse> {
    const etlSourceType = PythonETLService.toSourceType(
      (request.source_type as string) || sourceType,
    );
    const response = await PythonETLService.request<{
      columns: ColumnInfo[];
      primary_keys: string[];
      estimated_row_count?: number;
      error?: string;
    }>(`/discover-schema/${etlSourceType}`, {
      method: "POST",
      body: JSON.stringify({
        source_type: etlSourceType,
        connection_config: request.connection_config || request.source_config || {},
        source_config: request.source_config || {},
        table_name: request.table_name,
        schema_name: request.schema_name,
        query: request.query,
      }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return {
      columns: response.columns || [],
      primary_keys: response.primary_keys || [],
      estimated_row_count: response.estimated_row_count,
    };
  }

  /**
   * Preview first N rows from source (dlt-based, no write)
   */
  static async preview(
    sourceType: string,
    request: {
      source_config: Record<string, unknown>;
      source_stream: string;
      limit?: number;
    },
  ): Promise<{ records: Record<string, unknown>[]; columns: string[]; total: number; stream: string }> {
    const etlType = PythonETLService.toSourceType(sourceType);
    return PythonETLService.request("/preview", {
      method: "POST",
      body: JSON.stringify({
        source_type: etlType,
        source_config: request.source_config,
        source_stream: request.source_stream,
        limit: request.limit ?? 50,
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
   * Map frontend type to new-etl source_type (Airbyte connector name)
   */
  private static toSourceType(type: string): string {
    const t = type?.toLowerCase() || "postgres";
    if (t === "postgres" || t === "postgresql") return "source-postgres";
    if (t === "mongodb") return "source-mongodb-v2";
    if (t === "mysql") return "source-mysql";
    if (t === "mssql" || t === "sqlserver") return "source-mssql";
    return `source-${t}`;
  }

  /**
   * Test a data source connection
   * Calls new-etl POST /test-connection with { source_type, source_config }
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
    const { type, ...rest } = connectionData;
    const sourceType = PythonETLService.toSourceType(type || "postgres");

    // MongoDB: connection_string OR individual (host, port, username, password) per Airbyte spec
    if (type?.toLowerCase() === "mongodb") {
      const connStr = rest.connection_string_mongo ?? rest.connection_string;
      const sourceConfig: Record<string, unknown> = {
        extra: {},
      };
      if (connStr) {
        sourceConfig.connection_string = connStr;
      } else {
        sourceConfig.host = rest.host ?? "";
        sourceConfig.port = rest.port ?? 27017;
        sourceConfig.database = rest.database ?? "admin";
        sourceConfig.username = rest.username ?? "";
        sourceConfig.password = rest.password ?? "";
      }
      const dbs = rest.databases;
      if (Array.isArray(dbs) && dbs.length) {
        sourceConfig.databases = dbs;
      } else if (typeof dbs === "string" && dbs.trim()) {
        sourceConfig.databases = dbs.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const response = await PythonETLService.request<{
        success: boolean;
        message?: string;
      }>("/test-connection", {
        method: "POST",
        body: JSON.stringify({ source_type: sourceType, source_config: sourceConfig }),
      });
      return {
        success: response.success,
        message: response.message,
        error: response.success ? undefined : response.message,
      };
    }

    // Snowflake: host = account identifier, extra.warehouse, extra.schema
    if (type?.toLowerCase() === "snowflake") {
      const sourceConfig: Record<string, unknown> = {
        host: rest.host ?? rest.account ?? "",
        database: rest.database ?? "",
        username: rest.username ?? "",
        password: rest.password ?? "",
        extra: {
          warehouse: rest.warehouse ?? (rest.extra as Record<string, unknown>)?.warehouse ?? "",
          schema: rest.schema ?? (rest.extra as Record<string, unknown>)?.schema ?? "PUBLIC",
        },
      };
      const response = await PythonETLService.request<{
        success: boolean;
        message?: string;
      }>("/test-connection", {
        method: "POST",
        body: JSON.stringify({ source_type: sourceType, source_config: sourceConfig }),
      });
      return {
        success: response.success,
        message: response.message,
        error: response.success ? undefined : response.message,
      };
    }

    // Build source_config for other connectors
    const sourceConfig: Record<string, unknown> = {
      ...rest,
      host: rest.host,
      port: rest.port,
      database: rest.database,
      username: rest.username,
      password: rest.password,
      connection_string: rest.connection_string,
      extra: {
        ...(rest.extra as Record<string, unknown>),
        ssl: rest.ssl,
        auth_source: rest.auth_source,
        replica_set: rest.replica_set,
        tls: rest.tls,
      },
    };

    const response = await PythonETLService.request<{
      success: boolean;
      message?: string;
    }>("/test-connection", {
      method: "POST",
      body: JSON.stringify({ source_type: sourceType, source_config: sourceConfig }),
    });

    return {
      success: response.success,
      message: response.message,
      error: response.success ? undefined : response.message,
    };
  }
}
