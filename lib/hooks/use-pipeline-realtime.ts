"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export interface PipelineRunUpdate {
  id: string;
  pipeline_id: string;
  organization_id: string;
  status?: string;
  job_state?: string;
  rows_read?: number;
  rows_written?: number;
  rows_failed?: number;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  last_sync_cursor?: string;
  run_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Subscribes to Supabase Realtime for live pipeline run updates.
 * When a run is updated in pipeline_runs, the callback is invoked with the new row.
 *
 * @param organizationId - Filter updates for this organization
 * @param onUpdate - Callback when a run is updated
 */
export function usePipelineRealtime(
  organizationId: string | undefined,
  onUpdate: (run: PipelineRunUpdate) => void,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`pipeline-runs-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pipeline_runs",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          onUpdateRef.current(payload.new as PipelineRunUpdate);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);
}
