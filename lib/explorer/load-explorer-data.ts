/**
 * Load explorer data from the backend JSONL stream
 * Parses newline-delimited JSON and returns rows + columns for DuckDB addTable
 */

import { getApiUrl } from "@/lib/api/config";
import { createFetchOptions } from "@/lib/api/config";

export interface ExplorerDataResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

/**
 * Fetch table rows from the explorer API (JSONL stream) and return as rows + columns
 */
export async function loadFromExplorerData(
  orgId: string,
  dataSourceId: string,
  schema: string,
  table: string,
  limit: number,
): Promise<ExplorerDataResult> {
  const params = new URLSearchParams({
    schema: schema || "public",
    table,
    limit: String(Math.min(Math.max(limit, 1), 100_000)),
  });
  const url = `${getApiUrl(`api/organizations/${orgId}/data-sources/${dataSourceId}/explorer/data`)}?${params}`;

  const fetchOptions = await createFetchOptions({ method: "GET" });

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const firstLine = text.split("\n")[0];
      if (firstLine) {
        const parsed = JSON.parse(firstLine) as { error?: string };
        if (parsed.error) errorMessage = parsed.error;
      }
    } catch {
      // use default message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  const lines = text.trim().split("\n").filter(Boolean);

  const rows: Record<string, unknown>[] = [];
  let columns: string[] = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as Record<string, unknown>;
      if (obj && typeof obj === "object" && "error" in obj) {
        throw new Error((obj.error as string) || "Explorer error");
      }
      rows.push(obj);
      if (columns.length === 0 && Object.keys(obj).length > 0) {
        columns = Object.keys(obj);
      }
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message === "Explorer error") {
        throw parseErr;
      }
      // skip malformed lines or continue
    }
  }

  return { rows, columns };
}
