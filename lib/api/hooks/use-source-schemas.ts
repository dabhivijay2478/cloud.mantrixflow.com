/**
 * Source Schemas TanStack Query Hooks
 * Reusable hooks for source schema API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SourceSchemasService } from "../services/source-schemas.service";
import type {
  CreateSourceSchemaDto,
  UpdateSourceSchemaDto,
} from "../types/data-pipelines";

// Query Keys
export const sourceSchemasKeys = {
  all: ["source-schemas"] as const,
  schemas: {
    all: ["source-schemas", "schemas"] as const,
    lists: () => [...sourceSchemasKeys.schemas.all, "list"] as const,
    list: (organizationId: string) =>
      [...sourceSchemasKeys.schemas.lists(), organizationId] as const,
    details: () => [...sourceSchemasKeys.schemas.all, "detail"] as const,
    detail: (organizationId: string, sourceSchemaId: string) =>
      [
        ...sourceSchemasKeys.schemas.details(),
        organizationId,
        sourceSchemaId,
      ] as const,
  },
};

// Source Schema Management Hooks
export function useCreateSourceSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSourceSchemaDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.createSourceSchema(organizationId, data);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

export function useSourceSchemas(organizationId: string | undefined) {
  return useQuery({
    queryKey: sourceSchemasKeys.schemas.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.listSourceSchemas(organizationId);
    },
    enabled: !!organizationId,
  });
}

export function useSourceSchema(
  organizationId: string | undefined,
  sourceSchemaId: string | undefined,
) {
  return useQuery({
    queryKey: sourceSchemasKeys.schemas.detail(
      organizationId || "",
      sourceSchemaId || "",
    ),
    queryFn: () => {
      if (!organizationId || !sourceSchemaId) {
        throw new Error("Organization ID and Source Schema ID are required");
      }
      return SourceSchemasService.getSourceSchema(
        organizationId,
        sourceSchemaId,
      );
    },
    enabled: !!organizationId && !!sourceSchemaId,
  });
}

export function useUpdateSourceSchema(
  organizationId: string | undefined,
  sourceSchemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSourceSchemaDto) => {
      if (!organizationId || !sourceSchemaId) {
        throw new Error("Organization ID and Source Schema ID are required");
      }
      return SourceSchemasService.updateSourceSchema(
        organizationId,
        sourceSchemaId,
        data,
      );
    },
    onSuccess: () => {
      if (organizationId && sourceSchemaId) {
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.schemas.detail(
            organizationId,
            sourceSchemaId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

export function useDeleteSourceSchema(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceSchemaId: string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return SourceSchemasService.deleteSourceSchema(
        organizationId,
        sourceSchemaId,
      );
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.schemas.list(organizationId),
        });
      }
    },
  });
}

// Source Schema Discovery Hook
export function useDiscoverSourceSchema(
  organizationId: string | undefined,
  sourceSchemaId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!organizationId || !sourceSchemaId) {
        throw new Error("Organization ID and Source Schema ID are required");
      }
      return SourceSchemasService.discoverSourceSchema(
        organizationId,
        sourceSchemaId,
      );
    },
    onSuccess: () => {
      if (organizationId && sourceSchemaId) {
        queryClient.invalidateQueries({
          queryKey: sourceSchemasKeys.schemas.detail(
            organizationId,
            sourceSchemaId,
          ),
        });
      }
    },
  });
}
