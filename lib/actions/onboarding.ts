"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type OnboardingActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const organizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});

const connectionSchema = z.object({
  connector: z.string().min(1, "Connector is required"),
  host: z.string().min(1, "Host is required").optional(),
  port: z.string().optional(),
  database: z.string().min(1, "Database name is required").optional(),
  username: z.string().min(1, "Username is required").optional(),
  password: z.string().min(1, "Password is required").optional(),
});

/**
 * Server Action for creating an organization during onboarding
 */
export async function createOrganizationAction(
  _prevState: OnboardingActionResult<{ organizationId: string }> | null,
  formData: FormData,
): Promise<OnboardingActionResult<{ organizationId: string }>> {
  try {
    const rawData = {
      name: formData.get("name")?.toString() ?? "",
      slug: formData.get("slug")?.toString() ?? "",
    };

    const validation = organizationSchema.safeParse(rawData);

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

    const { name, slug } = validation.data;

    // TODO: Implement actual organization creation logic
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));

    const organizationId = `org_${Date.now()}`;

    revalidatePath("/onboarding");
    redirect("/onboarding/data-source");
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
 * Server Action for connecting a data source during onboarding
 */
export async function connectDataSourceAction(
  _prevState: OnboardingActionResult<{ dataSourceId: string }> | null,
  formData: FormData,
): Promise<OnboardingActionResult<{ dataSourceId: string }>> {
  try {
    const connector = formData.get("connector")?.toString() ?? "";
    const rawData = {
      connector,
      host: formData.get("host")?.toString(),
      port: formData.get("port")?.toString(),
      database: formData.get("database")?.toString(),
      username: formData.get("username")?.toString(),
      password: formData.get("password")?.toString(),
    };

    // For OAuth connectors, we don't need all fields
    const isOAuth = ["google-sheets"].includes(connector);
    const isFileUpload = ["excel", "csv"].includes(connector);

    if (!isOAuth && !isFileUpload) {
      const validation = connectionSchema.safeParse(rawData);

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
    }

    // TODO: Implement actual connection logic (test connection, create data source, etc.)
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const dataSourceId = `ds_${Date.now()}`;

    revalidatePath("/onboarding");
    redirect(`/onboarding/connect/${connector}/select`);
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

