"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { OrganizationsService } from "@/lib/api/services/organizations.service";
import { UsersService } from "@/lib/api/services/users.service";

export type TeamActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const inviteTeamMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "viewer", "guest"]),
  agentPanelAccess: z.boolean().default(false),
  allowedModels: z.array(z.string()).default([]),
});

const updateTeamMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "viewer", "guest"]),
  agentPanelAccess: z.boolean().default(false),
  allowedModels: z.array(z.string()).default([]),
});

/**
 * Server Action for inviting a team member
 */
export async function inviteTeamMemberAction(
  _prevState: TeamActionResult | null,
  formData: FormData,
): Promise<TeamActionResult> {
  try {
    const rawData = {
      email: formData.get("email")?.toString() ?? "",
      role: formData.get("role")?.toString() ?? "member",
      agentPanelAccess: formData.get("agentPanelAccess") === "true",
      allowedModels: formData.getAll("allowedModels").map((v) => v.toString()),
    };

    const validation = inviteTeamMemberSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { agentPanelAccess, allowedModels } = validation.data;

    // Validate agent panel access
    if (agentPanelAccess && allowedModels.length === 0) {
      return {
        success: false,
        error:
          "Please select at least one model if agent panel access is enabled.",
        fieldErrors: {
          allowedModels: ["At least one model must be selected"],
        },
      };
    }

    // Get current organization
    let organizationId: string;
    try {
      const currentUser = await UsersService.getCurrentUser();
      if (currentUser.currentOrgId) {
        organizationId = currentUser.currentOrgId;
      } else {
        // Fallback: get current organization from API
        const currentOrg = await OrganizationsService.getCurrentOrganization();
        if (!currentOrg) {
          return {
            success: false,
            error: "No organization selected. Please select an organization first.",
          };
        }
        organizationId = currentOrg.id;
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get current organization. Please try again.",
      };
    }

    // Invite member via API
    try {
      await OrganizationsService.inviteMember(organizationId, {
        email: validation.data.email,
        role: validation.data.role,
        agentPanelAccess: validation.data.agentPanelAccess,
        allowedModels: validation.data.allowedModels,
      });

      revalidatePath("/workspace/team");
      // Don't redirect - let the form handle success message
      return {
        success: true,
        message: `Invitation sent to ${validation.data.email}`,
      };
    } catch (error) {
      // Handle API errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";
      
      // Check if it's a duplicate invite error
      if (errorMessage.includes("already been invited")) {
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {
            email: ["This user has already been invited to this organization"],
          },
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for updating a team member
 */
export async function updateTeamMemberAction(
  _prevState: TeamActionResult | null,
  formData: FormData,
): Promise<TeamActionResult> {
  try {
    const rawData = {
      memberId: formData.get("memberId")?.toString() ?? "",
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      role: formData.get("role")?.toString() ?? "member",
      agentPanelAccess: formData.get("agentPanelAccess") === "true",
      allowedModels: formData.getAll("allowedModels").map((v) => v.toString()),
    };

    const validation = updateTeamMemberSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() ?? "root";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { agentPanelAccess, allowedModels } = validation.data;

    // Validate agent panel access
    if (agentPanelAccess && allowedModels.length === 0) {
      return {
        success: false,
        error:
          "Please select at least one model if agent panel access is enabled.",
        fieldErrors: {
          allowedModels: ["At least one model must be selected"],
        },
      };
    }

    // TODO: Implement actual update logic
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath("/workspace/team");
    redirect("/workspace/team");
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for removing a team member
 */
export async function removeTeamMemberAction(
  memberId: string,
): Promise<TeamActionResult> {
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    // TODO: Implement actual removal logic
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath("/workspace/team");
    return {
      success: true,
      message: "Team member removed successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
