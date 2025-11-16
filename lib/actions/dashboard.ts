"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type DashboardActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const dashboardSchema = z.object({
  name: z
    .string()
    .min(1, "Dashboard name is required")
    .min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  dataSourceId: z.string().min(1, "Please select a data source"),
});

/**
 * Server Action for creating a dashboard
 */
export async function createDashboardAction(
  _prevState: DashboardActionResult<{ dashboardId: string }> | null,
  formData: FormData,
): Promise<DashboardActionResult<{ dashboardId: string }>> {
  try {
    const rawData = {
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      dataSourceId: formData.get("dataSourceId")?.toString() ?? "",
    };

    const validation = dashboardSchema.safeParse(rawData);

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

    const { name, description, dataSourceId } = validation.data;

    // TODO: Implement actual dashboard creation logic
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dashboardId = `dash_${Date.now()}`;

    revalidatePath("/workspace/dashboards");
    redirect(`/workspace/dashboards/${dashboardId}`);
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

