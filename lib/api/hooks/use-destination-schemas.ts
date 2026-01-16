/**
 * Destination Schemas TanStack Query Hooks
 * Reusable hooks for destination schema API endpoints
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
  schemas: {
    all: ["destination-schemas", "schemas"] as const,
    lists: () => [...destinationSchemasKeys.schemas.all, "list"] as const,
    list: (organizationId: string) =>
      [...destinationSchemasKeys.schemas.lists(), organizationId] as const,
    details: () => [...destinationSchemasKeys.schemas.all, "detail"] as const,
    detail: (organizationId: string, destinationSchemaId: string) =>
      [
        ...destinationSchemasKeys.schemas.details(),
        organizationId,
        destinationSchemaId,
      ] as const,
  },
};

// Destination Schema Management Hooks
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
          queryKey: destinationSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

export function useDestinationSchemas(organizationId: string | undefined) {
  return useQuery({
    queryKey: destinationSchemasKeys.schemas.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.listDestinationSchemas(organizationId);
    },
    enabled: !!organizationId,
  });
}

export function useDestinationSchema(
  organizationId: string | undefined,
  destinationSchemaId: string | undefined,
) {
  return useQuery({
    queryKey: destinationSchemasKeys.schemas.detail(
      organizationId || "",
      destinationSchemaId || "",
    ),
    queryFn: () => {
      if (!organizationId || !destinationSchemaId) {
        throw new Error(
          "Organization ID and Destination Schema ID are required",
        );
      }
      return DestinationSchemasService.getDestinationSchema(
        organizationId,
        destinationSchemaId,
      );
    },
    enabled: !!organizationId && !!destinationSchemaId,
  });
}

export function useUpdateDestinationSchema(
  organizationId: string | undefined,
  destinationSchemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDestinationSchemaDto) => {
      if (!organizationId || !destinationSchemaId) {
        throw new Error(
          "Organization ID and Destination Schema ID are required",
        );
      }
      return DestinationSchemasService.updateDestinationSchema(
        organizationId,
        destinationSchemaId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && destinationSchemaId) {
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.schemas.detail(
            organizationId,
            destinationSchemaId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

export function useDeleteDestinationSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (destinationSchemaId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return DestinationSchemasService.deleteDestinationSchema(
        organizationId,
        destinationSchemaId,
      );
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: destinationSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

// Destination Schema Validation Hook
export function useValidateDestinationSchema(
  organizationId: string | undefined,
  destinationSchemaId: string | undefined,
) {
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !destinationSchemaId) {
        throw new Error(
          "Organization ID and Destination Schema ID are required",
        );
      }
      return DestinationSchemasService.validateDestinationSchema(
        organizationId,
        destinationSchemaId,
      );
    },
  });
}
