/**
 * Destination Schemas TanStack Query Hooks
 * Reusable hooks for pipeline destination schema API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "../error-handler";
import { DestinationSchemasService } from "../services/destination-schemas.service";
import type {
  CreateDestinationSchemaDto,
  UpdateDestinationSchemaDto,
} from "../types/data-pipelines";

// Query Keys
export const destinationSchemasKeys = {
  all: ["destination-schemas"] as const,
  lists: () => [...destinationSchemasKeys.all, "list"] as const,
  list: (organizationId: string) =>
    [...destinationSchemasKeys.lists(), organizationId] as const,
  details: () => [...destinationSchemasKeys.all, "detail"] as const,
  detail: (organizationId: string, schemaId: string) =>
    [...destinationSchemasKeys.details(), organizationId, schemaId] as const,
  validation: (organizationId: string, schemaId: string) =>
    [
      ...destinationSchemasKeys.all,
      "validation",
      organizationId,
      schemaId,
    ] as const,
  tableExists: (organizationId: string, schemaId: string) =>
    [
      ...destinationSchemasKeys.all,
      "table-exists",
      organizationId,
      schemaId,
    ] as const,
  preview: (organizationId: string, schemaId: string, limit?: number) =>
    [
      ...destinationSchemasKeys.all,
      "preview",
      organizationId,
      schemaId,
      limit,
    ] as const,
};

// ============================================================================
// CRUD Hooks
// ============================================================================

/**
 * List destination schemas for organization
 * Cached for 5 minutes - schema lists rarely change between navigations
 */
export function useDestinationSchemas(organizationId: string | undefined) {
  return useQuery({
    queryKey: destinationSchemasKeys.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.listDestinationSchemas(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * List destination schemas with server-side pagination
 */
export function useDestinationSchemasPaginated(
  organizationId: string | undefined,
  pagination: { pageIndex: number; pageSize: number },
) {
  const { pageIndex, pageSize } = pagination;
  const offset = pageIndex * pageSize;

  return useQuery({
    queryKey: [
      ...destinationSchemasKeys.lists(),
      organizationId,
      { limit: pageSize, offset },
    ],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.listDestinationSchemasPaginated(
        organizationId,
        pageSize,
        offset,
      );
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Get destination schema by ID
 * Schema structure is essentially static once created - cache indefinitely
 * and rely on explicit invalidation after mutations
 */
export function useDestinationSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  return useQuery({
    queryKey: destinationSchemasKeys.detail(
      organizationId || "",
      schemaId || "",
    ),
    queryFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.getDestinationSchema(
        organizationId,
        schemaId,
      );
    },
    enabled: !!organizationId && !!schemaId,
    staleTime: Infinity, // Schema structure never auto-refetches; invalidated on mutation
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes after last use
  });
}

/**
 * Create destination schema
 * Invalidates: all destination schema list queries (including paginated), activity logs
 */
export function useCreateDestinationSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDestinationSchemaDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.createDestinationSchema(
        organizationId,
        data,
      );
    },
    onError: (error) => handleApiError(error),
    onSuccess: () => {
      if (organizationId) {
        // Invalidate all destination schema list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.lists(),
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
 * Update destination schema
 * Invalidates: detail, all list queries (including paginated), pipeline queries, activity logs
 */
export function useUpdateDestinationSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDestinationSchemaDto) => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.updateDestinationSchema(
        organizationId,
        schemaId,
        data,
      );
    },
    onError: (error) => handleApiError(error),
    onSuccess: (updatedSchema) => {
      if (organizationId && schemaId) {
        // Update cache with new data
        queryClient.setQueryData(
          destinationSchemasKeys.detail(organizationId, schemaId),
          updatedSchema,
        );
        // Invalidate all list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.lists(),
        });
        // Invalidate pipelines that reference this schema
        queryClient.invalidateQueries({
          queryKey: ["data-pipelines"],
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
 * Delete destination schema
 * Invalidates: removes detail/validation/tableExists/preview caches,
 * all list queries (including paginated), pipelines, dashboard, activity logs, global search
 */
export function useDeleteDestinationSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schemaId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.deleteDestinationSchema(
        organizationId,
        schemaId,
      );
    },
    onError: (error) => handleApiError(error),
    onSuccess: (_, deletedSchemaId) => {
      if (organizationId) {
        // Remove all caches specific to the deleted schema
        queryClient.removeQueries({
          queryKey: destinationSchemasKeys.detail(
            organizationId,
            deletedSchemaId,
          ),
        });
        queryClient.removeQueries({
          queryKey: destinationSchemasKeys.validation(
            organizationId,
            deletedSchemaId,
          ),
        });
        queryClient.removeQueries({
          queryKey: destinationSchemasKeys.tableExists(
            organizationId,
            deletedSchemaId,
          ),
        });
        queryClient.removeQueries({
          queryKey: destinationSchemasKeys.preview(
            organizationId,
            deletedSchemaId,
          ),
        });
        // Invalidate all destination schema list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.lists(),
        });
        // Invalidate pipelines that may reference this schema
        queryClient.invalidateQueries({
          queryKey: ["data-pipelines"],
        });
        // Invalidate dashboard
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
        // Invalidate global search
        queryClient.invalidateQueries({
          queryKey: ["global-search"],
        });
      }
    },
  });
}

// ============================================================================
// Validation & Table Hooks
// ============================================================================

/**
 * Validate destination schema against actual database
 */
export function useValidateDestinationSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.validateDestinationSchema(
        organizationId,
        schemaId,
      );
    },
    onSuccess: (result) => {
      if (organizationId && schemaId) {
        // Cache validation result
        queryClient.setQueryData(
          destinationSchemasKeys.validation(organizationId, schemaId),
          result,
        );
        // Refresh schema to get updated validation result
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.detail(organizationId, schemaId),
        });
      }
    },
  });
}

/**
 * Validate configuration without querying database
 */
export function useValidateDestinationConfig(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.validateConfiguration(
        organizationId,
        schemaId,
      );
    },
  });
}

/**
 * Check if destination table exists
 */
export function useCheckTableExists(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  return useQuery({
    queryKey: destinationSchemasKeys.tableExists(
      organizationId || "",
      schemaId || "",
    ),
    queryFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.checkTableExists(
        organizationId,
        schemaId,
      );
    },
    enabled: !!organizationId && !!schemaId,
    staleTime: 60000, // 1 minute - table existence doesn't change frequently
  });
}

/**
 * Create destination table
 */
export function useCreateDestinationTable(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.createTable(organizationId, schemaId);
    },
    onSuccess: () => {
      if (organizationId && schemaId) {
        // Invalidate table exists check
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.tableExists(
            organizationId,
            schemaId,
          ),
        });
        // Refresh schema
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.detail(organizationId, schemaId),
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
 * Preview sample data from destination table (top N rows)
 * Cached for 5 minutes - destination data changes only after pipeline runs
 */
export function usePreviewDestinationData(
  organizationId: string | undefined,
  schemaId: string | undefined,
  limit?: number,
  enabled?: boolean,
) {
  return useQuery({
    queryKey: destinationSchemasKeys.preview(
      organizationId || "",
      schemaId || "",
      limit,
    ),
    queryFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return DestinationSchemasService.previewDestinationData(
        organizationId,
        schemaId,
        limit,
      );
    },
    enabled: (enabled ?? true) && !!organizationId && !!schemaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Destination table may not exist yet
  });
}
