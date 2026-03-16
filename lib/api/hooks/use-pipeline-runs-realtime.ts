"use client";

/**
 * Supabase Realtime subscription for pipeline runs.
 * Updates TanStack Query cache when run status changes.
 * Use on pipeline detail page for live run status.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { dataPipelinesKeys } from "./use-data-pipelines";

export function usePipelineRunsRealtime(
  organizationId: string | undefined,
  pipelineId: string | undefined,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId || !pipelineId) return;

    const channel = supabase
      .channel(`pipeline-runs-${pipelineId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pipeline_runs",
          filter: `pipeline_id=eq.${pipelineId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; status?: string; [k: string]: unknown };
          queryClient.invalidateQueries({
            queryKey: dataPipelinesKeys.runs(organizationId, pipelineId),
          });
          queryClient.invalidateQueries({
            queryKey: dataPipelinesKeys.pipelines.detail(organizationId, pipelineId),
          });
          queryClient.invalidateQueries({
            queryKey: dataPipelinesKeys.pipelines.lists(),
          });
          if (updated.id) {
            queryClient.invalidateQueries({
              queryKey: dataPipelinesKeys.run(organizationId, pipelineId, updated.id),
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, pipelineId, queryClient]);
}
