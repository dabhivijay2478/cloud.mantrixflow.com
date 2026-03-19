"use client";

import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePipelineRuns } from "@/lib/api/hooks/use-data-pipelines";
import type { PipelineRun } from "@/lib/api/types/data-pipelines";
import type { MockRun } from "../store/pipelineStore";
import { usePipelineBuilderStore } from "../store/pipelineStore";

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return date.toLocaleDateString();
}

function RunStatusIcon({ run }: { run: { status: string } }) {
  switch (run.status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "failed":
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "running":
      return <Clock className="h-4 w-4 animate-pulse text-blue-600" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function RunHistoryPanel() {
  const [expanded, setExpanded] = useState(false);
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const runHistory = usePipelineBuilderStore((s) => s.runHistory);
  const organizationId = pipeline?.pipeline.organizationId;

  const { data: apiRuns } = usePipelineRuns(
    useMockData ? undefined : organizationId ?? undefined,
    useMockData ? undefined : pipelineId ?? undefined,
    10,
  );

  const runs = useMockData ? runHistory : apiRuns;
  const lastRun = runs?.[0];

  const getRunDisplay = (run: PipelineRun | MockRun) => {
    if ("created_at" in run) {
      return {
        id: run.id,
        status: run.status,
        startedAt: run.created_at,
        durationSeconds: run.duration_seconds,
        rowsWritten: run.rows_written,
        triggerType: run.triggered_by,
      };
    }
    return {
      id: run.id,
      status: run.status,
      startedAt: run.startedAt ?? "",
      durationSeconds: run.durationSeconds,
      rowsWritten: run.rowsWritten,
      triggerType: run.triggerType ?? "manual",
    };
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium hover:bg-muted/50"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span>
          Run History
          {lastRun && (() => {
            const d = getRunDisplay(lastRun);
            return (
              <span className="ml-2 text-muted-foreground font-normal">
                · Last run: {d.status === "success" && "✓"}
                {d.status === "failed" && "✗"} {formatRelativeTime(d.startedAt)}
                {d.rowsWritten != null && ` · ${d.rowsWritten.toLocaleString()} rows`}
              </span>
            );
          })()}
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>
      {expanded && runs && runs.length > 0 && (
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const d = getRunDisplay(run);
                return (
                <TableRow
                  key={run.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openDrawer("run_details", null, null, run.id)}
                >
                  <TableCell className="font-mono text-xs">
                    {run.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{formatRelativeTime(d.startedAt)}</TableCell>
                  <TableCell>
                    {d.durationSeconds != null
                      ? `${d.durationSeconds}s`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <RunStatusIcon run={run} />
                      <span className="capitalize">{d.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{d.triggerType}</TableCell>
                  <TableCell>
                    {d.rowsWritten?.toLocaleString() ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {expanded && (!runs || runs.length === 0) && (
        <div className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
          No runs yet. Click "Run Now" to execute the pipeline.
        </div>
      )}
    </div>
  );
}
