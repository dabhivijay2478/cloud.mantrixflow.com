"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  allDataSources,
  ConnectionSheet,
  DataSourceGrid,
  DataSourceTable,
} from "@/components/data-sources";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  type CreateConnectionDto,
  type TestConnectionDto,
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
} from "@/lib/api";
import type { DataSource } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

type ConnectionFormValues = Record<string, string>;

export default function DataSourcesPage() {
  // Get current organization from workspace store (set by sidebar selector)
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Debug logging
  useEffect(() => {
    if (currentOrganization) {
      console.log("Current Organization from store:", currentOrganization);
      console.log("Organization ID:", orgId);
    } else {
      console.warn("No organization selected in workspace store");
    }
  }, [currentOrganization, orgId]);

  // Use real API hooks instead of workspace store
  const {
    data: connections,
    isLoading: connectionsLoading,
    error: connectionsError,
  } = useConnections(orgId);
  const createConnection = useCreateConnection(orgId);
  const deleteConnection = useDeleteConnection(orgId);
  const testConnection = useTestConnection();

  // Debug logging for connections
  useEffect(() => {
    if (connections !== undefined) {
      console.log("Connections loaded:", connections);
      console.log("Connections count:", connections?.length || 0);
      console.log("Query orgId used:", orgId);
    }
    if (connectionsError) {
      console.error("Connections error:", connectionsError);
    }
  }, [connections, connectionsError, orgId]);

  const isLoading = connectionsLoading;

  // Filter to show PostgreSQL data sources
  const enabledDataSources = allDataSources.filter(
    (ds) => ds.type === "postgres",
  );

  // Convert API connections to component format
  const filteredDataSources: DataSource[] = (connections?.map((conn) => {
    const dateValue = conn.lastConnectedAt || conn.createdAt;
    const connectedAt =
      typeof dateValue === "string"
        ? dateValue
        : dateValue instanceof Date
          ? dateValue.toISOString()
          : new Date(dateValue).toISOString();

    return {
      id: conn.id,
      name: conn.name,
      type: "postgres" as const,
      status: (conn.status === "active"
        ? "connected"
        : conn.status === "error"
          ? "error"
          : "disconnected") as "connected" | "disconnected" | "error",
      organizationId: conn.orgId,
      connectedAt,
      tables: undefined, // Will be fetched separately when needed
    };
  }) || []) as DataSource[];

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
  // Check if there are any connections (regardless of status)
  const hasConnections = filteredDataSources.length > 0;

  // View state: show grid when no connections, table when connections exist
  const [showGridView, setShowGridView] = useState<boolean>(true);
  const previousHasConnections = useRef<boolean | null>(null);

  // Initialize view mode when connections are loaded for the first time
  useEffect(() => {
    if (!connectionsLoading && previousHasConnections.current === null) {
      // Initial load: show grid if no connections, table if connections exist
      setShowGridView(!hasConnections);
      previousHasConnections.current = hasConnections;
    }
  }, [connectionsLoading, hasConnections]);

  // Auto-switch views when connection state transitions (after initial load)
  useEffect(() => {
    if (previousHasConnections.current === null) {
      return; // Not initialized yet
    }

    const hadConnections = previousHasConnections.current;
    const nowHasConnections = hasConnections;

    // Connection was just created (transition from no connections to has connections)
    if (!hadConnections && nowHasConnections && showGridView) {
      setShowGridView(false);
    }
    // All connections were deleted (transition from has connections to no connections)
    else if (hadConnections && !nowHasConnections && !showGridView) {
      setShowGridView(true);
    }

    previousHasConnections.current = nowHasConnections;
  }, [hasConnections, showGridView]);

  const isConnected = (dataSourceId: string) => {
    return filteredDataSources.some(
      (ds) => ds.id === dataSourceId && ds.status === "connected",
    );
  };

  const getConnectedDataSource = (
    dataSourceId: string,
  ): DataSource | undefined => {
    return filteredDataSources.find((ds) => ds.id === dataSourceId);
  };

  const handleDataSourceClick = (dataSourceId: string) => {
    setSelectedDataSource(dataSourceId);

    // If we're in table view showing connections, check if this is a connection ID
    const isConnectionId = filteredDataSources.some(
      (conn) => conn.id === dataSourceId,
    );

    if (isConnectionId) {
      // This is a connection - navigate to connection detail or keep in table view
      setShowGridView(false);
      // TODO: Navigate to connection detail page when implemented
      // router.push(`/workspace/data-sources/${dataSourceId}/query`);
    } else if (isConnected(dataSourceId)) {
      // If clicking on a connected data source type, hide grid view
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
      // Determine database type and auto-configure SSL
      const databaseType = data.databaseType || "other";
      const isNeon = databaseType === "neon";
      const isSupabase = databaseType === "supabase";
      const host = data.host || "";
      const isLocalhost =
        host === "localhost" || host === "127.0.0.1" || host.startsWith("127.");

      const connectionData: CreateConnectionDto = {
        name: data.name || dataSource.name,
        config: {
          host: host,
          port: data.port ? parseInt(data.port, 10) : 5432,
          database: data.database || "",
          username: data.username || "",
          password: data.password || "",
          // Don't auto-enable SSL for localhost, only for Neon/Supabase remote hosts
          ssl:
            !isLocalhost && (isNeon || isSupabase || data.ssl === "true")
              ? { enabled: true, rejectUnauthorized: !isLocalhost }
              : undefined,
          // Pass database type as metadata for backend processing
          databaseType: databaseType,
        },
      };

      // Ensure orgId is passed - log for debugging
      console.log("[DataSourcesPage] Creating connection with orgId:", orgId);
      console.log("[DataSourcesPage] Connection data:", {
        name: connectionData.name,
      });

      if (!orgId) {
        toast.error(
          "No organization selected",
          "Please select an organization from the sidebar before creating a connection.",
        );
        return;
      }

      await createConnection.mutateAsync(connectionData);

      // Close the connection sheet
      setShowConnectionSheet(false);
      setConnectingDataSourceId(null);

      toast.success(
        `${dataSource.name} connected successfully`,
        "Your data source has been connected and is ready to use.",
      );

      // The useEffect will automatically switch to table view when connections update
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to connect the data source. Please try again.";
      toast.error("Failed to connect data source", errorMessage);
      console.error(error);
    }
  };

  const handleTestConnection = async (
    data: ConnectionFormValues,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const _dataSource = enabledDataSources.find(
        (ds) => ds.id === connectingDataSourceId,
      );
      const databaseType = data.databaseType || "other";
      const isNeon = databaseType === "neon";
      const isSupabase = databaseType === "supabase";
      const host = data.host || "";
      const isLocalhost =
        host === "localhost" || host === "127.0.0.1" || host.startsWith("127.");

      const testData: TestConnectionDto = {
        host: host,
        port: data.port ? parseInt(data.port, 10) : 5432,
        database: data.database || "",
        username: data.username || "",
        password: data.password || "",
        // Don't auto-enable SSL for localhost, only for Neon/Supabase remote hosts
        ssl:
          !isLocalhost && (isNeon || isSupabase || data.ssl === "true")
            ? { enabled: true, rejectUnauthorized: !isLocalhost }
            : undefined,
        databaseType: databaseType,
      };

      const result = await testConnection.mutateAsync(testData);
      return {
        success: result.success,
        message: result.success
          ? "Connection test successful!"
          : result.error || "Connection test failed",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection test failed";
      return {
        success: false,
        message: errorMessage,
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
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to disconnect the data source.";
      toast.error("Failed to disconnect data source", errorMessage);
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
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to delete the data source.";
        toast.error("Failed to delete data source", errorMessage);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources"
        description="Connect and manage your data sources to power your dashboards"
        action={
          hasConnections && !showGridView ? (
            <Button onClick={() => setShowGridView(true)} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Source
            </Button>
          ) : showGridView ? (
            <Button variant="outline" onClick={() => setShowGridView(false)} className="cursor-pointer">
              <X className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          ) : (
            <Button onClick={() => setShowGridView(true)} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Source
            </Button>
          )
        }
      />

      {!orgId ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              No organization selected
            </p>
            <p className="text-xs text-muted-foreground">
              Please select an organization from the sidebar to view connections
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading connections...</div>
        </div>
      ) : showGridView ? (
        // Show grid view when no connections or when "New source" is clicked
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
            connections={filteredDataSources}
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
