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

function RunStatusIcon({ status }: { status: string }) {
  switch (status) {
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
  const organizationId = pipeline?.pipeline.organizationId;

  const { data: runs, isLoading } = usePipelineRuns(
    organizationId ?? undefined,
    pipelineId ?? undefined,
    20,
  );

  return (
    <div className="flex flex-col h-full gap-6">
      <SheetHeader>
        <SheetTitle>Run History</SheetTitle>
      </SheetHeader>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Loading runs…
        </div>
      ) : !runs || runs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No runs yet. Click "Run" to execute the pipeline.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 text-xs font-medium">ID</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Started</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Duration</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Rows</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Trigger</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(runs as PipelineRun[]).map((run) => (
                <TableRow
                  key={run.id}
                  className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
                  onClick={() => openDrawer("run_details", null, null, run.id)}
                >
                  <TableCell className="font-mono text-xs text-zinc-400 py-3">
                    {run.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <RunStatusIcon status={run.status} />
                      <span className="capitalize text-sm font-medium">{run.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300 py-3">
                    {formatRelativeTime(run.startedAt ?? run.createdAt ?? "")}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300 py-3">
                    {run.durationSeconds != null ? `${run.durationSeconds}s` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300 py-3 tabular-nums">
                    {run.rowsWritten?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell className="capitalize text-sm text-zinc-300 py-3">
                    {run.triggerType ?? "manual"}
                  </TableCell>
                  <TableCell className="py-3">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400 hover:text-zinc-100">
                      Details →
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
