"use client";

import {
  ArrowRight,
  Database,
  MoreVertical,
  Pause,
  Play,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SyncModeBadge } from "@/components/pipeline/SyncModeBadge";
import type { Pipeline } from "@/lib/api/types/data-pipelines";
import { cn } from "@/lib/utils";

interface PipelineCardProps {
  pipeline: Pipeline;
  onRun: (id: string, name: string) => void;
  onPause: (id: string, name: string) => void;
  onResume: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  isActionLoading?: boolean;
}

function StatusDot({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  if (s === "running" || s === "pending" || s === "initializing" || s === "listening") {
    return <span className="size-2 rounded-full bg-blue-500 animate-pulse" />;
  }
  if (s === "paused") {
    return <span className="size-2 rounded-full bg-amber-500" />;
  }
  return <span className="size-2 rounded-full bg-zinc-500" />;
}

export function PipelineCard({
  pipeline,
  onRun,
  onPause,
  onResume,
  onDelete,
  isActionLoading,
}: PipelineCardProps) {
  const router = useRouter();
  const source = pipeline.sourceSchema;
  const dest = pipeline.destinationSchema;
  const isPaused = pipeline.status === "paused";
  const isRunning =
    pipeline.status === "running" ||
    pipeline.status === "initializing" ||
    pipeline.status === "listening";

  const sourceLabel = source
    ? `${source.sourceType} (${source.sourceSchema || "public"}.${source.sourceTable || "?"})`
    : "No source";
  const destLabel = dest
    ? `${dest.destinationSchema || "public"}.${dest.destinationTable || "?"}`
    : "No destination";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/workspace/data-pipelines/${pipeline.id}/builder`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/workspace/data-pipelines/${pipeline.id}/builder`);
        }
      }}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-zinc-800/90 p-4 shadow-lg",
        "cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-xl",
        "border-zinc-700",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{pipeline.name}</h3>
          {pipeline.description && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {pipeline.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-70 hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workspace/data-pipelines/${pipeline.id}/builder`);
              }}
            >
              Open Builder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workspace/data-pipelines/${pipeline.id}`);
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isPaused ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onResume(pipeline.id, pipeline.name);
                }}
                disabled={isActionLoading}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRun(pipeline.id, pipeline.name);
                }}
                disabled={isActionLoading || isRunning}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Now
              </DropdownMenuItem>
            )}
            {isRunning && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPause(pipeline.id, pipeline.name);
                }}
                disabled={isActionLoading}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workspace/data-pipelines/${pipeline.id}/edit`);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pipeline.id, pipeline.name);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Flow: Source → Destination */}
      <div className="flex items-center gap-2 rounded-md bg-zinc-900/80 p-3 border border-zinc-700/80">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded bg-blue-500/20">
            <Database className="h-4 w-4 text-blue-400" />
          </div>
          <span className="truncate text-sm text-zinc-300">{sourceLabel}</span>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded bg-emerald-500/20">
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="truncate text-sm text-zinc-300">{destLabel}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <StatusDot status={pipeline.status} />
          <span className="text-xs font-medium uppercase text-zinc-400">
            {pipeline.status === "paused"
              ? "Paused"
              : pipeline.status === "running" ||
                  pipeline.status === "initializing" ||
                  pipeline.status === "listening"
                ? "Running"
                : "Idle"}
          </span>
        </div>
        <SyncModeBadge mode={pipeline.syncMode ?? "full"} />
        {pipeline.totalRowsProcessed != null && pipeline.totalRowsProcessed > 0 && (
          <span className="text-xs text-zinc-500">
            {pipeline.totalRowsProcessed.toLocaleString()} rows
          </span>
        )}
      </div>
    </div>
  );
}
