/**
 * Data Source TanStack Query Hooks
 * Reusable hooks for new data source API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataSourceService } from "../services/data-source.service";
import type {
  CreateDataSourceDto,
  UpdateDataSourceDto,
} from "../types/data-sources";
import { dataSourcesKeys } from "./use-data-sources";

// Query Keys
export const dataSourceKeys = {
  all: ["data-sources"] as const,
  lists: () => [...dataSourceKeys.all, "list"] as const,
  list: (organizationId: string, filters?: Record<string, unknown>) =>
    [...dataSourceKeys.lists(), organizationId, filters] as const,
  details: () => [...dataSourceKeys.all, "detail"] as const,
  detail: (organizationId: string, dataSourceId: string) =>
    [...dataSourceKeys.details(), organizationId, dataSourceId] as const,
  types: (organizationId: string) =>
    [...dataSourceKeys.all, "types", organizationId] as const,
  discover: (organizationId: string, dataSourceId: string) =>
    [...dataSourceKeys.all, "discover", organizationId, dataSourceId] as const,
  preview: (organizationId: string, dataSourceId: string, stream?: string) =>
    [...dataSourceKeys.all, "preview", organizationId, dataSourceId, stream] as const,
  cdcStatus: (organizationId: string, dataSourceId: string) =>
    [...dataSourceKeys.all, "cdc-status", organizationId, dataSourceId] as const,
};

/**
 * Hook to fetch all data sources for an organization
 */
export function useDataSources(
  organizationId: string | undefined,
  filters?: { sourceType?: string; isActive?: boolean },
) {
  return useQuery({
    queryKey: dataSourceKeys.list(organizationId || "", filters),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataSourceService.listDataSources(organizationId, filters);
    },
    enabled: !!organizationId,
  });
}

/**
 * Hook to fetch data sources with server-side pagination
 */
export function useDataSourcesPaginated(
  organizationId: string | undefined,
  pagination: { pageIndex: number; pageSize: number },
  filters?: { sourceType?: string; isActive?: boolean },
) {
  const { pageIndex, pageSize } = pagination;
  const offset = pageIndex * pageSize;

  return useQuery({
    queryKey: [
      ...dataSourceKeys.lists(),
      organizationId,
      { limit: pageSize, offset },
      filters,
    ],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataSourceService.listDataSourcesPaginated(
        organizationId,
        pageSize,
        offset,
        filters,
      );
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
  });
}

/**
 * Hook to fetch a single data source
 */
export function useDataSource(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  return useQuery({
    queryKey: dataSourceKeys.detail(organizationId || "", dataSourceId || ""),
    queryFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.getDataSource(organizationId, dataSourceId);
    },
    enabled: !!organizationId && !!dataSourceId,
  });
}

/**
 * Hook to get supported data source types
 */
export function useSupportedDataSourceTypes(
  organizationId: string | undefined,
) {
  return useQuery({
    queryKey: dataSourceKeys.types(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataSourceService.getSupportedTypes(organizationId);
    },
    enabled: !!organizationId,
  });
}

/**
 * Hook to discover streams from a data source (ETL/Airbyte)
 */
export function useDiscoverStreams(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: dataSourceKeys.discover(organizationId || "", dataSourceId || ""),
    queryFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.discoverStreams(organizationId, dataSourceId);
    },
    enabled: !!organizationId && !!dataSourceId && enabled,
  });
}

/**
 * Hook to preview data from a data source (ETL/Airbyte)
 */
export function usePreviewData(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
  options?: { source_stream?: string; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: dataSourceKeys.preview(
      organizationId || "",
      dataSourceId || "",
      options?.source_stream,
    ),
    queryFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.previewData(organizationId, dataSourceId, {
        source_stream: options?.source_stream,
        limit: options?.limit ?? 50,
      });
    },
    enabled:
      !!organizationId &&
      !!dataSourceId &&
      !!options?.source_stream &&
      enabled,
  });
}

/**
 * Hook to fetch CDC status for a data source
 */
