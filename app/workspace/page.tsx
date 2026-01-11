"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  RefreshCw,
  Calendar,
  CalendarClock,
  TrendingUp,
  Users,
  Database,
  Activity,
} from "lucide-react";
import { useMemo } from "react";
import { useDashboardOverview } from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DataTable, PageHeader } from "@/components/shared";

function Gauge({
  value,
  size,
  showValue,
}: {
  value: number;
  size: string;
  showValue: boolean;
}) {
  const sizeClasses = size === "large" ? "w-32 h-32" : "w-24 h-24";
  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center`}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Progress gauge"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgb(229, 231, 235)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - value / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold">{value.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;
  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDashboardOverview(orgId);

  // Column definitions for Recent Migrations table
  // Must be defined before any conditional returns to follow Rules of Hooks
  const migrationColumns: ColumnDef<
    {
      id: string;
      pipelineId: string;
      pipelineName: string;
      status: string;
      startedAt: string | Date | null;
      completedAt: string | Date | null;
      rowsProcessed: number | null;
    }
  >[] = useMemo(
    () => [
      {
        accessorKey: "pipelineName",
        header: "Pipeline",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.pipelineName}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === "completed" || status === "success"
                  ? "default"
                  : status === "failed" || status === "error"
                    ? "destructive"
                    : "secondary"
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.startedAt
              ? new Date(row.original.startedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "rowsProcessed",
        header: () => <div className="text-right">Rows</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-medium text-foreground">
              {row.original.rowsProcessed?.toLocaleString() || "0"}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-[300px] h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">
            Error loading dashboard
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">
            No data available
          </p>
          <p className="text-sm text-muted-foreground">
            Dashboard data could not be loaded
          </p>
        </div>
      </div>
    );
  }

  const { organization, pipelines, recentMigrations, recentActivity } =
    dashboard;

  // Calculate pipeline success rate
  const totalRuns = pipelines.byStatus.completed + pipelines.byStatus.failed;
  const successRate =
    totalRuns > 0
      ? ((pipelines.byStatus.completed / totalRuns) * 100).toFixed(1)
      : "0.0";

  // Get recent migrations for this week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const migrationsThisWeek = recentMigrations.filter((m) => {
    const startedAt = m.startedAt ? new Date(m.startedAt) : null;
    return startedAt && startedAt >= weekAgo;
  });

  // Calculate total rows processed
  const totalRowsProcessed = recentMigrations.reduce(
    (sum, m) => sum + (m.rowsProcessed || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <span>{organization.name} Dashboard</span>
            </div>
          }
          description={`Last updated: ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          }
        />

        {/* Weekly Update */}
        <section className="mb-12">
          <h2 className="text-lg font-medium mb-6 text-foreground">Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-border rounded-lg p-6 bg-card hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Active Pipelines</span>
              </div>
              <div className="text-4xl font-semibold mb-2 text-foreground">
                {pipelines.active}
              </div>
              <div className="text-sm text-muted-foreground">
                {pipelines.total} total pipelines
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Activity className="w-4 h-4 text-purple-500" />
                <span>Migrations This Week</span>
              </div>
              <div className="text-4xl font-semibold mb-2 text-foreground">
                {migrationsThisWeek.length}
              </div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Team Members</span>
              </div>
              <div className="text-4xl font-semibold mb-2 text-foreground">
                {organization.memberCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Active members
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Statistics */}
        <section className="mb-12">
          <h2 className="text-lg font-medium mb-6 text-foreground">
            Pipeline Statistics
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span>Total Pipelines</span>
              </div>
              <div className="text-4xl font-semibold mb-2 text-foreground">
                {pipelines.total}
              </div>
              <div className="text-sm text-muted-foreground">
                {pipelines.active} active, {pipelines.paused} paused
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Success Rate</span>
              </div>
              <div className="text-4xl font-semibold mb-2 text-foreground">
                {successRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                {pipelines.byStatus.completed} completed,{" "}
                {pipelines.byStatus.failed} failed
              </div>
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="mb-12">
          <div className="border border-border rounded-lg p-8 bg-card">
            <div className="border-l-4 border-primary pl-6 mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                Performance Overview
              </h2>
              <p className="text-lg text-muted-foreground mb-1">
                Pipeline execution metrics and statistics
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  <Database className="w-3.5 h-3.5" />
                  Rows Processed
                </div>
                <div className="text-3xl font-semibold mb-4 text-foreground">
                  {totalRowsProcessed.toLocaleString()}
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min((totalRowsProcessed / 1000000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Recent migrations
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Running Pipelines
                </div>
                <div className="text-3xl font-semibold mb-4 text-foreground">
                  {pipelines.byStatus.running}
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${pipelines.total > 0 ? (pipelines.byStatus.running / pipelines.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {pipelines.total > 0
                        ? (
                            (pipelines.byStatus.running / pipelines.total) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                    <span className="text-muted-foreground">
                      of total pipelines
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  Completed Runs
                </div>
                <div className="text-3xl font-semibold mb-4 text-foreground">
                  {pipelines.byStatus.completed}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Successful executions
                  </p>
                </div>
              </div>
            </div>

            {/* Success Rate with Gauge */}
            <div className="border-t border-border pt-8">
              <h3 className="text-base font-medium mb-2 text-foreground">
                Pipeline Success Rate
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                Overall pipeline execution success rate
              </p>
              <div className="flex flex-col items-center">
                <Gauge
                  value={Number.parseFloat(successRate)}
                  size="large"
                  showValue
                />
                <div className="text-center mt-4">
                  <div className="font-medium text-foreground">
                    {pipelines.byStatus.completed} of {totalRuns || 1} runs
                    successful
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Migrations */}
        <section>
          <div className="border border-border rounded-lg p-8 bg-card">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-1 text-foreground">
                Recent Migrations
              </h2>
              <p className="text-sm text-muted-foreground">
                Latest pipeline execution runs
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <div className="border border-border rounded-lg p-5 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10">
                    <Database className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Total Migrations
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {recentMigrations.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-5 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10">
                    <CalendarClock className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      This Week
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {migrationsThisWeek.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-5 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Rows Processed
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totalRowsProcessed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Migrations Table */}
            <div className="border-t border-border pt-6">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Recent Pipeline Runs
              </h4>
              <DataTable
                columns={migrationColumns}
                data={recentMigrations.slice(0, 10)}
                isLoading={false}
                enableSorting
                enableFiltering
                filterPlaceholder="Filter migrations..."
                defaultVisibleColumns={[
                  "pipelineName",
                  "status",
                  "startedAt",
                  "rowsProcessed",
                ]}
                fixedColumns={["pipelineName"]}
                emptyMessage="No recent migrations"
                emptyDescription="Pipeline execution runs will appear here"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
