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
 * Hook to create a data source
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
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.list(organizationId),
        });
      }
    },
  });
}

/**
 * Hook to update a data source
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
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.list(organizationId),
        });
      }
    },
  });
}

/**
 * Hook to delete a data source
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
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.list(organizationId),
        });
      }
    },
  });
}
