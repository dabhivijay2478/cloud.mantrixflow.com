/**
 * Python ETL Service Client
 * Direct client for calling Python FastAPI ETL microservice
 * Used for ETL operations: discover schema, collect, transform, emit
 * Also handles data source and connection CRUD operations (create, update, delete)
 */

import type {
  ColumnMapping,
  ColumnInfo,
} from "../types/data-pipelines";

const PYTHON_SERVICE_URL = process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 'http://localhost:8001';

export interface DiscoverSchemaRequest {
  source_type: string;
  connection_config: Record<string, any>;
  source_config?: Record<string, any>;
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
  connection_config: Record<string, any>;
  source_config?: Record<string, any>;
  table_name?: string;
  schema_name?: string;
  query?: string;
  sync_mode?: 'full' | 'incremental';
  checkpoint?: Record<string, any>;
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface CollectResponse {
  rows: any[];
  total_rows?: number;
  next_cursor?: string;
  has_more?: boolean;
  metadata?: Record<string, any>;
}

export interface TransformRequest {
  rows: any[];
  column_mappings: ColumnMapping[];
  transformations?: any[];
}

export interface TransformResponse {
  transformed_rows: any[];
  errors: any[];
}

export interface EmitRequest {
  destination_type: string;
  connection_config: Record<string, any>;
  destination_config?: Record<string, any>;
  table_name: string;
  schema_name?: string;
  rows: any[];
  write_mode?: 'append' | 'upsert' | 'replace';
  upsert_key?: string[];
  column_mappings?: ColumnMapping[];
}

export interface EmitResponse {
  rows_written: number;
  rows_skipped: number;
  rows_failed: number;
  errors: any[];
}

export class PythonETLService {
  /**
   * Get auth token from Supabase session
   * Made public so it can be used by other services
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.warn('getAuthToken called on server-side - token should be passed explicitly');
        return null;
      }

      // Use the existing Supabase client from the app
      // This ensures we use the same client instance that manages the session
      const { supabase } = await import('@/lib/supabase/client');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Failed to get session:', error);
        return null;
      }
      
      if (!session?.access_token) {
        console.warn('No active session - user may not be logged in');
        return null;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
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
      console.error('No auth token available - user may not be logged in');
      throw new Error('Authentication required. Please log in.');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${PYTHON_SERVICE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
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
        method: 'POST',
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
    return PythonETLService.request<CollectResponse>(
      `/collect/${sourceType}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  }

  /**
   * Transform data
   */
  static async transform(request: TransformRequest): Promise<TransformResponse> {
    return PythonETLService.request<TransformResponse>(
      '/transform',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  }

  /**
   * Emit data to destination
   */
  static async emit(
    destinationType: string,
    request: EmitRequest,
  ): Promise<EmitResponse> {
    return PythonETLService.request<EmitResponse>(
      `/emit/${destinationType}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  }

  /**
   * Delta check for changes
   */
  static async deltaCheck(
    sourceType: string,
    connectionConfig: Record<string, any>,
    sourceConfig: Record<string, any>,
    tableName?: string,
    schemaName?: string,
    checkpoint?: Record<string, any>,
  ): Promise<{ has_changes: boolean; checkpoint?: Record<string, any> }> {
    return PythonETLService.request<{ has_changes: boolean; checkpoint?: Record<string, any> }>(
      `/delta-check/${sourceType}`,
      {
        method: 'POST',
        body: JSON.stringify({
          connection_config: connectionConfig,
          source_config: sourceConfig,
          table_name: tableName,
          schema_name: schemaName,
          checkpoint,
        }),
      },
    );
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
      metadata?: Record<string, any>;
    },
  ): Promise<{
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    source_type: string;
    is_active: boolean;
    metadata?: Record<string, any>;
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
      metadata?: Record<string, any>;
      created_by: string;
      created_at: string;
      updated_at: string;
    }>(
      '/data-sources',
      {
        method: 'POST',
        body: JSON.stringify({
          organization_id: organizationId,
          name: data.name,
          description: data.description,
          source_type: data.source_type,
          metadata: data.metadata,
        }),
      },
    );
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
        method: 'DELETE',
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
      config: Record<string, any>;
    },
  ): Promise<{
    id: string;
    data_source_id: string;
    connection_type: string;
    config: Record<string, any>;
    status: string;
    created_at: string;
    updated_at: string;
  }> {
    return PythonETLService.request<{
      id: string;
      data_source_id: string;
      connection_type: string;
      config: Record<string, any>;
      status: string;
      created_at: string;
      updated_at: string;
    }>(
      '/connections',
      {
        method: 'POST',
        body: JSON.stringify({
          organization_id: organizationId,
          data_source_id: dataSourceId,
          connection_type: data.connection_type,
          config: data.config,
        }),
      },
    );
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
        method: 'DELETE',
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
  static async testConnection(
    connectionData: {
      type: string;
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
      connection_string?: string;
      connection_string_mongo?: string;
      ssl?: any;
      auth_source?: string;
      replica_set?: string;
      tls?: boolean;
      database_type?: string;
      [key: string]: any;
    },
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    version?: string;
    response_time_ms?: number;
    details?: any;
  }> {
    // Map connection_string to connection_string_mongo for MongoDB
    const requestData: any = { ...connectionData };
    if (connectionData.type === 'mongodb' && connectionData.connection_string) {
      requestData.connection_string_mongo = connectionData.connection_string;
      delete requestData.connection_string;
    }
    
    return PythonETLService.request<{
      success: boolean;
      message?: string;
      error?: string;
      version?: string;
      response_time_ms?: number;
      details?: any;
    }>(
      '/test-connection',
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      },
    );
  }
}