export function useCdcStatus(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: dataSourceKeys.cdcStatus(organizationId || "", dataSourceId || ""),
    queryFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.getCdcStatus(organizationId, dataSourceId);
    },
    enabled: !!organizationId && !!dataSourceId && enabled,
  });
}

/**
 * Hook to verify a single CDC step
 */
export function useVerifyCdcStep(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      step,
      providerSelected,
    }: {
      step: string;
      providerSelected?: string;
    }) => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.verifyCdcStep(
        organizationId,
        dataSourceId,
        step,
        providerSelected,
      );
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.cdcStatus(organizationId, dataSourceId),
        });
      }
    },
  });
}

/**
 * Hook to verify all CDC steps
 */
export function useVerifyCdcAll(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerSelected?: string) => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.verifyCdcAll(
        organizationId,
        dataSourceId,
        providerSelected,
      );
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.cdcStatus(organizationId, dataSourceId),
        });
      }
    },
  });
}

/**
 * Hook to create a data source
 * Invalidates: data source lists (all pagination states), dashboard, activity logs
 */
export function useCreateDataSource(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDataSourceDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataSourceService.createDataSource(organizationId, data);
    },
    onSuccess: () => {
      if (organizationId) {
        // Invalidate all data source list queries (including paginated variants)
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.lists(),
        });
        // Also invalidate legacy connections list (used by data sources page)
        queryClient.invalidateQueries({
          queryKey: dataSourcesKeys.connections.lists(),
        });
        // Invalidate dashboard to reflect new data source count
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs to show the create action
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}

/**
 * Hook to update a data source
 * Invalidates: data source detail + lists, connections, dashboard, activity logs
 */
export function useUpdateDataSource(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDataSourceDto) => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return DataSourceService.updateDataSource(
        organizationId,
        dataSourceId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        // Invalidate specific detail cache
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
        // Invalidate all data source list queries (including paginated variants)
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.lists(),
        });
        // Invalidate connections list (used by connections page)
        queryClient.invalidateQueries({
          queryKey: dataSourcesKeys.connections.lists(),
        });
        // Invalidate connection queries for this data source
        queryClient.invalidateQueries({
          queryKey: ["connections", "detail", organizationId, dataSourceId],
        });
        // Invalidate dashboard to reflect updated status
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}

/**
 * Hook to delete a data source
 * Invalidates: data source lists (all pagination states), removes detail cache,
 * connections, pipelines, source/destination schemas, dashboard, activity logs
 */
export function useDeleteDataSource(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataSourceId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DataSourceService.deleteDataSource(organizationId, dataSourceId);
    },
    onSuccess: (_, deletedDataSourceId) => {
      if (organizationId) {
        // Remove the specific detail cache for the deleted data source
        queryClient.removeQueries({
          queryKey: dataSourceKeys.detail(organizationId, deletedDataSourceId),
        });
        // Invalidate all data source list queries (including all paginated variants)
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.lists(),
        });
        // Also invalidate legacy connections list (used by data sources page)
        queryClient.invalidateQueries({
          queryKey: dataSourcesKeys.connections.lists(),
        });
        // Remove legacy connection detail cache for the deleted data source
        queryClient.removeQueries({
          queryKey: dataSourcesKeys.connections.detail(deletedDataSourceId),
        });
        // Remove connection cache for the deleted data source (new API)
        queryClient.removeQueries({
          queryKey: [
            "connections",
            "detail",
            organizationId,
            deletedDataSourceId,
          ],
        });
        // Invalidate pipelines - they might reference this data source
        queryClient.invalidateQueries({
          queryKey: ["data-pipelines"],
        });
        // Invalidate source schemas - they might reference this data source
        queryClient.invalidateQueries({
          queryKey: ["source-schemas"],
        });
        // Invalidate destination schemas - they might reference this data source
        queryClient.invalidateQueries({
          queryKey: ["destination-schemas"],
        });
        // Invalidate dashboard to reflect updated counts
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs to show the delete action
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
        // Invalidate global search results as they may include the deleted source
        queryClient.invalidateQueries({
          queryKey: ["global-search"],
        });
      }
    },
  });
}
