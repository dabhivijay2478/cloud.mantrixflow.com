/**
 * Organization Members Hooks
 * TanStack Query hooks for organization member management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationsService } from "../services/organizations.service";
import type { InviteMemberDto, UpdateMemberDto } from "../types/organizations";

// Query keys factory
export const organizationMembersKeys = {
  all: ["organization-members"] as const,
  lists: () => [...organizationMembersKeys.all, "list"] as const,
  list: (organizationId: string) =>
    [...organizationMembersKeys.lists(), organizationId] as const,
  details: () => [...organizationMembersKeys.all, "detail"] as const,
  detail: (organizationId: string, memberId: string) =>
    [...organizationMembersKeys.details(), organizationId, memberId] as const,
};

/**
 * Hook to fetch organization members
 */
export function useOrganizationMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: organizationMembersKeys.list(organizationId || ""),
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return OrganizationsService.listMembers(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single organization member
 */
export function useOrganizationMember(
  organizationId: string | undefined,
  memberId: string | undefined,
) {
  return useQuery({
    queryKey: organizationMembersKeys.detail(
      organizationId || "",
      memberId || "",
    ),
    queryFn: () => {
      if (!organizationId || !memberId) {
        throw new Error("Organization ID and Member ID are required");
      }
      return OrganizationsService.getMember(organizationId, memberId);
    },
    enabled: !!organizationId && !!memberId,
  });
}

/**
 * Hook to invite a member
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: InviteMemberDto;
    }) => OrganizationsService.inviteMember(organizationId, data),
    onSuccess: (_, variables) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.list(variables.organizationId),
      });
    },
  });
}

/**
 * Hook to update a member
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      memberId,
      data,
    }: {
      organizationId: string;
      memberId: string;
      data: UpdateMemberDto;
    }) => OrganizationsService.updateMember(organizationId, memberId, data),
    onSuccess: (_, variables) => {
      // Invalidate members list and detail
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.list(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.detail(
          variables.organizationId,
          variables.memberId,
        ),
      });
    },
  });
}

/**
 * Hook to remove a member
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      memberId,
    }: {
      organizationId: string;
      memberId: string;
    }) => OrganizationsService.removeMember(organizationId, memberId),
    onSuccess: (_, variables) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.list(variables.organizationId),
      });
    },
  });
}
