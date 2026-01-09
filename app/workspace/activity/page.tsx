"use client";

import { formatDistanceToNow } from "date-fns";
import { Filter, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActivityLogs } from "@/lib/api/hooks/use-activity-logs";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

// Entity type options for filtering
const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "organization", label: "Organization" },
  { value: "pipeline", label: "Pipeline" },
  { value: "migration", label: "Migration" },
  { value: "datasource", label: "Data Source" },
  { value: "destination", label: "Destination" },
  { value: "user", label: "User" },
  { value: "mapping", label: "Mapping" },
] as const;

function formatActionType(actionType: string): string {
  // Convert ACTION_TYPE to human-readable format
  return actionType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getActionBadgeVariant(
  actionType: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (
    actionType.includes("FAILED") ||
    actionType.includes("DELETED") ||
    actionType.includes("REMOVED")
  ) {
    return "destructive";
  }
  if (
    actionType.includes("SUCCEEDED") ||
    actionType.includes("COMPLETED") ||
    actionType.includes("CREATED")
  ) {
    return "default";
  }
  if (actionType.includes("STARTED") || actionType.includes("UPDATED")) {
    return "secondary";
  }
  return "outline";
}

export default function ActivityLogPage() {
  const { currentOrganization } = useWorkspaceStore();
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const organizationId = currentOrganization?.id;

  const {
    data: logs,
    isLoading,
    error,
    refetch,
  } = useActivityLogs(
    {
      organizationId: organizationId || "",
      entityType:
        selectedEntityType && selectedEntityType !== "all"
          ? selectedEntityType
          : undefined,
      limit: 50,
      cursor,
    },
    {
      enabled: !!organizationId, // Only fetch if organizationId exists
    },
  );

  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    setCursor(undefined); // Reset cursor when filter changes
  };

  const handleLoadMore = () => {
    if (logs && logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      setCursor(lastLog.id);
    }
  };

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Please select an organization to view activity logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          {currentOrganization?.name
            ? `Activity history for ${currentOrganization.name}`
            : "View all activity logs"}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter activity logs by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="entity-type-select"
                className="text-sm font-medium mb-2 block"
              >
                Entity Type
              </label>
              <Select
                value={selectedEntityType}
                onValueChange={handleEntityTypeChange}
              >
                <SelectTrigger id="entity-type-select">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCursor(undefined);
                  refetch();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                {logs
                  ? `${logs.length} log${logs.length === 1 ? "" : "s"}`
                  : "Loading..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-2">
                Failed to load activity logs
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error
                  ? error.message.includes("UUID")
                    ? "Invalid organization ID. Please select an organization."
                    : error.message
                  : "Unknown error occurred"}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground font-medium">
                No activity logs found for this organization
              </p>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Activity logs will appear here as actions are performed in the
                organization, such as creating pipelines, inviting team members,
                or running migrations.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Time</TableHead>
                      <TableHead className="w-[120px]">Action</TableHead>
                      <TableHead className="w-[100px]">Entity</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const createdAt = new Date(log.createdAt);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex flex-col">
                              <span>
                                {formatDistanceToNow(createdAt, {
                                  addSuffix: true,
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground/70">
                                {createdAt.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getActionBadgeVariant(log.actionType)}
                            >
                              {formatActionType(log.actionType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.entityType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">{log.message}</span>
                              {log.metadata &&
                                Object.keys(log.metadata).length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {JSON.stringify(
                                      log.metadata,
                                      null,
                                      2,
                                    ).slice(0, 100)}
                                    {JSON.stringify(log.metadata).length > 100
                                      ? "..."
                                      : ""}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {logs.length >= 50 && (
                <div className="border-t p-4 flex justify-center">
                  <Button variant="outline" onClick={handleLoadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
