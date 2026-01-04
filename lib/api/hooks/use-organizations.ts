/**
 * Organizations TanStack Query Hooks
 * Reusable hooks for organization API endpoints
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationsService } from "../services/organizations.service";
import type {
  CreateOrganizationDto,
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
    queryKey: organizationsKeys.detail(id!),
    queryFn: () => OrganizationsService.getOrganization(id!),
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
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OrganizationsService.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
    },
  });
}

export function useSetCurrentOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OrganizationsService.setCurrentOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.current(),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
    },
  });
}
