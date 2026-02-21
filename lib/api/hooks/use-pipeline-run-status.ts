/**
 * Real-time pipeline run status via Supabase Realtime on etl_jobs table
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type EtlJobStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface PipelineRunStatus {
  id: string;
  pipelineId: string;
  status: EtlJobStatus;
  rowsSynced?: number;
  errorMessage?: string;
  userMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

function rowToStatus(row: Record<string, unknown>): PipelineRunStatus {
  return {
    id: String(row.id),
    pipelineId: String(row.pipeline_id),
    status: (row.status as EtlJobStatus) ?? "pending",
    rowsSynced: row.rows_synced as number | undefined,
    errorMessage: row.error_message as string | undefined,
    userMessage: row.user_message as string | undefined,
    startedAt: row.started_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    createdAt: String(row.created_at),
  };
}

export function usePipelineRunStatus(
  pipelineId: string | null
): PipelineRunStatus | null {
  const [latest, setLatest] = useState<PipelineRunStatus | null>(null);

  const fetchLatest = useCallback(async () => {
    if (!pipelineId) return;
    const { data } = await supabase
      .from("etl_jobs")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setLatest(rowToStatus(data as Record<string, unknown>));
  }, [pipelineId]);

  useEffect(() => {
    if (!pipelineId) return;
    void fetchLatest();

    const channel = supabase
      .channel(`etl_jobs:${pipelineId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "etl_jobs",
          filter: `pipeline_id=eq.${pipelineId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row) setLatest(rowToStatus(row));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipelineId, fetchLatest]);

  return latest;
}
