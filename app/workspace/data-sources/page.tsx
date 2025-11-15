"use client";

import { Database, Plus, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  allDataSources,
  ConnectionSheet,
  DataSourceGrid,
  DataSourceTable,
  mockTables,
} from "@/components/data-sources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";

type ConnectionFormValues = Record<string, string>;

export default function DataSourcesPage() {
  const router = useRouter();
  const {
    dataSources,
    addDataSource,
    removeDataSource,
    updateDataSource,
    currentOrganization,
    datasets,
  } = useWorkspaceStore();

  // Filter data sources by current organization
  const filteredDataSources = currentOrganization
    ? dataSources.filter(
        (ds) =>
          !ds.organizationId || ds.organizationId === currentOrganization.id,
      )
    : dataSources.filter((ds) => !ds.organizationId);

  const [_selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null,
  );
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<
    string | null
  >(null);
  const [_loading, setLoading] = useState(false);
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

  const handleConnect = async (_data: ConnectionFormValues) => {
    if (!connectingDataSourceId) return;

    const dataSource = allDataSources.find(
      (ds) => ds.id === connectingDataSourceId,
    );
    if (!dataSource) return;

    setLoading(true);
    try {
      // Simulate connection - in real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDataSource = {
        id: connectingDataSourceId,
        name: dataSource.name,
        type: dataSource.type,
        status: "connected" as const,
        organizationId: currentOrganization?.id,
        connectedAt: new Date().toISOString(),
        tables: mockTables[dataSource.type] || [],
      };

      addDataSource(newDataSource);
      toast.success(
        `${dataSource.name} connected successfully`,
        "Your data source has been connected and is ready to use.",
      );
      setSelectedDataSource(connectingDataSourceId);
      setShowGridView(false); // Hide grid view after successful connection
    } catch (error) {
      toast.error(
        "Failed to connect data source",
        "Unable to connect the data source. Please try again.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const _handleOAuthConnect = async (dataSourceId: string) => {
    const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    setLoading(true);
    try {
      // Simulate OAuth flow
      toast.info(
        "Redirecting to OAuth...",
        "You will be redirected to complete the OAuth authentication.",
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDataSource = {
        id: dataSourceId,
        name: dataSource.name,
        type: dataSource.type,
        status: "connected" as const,
        organizationId: currentOrganization?.id,
        connectedAt: new Date().toISOString(),
        tables: mockTables[dataSource.type] || [],
      };

      addDataSource(newDataSource);
      toast.success(`${dataSource.name} connected successfully`);
      setSelectedDataSource(dataSourceId);
      setShowGridView(false); // Hide grid view after successful connection
    } catch (error) {
      toast.error("Failed to connect data source");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const _handleFileUpload = (dataSourceId: string, file: File) => {
    const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    const newDataSource = {
      id: dataSourceId,
      name: file.name,
      type: dataSource.type,
      status: "connected" as const,
      organizationId: currentOrganization?.id,
      connectedAt: new Date().toISOString(),
      tables: mockTables[dataSource.type] || [],
    };

    addDataSource(newDataSource);
    toast.success("File uploaded successfully");
    setSelectedDataSource(dataSourceId);
    setShowGridView(false); // Hide grid view after successful upload
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleDisconnect = (dataSourceId: string) => {
    const dataSource = filteredDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    updateDataSource(dataSourceId, {
      ...dataSource,
      status: "disconnected",
    });

    toast.success(
      "Data source disconnected",
      `${dataSource.name} has been disconnected successfully.`,
    );
  };

  const handleDelete = (dataSourceId: string) => {
    const dataSource = filteredDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    if (
      confirm(
        `Are you sure you want to delete "${dataSource.name}"? This action cannot be undone.`,
      )
    ) {
      removeDataSource(dataSourceId);
      toast.success(
        "Data source deleted",
        `${dataSource.name} has been deleted successfully.`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sources</h1>
          <p className="text-muted-foreground">
            Connect and manage your data sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasConnectedDataSources && !showGridView && (
            <Button variant="outline" onClick={() => setShowGridView(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New source
            </Button>
          )}
          {showGridView && (
            <Button variant="outline" onClick={() => setShowGridView(false)}>
              <X className="mr-2 h-4 w-4" />
              Back to list
            </Button>
          )}
        </div>
      </div>

      {!hasConnectedDataSources || showGridView ? (
        // Show grid view when no data sources are connected or when "New source" is clicked
        <DataSourceGrid
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

          {/* Datasets Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configured Datasets</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Datasets configured for analytics dashboards
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/workspace/datasets/new")}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Dataset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No datasets configured yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/workspace/datasets/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Dataset
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasets.map((dataset) => {
                      const dataSource = dataSources.find(
                        (ds) => ds.id === dataset.dataSourceId,
                      );
                      const selectedColumns = dataset.columns.filter(
                        (c) => c.selected,
                      );
                      return (
                        <TableRow key={dataset.id}>
                          <TableCell className="font-medium">
                            {dataset.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span>{dataSource?.name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {dataset.sourceType === "table" ? "Table" : "Query"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {selectedColumns.length} selected
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(dataset.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/workspace/datasets/${dataset.id}`)
                              }
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
      />
    </div>
  );
}
