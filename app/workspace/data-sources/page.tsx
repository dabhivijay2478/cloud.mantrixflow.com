"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Database } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import {
  DataSourceGrid,
  DataSourceTable,
  DataSourceDetail,
  ConnectionSheet,
  TableListView,
  TableDataView,
  allDataSources,
  mockTables,
} from "@/components/data-sources";

type ConnectionFormValues = Record<string, string>;

export default function DataSourcesPage() {
  const router = useRouter();
  const { dataSources, addDataSource, updateDataSource, removeDataSource, currentOrganization } = useWorkspaceStore();
  
  // Filter data sources by current organization
  const filteredDataSources = currentOrganization
    ? dataSources.filter((ds) => !ds.organizationId || ds.organizationId === currentOrganization.id)
    : dataSources.filter((ds) => !ds.organizationId);
  
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTableForView, setSelectedTableForView] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const isConnected = (dataSourceId: string) => {
    return filteredDataSources.some((ds) => ds.id === dataSourceId && ds.status === "connected");
  };

  const getConnectedDataSource = (dataSourceId: string) => {
    return filteredDataSources.find((ds) => ds.id === dataSourceId);
  };

  const handleDataSourceClick = (dataSourceId: string) => {
      setSelectedDataSource(dataSourceId);
  };

  const handleConnectClick = (dataSourceId: string) => {
    setConnectingDataSourceId(dataSourceId);
    setShowConnectionSheet(true);
  };

  const handleConnect = async (data: ConnectionFormValues) => {
    if (!connectingDataSourceId) return;

    const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
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
      toast.success(`${dataSource.name} connected successfully`, "Your data source has been connected and is ready to use.");
      setSelectedDataSource(connectingDataSourceId);
    } catch (error) {
      toast.error("Failed to connect data source", "Unable to connect the data source. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = async (dataSourceId: string) => {
    const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    setLoading(true);
    try {
      // Simulate OAuth flow
      toast.info("Redirecting to OAuth...", "You will be redirected to complete the OAuth authentication.");
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
    } catch (error) {
      toast.error("Failed to connect data source");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (dataSourceId: string, file: File) => {
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
  };

  // Mock function to load table data
  const loadTableData = async (dataSourceId: string, tableName: string) => {
    setLoadingTableData(true);
    setTableData(null);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock data based on table name
      const mockData = {
        columns: ["id", "name", "email", "created_at", "status"],
        rows: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `${tableName} Row ${i + 1}`,
          email: `row${i + 1}@example.com`,
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0],
          status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
        })),
      };
      
      setTableData(mockData);
      setSelectedTableForView(tableName);
      toast.success("Table data loaded", `Loaded ${mockData.rows.length} rows from ${tableName}`);
    } catch (error: any) {
      toast.error("Failed to load table data", error.message || "An error occurred");
    } finally {
      setLoadingTableData(false);
    }
  };

  const handleSelectTable = (dataSourceId: string, table: string) => {
    const dataSource = getConnectedDataSource(dataSourceId);
    if (!dataSource) return;

    // Get current selected tables (support both old selectedTable and new selectedTables)
    const currentSelected = dataSource.selectedTables || (dataSource.selectedTable ? [dataSource.selectedTable] : []);
    
    // Toggle table selection
    const isSelected = currentSelected.includes(table);
    const newSelectedTables = isSelected
      ? currentSelected.filter((t) => t !== table)
      : [...currentSelected, table];

    updateDataSource(dataSourceId, { 
      selectedTables: newSelectedTables,
      // Keep selectedTable for backward compatibility (use first selected)
      selectedTable: newSelectedTables.length > 0 ? newSelectedTables[0] : undefined
    });

    if (isSelected) {
      toast.success(`Deselected ${table}`, `${newSelectedTables.length} table(s) selected`);
    } else {
      toast.success(`Selected ${table}`, `${newSelectedTables.length} table(s) selected`);
    }
  };

  const handleViewTableData = (dataSourceId: string, table: string) => {
    loadTableData(dataSourceId, table);
  };

  const handleDisconnect = (dataSourceId: string) => {
    if (confirm("Are you sure you want to disconnect this data source?")) {
      removeDataSource(dataSourceId);
      toast.success("Data source disconnected");
      setSelectedDataSource(null);
    }
  };

  const connectedDataSource = selectedDataSource
    ? getConnectedDataSource(selectedDataSource)
    : null;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get all connected data sources
  const connectedDataSources = filteredDataSources.filter((ds) => ds.status === "connected");
  const hasOnlyOneConnected = connectedDataSources.length === 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sources</h1>
          <p className="text-muted-foreground">Connect and manage your data sources</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedDataSource && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedDataSource(null);
                setSelectedTableForView(null);
                setTableData(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          )}
          {!selectedDataSource && (
            <Button onClick={() => setShowConnectionSheet(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New source
            </Button>
          )}
        </div>
      </div>

      {!selectedDataSource ? (
        // Show grid view when no data source is selected
        hasOnlyOneConnected ? (
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
          />
        ) : (
          <DataSourceGrid
            isConnected={isConnected}
            getConnectedDataSource={getConnectedDataSource}
            onDataSourceClick={handleDataSourceClick}
          />
        )
      ) : (
        // Show selected data source detail view
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DataSourceDetail
              dataSourceId={selectedDataSource}
              connectedDataSource={connectedDataSource || undefined}
              onConnect={() => handleConnectClick(selectedDataSource)}
              onOAuthConnect={() => handleOAuthConnect(selectedDataSource)}
              onFileUpload={(file) => handleFileUpload(selectedDataSource, file)}
              onDisconnect={() => handleDisconnect(selectedDataSource)}
              loading={loading}
            />
                </div>

          <div className="lg:col-span-2">
            {connectedDataSource ? (
              selectedTableForView && tableData ? (
                <TableDataView
                  dataSourceId={selectedDataSource}
                  tableName={selectedTableForView}
                  tableData={tableData}
                  loading={loadingTableData}
                  onBack={() => {
                            setSelectedTableForView(null);
                            setTableData(null);
                          }}
                />
              ) : (
                <TableListView
                  dataSourceId={selectedDataSource}
                  tables={connectedDataSource.tables || []}
                  selectedTables={connectedDataSource.selectedTables || (connectedDataSource.selectedTable ? [connectedDataSource.selectedTable] : [])}
                  onSelectTable={(table) => handleSelectTable(selectedDataSource, table)}
                  onViewTableData={(table) => handleViewTableData(selectedDataSource, table)}
                  onUpdateDataSource={(updates) => updateDataSource(selectedDataSource, updates)}
                />
              )
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Connect to {allDataSources.find((ds) => ds.id === selectedDataSource)?.name} to view available tables and sheets.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
