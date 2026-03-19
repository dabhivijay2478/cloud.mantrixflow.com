"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dataPipelinesKeys,
  useDeletePipeline,
  usePipelinesPaginated,
} from "@/lib/api/hooks/use-data-pipelines";
import { DataPipelinesService } from "@/lib/api/services/data-pipelines.service";
import type { Pipeline } from "@/lib/api/types/data-pipelines";
import { usePipelineRealtime } from "@/lib/hooks/use-pipeline-realtime";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { MOCK_LIST_PIPELINES } from "./mockListData";

/** Use mock data for list when true; use API when false */
const USE_MOCK_LIST = true;

type FilterTab = "all" | "running" | "failed" | "scheduled";

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
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

function formatCronNext(cron: string | null): string {
  if (!cron) return "—";
  if (cron === "*/30 * * * *") return "30m";
  if (cron === "0 * * * *") return "1h";
  return "scheduled";
}

/** Map API Pipeline to list row format */
function pipelineToListRow(p: Pipeline): {
  id: string;
  name: string;
  source: { connector_type: string; connection_name: string };
  branches: Array<{ label: string; destination: { connector_type: string; connection_name: string } }>;
  status: string;
  last_run_at: string | null;
  cron_schedule: string | null;
} {
  const src = p.sourceSchema;
  const dest = p.destinationSchema;
  const graphBranches = p.pipelineGraph?.branches;
  const branches = graphBranches?.length
    ? graphBranches.map((b) => ({
        label: b.label,
        destination: { connector_type: "postgres", connection_name: b.label },
      }))
    : dest
      ? [
          {
            label: dest.name ?? `${dest.destinationSchema ?? "public"}.${dest.destinationTable ?? "?"}`,
            destination: {
              connector_type: "postgres",
              connection_name: dest.name ?? "Destination",
            },
          },
        ]
      : [];

  const status =
    p.status === "running" || p.status === "initializing" || p.status === "listening"
      ? "running"
      : p.lastRunStatus === "success"
        ? "success"
        : p.lastRunStatus === "failed"
          ? "failed"
          : "idle";

  return {
    id: p.id,
    name: p.name,
    source: {
      connector_type: src?.sourceType ?? "postgres",
      connection_name: src?.name ?? "Source",
    },
    branches,
    status,
    last_run_at: p.lastRunAt ?? null,
    cron_schedule:
      p.scheduleType && p.scheduleType !== "none"
        ? p.scheduleType === "minutes"
          ? `*/${p.scheduleValue ?? "30"} * * * *`
          : "0 * * * *"
        : null,
  };
}

export default function DataPipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [mockPipelines, setMockPipelines] = useState(MOCK_LIST_PIPELINES);

  const { data: paginatedResult, isLoading: pipelinesLoading } = usePipelinesPaginated(
    USE_MOCK_LIST ? undefined : organizationId,
    { pageIndex: 0, pageSize: 50 },
  );
  const apiPipelines = paginatedResult?.data ?? [];
  const deletePipeline = useDeletePipeline(organizationId);

  usePipelineRealtime(USE_MOCK_LIST ? undefined : organizationId ?? undefined, () => {
    queryClient.invalidateQueries({ queryKey: dataPipelinesKeys.pipelines.lists() });
  });

  const listRows = useMemo(() => {
    const raw = USE_MOCK_LIST ? mockPipelines : apiPipelines.map(pipelineToListRow);
    let filtered = raw;

    if (filterTab === "running") {
      filtered = filtered.filter((r) => r.status === "running");
    } else if (filterTab === "failed") {
      filtered = filtered.filter((r) => r.status === "failed");
    } else if (filterTab === "scheduled") {
      filtered = filtered.filter((r) => r.cron_schedule != null);
    }

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
  }, [USE_MOCK_LIST, mockPipelines, apiPipelines, filterTab, search]);

  const runPipelineMutation = useMutation({
    mutationFn: ({ pipelineId }: { pipelineId: string }) => {
      if (!organizationId && !USE_MOCK_LIST) throw new Error("Organization required");
      return DataPipelinesService.runPipeline(organizationId ?? "mock", pipelineId, {});
    },
    onSuccess: (_, variables) => {
      if (USE_MOCK_LIST) {
        setMockPipelines((prev) =>
          prev.map((p) =>
            p.id === variables.pipelineId ? { ...p, status: "running" as const } : p,
          ),
        );
        setTimeout(() => {
          setMockPipelines((prev) =>
            prev.map((p) =>
              p.id === variables.pipelineId ? { ...p, status: "success" as const } : p,
            ),
          );
        }, 3000);
      } else if (organizationId) {
        queryClient.invalidateQueries({ queryKey: dataPipelinesKeys.pipelines.lists() });
      }
    },
  });

  const handleRunPipeline = async (pipelineId: string, pipelineName: string) => {
    try {
      if (USE_MOCK_LIST) {
        setMockPipelines((prev) =>
          prev.map((p) =>
            p.id === pipelineId ? { ...p, status: "running" as const } : p,
          ),
        );
        setTimeout(() => {
          setMockPipelines((prev) =>
            prev.map((p) =>
              p.id === pipelineId ? { ...p, status: "success" as const } : p,
            ),
          );
        }, 3000);
      } else {
        await runPipelineMutation.mutateAsync({ pipelineId });
        toast.success("Pipeline started", `${pipelineName} is now running.`);
      }
    } catch (error) {
      toast.error("Failed to run", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (USE_MOCK_LIST) {
        setMockPipelines((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        await deletePipeline.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
        toast.success("Pipeline deleted", `${deleteTarget.name} has been deleted.`);
      }
    } catch (error) {
      toast.error("Failed to delete", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/workspace/data-pipelines/${id}/builder`);
  };

  const isLoading = pipelinesLoading && !USE_MOCK_LIST;

  return (
    <div className="space-y-6">
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
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filterTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : listRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium">No pipelines yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first pipeline to start moving data from source to destination.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/workspace/data-pipelines/new">Create your first pipeline</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination(s)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {row.source.connection_name}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({row.source.connector_type})
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {row.branches.slice(0, 2).map((b, i) => (
                        <span key={i} className="text-sm">
                          {b.destination.connection_name}
                        </span>
                      ))}
                      {row.branches.length > 2 && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          +{row.branches.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.status === "success" && (
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        ✓ Success
                      </Badge>
                    )}
                    {row.status === "failed" && (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                        ✗ Failed
                      </Badge>
                    )}
                    {row.status === "running" && (
                      <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                        <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-blue-500" />
                        Running
                      </Badge>
                    )}
                    {(row.status === "idle" || !["success", "failed", "running"].includes(row.status)) && (
                      <Badge variant="secondary">○ Idle</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(row.last_run_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatCronNext(row.cron_schedule)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRowClick(row.id)}>
                          Open Builder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRunPipeline(row.id, row.name)}
                          disabled={row.status === "running"}
                        >
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(row.id, row.name)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
