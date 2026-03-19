"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  Database,
  GitBranch,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  dataPipelinesKeys,
  useDeletePipeline,
  usePipelinesPaginated,
  useRunPipeline,
} from "@/lib/api/hooks/use-data-pipelines";
import type { Pipeline } from "@/lib/api/types/data-pipelines";
import { usePipelineRealtime } from "@/lib/hooks/use-pipeline-realtime";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

type FilterTab = "all" | "running" | "failed" | "scheduled";

type PipelineRow = {
  id: string;
  name: string;
  status: "running" | "success" | "failed" | "idle";
  source: { connector_type: string; connection_name: string };
  branches: Array<{ label: string; destination: { connector_type: string; connection_name: string } }>;
  last_run_at: string | null;
  last_run_duration: number | null;
  cron_schedule: string | null;
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatCron(cron: string | null): string {
  if (!cron) return "Manual";
  if (cron === "*/30 * * * *") return "Every 30m";
  if (cron === "0 * * * *") return "Every hour";
  return "Scheduled";
}

function pipelineToRow(p: Pipeline): PipelineRow {
  const src = p.sourceSchema;
  const dest = p.destinationSchema;
  const graphBranches = p.pipelineGraph?.branches;
  const branches = graphBranches?.length
    ? graphBranches.map((b) => ({
        label: b.label,
        destination: { connector_type: "postgres", connection_name: b.label },
      }))
    : dest
      ? [{ label: dest.name ?? "Destination", destination: { connector_type: "postgres", connection_name: dest.name ?? "Destination" } }]
      : [];

  const status =
    p.status === "running" || p.status === "initializing" || p.status === "listening"
      ? ("running" as const)
      : p.lastRunStatus === "success"
        ? ("success" as const)
        : p.lastRunStatus === "failed"
          ? ("failed" as const)
          : ("idle" as const);

  return {
    id: p.id,
    name: p.name,
    source: { connector_type: src?.sourceType ?? "postgres", connection_name: src?.name ?? "Source" },
    branches,
    status,
    last_run_at: p.lastRunAt ?? null,
    last_run_duration: p.totalRowsProcessed ? null : null,
    cron_schedule:
      p.scheduleType && p.scheduleType !== "none"
        ? p.scheduleType === "minutes" ? `*/${p.scheduleValue ?? "30"} * * * *` : "0 * * * *"
        : null,
  };
}

function StatusBadge({ status }: { status: PipelineRow["status"] }) {
  if (status === "running") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1.5">
        <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
        Running
      </Badge>
    );
  }
  if (status === "success") {
    return (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        ✓ Success
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
        ✗ Failed
      </Badge>
    );
  }
  return <Badge variant="secondary">○ Idle</Badge>;
}

interface PipelineCardRowProps {
  row: PipelineRow;
  onOpen: () => void;
  onRun: () => void;
  onDelete: () => void;
  isRunning: boolean;
}

function PipelineCardRow({ row, onOpen, onRun, onDelete, isRunning }: PipelineCardRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="flex cursor-pointer items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Zap className="size-5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold leading-tight">{row.name}</span>
          <StatusBadge status={row.status} />
          {row.cron_schedule && (
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="size-3" />
              {formatCron(row.cron_schedule)}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Database className="size-3.5 shrink-0" />
          <span className="font-medium text-foreground/80">{row.source.connection_name}</span>
          <span className="text-xs text-muted-foreground/60">({row.source.connector_type})</span>
          <ArrowRight className="size-3 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {row.branches.slice(0, 3).map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <GitBranch className="size-3 shrink-0" />
                {b.destination.connection_name}
                {i < Math.min(row.branches.length, 3) - 1 && <span className="text-muted-foreground/40">,</span>}
              </span>
            ))}
            {row.branches.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{row.branches.length - 3} more</Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Last run: {formatRelativeTime(row.last_run_at)}
          {row.last_run_duration ? ` · ${row.last_run_duration}s` : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title="Run now"
          disabled={row.status === "running" || isRunning}
          onClick={(e) => { e.stopPropagation(); onRun(); }}
        >
          {isRunning || row.status === "running" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>Open Builder</DropdownMenuItem>
            <DropdownMenuItem onClick={onRun} disabled={row.status === "running"}>
              Run Now
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function DataPipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());

  const { data: paginatedResult, isLoading } = usePipelinesPaginated(
    organizationId,
    { pageIndex: 0, pageSize: 50 },
  );
  const apiPipelines = paginatedResult?.data ?? [];
  const deletePipeline = useDeletePipeline(organizationId);
  const runPipeline = useRunPipeline(organizationId, undefined);

  usePipelineRealtime(organizationId, () => {
    queryClient.invalidateQueries({ queryKey: dataPipelinesKeys.pipelines.lists() });
  });

  const listRows = useMemo(() => {
    let filtered = apiPipelines.map(pipelineToRow);
    if (filterTab === "running") filtered = filtered.filter((r) => r.status === "running");
    else if (filterTab === "failed") filtered = filtered.filter((r) => r.status === "failed");
    else if (filterTab === "scheduled") filtered = filtered.filter((r) => r.cron_schedule != null);
    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.source.connection_name.toLowerCase().includes(q) ||
          r.branches.some((b) => b.destination.connection_name.toLowerCase().includes(q)),
      );
    }
    return filtered;
  }, [apiPipelines, filterTab, search]);

  const handleRun = async (id: string, name: string) => {
    setRunningIds((s) => new Set([...s, id]));
    try {
      await runPipeline.mutateAsync(undefined, {
        onSettled: () => setRunningIds((s) => { const n = new Set(s); n.delete(id); return n; }),
      } as Parameters<typeof runPipeline.mutateAsync>[1]);
      queryClient.invalidateQueries({ queryKey: dataPipelinesKeys.pipelines.lists() });
      toast.success("Pipeline started", `${name} is now running.`);
    } catch (error) {
      setRunningIds((s) => { const n = new Set(s); n.delete(id); return n; });
      toast.error("Failed to run", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deletePipeline.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Pipeline deleted", `${deleteTarget.name} has been deleted.`);
    } catch (error) {
      toast.error("Failed to delete", error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pipelines"
        description="Manage your data synchronization pipelines."
        action={
          <Button asChild>
            <Link href="/workspace/data-pipelines/new">
              <Plus className="mr-2 h-4 w-4" />
              New Pipeline
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "running", "failed", "scheduled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filterTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : listRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border py-24 text-center">
          <Zap className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium">No pipelines found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || filterTab !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first pipeline to start moving data."}
          </p>
          {!search && filterTab === "all" && (
            <Button className="mt-4" asChild>
              <Link href="/workspace/data-pipelines/new">Create your first pipeline</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {listRows.map((row) => (
            <PipelineCardRow
              key={row.id}
              row={row}
              isRunning={runningIds.has(row.id)}
              onOpen={() => router.push(`/workspace/data-pipelines/${row.id}/builder`)}
              onRun={() => handleRun(row.id, row.name)}
              onDelete={() => setDeleteTarget({ id: row.id, name: row.name })}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        action="delete"
        itemName="Pipeline"
        itemValue={deleteTarget?.name}
        isLoading={deletePipeline.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
