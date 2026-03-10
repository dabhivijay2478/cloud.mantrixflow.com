/**
 * Source Schemas TanStack Query Hooks
 * Reusable hooks for pipeline source schema API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "../error-handler";
import { SourceSchemasService } from "../services/source-schemas.service";
import type {
  CreateSourceSchemaDto,
  UpdateSourceSchemaDto,
} from "../types/data-pipelines";

// Query Keys
export const sourceSchemasKeys = {
  all: ["source-schemas"] as const,
  lists: () => [...sourceSchemasKeys.all, "list"] as const,
  list: (organizationId: string) =>
    [...sourceSchemasKeys.lists(), organizationId] as const,
  details: () => [...sourceSchemasKeys.all, "detail"] as const,
  detail: (organizationId: string, schemaId: string) =>
    [...sourceSchemasKeys.details(), organizationId, schemaId] as const,
  discovery: (organizationId: string, schemaId: string) =>
    [...sourceSchemasKeys.all, "discovery", organizationId, schemaId] as const,
  validation: (organizationId: string, schemaId: string) =>
    [...sourceSchemasKeys.all, "validation", organizationId, schemaId] as const,
  preview: (organizationId: string, schemaId: string, limit?: number) =>
    [
      ...sourceSchemasKeys.all,
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
 * List source schemas for organization
 * Cached for 5 minutes - schema lists rarely change between navigations
 */
export function useSourceSchemas(organizationId: string | undefined) {
  return useQuery({
    queryKey: sourceSchemasKeys.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.listSourceSchemas(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * List source schemas with server-side pagination
 */
export function useSourceSchemasPaginated(
  organizationId: string | undefined,
  pagination: { pageIndex: number; pageSize: number },
) {
  const { pageIndex, pageSize } = pagination;
  const offset = pageIndex * pageSize;

  return useQuery({
    queryKey: [
      ...sourceSchemasKeys.lists(),
      organizationId,
      { limit: pageSize, offset },
    ],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.listSourceSchemasPaginated(
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
 * Get source schema by ID
 * Schema structure is essentially static once created - cache indefinitely
 * and rely on explicit invalidation after mutations
 */
export function useSourceSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  return useQuery({
    queryKey: sourceSchemasKeys.detail(organizationId || "", schemaId || ""),
    queryFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return SourceSchemasService.getSourceSchema(organizationId, schemaId);
    },
    enabled: !!organizationId && !!schemaId,
    staleTime: Infinity, // Schema structure never auto-refetches; invalidated on mutation
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes after last use
  });
}

/**
 * Create source schema
 * Invalidates: all source schema list queries (including paginated), activity logs
 */
export function useCreateSourceSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSourceSchemaDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.createSourceSchema(organizationId, data);
    },
    onError: (error) => handleApiError(error),
    onSuccess: () => {
      if (organizationId) {
        // Invalidate all source schema list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.lists(),
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
 * Update source schema
 * Invalidates: detail, all list queries (including paginated), pipelines, activity logs
 */
export function useUpdateSourceSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSourceSchemaDto) => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return SourceSchemasService.updateSourceSchema(
        organizationId,
        schemaId,
        data,
      );
    },
    onSuccess: (updatedSchema) => {
      if (organizationId && schemaId) {
        // Update cache with new data
        queryClient.setQueryData(
          sourceSchemasKeys.detail(organizationId, schemaId),
          updatedSchema,
        );
        // Invalidate all list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.lists(),
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
 * Delete source schema
 * Invalidates: removes detail/discovery/validation/preview caches,
 * all list queries (including paginated), pipelines, dashboard, activity logs, global search
 */
export function useDeleteSourceSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schemaId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.deleteSourceSchema(organizationId, schemaId);
    },
    onSuccess: (_, deletedSchemaId) => {
      if (organizationId) {
        // Remove all caches specific to the deleted schema
        queryClient.removeQueries({
          queryKey: sourceSchemasKeys.detail(organizationId, deletedSchemaId),
        });
        queryClient.removeQueries({
          queryKey: sourceSchemasKeys.discovery(
            organizationId,
            deletedSchemaId,
          ),
        });
        queryClient.removeQueries({
          queryKey: sourceSchemasKeys.validation(
            organizationId,
            deletedSchemaId,
          ),
        });
        queryClient.removeQueries({
          queryKey: sourceSchemasKeys.preview(organizationId, deletedSchemaId),
        });
        // Invalidate all source schema list queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.lists(),
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
// Schema Discovery & Validation Hooks
// ============================================================================

/**
 * Discover schema from source (columns, primary keys, row count)
 * Persists discovered data to the backend and invalidates list queries
 */
export function useDiscoverSourceSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      const result = await SourceSchemasService.discoverSourceSchema(
        organizationId,
        schemaId,
      );
      // Persist discovered data to backend (sets lastDiscoveredAt)
      const updatePayload = {
        discoveredColumns: result.discovered.columns.map((c) => ({
          name: c.name,
          type: c.type,
          nullable: c.nullable,
        })),
        primaryKeys: result.discovered.primaryKeys,
        estimatedRowCount: result.discovered.estimatedRowCount,
      };
      const updatedSchema = await SourceSchemasService.updateSourceSchema(
        organizationId,
        schemaId,
        updatePayload,
      );
      return { ...result, schema: updatedSchema };
    },
    onSuccess: (result) => {
      if (organizationId && schemaId) {
        // Update schema cache with persisted data
        queryClient.setQueryData(
          sourceSchemasKeys.detail(organizationId, schemaId),
          result.schema,
        );
        // Cache discovery result
        queryClient.setQueryData(
          sourceSchemasKeys.discovery(organizationId, schemaId),
          result.discovered,
        );
        // Invalidate list queries so lastDiscoveredAt shows in table
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.lists(),
        });
      }
    },
  });
}

/**
 * Validate source schema configuration
 */
export function useValidateSourceSchema(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return SourceSchemasService.validateSourceSchema(
        organizationId,
        schemaId,
      );
    },
    onSuccess: (result) => {
      if (organizationId && schemaId) {
        // Cache validation result
        queryClient.setQueryData(
          sourceSchemasKeys.validation(organizationId, schemaId),
          result,
        );
      }
    },
  });
}

/**
 * Preview sample data from source (top N rows)
 * Cached for 5 minutes - source data changes infrequently between pipeline runs
 */
export function usePreviewSourceData(
  organizationId: string | undefined,
  schemaId: string | undefined,
  limit?: number,
  enabled?: boolean,
) {
  return useQuery({
    queryKey: sourceSchemasKeys.preview(
      organizationId || "",
      schemaId || "",
      limit,
    ),
    queryFn: () => {
      if (!organizationId || !schemaId) {
        throw new Error("Organization ID and Schema ID are required");
      }
      return SourceSchemasService.previewSourceData(
        organizationId,
        schemaId,
        limit,
      );
    },
    enabled: (enabled ?? true) && !!organizationId && !!schemaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

/**
 * Get cached discovery result
 */
export function useSourceSchemaDiscovery(
  organizationId: string | undefined,
  schemaId: string | undefined,
) {
  return useQuery({
    queryKey: sourceSchemasKeys.discovery(organizationId || "", schemaId || ""),
    queryFn: () => {
      // This is a cache-only query; use discoverSourceSchema mutation to populate
      return null;
    },
    enabled: false, // Only read from cache
  });
}
