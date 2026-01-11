"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmationModal, PageHeader, RoleSelect } from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConfirmation } from "@/hooks/use-confirmation";
import {
  useOrganizationMember,
  useRemoveMember,
  useUpdateMember,
} from "@/lib/api";
import type { OrganizationMember } from "@/lib/api/types/organizations";
import type { TeamMemberRole } from "@/lib/constants/roles";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  // Get current organization from workspace store
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  // Fetch member data from API
  const {
    data: member,
    isLoading: memberLoading,
    error: memberError,
  } = useOrganizationMember(organizationId, memberId);

  // Mutations
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();

  // Form state - only role is editable
  const [editRole, setEditRole] = useState<TeamMemberRole>("EDITOR");

  // Initialize form when member data loads
  useEffect(() => {
    if (member) {
      setEditRole(member.role as TeamMemberRole);
    }
  }, [member]);

  // Confirmation modal for removing member
  const removeMemberConfirm = useConfirmation({
    action: "remove",
    itemName: "Team Member",
    onConfirm: async () => {
      if (!organizationId || !memberId) return;
      try {
        await removeMember.mutateAsync({
          organizationId,
          memberId,
        });
        showSuccessToast("removed", "Team Member");
        router.push("/workspace/team");
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

  const getStatusBadge = (status: OrganizationMember["status"]) => {
    const statusMap = {
      active: {
        label: "Active",
        className:
          "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
        dotColor: "bg-green-500",
      },
      invited: {
        label: "Pending",
        className:
          "border-yellow-500/50 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950",
        dotColor: "bg-yellow-500",
      },
      accepted: {
        label: "Active",
        className:
          "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
        dotColor: "bg-green-500",
      },
      inactive: {
        label: "Inactive",
        className:
          "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
        dotColor: "bg-gray-500",
      },
    };

    const statusInfo = statusMap[status] || statusMap.inactive;

    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", statusInfo.className)}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
            statusInfo.dotColor,
          )}
        />
        {statusInfo.label}
      </Badge>
    );
  };

  const handleSave = async () => {
    if (!organizationId || !memberId) {
      showErrorToast("notFound", "Organization");
      return;
    }

    if (!member) {
      showErrorToast("notFound", "Team Member");
      return;
    }

    // Prevent updating OWNER role
    if (member.role === "OWNER") {
      showErrorToast(
        "updateFailed",
        "Team Member",
        "Organization owners cannot have their role changed. Transfer ownership first.",
      );
      return;
    }

    // Prevent changing role to OWNER
    if (editRole === "OWNER") {
      showErrorToast(
        "updateFailed",
        "Team Member",
        "Cannot assign OWNER role. Ownership must be transferred separately.",
      );
      return;
    }

    try {
      await updateMember.mutateAsync({
        organizationId,
        memberId,
        data: {
          role: editRole,
        },
      });
      showSuccessToast("updated", "Team Member");
      router.push("/workspace/team");
    } catch (error) {
      showErrorToast(
        "updateFailed",
        "Team Member",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  // Check if member is OWNER - OWNERs cannot have their role changed
  const isOwner = member?.role === "OWNER";

  const handleRemoveMember = () => {
    if (!member) return;
    removeMemberConfirm.showConfirm(member.email);
  };

  // Show loading state
  if (memberLoading || !member) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading member details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (memberError || !organizationId) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
        <PageHeader
          title="Edit Team Member"
          description="Update team member role and permissions"
          backButton={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/team")}
              className="-ml-2 hover:bg-accent"
              asChild
            >
              <Link href="/workspace/team">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Team
              </Link>
            </Button>
          }
        />
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Member Not Found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {!organizationId
                ? "No organization selected. Please select an organization from the sidebar."
                : memberError instanceof Error
                  ? memberError.message
                  : "The team member you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Button onClick={() => router.push("/workspace/team")}>
              Back to Team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get member name from email (since we don't have a name field)
  const memberName = member.email.split("@")[0];
  const memberInitials = memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
      <PageHeader
        title="Edit Team Member"
        description="Update team member role and permissions"
        backButton={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 hover:bg-accent"
            asChild
          >
            <Link href="/workspace/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Member Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Member Profile</CardTitle>
            <CardDescription>
              View member information and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {memberInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-semibold">{memberName}</h3>
                  {getStatusBadge(member.status)}
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  {member.acceptedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {new Date(member.acceptedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  {!member.acceptedAt && member.invitedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Invited{" "}
                      {new Date(member.invitedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Permissions</CardTitle>
            <CardDescription>
              {isOwner
                ? "Organization owners have full access and their role cannot be changed"
                : "Assign a role to define access level and permissions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RoleSelect
              value={editRole}
              onValueChange={setEditRole}
              disabled={updateMember.isPending || isOwner}
              id="role-select"
              helpText={
                isOwner
                  ? "The owner role cannot be changed. To transfer ownership, use the organization settings."
                  : undefined
              }
              showDefaultHelpText={!isOwner}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button
                  variant="destructive"
                  onClick={handleRemoveMember}
                  disabled={
                    updateMember.isPending ||
                    removeMember.isPending ||
                    member.role === "OWNER"
                  }
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Member
                </Button>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/workspace/team")}
                    disabled={updateMember.isPending}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateMember.isPending || isOwner}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    {updateMember.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {member.role === "OWNER" && (
                <p className="text-xs text-muted-foreground text-center sm:text-right">
                  Organization owners cannot be removed. Transfer ownership
                  first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        {...removeMemberConfirm.confirmProps}
        isLoading={removeMember.isPending}
      />
    </div>
  );
}
