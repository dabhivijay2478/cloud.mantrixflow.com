/**
 * Data Sources TanStack Query Hooks
 * Reusable hooks for PostgreSQL data source API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataSourcesService } from "../services/data-sources.service";
import type {
  CreateConnectionDto,
  CreateSyncJobDto,
  ExecuteQueryDto,
  TestConnectionDto,
  UpdateConnectionDto,
  UpdateSyncJobScheduleDto,
} from "../types/data-sources";

// Query Keys
export const dataSourcesKeys = {
  all: ["data-sources"] as const,
  connections: {
    all: ["data-sources", "connections"] as const,
    lists: () => [...dataSourcesKeys.connections.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...dataSourcesKeys.connections.lists(), filters] as const,
    details: () => [...dataSourcesKeys.connections.all, "detail"] as const,
    detail: (id: string) =>
      [...dataSourcesKeys.connections.details(), id] as const,
  },
  databases: (connectionId: string) =>
    [...dataSourcesKeys.all, "databases", connectionId] as const,
  schemas: (connectionId: string) =>
    [...dataSourcesKeys.all, "schemas", connectionId] as const,
  tables: (connectionId: string, schema?: string) =>
    [...dataSourcesKeys.all, "tables", connectionId, schema] as const,
  tableSchema: (connectionId: string, table: string, schema?: string) =>
    [
      ...dataSourcesKeys.all,
      "table-schema",
      connectionId,
      table,
      schema,
    ] as const,
  syncJobs: (connectionId: string) =>
    [...dataSourcesKeys.all, "sync-jobs", connectionId] as const,
  syncJob: (connectionId: string, jobId: string) =>
    [...dataSourcesKeys.all, "sync-jobs", connectionId, jobId] as const,
  health: (connectionId: string) =>
    [...dataSourcesKeys.all, "health", connectionId] as const,
  queryLogs: (connectionId: string, limit?: number, offset?: number) =>
    [
      ...dataSourcesKeys.all,
      "query-logs",
      connectionId,
      limit,
      offset,
    ] as const,
  metrics: (connectionId: string) =>
    [...dataSourcesKeys.all, "metrics", connectionId] as const,
};

// Connection Management Hooks
export function useTestConnection() {
  return useMutation({
    mutationFn: (data: TestConnectionDto) =>
      DataSourcesService.testConnection(data),
  });
}

export function useCreateConnection(orgId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConnectionDto) =>
      DataSourcesService.createConnection(data, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.connections.lists(),
      });
    },
  });
}

export function useConnections(orgId?: string) {
  return useQuery({
    queryKey: dataSourcesKeys.connections.lists({ orgId }),
    queryFn: () => DataSourcesService.listConnections(orgId),
    enabled: !!orgId, // Only fetch if orgId is provided
  });
}

export function useConnection(id: string | undefined) {
  return useQuery({
    queryKey: dataSourcesKeys.connections.detail(id!),
    queryFn: () => DataSourcesService.getConnection(id!),
    enabled: !!id,
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConnectionDto }) =>
      DataSourcesService.updateConnection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.connections.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.connections.lists(),
      });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DataSourcesService.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.connections.lists(),
      });
    },
  });
}

// Schema Discovery Hooks
export function useDatabases(connectionId: string | undefined, orgId?: string) {
  return useQuery({
    queryKey: dataSourcesKeys.databases(connectionId!),
    queryFn: () => DataSourcesService.listDatabases(connectionId!, orgId),
    enabled: !!connectionId && !!orgId,
  });
}

export function useSchemas(connectionId: string | undefined, orgId?: string) {
  return useQuery({
    queryKey: dataSourcesKeys.schemas(connectionId!),
    queryFn: () => DataSourcesService.listSchemas(connectionId!, orgId),
    enabled: !!connectionId && !!orgId,
  });
}

export function useSchemasWithTables(
  connectionId: string | undefined,
  orgId?: string,
) {
  return useQuery({
    queryKey: [...dataSourcesKeys.schemas(connectionId!), "with-tables"],
    queryFn: () =>
      DataSourcesService.listSchemasWithTables(connectionId!, orgId),
    enabled: !!connectionId && !!orgId,
  });
}

export function useTables(
  connectionId: string | undefined,
  schema?: string,
  orgId?: string,
) {
  return useQuery({
    queryKey: dataSourcesKeys.tables(connectionId!, schema),
    queryFn: () => DataSourcesService.listTables(connectionId!, schema, orgId),
    enabled: !!connectionId && !!orgId,
  });
}

export function useTableSchema(
  connectionId: string | undefined,
  table: string | undefined,
  schema?: string,
  orgId?: string,
) {
  return useQuery({
    queryKey: dataSourcesKeys.tableSchema(connectionId!, table!, schema),
    queryFn: () =>
      DataSourcesService.getTableSchema(connectionId!, table!, schema, orgId),
    enabled: !!connectionId && !!table && !!orgId,
  });
}

export function useRefreshSchema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      DataSourcesService.refreshSchema(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.schemas(connectionId),
      });
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.tables(connectionId),
      });
    },
  });
}

// Query Execution Hooks
export function useExecuteQuery(orgId?: string) {
  return useMutation({
    mutationFn: ({
      connectionId,
      data,
    }: {
      connectionId: string;
      data: ExecuteQueryDto;
    }) => DataSourcesService.executeQuery(connectionId, data, orgId),
  });
}

export function useExplainQuery() {
  return useMutation({
    mutationFn: ({
      connectionId,
      data,
    }: {
      connectionId: string;
      data: ExecuteQueryDto;
    }) => DataSourcesService.explainQuery(connectionId, data),
  });
}

// Data Synchronization Hooks
export function useCreateSyncJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectionId,
      data,
    }: {
      connectionId: string;
      data: CreateSyncJobDto;
    }) => DataSourcesService.createSyncJob(connectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.syncJobs(variables.connectionId),
      });
    },
  });
}

export function useSyncJobs(connectionId: string | undefined) {
  return useQuery({
    queryKey: dataSourcesKeys.syncJobs(connectionId!),
    queryFn: () => DataSourcesService.listSyncJobs(connectionId!),
    enabled: !!connectionId,
  });
}

export function useSyncJob(
  connectionId: string | undefined,
  jobId: string | undefined,
) {
  return useQuery({
    queryKey: dataSourcesKeys.syncJob(connectionId!, jobId!),
    queryFn: () => DataSourcesService.getSyncJob(connectionId!, jobId!),
    enabled: !!connectionId && !!jobId,
  });
}

export function useCancelSyncJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectionId,
      jobId,
    }: {
      connectionId: string;
      jobId: string;
    }) => DataSourcesService.cancelSyncJob(connectionId, jobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.syncJob(
          variables.connectionId,
          variables.jobId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.syncJobs(variables.connectionId),
      });
    },
  });
}

export function useUpdateSyncJobSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectionId,
      jobId,
      data,
    }: {
      connectionId: string;
      jobId: string;
      data: UpdateSyncJobScheduleDto;
    }) => DataSourcesService.updateSyncJobSchedule(connectionId, jobId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.syncJob(
          variables.connectionId,
          variables.jobId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: dataSourcesKeys.syncJobs(variables.connectionId),
      });
    },
  });
}

// Monitoring Hooks
export function useConnectionHealth(connectionId: string | undefined) {
  return useQuery({
    queryKey: dataSourcesKeys.health(connectionId!),
    queryFn: () => DataSourcesService.getConnectionHealth(connectionId!),
    enabled: !!connectionId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useQueryLogs(
  connectionId: string | undefined,
  limit?: number,
  offset?: number,
) {
  return useQuery({
    queryKey: dataSourcesKeys.queryLogs(connectionId!, limit, offset),
    queryFn: () =>
      DataSourcesService.getQueryLogs(connectionId!, limit, offset),
    enabled: !!connectionId,
  });
}

export function useConnectionMetrics(connectionId: string | undefined) {
  return useQuery({
    queryKey: dataSourcesKeys.metrics(connectionId!),
    queryFn: () => DataSourcesService.getConnectionMetrics(connectionId!),
    enabled: !!connectionId,
    refetchInterval: 60000, // Refetch every minute
  });
}
