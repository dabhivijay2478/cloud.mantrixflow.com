"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Clock className="h-4 w-4 animate-pulse text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function RunHistoryDrawer() {
  const pipelineId = usePipelineBuilderStore((s) => s.pipelineId);
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const openDrawer = usePipelineBuilderStore((s) => s.openDrawer);
  const useMockData = usePipelineBuilderStore((s) => s.useMockData);
  const runHistory = usePipelineBuilderStore((s) => s.runHistory);
  const organizationId = pipeline?.pipeline.organizationId;

  const { data: apiRuns } = usePipelineRuns(
    useMockData ? undefined : organizationId ?? undefined,
    useMockData ? undefined : pipelineId ?? undefined,
    20,
  );

  const runs = useMockData ? runHistory : apiRuns;

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
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4">
        <SheetTitle>Run History</SheetTitle>
      </SheetHeader>

      {!runs || runs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No runs yet. Click "Run" to execute the pipeline.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mx-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead />
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
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <RunStatusIcon run={run} />
                        <span className="capitalize text-sm">{d.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatRelativeTime(d.startedAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.durationSeconds != null ? `${d.durationSeconds}s` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.rowsWritten?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {d.triggerType}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
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
    </div>
  );
}
