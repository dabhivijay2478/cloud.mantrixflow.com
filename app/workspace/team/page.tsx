"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Crown,
  Edit,
  Mail,
  MoreVertical,
  Shield,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmationModal, DataTable, PageHeader } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmation } from "@/hooks/use-confirmation";
import {
  organizationMembersKeys,
  useCurrentOrganization,
  useCurrentUser,
  useOrganizationMembers,
  useRemoveMember,
  useTransferOwnership,
  useUpdateMember,
} from "@/lib/api";
import type { OrganizationMember } from "@/lib/api/types/organizations";
import { roleConfig, type TeamMemberRole } from "@/lib/constants/roles";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast, toast } from "@/lib/utils/toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
  status: "active" | "pending" | "inactive";
  joinedAt?: string;
}

const roleIcons: Record<TeamMemberRole, typeof Shield> = {
  OWNER: Crown,
  ADMIN: Shield,
  EDITOR: User,
  VIEWER: User,
};

export default function TeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || undefined;

  // Get current organization from workspace store (set by sidebar selector)
  // This ensures team data updates when organization is switched
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  // Fetch current organization to get owner_user_id
  const { data: currentOrg } = useCurrentOrganization();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  // Check if current user is the owner
  const isCurrentUserOwner =
    currentOrg && currentUserId
      ? currentOrg.owner_user_id === currentUserId
      : false;

  // Show loading if no organization is selected
  const isLoading = !organizationId;

  // State for role update confirmation
  const [roleUpdateState, setRoleUpdateState] = useState<{
    memberId: string;
    memberEmail: string;
    newRole: TeamMemberRole;
  } | null>(null);

  // State for member removal
  const [memberToRemove, setMemberToRemove] = useState<{
    memberId: string;
    memberEmail: string;
  } | null>(null);

  // State for ownership transfer
  const [memberToTransfer, setMemberToTransfer] = useState<{
    memberId: string;
    memberEmail: string;
  } | null>(null);

  // Fetch organization members (only if organization is selected)
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
    refetch: _refetchMembers,
  } = useOrganizationMembers(organizationId);

  // Refetch members when organization changes
  useEffect(() => {
    if (organizationId) {
      // Invalidate all member queries for the new organization to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.list(organizationId),
      });
      // Also invalidate all member queries to clear old organization's data
      queryClient.invalidateQueries({
        queryKey: organizationMembersKeys.lists(),
      });
    }
  }, [organizationId, queryClient]);

  // Mutations
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const transferOwnership = useTransferOwnership(organizationId);

  // Confirmation modal for removing member
  const removeMemberConfirm = useConfirmation({
    action: "remove",
    itemName: "Team Member",
    onConfirm: async () => {
      if (!organizationId || !memberToRemove) return;
      try {
        await removeMember.mutateAsync({
          organizationId,
          memberId: memberToRemove.memberId,
        });
        showSuccessToast("removed", "Team Member");
        setMemberToRemove(null);
      } catch (error) {
        showErrorToast(
          "removeFailed",
          "Team Member",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
  });

  // Confirmation modal for updating role
  const updateRoleConfirm = useConfirmation({
    action: "update",
    itemName: "Member Role",
    onConfirm: async () => {
      if (!organizationId || !roleUpdateState) return;
      try {
        await updateMember.mutateAsync({
          organizationId,
          memberId: roleUpdateState.memberId,
          data: { role: roleUpdateState.newRole },
        });
        showSuccessToast("updated", "Member Role");
        setRoleUpdateState(null);
      } catch (error) {
        showErrorToast(
          "updateFailed",
          "Member Role",
          error instanceof Error ? error.message : undefined,
        );
        throw error;
      }
    },
  });

  // Confirmation modal for transferring ownership
  const transferOwnershipConfirm = useConfirmation({
    action: "update",
    itemName: "Organization Ownership",
    onConfirm: async () => {
      if (!memberToTransfer || !organizationId) return;
      try {
        // Find the member to get their user_id
        const member = members?.find((m) => m.id === memberToTransfer.memberId);
        if (!member?.user_id) {
          showErrorToast(
            "updateFailed",
            "Ownership Transfer",
            "Cannot transfer ownership to a member without a user account.",
          );
          return;
        }

        await transferOwnership.mutateAsync({
          newOwnerId: member.user_id,
        });
        toast.success(
          "Ownership transferred",
          `Ownership has been transferred to ${memberToTransfer.memberEmail}`,
        );
        setMemberToTransfer(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to transfer ownership.";
        showErrorToast("updateFailed", "Ownership Transfer", errorMessage);
        throw error; // Re-throw to prevent modal from closing on error
      }
    },
  });

  // Transform API members to TeamMember format
  const teamMembers: TeamMember[] = useMemo(() => {
    if (!members || !currentOrg) return [];

    return members.map((member: OrganizationMember) => {
      // Check if this member is the owner by comparing user_id with owner_user_id
      const isOwner =
        member.user_id && currentOrg.owner_user_id === member.user_id;

      // Map status: invited -> pending, accepted/active -> active
      const status: TeamMember["status"] =
        member.status === "invited"
          ? "pending"
          : member.status === "active" || member.status === "accepted"
            ? "active"
            : "inactive";

      return {
        id: member.id,
        name: member.email.split("@")[0], // Use email prefix as name until user signs up
        email: member.email,
        role: isOwner ? ("OWNER" as TeamMemberRole) : member.role,
        avatar: null,
        status,
        joinedAt: member.acceptedAt
          ? new Date(member.acceptedAt).toISOString().split("T")[0]
          : member.invitedAt
            ? new Date(member.invitedAt).toISOString().split("T")[0]
            : undefined,
      };
    });
  }, [members, currentOrg]);

  const handleRoleChange = useCallback(
    (
      memberId: string,
      memberEmail: string,
      newRole: TeamMemberRole,
      currentRole: TeamMemberRole,
    ) => {
      if (!organizationId) {
        showErrorToast("notFound", "Organization");
        return;
      }

      // Prevent changing OWNER role
      if (currentRole === "OWNER") {
        showErrorToast(
          "updateFailed",
          "Member Role",
          "Organization owners cannot have their role changed. Transfer ownership first.",
        );
        return;
      }

      // Prevent changing role to OWNER
      if (newRole === "OWNER") {
        showErrorToast(
          "updateFailed",
          "Member Role",
          "Cannot assign OWNER role. Ownership must be transferred separately.",
        );
        return;
      }

      // Set state and show confirmation modal
      setRoleUpdateState({ memberId, memberEmail, newRole });
      updateRoleConfirm.showConfirm(memberEmail);
    },
    [organizationId, updateRoleConfirm],
  );

  const handleRemoveMember = useCallback(
    (memberId: string, memberEmail: string) => {
      if (!organizationId) {
        showErrorToast("notFound", "Organization");
        return;
      }

      // Set state and show confirmation modal
      setMemberToRemove({ memberId, memberEmail });
      removeMemberConfirm.showConfirm(memberEmail);
    },
    [organizationId, removeMemberConfirm],
  );

  const handleEditClick = useCallback(
    (member: TeamMember) => {
      router.push(`/workspace/team/${member.id}/edit`);
    },
    [router],
  );

  const getRoleBadge = useCallback((role: TeamMemberRole) => {
    const config = roleConfig[role];
    const Icon = roleIcons[role];
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1",
          role === "OWNER" &&
            "border-purple-500/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950",
          role === "ADMIN" &&
            "border-blue-500/50 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950",
          role === "EDITOR" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          role === "VIEWER" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }, []);

  const getStatusBadge = useCallback((status: TeamMember["status"]) => {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          status === "active" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          status === "pending" &&
            "border-yellow-500/50 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950",
          status === "inactive" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
        )}
      >
        {status === "active" && "Active"}
        {status === "pending" && "Pending"}
        {status === "inactive" && "Inactive"}
      </Badge>
    );
  }, []);

  // Column definitions for DataTable
  const columns: ColumnDef<TeamMember>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="font-medium truncate">{member.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const member = row.original;
          if (member.role === "OWNER") {
            return getRoleBadge(member.role);
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  {getRoleBadge(member.role)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(roleConfig)
                  .filter(([key]) => key !== "OWNER")
                  .map(([key, config]) => {
                    const Icon = roleIcons[key as TeamMemberRole];
                    return (
                      <DropdownMenuItem
                        key={key}
                        onClick={() =>
                          handleRoleChange(
                            member.id,
                            member.email,
                            key as TeamMemberRole,
                            member.role,
                          )
                        }
                        className={cn(
                          "flex items-center gap-2",
                          member.role === key && "bg-accent",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="flex flex-col flex-1">
                          <span>{config.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {config.description}
                          </span>
                        </div>
                        {member.role === key && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ row }) => {
          const joinedAt = row.original.joinedAt;
          return (
            <div className="text-muted-foreground">
              {joinedAt
                ? new Date(joinedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleEditClick(member)}
                    disabled={member.role === "OWNER"}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Member
                    {member.role === "OWNER" && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        (Owner)
                      </span>
                    )}
                  </DropdownMenuItem>
                  {isCurrentUserOwner && member.role !== "OWNER" && (
                    <DropdownMenuItem
                      onClick={() => {
                        setMemberToTransfer({
                          memberId: member.id,
                          memberEmail: member.email,
                        });
                        transferOwnershipConfirm.showConfirm(member.email);
                      }}
                      className="text-purple-600 dark:text-purple-400"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Transfer Ownership
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRemoveMember(member.id, member.email)}
                    className="text-destructive"
                    disabled={member.role === "OWNER"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Member
                    {member.role === "OWNER" && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        (Owner)
                      </span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableHiding: false,
      },
    ],
    [
      handleRoleChange,
      handleEditClick,
      handleRemoveMember,
      getRoleBadge,
      getStatusBadge,
      isCurrentUserOwner,
      transferOwnershipConfirm.showConfirm,
    ],
  );

  // Show message if no organization is selected
  if (!organizationId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Team"
          description="Manage your team members and permissions"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Organization Selected
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Please select an organization from the sidebar to view and manage
              team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={`Manage team members for ${
          currentOrganization?.name || "your organization"
        }`}
        action={
          <Button
            onClick={() => router.push("/workspace/team/invite")}
            className="w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      <DataTable
        tableId={
          organizationId
            ? `team-members-table-${organizationId}`
            : "team-members-table"
        }
        columns={columns}
        data={teamMembers}
        isLoading={isLoading || membersLoading}
        error={membersError || undefined}
        enableSorting
        enableFiltering
        externalFilter={urlSearch}
        externalFilterColumnKey="name"
        filterPlaceholder="Filter team members..."
        defaultVisibleColumns={[
          "name",
          "status",
          "role",
          "joinedAt",
          "actions",
        ]}
        fixedColumns={["name", "actions"]}
        emptyMessage="No team members yet"
        emptyDescription="Invite team members to get started"
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        {...removeMemberConfirm.confirmProps}
        isLoading={removeMember.isPending}
      />
      <ConfirmationModal
        {...updateRoleConfirm.confirmProps}
        title={
          roleUpdateState
            ? `Change Role to ${roleConfig[roleUpdateState.newRole].label}`
            : "Update Member Role"
        }
        description={
          roleUpdateState
            ? `Are you sure you want to change ${
                roleUpdateState.memberEmail
              }'s role to ${
                roleConfig[roleUpdateState.newRole].label
              }? This will update their permissions in the organization.`
            : "Are you sure you want to update this member's role?"
        }
        confirmLabel="Update Role"
        isLoading={updateMember.isPending}
      />
      <ConfirmationModal
        {...transferOwnershipConfirm.confirmProps}
        title="Transfer Organization Ownership"
        description={
          memberToTransfer
            ? `Are you sure you want to transfer ownership of this organization to ${memberToTransfer.memberEmail}? This action cannot be undone. You will become an ADMIN member after the transfer.`
            : "Are you sure you want to transfer ownership?"
        }
        confirmLabel="Transfer Ownership"
        confirmVariant="destructive"
      />
    </div>
  );
}
