/**
 * Destination Schemas TanStack Query Hooks
 * Reusable hooks for pipeline destination schema API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
};

// ============================================================================
// CRUD Hooks
// ============================================================================

/**
 * List destination schemas for organization
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
  });
}

/**
 * Get destination schema by ID
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
  });
}

/**
 * Create destination schema
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
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.list(organizationId),
        });
      }
    },
  });
}

/**
 * Update destination schema
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
    onSuccess: (updatedSchema) => {
      if (organizationId && schemaId) {
        // Update cache with new data
        queryClient.setQueryData(
          destinationSchemasKeys.detail(organizationId, schemaId),
          updatedSchema,
        );
        // Invalidate list to reflect changes
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.list(organizationId),
        });
      }
    },
  });
}

/**
 * Delete destination schema
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
    onSuccess: (_, deletedSchemaId) => {
      if (organizationId) {
        // Remove from cache
        queryClient.removeQueries({
          queryKey: destinationSchemasKeys.detail(
            organizationId,
            deletedSchemaId,
          ),
        });
        // Invalidate list
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.list(organizationId),
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
      }
    },
  });
}
