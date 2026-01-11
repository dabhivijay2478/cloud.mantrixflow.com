"use client";

import { format, subDays } from "date-fns";
import { RefreshCw, Search, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { LogsSkeleton, PageHeader } from "@/components/shared";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Action Type options (grouped by category)
const ACTION_TYPE_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "CREATED", label: "Created" },
  { value: "UPDATED", label: "Updated" },
  { value: "DELETED", label: "Deleted" },
  { value: "STARTED", label: "Started" },
  { value: "COMPLETED", label: "Completed" },
  { value: "SUCCEEDED", label: "Succeeded" },
  { value: "FAILED", label: "Failed" },
  { value: "INVITED", label: "Invited" },
  { value: "CONNECTED", label: "Connected" },
  { value: "RUN_STARTED", label: "Run Started" },
  { value: "RUN_SUCCEEDED", label: "Run Succeeded" },
  { value: "RUN_FAILED", label: "Run Failed" },
] as const;

// Status options based on action type
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "in_progress", label: "In Progress" },
] as const;

// Time range options
const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
] as const;

function getLogColor(actionType: string): string {
  // Return color class based on action type using project's design system
  if (
    actionType.includes("FAILED") ||
    actionType.includes("DELETED") ||
    actionType.includes("REMOVED") ||
    actionType.includes("ERROR")
  ) {
    return "text-destructive"; // Red for errors/failures
  }
  if (
    actionType.includes("SUCCEEDED") ||
    actionType.includes("COMPLETED") ||
    actionType.includes("CREATED")
  ) {
    return "text-green-600 dark:text-green-400"; // Green for success
  }
  if (
    actionType.includes("STARTED") ||
    actionType.includes("UPDATED") ||
    actionType.includes("WARNING")
  ) {
    return "text-yellow-600 dark:text-yellow-400"; // Yellow for warnings/in-progress
  }
  return "text-cyan-600 dark:text-cyan-400"; // Cyan/teal for info
}

function formatLogMessage(log: {
  actionType: string;
  entityType: string;
  message: string;
  metadata: Record<string, unknown> | null;
}): string {
  let fullMessage = log.message;

  if (log.metadata && Object.keys(log.metadata).length > 0) {
    const metadataStr = JSON.stringify(log.metadata, null, 2);
    fullMessage += ` | Metadata: ${metadataStr}`;
  }

  return fullMessage;
}

