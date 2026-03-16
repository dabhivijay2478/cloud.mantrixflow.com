"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIconComponent } from "@/components/data-sources";
import { getDatabaseById, getAvailabilityBadge } from "@/config/database-registry";
import {
  Check,
  ChevronDown,
  Database,
  MoreVertical,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ConnectionCardData {
  id: string;
  name: string;
  type: string;
  connectorRole: "source" | "destination";
  status: "active" | "inactive" | "error";
  lastConnectedAt?: string;
  createdAt?: string;
  pipelineCount?: number;
  config?: { host?: string; port?: number; database?: string; path?: string };
}

interface ConnectionCardProps {
  connection: ConnectionCardData;
  onTest?: (id: string) => void;
  onDiscover?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSource?: boolean;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ConnectionCard({
  connection,
  onTest,
  onDiscover,
  onEdit,
  onDelete,
  isSource = true,
}: ConnectionCardProps) {
  const registry = getDatabaseById(connection.type);
  const badge = registry
    ? getAvailabilityBadge(registry)
    : { label: "Source & Dest", variant: "default" as const };
  const displayName = registry?.displayName ?? connection.type;
  const icon = registry?.icon ?? "postgres";
  const hostSummary = connection.config?.path
    ? connection.config.path
    : connection.config?.host && connection.config?.database
      ? `${connection.config.host}${connection.config.port ? `:${connection.config.port}` : ""}/${connection.config.database}`
      : "—";

  const lastTestOk = connection.status === "active";
  const lastTestText = formatRelativeTime(connection.lastConnectedAt || connection.createdAt);

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
              {getIconComponent(icon, 24)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{connection.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {displayName} · {hostSummary}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {connection.connectorRole === "source" ? "SOURCE" : "DEST"}
                </Badge>
                <Badge
                  variant={connection.status === "active" ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    connection.status === "active" && "bg-green-600 hover:bg-green-600",
                  )}
                >
                  {connection.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {connection.pipelineCount !== undefined && (
                  <>Used in {connection.pipelineCount} pipeline{connection.pipelineCount !== 1 ? "s" : ""} · </>
                )}
                Last tested {lastTestText}{" "}
                {lastTestOk ? (
                  <Check className="inline h-3 w-3 text-green-600" />
                ) : connection.status === "error" ? (
                  <XCircle className="inline h-3 w-3 text-destructive" />
                ) : null}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onTest && (
                <DropdownMenuItem onClick={() => onTest(connection.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </DropdownMenuItem>
              )}
              {isSource && onDiscover && (
                <DropdownMenuItem onClick={() => onDiscover(connection.id)}>
                  <Database className="mr-2 h-4 w-4" />
                  Discover Tables
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(connection.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(connection.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/workspace/connections/${connection.id}`}>
            <Button variant="outline" size="sm">
              View details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
