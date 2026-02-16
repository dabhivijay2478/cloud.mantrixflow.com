/**
 * Organizations TanStack Query Hooks
 * Reusable hooks for organization API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationsService } from "../services/organizations.service";
import type {
  CreateOrganizationDto,
  TransferOwnershipDto,
  UpdateOrganizationDto,
} from "../types/organizations";

// Query Keys
export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...organizationsKeys.lists(), filters] as const,
  details: () => [...organizationsKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  current: () => [...organizationsKeys.all, "current"] as const,
  canCreate: () => [...organizationsKeys.all, "can-create"] as const,
};

// Organization Management Hooks
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationDto) =>
      OrganizationsService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.canCreate(),
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: organizationsKeys.lists(),
    queryFn: () => OrganizationsService.listOrganizations(),
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: organizationsKeys.detail(id || ""),
    queryFn: () => {
      if (!id) throw new Error("Organization ID is required");
      return OrganizationsService.getOrganization(id);
    },
    enabled: !!id,
  });
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: organizationsKeys.current(),
    queryFn: () => OrganizationsService.getCurrentOrganization(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDto }) =>
      OrganizationsService.updateOrganization(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OrganizationsService.deleteOrganization(id),
    onSuccess: (_, deletedId) => {
      // Remove specific org detail cache
      queryClient.removeQueries({
        queryKey: organizationsKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.canCreate(),
      });
      // Invalidate all org-dependent queries since the org is deleted
      queryClient.invalidateQueries({
        queryKey: ["organization-members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["data-sources"],
      });
      queryClient.invalidateQueries({
        queryKey: ["data-pipelines"],
      });
      queryClient.invalidateQueries({
        queryKey: ["source-schemas"],
      });
      queryClient.invalidateQueries({
        queryKey: ["destination-schemas"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["global-search"],
      });
    },
  });
}

export function useSetCurrentOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OrganizationsService.setCurrentOrganization(id),
    onSuccess: () => {
      // Invalidate organization-related queries
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      // Invalidate ALL organization-dependent queries to refresh context
      queryClient.invalidateQueries({
        queryKey: ["organization-members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["data-sources"],
      });
      queryClient.invalidateQueries({
        queryKey: ["data-pipelines"],
      });
      queryClient.invalidateQueries({
        queryKey: ["source-schemas"],
      });
      queryClient.invalidateQueries({
        queryKey: ["destination-schemas"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["global-search"],
      });
    },
  });
}

export function useCanCreateOrganization() {
  return useQuery({
    queryKey: organizationsKeys.canCreate(),
    queryFn: () => OrganizationsService.canCreateOrganization(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to transfer organization ownership
 */
export function useTransferOwnership(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferOwnershipDto) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return OrganizationsService.transferOwnership(organizationId, data);
    },
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        });
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.current(),
        });
        // Invalidate all member queries (including paginated)
        queryClient.invalidateQueries({
          queryKey: ["organization-members"],
        });
        // Invalidate activity logs
        queryClient.invalidateQueries({
          queryKey: ["activity-logs"],
        });
      }
    },
  });
}
