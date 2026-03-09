"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, subDays } from "date-fns";
import {
  LayoutGrid,
  LayoutList,
  RefreshCw,
  Search,
  Terminal,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ActionStatusBadge,
  DataTable,
  LogsSkeleton,
  PageHeader,
} from "@/components/shared";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivityLogs } from "@/lib/api/hooks/use-activity-logs";
import type { ActivityLog } from "@/lib/api/types/activity-logs";
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

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "in_progress", label: "In Progress" },
] as const;

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
] as const;

function getStatusFromActionType(actionType: string): "success" | "failed" | "in_progress" | "info" {
  if (
    actionType.includes("FAILED") ||
    actionType.includes("DELETED") ||
    actionType.includes("REMOVED")
  ) {
    return "failed";
  }
  if (
    actionType.includes("SUCCEEDED") ||
    actionType.includes("COMPLETED") ||
    actionType.includes("CREATED") ||
    actionType.includes("CONNECTED")
  ) {
    return "success";
  }
  if (
    actionType.includes("STARTED") ||
    actionType.includes("RUN_STARTED") ||
    actionType.includes("UPDATED")
  ) {
    return "in_progress";
  }
  return "info";
}

export default function ActivityLogPage() {
  const { currentOrganization } = useWorkspaceStore();
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const organizationId = currentOrganization?.id;

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
      limit: 50,
      cursor,
    },
    { enabled: !!organizationId },
  );

  const logs = response?.logs ?? [];

  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
    setSelectedActionType("all");
    setCursor(undefined);
  };

  const handleActionTypeChange = (value: string) => {
    setSelectedActionType(value);
    setCursor(undefined);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCursor(undefined);
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setCursor(undefined);
  };

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

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    let filtered = logs;

    if (selectedActionType !== "all") {
      filtered = filtered.filter((log) =>
        log.actionType.includes(selectedActionType),
      );
    }

    if (startDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate >= new Date(startDate);
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((log) => {
        const status = getStatusFromActionType(log.actionType);
        if (selectedStatus === "success") return status === "success";
        if (selectedStatus === "failed") return status === "failed";
        if (selectedStatus === "in_progress") return status === "in_progress";
        return true;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query) ||
          log.actionType.toLowerCase().includes(query) ||
          (log.metadata &&
            JSON.stringify(log.metadata).toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [logs, selectedActionType, searchQuery, selectedStatus, startDate]);

  const columns: ColumnDef<ActivityLog>[] = useMemo(
    () => [
      {
        id: "no",
        header: "NO",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
          <span className="text-sm">
            {format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm:ss")}
          </span>
        ),
      },
      {
        accessorKey: "entityType",
        header: "Entity Type",
        cell: ({ row }) => (
          <span className="font-medium capitalize">
            {row.original.entityType}
          </span>
        ),
      },
      {
        accessorKey: "actionType",
        header: "Action Type",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.actionType}</span>
        ),
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground max-w-[300px] truncate block">
            {row.original.message}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <ActionStatusBadge actionType={row.original.actionType} />
        ),
      },
      {
        accessorKey: "metadata",
        header: "Metadata",
        cell: ({ row }) => {
          const meta = row.original.metadata;
          if (!meta || Object.keys(meta).length === 0) return <span>-</span>;
          return (
            <span className="text-xs text-muted-foreground max-w-[150px] truncate block">
              {JSON.stringify(meta).slice(0, 50)}...
            </span>
          );
        },
      },
    ],
    [],
  );

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
        <PageHeader
          title="Activity Logs"
          description="Track all activity across your data pipelines, data sources, and organization"
        />

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

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Activity Logs</h2>
              <p className="text-sm text-muted-foreground">
                All activity across your data pipelines, data sources, and
                organization
              </p>
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "table" | "cards")}
            >
              <TabsList>
                <TabsTrigger value="table" className="gap-2">
                  <LayoutList className="h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by message, entity, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedActionType} onValueChange={handleActionTypeChange}>
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] cursor-pointer">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[140px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
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
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {error ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-destructive">
                  <p className="font-medium">Failed to load activity logs</p>
                  <p className="text-sm mt-2">
                    {error instanceof Error
                      ? error.message.includes("UUID")
                        ? "Invalid organization ID. Please select an organization."
                        : error.message
                      : "Unknown error occurred"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="mt-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "table" ? (
            <DataTable
              tableId="activity-logs-table"
              columns={columns}
              data={filteredLogs}
              enableSorting
              enableFiltering={false}
              hideTopControls
              defaultVisibleColumns={[
                "no",
                "createdAt",
                "entityType",
                "actionType",
                "message",
                "status",
                "metadata",
              ]}
              emptyMessage="No logs found"
              emptyDescription="Activity logs will appear here as you create pipelines, connect data sources, and perform other actions."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLogs.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="font-medium">No logs found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Activity logs will appear here as you perform actions.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredLogs.map((log) => (
                  <Card key={log.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <ActionStatusBadge actionType={log.actionType} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          {log.entityType} · {log.actionType}
                        </p>
                        <p className="text-sm font-medium mt-1 line-clamp-2">
                          {log.message}
                        </p>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