export default function ActivityLogPage() {
  const { currentOrganization } = useWorkspaceStore();
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const organizationId = currentOrganization?.id;

  // Calculate start date based on time range
  const startDate = useMemo(() => {
    if (selectedTimeRange === "all") return undefined;
    const days =
      selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
    return subDays(new Date(), days).toISOString();
  }, [selectedTimeRange]);

  const {
    data: response,
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
      // Note: actionType filter is done client-side for better flexibility
      limit: 50,
      cursor,
    },
    {
      enabled: !!organizationId, // Only fetch if organizationId exists
    },
  );

  const logs = response?.logs ?? [];
  const nextCursor = response?.pagination?.nextCursor;

  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    setSelectedActionType("all"); // Reset action type when entity changes
    setCursor(undefined); // Reset cursor when filter changes
  };

  const handleActionTypeChange = (value: string) => {
    setSelectedActionType(value);
    setCursor(undefined); // Reset cursor when filter changes
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCursor(undefined); // Reset cursor when filter changes
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setCursor(undefined); // Reset cursor when filter changes
  };

  const _handleLoadMore = () => {
    // Use nextCursor from API response instead of constructing from last log
    // This ensures we use the correct cursor format (encoded with createdAt + id)
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  // Calculate metrics from all logs (not filtered) to show overall stats
  const metrics = useMemo(() => {
    if (!logs) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        created: 0,
        updated: 0,
        deleted: 0,
      };
    }

    return {
      total: logs.length,
      success: logs.filter(
        (log) =>
          log.actionType.includes("SUCCEEDED") ||
          log.actionType.includes("COMPLETED") ||
          log.actionType.includes("CREATED") ||
          log.actionType.includes("CONNECTED"),
      ).length,
      failed: logs.filter(
        (log) =>
          log.actionType.includes("FAILED") ||
          log.actionType.includes("DELETED") ||
          log.actionType.includes("REMOVED"),
      ).length,
      created: logs.filter((log) => log.actionType.includes("CREATED")).length,
      updated: logs.filter((log) => log.actionType.includes("UPDATED")).length,
      deleted: logs.filter(
        (log) =>
          log.actionType.includes("DELETED") ||
          log.actionType.includes("REMOVED"),
      ).length,
    };
  }, [logs]);

  // Filter logs based on action type, status, date, and search filters (client-side)
  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    let filtered = logs;

    // Action type filter (client-side for partial matching)
    if (selectedActionType !== "all") {
      filtered = filtered.filter((log) => {
        return log.actionType.includes(selectedActionType);
      });
    }

    // Date filter (client-side)
    if (startDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.createdAt);
        const start = new Date(startDate);
        return logDate >= start;
      });
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((log) => {
        if (selectedStatus === "success") {
          return (
            log.actionType.includes("SUCCEEDED") ||
            log.actionType.includes("COMPLETED") ||
            log.actionType.includes("CREATED") ||
            log.actionType.includes("CONNECTED")
          );
        } else if (selectedStatus === "failed") {
          return (
            log.actionType.includes("FAILED") ||
            log.actionType.includes("DELETED") ||
            log.actionType.includes("REMOVED")
          );
        } else if (selectedStatus === "in_progress") {
          return (
            log.actionType.includes("STARTED") ||
            log.actionType.includes("RUN_STARTED") ||
            log.actionType.includes("UPDATED")
          );
        }
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) => {
        return (
          log.message.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query) ||
          log.actionType.toLowerCase().includes(query) ||
          (log.metadata &&
            JSON.stringify(log.metadata).toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [logs, selectedActionType, searchQuery, selectedStatus, startDate]);

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Terminal className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground font-mono">
                  $ Please select an organization to view activity logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show skeleton during loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LogsSkeleton columnCount={6} rowCount={10} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Activity Logs"
          description="Track all activity across your data pipelines, data sources, and organization"
        />

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Total"
            value={metrics.total}
            indicatorColor="bg-muted-foreground"
          />
          <MetricCard
            label="Success"
            value={metrics.success}
            indicatorColor="bg-green-500"
            valueColor="text-green-500"
          />
          <MetricCard
            label="Failed"
            value={metrics.failed}
            indicatorColor="bg-red-500"
            valueColor="text-red-500"
          />
          <MetricCard
            label="Created"
            value={metrics.created}
            indicatorColor="bg-blue-500"
            valueColor="text-blue-500"
          />
          <MetricCard
            label="Updated"
            value={metrics.updated}
            indicatorColor="bg-yellow-500"
            valueColor="text-yellow-500"
          />
          <MetricCard
            label="Deleted"
            value={metrics.deleted}
            indicatorColor="bg-orange-500"
            valueColor="text-orange-500"
          />
        </div>

        {/* Request Logs Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Activity Logs</h2>
            <p className="text-sm text-muted-foreground">
              All activity across your data pipelines, data sources, and
              organization
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by message, entity, or action.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-mono text-sm"
              />
            </div>

            <Select
              value={selectedEntityType}
              onValueChange={handleEntityTypeChange}
            >
              <SelectTrigger className="w-[160px] font-mono text-sm cursor-pointer ">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedActionType}
              onValueChange={handleActionTypeChange}
            >
              <SelectTrigger className="w-[160px] font-mono text-sm cursor-pointer">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] font-mono text-sm cursor-pointer">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTimeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-[140px] font-mono text-sm cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCursor(undefined);
                refetch();
              }}
              className="font-mono cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Terminal Log Output */}
          <Card className="bg-card border">
            <CardContent className="p-0">
              <div className="bg-background p-4 font-mono text-sm overflow-x-auto min-h-[400px] max-h-[600px] overflow-y-auto">
                {error ? (
                  <div className="text-destructive">
                    <div className="mb-2">
                      [ERROR] Failed to load activity logs
                    </div>
                    <div className="text-sm text-destructive/70 mb-4">
                      {error instanceof Error
                        ? error.message.includes("UUID")
                          ? "Invalid organization ID. Please select an organization."
                          : error.message
                        : "Unknown error occurred"}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                ) : !filteredLogs || filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-muted-foreground mb-4">
                      <Terminal className="h-16 w-16 mx-auto" />
                    </div>
                    <div className="text-muted-foreground font-mono text-lg mb-2">
                      [INFO] No logs found
                    </div>
                    <div className="text-muted-foreground/70 font-mono text-sm max-w-md">
                      Activity logs will appear here as you create pipelines,
                      connect data sources, run migrations, and perform other
                      actions in your organization.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredLogs.map((log) => {
                      const createdAt = new Date(log.createdAt);
                      const timeStr = format(createdAt, "HH:mm:ss");
                      const entityTypeUpper = log.entityType.toUpperCase();
                      const logColor = getLogColor(log.actionType);
                      const logMessage = formatLogMessage(log);

                      return (
                        <div
                          key={log.id}
                          className="hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-default"
                        >
                          <span className="text-muted-foreground">
                            [{timeStr}]
                          </span>{" "}
                          <span className="text-secondary">
                            [{entityTypeUpper}]
                          </span>{" "}
                          <span className={logColor}>{logMessage}</span>
                        </div>
                      );
                    })}
                    {/* {nextCursor && (
                      <div className="pt-4 mt-4 border-t border-border flex justify-center">
                        <Button
                          variant="ghost"
                          onClick={handleLoadMore}
                          className="font-mono"
                          disabled={!nextCursor}
                        >
                          [LOAD MORE]
                        </Button>
                      </div>
                    )} */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
