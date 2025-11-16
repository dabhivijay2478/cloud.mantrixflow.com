"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type DatasetActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const datasetSchema = z.object({
  name: z
    .string()
    .min(1, "Dataset name is required")
    .min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  dataSourceId: z.string().min(1, "Please select a data source"),
  sourceType: z.enum(["table", "custom_query"]),
  sourceName: z.string().min(1, "Please select a table or query"),
  selectedColumns: z.array(z.string()).optional(),
});

/**
 * Server Action for creating or updating a dataset
 */
export async function saveDatasetAction(
  _prevState: DatasetActionResult<{ datasetId: string }> | null,
  formData: FormData,
): Promise<DatasetActionResult<{ datasetId: string }>> {
  try {
    const rawData = {
      datasetId: formData.get("datasetId")?.toString(),
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      dataSourceId: formData.get("dataSourceId")?.toString() ?? "",
      sourceType: formData.get("sourceType")?.toString() ?? "table",
      sourceName: formData.get("sourceName")?.toString() ?? "",
      selectedColumns: formData.getAll("selectedColumns").map((v) => v.toString()),
    };

    const validation = datasetSchema.safeParse(rawData);

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

    const { name, description, dataSourceId, sourceType, sourceName } =
      validation.data;

    // TODO: Implement actual dataset creation/update logic
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));

    const datasetId = rawData.datasetId || `dataset_${Date.now()}`;

    revalidatePath("/workspace/datasets");
    redirect(`/workspace/datasets/${datasetId}`);
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

