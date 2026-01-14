"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Crown,
  Edit,
  Loader2,
  Mail,
  MoreVertical,
  Shield,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmationModal, PageHeader } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirmation } from "@/hooks/use-confirmation";
import {
  organizationMembersKeys,
  useOrganizationMembers,
  useRemoveMember,
  useUpdateMember,
} from "@/lib/api";
import type { OrganizationMember } from "@/lib/api/types/organizations";
import { roleConfig, type TeamMemberRole } from "@/lib/constants/roles";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

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
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: User,
  guest: User,
};

export default function TeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current organization from workspace store (set by sidebar selector)
  // This ensures team data updates when organization is switched
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

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

  // Transform API members to TeamMember format
  const teamMembers: TeamMember[] = useMemo(() => {
    if (!members) return [];

    return members.map((member: OrganizationMember) => {
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
        role: member.role,
        avatar: null,
        status,
        joinedAt: member.acceptedAt
          ? new Date(member.acceptedAt).toISOString().split("T")[0]
          : member.invitedAt
            ? new Date(member.invitedAt).toISOString().split("T")[0]
            : undefined,
      };
    });
  }, [members]);

  const handleRoleChange = (
    memberId: string,
    memberEmail: string,
    newRole: TeamMemberRole,
    currentRole: TeamMemberRole,
  ) => {
    if (!organizationId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    // Prevent changing owner role
    if (currentRole === "owner") {
      showErrorToast(
        "updateFailed",
        "Member Role",
        "Organization owners cannot have their role changed. Transfer ownership first.",
      );
      return;
    }

    // Prevent changing role to owner
    if (newRole === "owner") {
      showErrorToast(
        "updateFailed",
        "Member Role",
        "Cannot assign owner role. Ownership must be transferred separately.",
      );
      return;
    }

    // Set state and show confirmation modal
    setRoleUpdateState({ memberId, memberEmail, newRole });
    updateRoleConfirm.showConfirm(memberEmail);
  };

  const handleRemoveMember = (memberId: string, memberEmail: string) => {
    if (!organizationId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    // Set state and show confirmation modal
    setMemberToRemove({ memberId, memberEmail });
    removeMemberConfirm.showConfirm(memberEmail);
  };

  const handleEditClick = (member: TeamMember) => {
    router.push(`/workspace/team/${member.id}/edit`);
  };

  const getRoleBadge = (role: TeamMemberRole) => {
    const config = roleConfig[role];
    const Icon = roleIcons[role];
    
    // Safety check: if config doesn't exist, use fallback
    if (!config) {
      return (
        <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1">
          <User className="h-3 w-3" />
          {role}
        </Badge>
      );
    }
    
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1",
          role === "owner" &&
            "border-purple-500/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950",
          role === "admin" &&
            "border-blue-500/50 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950",
          role === "member" &&
            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
          role === "viewer" &&
            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
          role === "guest" &&
            "border-orange-500/50 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950",
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: TeamMember["status"]) => {
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
  };

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
        description={`Manage team members for ${currentOrganization?.name || "your organization"}`}
        action={
          <Button
            onClick={() => router.push("/workspace/team/invite")}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {teamMembers.length}{" "}
                {teamMembers.length === 1 ? "member" : "members"} in{" "}
                {currentOrganization?.name || "this organization"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Member</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || membersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Loading members...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : membersError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-destructive">
                          Failed to load team members
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {membersError instanceof Error
                            ? membersError.message
                            : "An error occurred"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No team members yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invite team members to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => {
                    return (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell>
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
                              <div className="font-medium truncate">
                                {member.name}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(member.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {member.role === "owner" ? (
                            // Owners cannot have their role changed - show badge only
                            getRoleBadge(member.role)
                          ) : (
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
                              <DropdownMenuContent
                                align="start"
                                className="w-56"
                              >
                                <DropdownMenuLabel>
                                  Change Role
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {Object.entries(roleConfig)
                                  .filter(([key]) => key !== "owner") // Remove owner from options
                                  .map(([key, config]) => {
                                    const Icon =
                                      roleIcons[key as TeamMemberRole];
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
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="lg:hidden">
                              {getStatusBadge(member.status)}
                            </div>
                            <div className="lg:hidden">
                              {getRoleBadge(member.role)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(member)}
                                  disabled={member.role === "owner"}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Member
                                  {member.role === "owner" && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      (Owner)
                                    </span>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRemoveMember(member.id, member.email)
                                  }
                                  className="text-destructive"
                                  disabled={member.role === "owner"}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                  {member.role === "owner" && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      (Owner)
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
            ? `Are you sure you want to change ${roleUpdateState.memberEmail}'s role to ${roleConfig[roleUpdateState.newRole].label}? This will update their permissions in the organization.`
            : "Are you sure you want to update this member's role?"
        }
        confirmLabel="Update Role"
        isLoading={updateMember.isPending}
      />
    </div>
  );
}
