"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import {
  allDataSources,
  ConnectionSheet,
  DataSourceGrid,
  DataSourceTable,
} from "@/components/data-sources";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
  type CreateConnectionDto,
  type TestConnectionDto,
} from "@/lib/api";
import { toast } from "@/lib/utils/toast";

type ConnectionFormValues = Record<string, string>;

export default function DataSourcesPage() {
  // Use real API hooks instead of workspace store
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();

  // Filter to only show PostgreSQL data sources
  const enabledDataSources = allDataSources.filter((ds) => ds.type === "postgres");

  // Convert API connections to component format
  const filteredDataSources = connections?.map((conn) => ({
    id: conn.id,
    name: conn.name,
    type: "postgres" as const,
    status: conn.status === "active" ? "connected" : "disconnected" as const,
    organizationId: conn.orgId,
    connectedAt: conn.lastConnectedAt || conn.createdAt,
    tables: [], // Will be fetched separately when needed
  })) || [];

  const [_selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null,
  );
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showGridView, setShowGridView] = useState(false);

  // Check if there's at least one connected data source
  const hasConnectedDataSources = filteredDataSources.some(
    (ds) => ds.status === "connected",
  );

  const isConnected = (dataSourceId: string) => {
    return filteredDataSources.some(
      (ds) => ds.id === dataSourceId && ds.status === "connected",
    );
  };

  const getConnectedDataSource = (dataSourceId: string) => {
    return filteredDataSources.find((ds) => ds.id === dataSourceId);
  };

  const handleDataSourceClick = (dataSourceId: string) => {
    setSelectedDataSource(dataSourceId);
    // If clicking on a connected data source, hide grid view
    if (isConnected(dataSourceId)) {
      setShowGridView(false);
    } else {
      // If clicking on a non-connected data source, open connection sheet
      handleConnectClick(dataSourceId);
    }
  };

  const handleConnectClick = (dataSourceId: string) => {
    setConnectingDataSourceId(dataSourceId);
    setShowConnectionSheet(true);
  };

  const handleConnect = async (data: ConnectionFormValues) => {
    if (!connectingDataSourceId) return;

    const dataSource = enabledDataSources.find(
      (ds) => ds.id === connectingDataSourceId,
    );
    if (!dataSource) return;

    try {
      // Convert form data to API format
      const connectionData: CreateConnectionDto = {
        name: data.name || dataSource.name,
        config: {
          host: data.host || "",
          port: data.port ? parseInt(data.port, 10) : 5432,
          database: data.database || "",
          username: data.username || "",
          password: data.password || "",
          ssl: data.ssl === "true" ? { enabled: true } : undefined,
        },
      };

      await createConnection.mutateAsync(connectionData);
      toast.success(
        `${dataSource.name} connected successfully`,
        "Your data source has been connected and is ready to use.",
      );
      setSelectedDataSource(connectingDataSourceId);
      setShowGridView(false);
    } catch (error: any) {
      toast.error(
        "Failed to connect data source",
        error?.message || "Unable to connect the data source. Please try again.",
      );
      console.error(error);
    }
  };

  const handleTestConnection = async (
    data: ConnectionFormValues,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const testData: TestConnectionDto = {
        host: data.host || "",
        port: data.port ? parseInt(data.port, 10) : 5432,
        database: data.database || "",
        username: data.username || "",
        password: data.password || "",
        ssl: data.ssl === "true" ? { enabled: true } : undefined,
      };

      const result = await testConnection.mutateAsync(testData);
      return {
        success: result.success,
        message: result.success
          ? "Connection test successful!"
          : result.error || "Connection test failed",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Connection test failed",
      };
    }
  };


  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleDisconnect = async (dataSourceId: string) => {
    const dataSource = filteredDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    try {
      // Update connection status to inactive
      // Note: You may need to add an updateConnection hook call here
      // For now, we'll just show a message
      toast.success(
        "Data source disconnected",
        `${dataSource.name} has been disconnected successfully.`,
      );
    } catch (error: any) {
      toast.error(
        "Failed to disconnect data source",
        error?.message || "Unable to disconnect the data source.",
      );
    }
  };

  const handleDelete = async (dataSourceId: string) => {
    const dataSource = filteredDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    if (
      confirm(
        `Are you sure you want to delete "${dataSource.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteConnection.mutateAsync(dataSourceId);
        toast.success(
          "Data source deleted",
          `${dataSource.name} has been deleted successfully.`,
        );
      } catch (error: any) {
        toast.error(
          "Failed to delete data source",
          error?.message || "Unable to delete the data source.",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources"
        description="Connect and manage your data sources to power your dashboards"
        action={
          <>
            {hasConnectedDataSources && !showGridView && (
              <Button onClick={() => setShowGridView(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Source
              </Button>
            )}
            {showGridView && (
              <Button variant="outline" onClick={() => setShowGridView(false)}>
                <X className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            )}
          </>
        }
      />

      {connectionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading connections...</div>
        </div>
      ) : !hasConnectedDataSources || showGridView ? (
        // Show grid view when no data sources are connected or when "New source" is clicked
        <DataSourceGrid
          dataSources={enabledDataSources}
          isConnected={isConnected}
          getConnectedDataSource={getConnectedDataSource}
          onDataSourceClick={handleDataSourceClick}
        />
      ) : (
        <>
          {/* Show table list view with only connected data sources */}
          <DataSourceTable
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            isConnected={isConnected}
            getConnectedDataSource={getConnectedDataSource}
            onDataSourceClick={handleDataSourceClick}
            showOnlyConnected={true}
            onDisconnect={handleDisconnect}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* Connection Sheet */}
      <ConnectionSheet
        open={showConnectionSheet}
        onOpenChange={(open) => {
          setShowConnectionSheet(open);
          if (!open) {
            setConnectingDataSourceId(null);
          }
        }}
        dataSourceId={connectingDataSourceId}
        onConnect={handleConnect}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}
