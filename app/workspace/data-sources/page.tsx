"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Eye,
  Link2,
  MoreVertical,
  Plus,
  Trash2,
  Unlink,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getIconComponent } from "@/components/data-sources";
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
  useConnections,
  useDisconnectConnection,
  useReconnectConnection,
  useUsers,
} from "@/lib/api";
import { useDeleteDataSource } from "@/lib/api/hooks/use-data-source";
import type { DataSource } from "@/lib/stores/workspace-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function DataSourcesPage() {
  // Get current organization from workspace store (set by sidebar selector)
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || undefined;

  // Use real API hooks instead of workspace store
  // Note: Currently using legacy postgres connections API
  // TODO: Migrate to useDataSources(organizationId) for new dynamic data sources API
  const { data: connections, isLoading: connectionsLoading } =
    useConnections(organizationId);
  // Use NestJS API for data source deletion
  const deleteDataSource = useDeleteDataSource(organizationId);
  const disconnectConnection = useDisconnectConnection(organizationId);
  const reconnectConnection = useReconnectConnection(organizationId);

  const isLoading = connectionsLoading;

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
      type: (conn.type || "postgres") as "postgres",
      connectorRole: conn.connectorRole ?? "source",
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

  // Match by connector type (e.g. "postgres") — connections have type from sourceType
  const isConnected = useCallback(
    (connectorId: string) => {
      return filteredDataSources.some(
        (ds) =>
          (ds.type === connectorId || ds.id === connectorId) &&
          ds.status === "connected",
      );
    },
    [filteredDataSources],
  );

  const getConnectedDataSource = useCallback(
    (connectorId: string): DataSource | undefined => {
      return filteredDataSources.find(
        (ds) => ds.type === connectorId || ds.id === connectorId,
      );
    },
    [filteredDataSources],
  );

  // Connect flow moved to /workspace/data-sources/new page

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
        await deleteDataSource.mutateAsync(dataSourceToDelete.id);
        showSuccessToast("deleted", "Data Source");
        setDataSourceToDelete(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to delete the data source.";
        showErrorToast("deleteFailed", "Data Source", errorMessage);
        throw error;
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
        await disconnectConnection.mutateAsync(dataSourceId);
        showSuccessToast("disconnected", dataSource.name);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to disconnect the data source.";
        showErrorToast("disconnectFailed", "Data Source", errorMessage);
      }
    },
    [filteredDataSources, disconnectConnection],
  );

  const handleReconnect = useCallback(
    async (dataSourceId: string) => {
      const dataSource = filteredDataSources.find(
        (ds) => ds.id === dataSourceId,
      );
      if (!dataSource) {
        showErrorToast("notFound", "Data Source");
        return;
      }
      try {
        const result = await reconnectConnection.mutateAsync(dataSourceId);
        if (result.success) {
          showSuccessToast("reconnected", dataSource.name);
        } else {
          showErrorToast(
            "reconnectFailed",
            "Data Source",
            result.error || result.message,
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to reconnect the data source.";
        showErrorToast("reconnectFailed", "Data Source", errorMessage);
      }
    },
    [filteredDataSources, reconnectConnection],
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
        accessorKey: "connectorRole",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.connectorRole ?? "source";
          return role === "destination" ? (
            <Badge variant="secondary" className="font-medium">
              Destination
            </Badge>
          ) : (
            <Badge variant="outline" className="font-medium">
              Source
            </Badge>
          );
        },
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
                  {connected ? (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/workspace/data-sources/${dataSource.id}/query`,
                          );
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview data
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
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReconnect(dataSource.id);
                        }}
                        className="text-green-600 focus:text-green-600"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Reconnect
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
      handleReconnect,
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
          <Button asChild className="cursor-pointer">
            <Link
              href={organizationId ? "/workspace/data-sources/new" : "#"}
              onClick={(e) => {
                if (!organizationId) {
                  e.preventDefault();
                  showErrorToast(
                    "notFound",
                    "Organization",
                    "Please select an organization from the sidebar before connecting.",
                  );
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Source
            </Link>
          </Button>
        }
      />

      {!organizationId ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select an organization from the sidebar to connect data sources
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <PageHeaderSkeleton showAction={true} />
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Your connections
            </h3>
            <DataTable
                tableId={
                  organizationId
                    ? `data-sources-table-${organizationId}`
                    : "data-sources-table"
                }
                columns={columns}
                data={filteredDataSources}
                isLoading={false}
                enableSorting
                enableFiltering
                externalFilter={urlSearch}
                externalFilterColumnKey="name"
                filterPlaceholder="Filter data sources..."
                defaultVisibleColumns={[
                  "name",
                  "type",
                  "connectorRole",
                  "connections",
                  "connectedAt",
                  "status",
                  "actions",
                ]}
                fixedColumns={["name", "actions"]}
                onRowClick={(row) =>
                  router.push(`/workspace/data-sources/${row.id}/query`)
                }
                emptyMessage="No data sources found"
                emptyDescription="Get started by clicking New Source to add a connector"
            />
          </div>
        </div>
      )}

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
        isLoading={deleteDataSource.isPending}
      />
    </div>
  );
}
