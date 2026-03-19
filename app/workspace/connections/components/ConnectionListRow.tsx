"use client";

import {
  Database,
  MoreHorizontal,
  Check,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { ConnectionDisplay } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ConnectionListRowProps {
  connection: ConnectionDisplay;
  onClick: () => void;
  isSelected?: boolean;
  onTest?: () => void;
  onDiscover?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function StatusIcon({
  result,
  lastTestTime,
}: {
  result: ConnectionDisplay["lastTestResult"];
  lastTestTime?: string;
}) {
  if (result === "success") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <Check className="size-3.5 shrink-0 text-green-500" />
        Tested {lastTestTime ?? "recently"} ✓
      </span>
    );
  }
  if (result === "never") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
        Never tested ⚠
      </span>
    );
  }
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
      <XCircle className="size-3.5 shrink-0 text-destructive" />
      Last test failed ✗
    </span>
  );
}

export function ConnectionListRow({
  connection,
  onClick,
  isSelected,
  onTest,
  onDiscover,
  onDisconnect,
  onReconnect,
  onEdit,
  onDelete,
}: ConnectionListRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30",
        isSelected && "border-primary/50 ring-2 ring-primary/20",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Database className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{connection.name}</span>
          <Badge
            variant="outline"
            className="text-xs uppercase"
          >
            {connection.role === "source" ? "SOURCE" : "DEST"}
          </Badge>
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              connection.status === "active"
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                connection.status === "active" ? "bg-green-500" : "bg-muted-foreground",
              )}
            />
            {connection.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {connection.type} · {connection.hostSummary}
        </p>
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
          Used in {connection.pipelineCount} pipeline
          {connection.pipelineCount !== 1 ? "s" : ""} ·{" "}
          <StatusIcon
            result={connection.lastTestResult}
            lastTestTime={connection.lastTestTime}
          />
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTest?.(); }}>
            Test Connection
          </DropdownMenuItem>
          {connection.role === "source" && onDiscover && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDiscover(); }}>
              Discover Tables
            </DropdownMenuItem>
          )}
          {onDisconnect && (
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDisconnect(); }}
              disabled={connection.status !== "active"}
            >
              Disconnect
            </DropdownMenuItem>
          )}
          {onReconnect && (
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onReconnect(); }}
              disabled={connection.status !== "inactive"}
            >
              Reconnect
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
