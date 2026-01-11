"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  MoreVertical,
  Plus,
  Table as TableIcon,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  allDataSources,
  ConnectionSheet,
  DataSourceGrid,
  getIconComponent,
} from "@/components/data-sources";
import {
  ConfirmationModal,
  DataTable,
  PageHeader,
  PageHeaderSkeleton,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmation } from "@/hooks/use-confirmation";
import {
  type CreateConnectionDto,
  type TestConnectionDto,
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
  useUsers,
} from "@/lib/api";
import type { DataSource } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

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

  // Get all unique user IDs from connections for fetching user names
  const userIds = useMemo(
    () => connections?.map((conn) => conn.userId).filter(Boolean) || [],
    [connections],
  );
  const { usersMap } = useUsers(userIds);

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

  const router = useRouter();
  const [_selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null,
  );
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<
    string | null
  >(null);
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

  const isConnected = useCallback(
    (dataSourceId: string) => {
      return filteredDataSources.some(
        (ds) => ds.id === dataSourceId && ds.status === "connected",
      );
    },
    [filteredDataSources],
  );

  const getConnectedDataSource = useCallback(
    (dataSourceId: string): DataSource | undefined => {
      return filteredDataSources.find((ds) => ds.id === dataSourceId);
    },
    [filteredDataSources],
  );

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
        showErrorToast(
          "notFound",
          "Organization",
          "Please select an organization from the sidebar before creating a connection.",
        );
        return;
      }

      await createConnection.mutateAsync(connectionData);

      // Close the connection sheet
      setShowConnectionSheet(false);
      setConnectingDataSourceId(null);

      showSuccessToast("connected", dataSource.name);

      // The useEffect will automatically switch to table view when connections update
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to connect the data source. Please try again.";
      showErrorToast("connectFailed", "Data Source", errorMessage);
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

  // State to track which data source is being deleted
  const [dataSourceToDelete, setDataSourceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Confirmation modal for deleting data source
  const deleteConfirm = useConfirmation({
    action: "delete",
    itemName: "Data Source",
    onConfirm: async () => {
      if (!dataSourceToDelete) return;
      try {
        await deleteConnection.mutateAsync(dataSourceToDelete.id);
        showSuccessToast("deleted", "Data Source");
        setDataSourceToDelete(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to delete the data source.";
        showErrorToast("deleteFailed", "Data Source", errorMessage);
        throw error; // Re-throw to prevent modal from closing on error
      }
    },
  });

  const handleDisconnect = useCallback(
    async (dataSourceId: string) => {
      const dataSource = filteredDataSources.find(
        (ds) => ds.id === dataSourceId,
      );
      if (!dataSource) {
        showErrorToast("notFound", "Data Source");
        return;
      }

      try {
        // Update connection status to inactive
        // Note: You may need to add an updateConnection hook call here
        // For now, we'll just show a message
        showSuccessToast("disconnected", dataSource.name);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to disconnect the data source.";
        showErrorToast("disconnectFailed", "Data Source", errorMessage);
      }
    },
    [filteredDataSources],
  );

  const handleDelete = useCallback(
    (dataSourceId: string) => {
      const dataSource = filteredDataSources.find(
        (ds) => ds.id === dataSourceId,
      );
      if (!dataSource) {
        showErrorToast("notFound", "Data Source");
        return;
      }
      // Store the data source to delete and show confirmation modal
      setDataSourceToDelete({ id: dataSourceId, name: dataSource.name });
      deleteConfirm.showConfirm(dataSource.name);
    },
    [filteredDataSources, deleteConfirm],
  );

  // Column definitions for DataTable
  const columns: ColumnDef<DataSource>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const dataSource = row.original;
          const iconType: string =
            "iconType" in dataSource && typeof dataSource.iconType === "string"
              ? dataSource.iconType
              : dataSource.type === "postgres"
                ? "postgres"
                : dataSource.type;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                {getIconComponent(iconType, 16)}
              </div>
              <span className="font-semibold">{dataSource.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Connector",
        cell: ({ row }) => (
          <span className="capitalize text-sm text-muted-foreground">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "connections",
        header: "Connections",
        cell: ({ row }) => {
          const dataSource = row.original;
          const connected = isConnected(dataSource.id);
          const connectedData = getConnectedDataSource(dataSource.id);
          const selectedTables =
            connectedData?.selectedTables ||
            (connectedData?.selectedTable ? [connectedData.selectedTable] : []);
          return connected && selectedTables.length > 0 ? (
            <span className="text-sm font-medium">
              {selectedTables.length}{" "}
              {selectedTables.length === 1 ? "table" : "tables"}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: "connectedAt",
        header: "Last Sync",
        cell: ({ row }) => {
          const dataSource = row.original;
          const connectedData = getConnectedDataSource(dataSource.id);
          return connectedData?.connectedAt ? (
            <span className="text-sm text-muted-foreground">
              {new Date(connectedData.connectedAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
          const dataSource = row.original;
          // Find the connection to get userId
          const connection = connections?.find(
            (conn) => conn.id === dataSource.id,
          );
          if (!connection?.userId) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }
          const creator = usersMap.get(connection.userId);
          const displayName =
            creator?.fullName ||
            (creator?.firstName && creator?.lastName
              ? `${creator.firstName} ${creator.lastName}`
              : creator?.email?.split("@")[0] || "Unknown");
          return (
            <span className="text-sm text-muted-foreground">{displayName}</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const dataSource = row.original;
          const connected = isConnected(dataSource.id);
          return connected ? (
            <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0 font-medium">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Not connected</span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const dataSource = row.original;
          const connected = isConnected(dataSource.id);
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {connected && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/workspace/data-sources/${dataSource.id}/query`,
                          );
                        }}
                      >
                        <TableIcon className="mr-2 h-4 w-4" />
                        View table navigation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnect(dataSource.id);
                        }}
                        className="text-orange-600 focus:text-orange-600"
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(dataSource.id);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableHiding: false,
      },
    ],
    [
      isConnected,
      getConnectedDataSource,
      router,
      handleDisconnect,
      handleDelete,
      connections,
      usersMap,
    ],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources"
        description="Connect and manage your data sources to power your dashboards"
        action={
          hasConnections && !showGridView ? (
            <Button
              onClick={() => setShowGridView(true)}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Source
            </Button>
          ) : showGridView ? (
            <Button
              variant="outline"
              onClick={() => setShowGridView(false)}
              className="cursor-pointer"
            >
              <X className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          ) : (
            <Button
              onClick={() => setShowGridView(true)}
              className="cursor-pointer"
            >
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
        <div className="space-y-6">
          <PageHeaderSkeleton showAction={true} />
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading connections...</div>
          </div>
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
        <DataTable
          tableId={orgId ? `data-sources-table-${orgId}` : "data-sources-table"}
          columns={columns}
          data={filteredDataSources}
          isLoading={false}
          enableSorting
          enableFiltering
          filterPlaceholder="Filter data sources..."
          defaultVisibleColumns={[
            "name",
            "type",
            "connections",
            "connectedAt",
            "status",
            "actions",
          ]}
          fixedColumns={["name", "actions"]}
          onRowClick={(row) => handleDataSourceClick(row.id)}
          emptyMessage="No data sources found"
          emptyDescription="Get started by connecting a data source"
        />
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirm.confirmProps.open}
        onOpenChange={(open) => {
          if (!open) {
            deleteConfirm.hideConfirm();
            // Clear the data source to delete when modal closes
            setDataSourceToDelete(null);
          } else {
            // If opening, use the showConfirm from confirmProps
            // This shouldn't happen normally, but handle it
          }
        }}
        action={deleteConfirm.confirmProps.action}
        itemName={deleteConfirm.confirmProps.itemName}
        itemValue={deleteConfirm.confirmProps.itemValue}
        onConfirm={deleteConfirm.confirmProps.onConfirm}
        isLoading={deleteConnection.isPending}
      />
    </div>
  );
}
