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
    staleTime: 0, // Always refetch when organization changes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to fetch organization members with server-side pagination
 */
export function useOrganizationMembersPaginated(
  organizationId: string | undefined,
  pagination: { pageIndex: number; pageSize: number },
) {
  const { pageIndex, pageSize } = pagination;
  const offset = pageIndex * pageSize;

  return useQuery({
    queryKey: [
      ...organizationMembersKeys.lists(),
      organizationId,
      { limit: pageSize, offset },
    ],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return OrganizationsService.listMembersPaginated(
        organizationId,
        pageSize,
        offset,
      );
    },
    enabled: !!organizationId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
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
 * Invalidates: all member list queries (including paginated), activity logs
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
      // Invalidate all member list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.lists(),
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

/**
 * Hook to update a member
 * Invalidates: all member list queries (including paginated), member detail, activity logs
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
      // Invalidate all member list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.lists(),
      });
      // Invalidate the specific member detail
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.detail(
          variables.organizationId,
          variables.memberId,
        ),
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}

/**
 * Hook to remove a member
 * Invalidates: all member list queries (including paginated), removes member detail,
 * activity logs
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
      // Remove the specific member detail cache
      queryClient.removeQueries({
        queryKey: organizationMembersKeys.detail(
          variables.organizationId,
          variables.memberId,
        ),
      });
      // Invalidate all member list queries (including paginated)
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.lists(),
      });
      // Invalidate activity logs
      queryClient.invalidateQueries({
        queryKey: ["activity-logs"],
      });
    },
  });
}
