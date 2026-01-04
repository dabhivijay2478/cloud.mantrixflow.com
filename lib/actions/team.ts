"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { OrganizationsService } from "@/lib/api/services/organizations.service";
import { UsersService } from "@/lib/api/services/users.service";
import { ApiClientError } from "@/lib/api/client";

export type TeamActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const inviteTeamMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "viewer", "guest"]),
  agentPanelAccess: z.boolean().optional().default(false),
  allowedModels: z.array(z.string()).optional().default([]),
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
  console.log("[INVITE] ===== Server action started =====");
  try {
    const rawData = {
      email: formData.get("email")?.toString() ?? "",
      role: formData.get("role")?.toString() ?? "member",
      agentPanelAccess: false, // Default to false, removed from UI
      allowedModels: [], // Default to empty, removed from UI
    };

    console.log("[INVITE] Raw data extracted:", {
      email: rawData.email,
      role: rawData.role,
    });

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

    // Get auth token FIRST before making any API calls
    console.log("[INVITE] Getting auth token...");
    let authToken: string | null = null;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[INVITE] Session error:", sessionError);
        return {
          success: false,
          error: "Authentication required. Please log in again.",
        };
      }

      authToken = session?.access_token || null;
      if (!authToken) {
        console.error("[INVITE] No access token in session");
        return {
          success: false,
          error: "Authentication required. Please log in again.",
        };
      }

      console.log(
        "[INVITE] ✓ Auth token retrieved (length:",
        authToken.length,
        ")",
      );
    } catch (tokenError) {
      console.error("[INVITE] ✗ Error getting auth token:", tokenError);
      return {
        success: false,
        error: "Failed to authenticate. Please log in again.",
      };
    }

    // Get current organization (with auth token)
    console.log("[INVITE] Getting current organization...");
    let organizationId: string;
    try {
      const currentUser = await UsersService.getCurrentUser({
        token: authToken,
      });
      if (currentUser.currentOrgId) {
        organizationId = currentUser.currentOrgId;
        console.log("[INVITE] Got organization ID from user:", organizationId);
      } else {
        // Fallback: get current organization from API
        const currentOrg = await OrganizationsService.getCurrentOrganization({
          token: authToken,
        });
        if (!currentOrg) {
          return {
            success: false,
            error:
              "No organization selected. Please select an organization first.",
          };
        }
        organizationId = currentOrg.id;
        console.log("[INVITE] Got organization ID from API:", organizationId);
      }
    } catch (error) {
      console.error("[INVITE] Error getting organization:", error);
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
      console.log("[INVITE] Starting invite process", {
        organizationId,
        email: validation.data.email,
        role: validation.data.role,
        hasToken: !!authToken,
      });

      const result = await OrganizationsService.inviteMember(
        organizationId,
        {
          email: validation.data.email,
          role: validation.data.role,
          agentPanelAccess: validation.data.agentPanelAccess || false,
          allowedModels: validation.data.allowedModels || [],
        },
        { token: authToken },
      );

      console.log("[INVITE] Invite successful", result);

      revalidatePath("/workspace/team");
      return {
        success: true,
        message: `Invitation sent to ${validation.data.email}`,
      };
    } catch (error) {
      // Comprehensive error logging
      console.error("[INVITE] Error caught in API call");
      console.error("[INVITE] Error type:", error?.constructor?.name);
      console.error(
        "[INVITE] Error instance check - ApiClientError:",
        error instanceof ApiClientError,
      );
      console.error(
        "[INVITE] Error instance check - Error:",
        error instanceof Error,
      );
      console.error(
        "[INVITE] Full error object:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );

      let errorMessage = "Failed to send invitation";
      let fieldErrors: Record<string, string[]> | undefined;

      // Extract error message with multiple fallbacks
      // IMPORTANT: Server actions can't serialize Error objects properly,
      // so we need to extract the message before returning
      let extractedMessage = "Failed to send invitation";

      if (error instanceof ApiClientError) {
        extractedMessage =
          error.message || `API Error: ${error.code} (${error.statusCode})`;
        console.error("[INVITE] ApiClientError details:", {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        });
        // Include details if available
        if (error.details && typeof error.details === "object") {
          const detailsStr = JSON.stringify(error.details);
          if (detailsStr && detailsStr !== "{}") {
            extractedMessage += `: ${detailsStr}`;
          }
        }
      } else if (error instanceof Error) {
        extractedMessage =
          error.message || error.toString() || "An error occurred";
        console.error("[INVITE] Error name:", error.name);
        console.error("[INVITE] Error message:", error.message);
        console.error("[INVITE] Error toString:", error.toString());
        if (error.stack) {
          console.error("[INVITE] Error stack:", error.stack);
        }
      } else if (typeof error === "object" && error !== null) {
        const err = error as Record<string, unknown>;
        // Try multiple common error message fields
        extractedMessage = String(
          err.message ||
            err.error ||
            err.msg ||
            err.errorMessage ||
            (typeof err.toString === "function" ? err.toString() : null) ||
            JSON.stringify(err).substring(0, 200) ||
            "Failed to send invitation",
        );
        console.error("[INVITE] Error object keys:", Object.keys(err));
        console.error(
          "[INVITE] Error object stringified:",
          JSON.stringify(err).substring(0, 500),
        );
      } else {
        extractedMessage = String(error || "An unknown error occurred");
        console.error("[INVITE] Primitive error value:", error);
      }

      errorMessage = extractedMessage;

      // Normalize error message - replace generic messages
      if (
        errorMessage === "An error occurred" ||
        !errorMessage ||
        errorMessage.trim() === ""
      ) {
        errorMessage =
          "Failed to send invitation. Please check your connection and try again.";
      }

      // Check for specific error patterns
      if (
        errorMessage.includes("already been invited") ||
        errorMessage.includes("already exists") ||
        errorMessage.includes("Conflict") ||
        errorMessage.includes("409")
      ) {
        errorMessage =
          "This user has already been invited to this organization";
        fieldErrors = {
          email: [errorMessage],
        };
      } else if (
        errorMessage.includes("not found") ||
        errorMessage.includes("NotFound") ||
        errorMessage.includes("404")
      ) {
        errorMessage =
          "Organization not found. Please select an organization first.";
      } else if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        errorMessage =
          "You are not authorized to invite members. Please log in again.";
      } else if (
        errorMessage.includes("Forbidden") ||
        errorMessage.includes("403")
      ) {
        errorMessage =
          "You don't have permission to invite members to this organization.";
      }

      console.error("[INVITE] Final error message:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        fieldErrors,
      };
    }
  } catch (error) {
    // Log full error for debugging
    console.error("[INVITE] Unexpected outer catch error:", error);
    console.error("[INVITE] Error type:", error?.constructor?.name);
    console.error(
      "[INVITE] Full error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );

    // Try to extract meaningful error message
    let errorMessage = "An unexpected error occurred. Please try again.";

    if (error instanceof ApiClientError) {
      errorMessage =
        error.message || `API Error: ${error.code} (${error.statusCode})`;
      console.error("[INVITE] ApiClientError:", {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      });
    } else if (error instanceof Error) {
      errorMessage = error.message || "An unexpected error occurred";
      console.error("[INVITE] Error message:", error.message);
      console.error("[INVITE] Error stack:", error.stack);
    } else if (typeof error === "object" && error !== null) {
      const err = error as Record<string, unknown>;
      errorMessage = String(
        err.message || err.error || JSON.stringify(err) || errorMessage,
      );
      console.error("[INVITE] Error object:", err);
    } else {
      errorMessage = String(error || "An unknown error occurred");
    }

    return {
      success: false,
      error: errorMessage,
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
