/**
 * Execute SQL against the remote database (like Snowflake/Redshift editors).
 * Supports JOINs, subqueries, and full SQL - runs on the server.
 */

import { getApiUrl } from "@/lib/api/config";
import { createFetchOptions } from "@/lib/api/config";

export interface ExecuteRemoteQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

export async function executeRemoteQuery(
  orgId: string,
  dataSourceId: string,
  query: string,
  maxRows = 10000,
  timeoutMs = 60000,
): Promise<ExecuteRemoteQueryResult> {
  const url = getApiUrl(
    `api/organizations/${orgId}/data-sources/${dataSourceId}/explorer/execute-query`,
  );

  const fetchOptions = await createFetchOptions({
    method: "POST",
    body: JSON.stringify({
      query: query.trim(),
      maxRows,
      timeoutMs,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      errorMessage = parsed.message ?? parsed.error ?? errorMessage;
    } catch {
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  const result = (await response.json()) as ExecuteRemoteQueryResult;
  if (!result?.columns || !Array.isArray(result.rows)) {
    throw new Error("Invalid response format from execute-query");
  }
  return result;
}
