/**
 * Connection TanStack Query Hooks
 * Reusable hooks for data source connection management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectionService } from "../services/connection.service";
import type {
  CreateConnectionDto,
  UpdateConnectionDto,
} from "../types/data-sources";
import { dataSourceKeys } from "./use-data-source";

// Query Keys
export const connectionKeys = {
  all: ["connections"] as const,
  details: () => [...connectionKeys.all, "detail"] as const,
  detail: (organizationId: string, dataSourceId: string) =>
    [...connectionKeys.details(), organizationId, dataSourceId] as const,
};

/**
 * Hook to get connection for a data source
 */
export function useConnection(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
  includeSensitive: boolean = false,
) {
  return useQuery({
    queryKey: connectionKeys.detail(organizationId || "", dataSourceId || ""),
    queryFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return ConnectionService.getConnection(
        organizationId,
        dataSourceId,
        includeSensitive,
      );
    },
    enabled: !!organizationId && !!dataSourceId,
  });
}

/**
 * Hook to create or update connection
 */
export function useCreateOrUpdateConnection(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConnectionDto) => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return ConnectionService.createOrUpdateConnection(
        organizationId,
        dataSourceId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: connectionKeys.detail(organizationId, dataSourceId),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
      }
    },
  });
}

/**
 * Hook to update connection configuration
 */
export function useUpdateConnection(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConnectionDto) => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return ConnectionService.updateConnection(
        organizationId,
        dataSourceId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: connectionKeys.detail(organizationId, dataSourceId),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
      }
    },
  });
}

/**
 * Hook to test connection
 */
export function useTestConnection(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return ConnectionService.testConnection(organizationId, dataSourceId);
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: connectionKeys.detail(organizationId, dataSourceId),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
      }
    },
  });
}

/**
 * Hook to discover schema
 */
export function useDiscoverSchema(
  organizationId: string | undefined,
  dataSourceId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!organizationId || !dataSourceId) {
        throw new Error("Organization ID and Data Source ID are required");
      }
      return ConnectionService.discoverSchema(organizationId, dataSourceId);
    },
    onSuccess: () => {
      if (organizationId && dataSourceId) {
        queryClient.invalidateQueries({
          queryKey: connectionKeys.detail(organizationId, dataSourceId),
        });
        queryClient.invalidateQueries({
          queryKey: dataSourceKeys.detail(organizationId, dataSourceId),
        });
      }
    },
  });
}
