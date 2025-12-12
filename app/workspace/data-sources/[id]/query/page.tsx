"use client";

import {
  ArrowLeft,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  Loader2,
  Minimize2,
  Play,
  RefreshCw,
  Save,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SQLEditor } from "@/components/data-sources/sql-editor";
import { SQLResultViewer } from "@/components/data-sources/sql-result-viewer";
import { TableNavigation } from "@/components/data-sources/table-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import { DatasetConfigurationEmbedded } from "./dataset-config";

// Mock query execution - replace with actual API call
const executeQuery = async (
  _dataSourceId: string,
  _dataSourceType: string,
  query: string,
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock data based on query
  const lowerQuery = query.toLowerCase().trim();

  if (lowerQuery.includes("select") || lowerQuery.includes("from")) {
    // SQL-like query
    return {
      columns: ["id", "name", "email", "created_at", "status"],
      rows: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 10000000000)
          .toISOString()
          .split("T")[0],
        status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
      })),
    };
  }

  // Default mock data
  return {
    columns: ["column1", "column2", "column3"],
    rows: Array.from({ length: 10 }, (_, i) => ({
      column1: `Value ${i + 1}-1`,
      column2: `Value ${i + 1}-2`,
      column3: `Value ${i + 1}-3`,
    })),
  };
};

// Check if data source type supports SQL queries
const supportsSQLQueries = (type: string): boolean => {
  const sqlTypes = [
    "postgres",
    "mysql",
    "mssql",
    "redshift",
    "clickhouse",
    "pgvector",
    "bigquery",
    "snowflake",
    "snowflake-cortex",
    "databricks",
    "google-sheets",
    "excel",
    "csv",
  ];
  return sqlTypes.includes(type);
};

// Get language for Monaco editor based on data source type
const getLanguageForDataSource = (type: string): string => {
  const languageMap: Record<string, string> = {
    postgres: "sql",
    mysql: "sql",
    mssql: "sql",
    redshift: "sql",
    clickhouse: "sql",
    pgvector: "sql",
    bigquery: "sql",
    snowflake: "sql",
    "snowflake-cortex": "sql",
    databricks: "sql",
    mongodb: "javascript",
    api: "json",
    "google-sheets": "sql",
    excel: "sql",
    csv: "sql",
  };
  return languageMap[type] || "sql";
};

// Get default query based on data source type
const getDefaultQuery = (type: string, tableName?: string): string => {
  const table = tableName || "users";

  const queries: Record<string, string> = {
    postgres: `SELECT * FROM ${table} LIMIT 100;`,
    mysql: `SELECT * FROM ${table} LIMIT 100;`,
    mssql: `SELECT TOP 100 * FROM ${table};`,
    redshift: `SELECT * FROM ${table} LIMIT 100;`,
    clickhouse: `SELECT * FROM ${table} LIMIT 100;`,
    bigquery: `SELECT * FROM \`${table}\` LIMIT 100;`,
    snowflake: `SELECT * FROM ${table} LIMIT 100;`,
    "snowflake-cortex": `SELECT * FROM ${table} LIMIT 100;`,
    databricks: `SELECT * FROM ${table} LIMIT 100;`,
    "google-sheets": `SELECT * FROM "${table}" LIMIT 100`,
    excel: `SELECT * FROM [${table}] LIMIT 100`,
    csv: `SELECT * FROM ${table} LIMIT 100`,
  };

  return queries[type] || `SELECT * FROM ${table} LIMIT 100;`;
};

export default function DataSourceQueryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataSourceId = params.id as string;
  const { dataSources, addSavedQuery, currentOrganization } =
    useWorkspaceStore();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"query" | "dataset">(
    tabParam === "dataset" ? "dataset" : "query",
  );

  // Sync tab state with URL param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "dataset") {
      setActiveTab("dataset");
    } else {
      setActiveTab("query");
    }
  }, [searchParams]);

  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [_queryTitle, _setQueryTitle] = useState("Untitled SQL query");
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [resultsFullScreen, setResultsFullScreen] = useState(false);
  const [editorSize, setEditorSize] = useState(60);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [tableData, setTableData] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [tableDataLoading, setTableDataLoading] = useState(false);

  const editorRef = useRef<{ setValue: (value: string) => void } | null>(null);
  const language = dataSource
    ? getLanguageForDataSource(dataSource.type)
    : "sql";

  // Check if SQL editor should be shown
  const shouldShowSQLEditor =
    dataSource &&
    dataSource.status === "connected" &&
    supportsSQLQueries(dataSource.type);

  useEffect(() => {
    if (dataSource && !query && shouldShowSQLEditor) {
      const defaultQuery = getDefaultQuery(
        dataSource.type,
        dataSource.selectedTable || dataSource.tables?.[0],
      );
      setQuery(defaultQuery);
    }
  }, [dataSource, query, shouldShowSQLEditor]);

  if (!dataSource) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Data source not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/workspace/data-sources")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Data Sources
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if data source is connected
  if (dataSource.status !== "connected") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Data source is not connected
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please connect the data source first to view tables and run
                queries.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/workspace/data-sources")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Data Sources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      toast.error("Query is empty", "Please enter a query to execute.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await executeQuery(dataSourceId, dataSource.type, query);
      setResults(result);
      toast.success(
        "Query executed successfully",
        `Returned ${result.rows.length} rows`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to execute query";
      setError(errorMessage);
      toast.error("Query execution failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    if (shouldShowSQLEditor) {
      const newQuery = getDefaultQuery(dataSource.type, tableName);
      setQuery(newQuery);
      if (editorRef.current) {
        editorRef.current.setValue(newQuery);
      }
    } else {
      // For non-SQL data sources, fetch table data
      fetchTableData(tableName);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setTableDataLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = {
        columns: ["id", "name", "value", "created_at"],
        rows: Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          name: `${tableName}_item_${i + 1}`,
          value: Math.random() * 1000,
          created_at: new Date(Date.now() - Math.random() * 10000000000)
            .toISOString()
            .split("T")[0],
        })),
      };
      setTableData(mockData);
    } catch (err) {
      toast.error(
        "Failed to load table data",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setTableDataLoading(false);
    }
  };

  const handleRefreshTableData = () => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  };

  const handleOpenInNewTab = (
    data: {
      columns: string[];
      rows: Record<string, unknown>[];
    },
    viewType: "query" | "table" = "query",
  ) => {
    // Store data in sessionStorage
    const dataToStore = {
      results: data,
      viewType,
      query: viewType === "query" ? query : "",
      tableName: viewType === "table" ? selectedTable : "",
    };

    sessionStorage.setItem(
      `query-results-${dataSourceId}`,
      JSON.stringify(dataToStore),
    );

    // Open new tab with the view route
    window.open(`/workspace/data-sources/${dataSourceId}/query/view`, "_blank");
  };

  const handleSaveQuery = () => {
    if (!query.trim()) {
      toast.error("Query is empty", "Please enter a query to save.");
      return;
    }
    setSaveAsNew(false);
    setQueryName(_queryTitle);
    setShowSaveDialog(true);
  };

  const handleSaveAsNewQuery = () => {
    if (!query.trim()) {
      toast.error("Query is empty", "Please enter a query to save.");
      return;
    }
    setSaveAsNew(true);
    setQueryName("");
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (!queryName.trim()) {
      toast.error("Query name required", "Please enter a name for the query.");
      return;
    }

    const savedQuery = {
      id: `query_${Date.now()}`,
      name: queryName,
      query: query,
      dataSourceId: dataSourceId,
      organizationId: currentOrganization?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSavedQuery(savedQuery);
    toast.success("Query saved successfully", `"${queryName}" has been saved.`);
    setShowSaveDialog(false);
    setQueryName("");
  };

  const handleDownload = (format: "csv" | "json" | "excel") => {
    if (!results) return;

    if (format === "csv") {
      const headers = results.columns.join(",");
      const csvRows = results.rows.map((row) =>
        results.columns
          .map((col) => {
            const val = row[col];
            if (val === null || val === undefined) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return String(val).replace(/"/g, '""');
          })
          .join(","),
      );
      const csv = [headers, ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "query-results.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "json") {
      const json = JSON.stringify(results.rows, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "query-results.json";
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(
      "Download started",
      `Downloading results as ${format.toUpperCase()}`,
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header Bar */}
      <div className="border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/data-sources")}
              className="h-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4">
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  const newTab = v as "query" | "dataset";
                  setActiveTab(newTab);
                  if (newTab === "dataset") {
                    router.push(
                      `/workspace/data-sources/${dataSourceId}/query?tab=dataset`,
                    );
                  } else {
                    router.push(
                      `/workspace/data-sources/${dataSourceId}/query`,
                    );
                  }
                }}
              >
                <TabsList>
                  <TabsTrigger value="query">Query</TabsTrigger>
                  <TabsTrigger value="dataset">Dataset</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shouldShowSQLEditor && activeTab === "query" && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSaveQuery}>
                      <Save className="h-4 w-4 mr-2" />
                      Save query
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveAsNewQuery}>
                      <Save className="h-4 w-4 mr-2" />
                      Save as new query
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleExecuteQuery}
                  disabled={loading || !query.trim()}
                  size="sm"
                  className="h-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run query
                    </>
                  )}
                </Button>
                {results && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setActiveTab("dataset");
                        router.push(
                          `/workspace/data-sources/${dataSourceId}/query?tab=dataset`,
                        );
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Dataset
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload("csv")}>
                          Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload("json")}
                        >
                          Download as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload("excel")}
                        >
                          Download as Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "query" ? (
          shouldShowSQLEditor ? (
            <div className="flex h-full">
              {/* Tables Sidebar - Fixed width based on collapsed state */}
              <div
                className={cn(
                  "shrink-0 transition-all duration-200 border-r",
                  sidebarCollapsed ? "w-16" : "w-64",
                )}
              >
                <TableNavigation
                  tables={dataSource.tables || []}
                  onTableSelect={handleTableSelect}
                  selectedTable={selectedTable}
                  defaultCollapsed={sidebarCollapsed}
                  onCollapsedChange={setSidebarCollapsed}
                />
              </div>

              {/* Editor and Results */}
              <div className="flex-1 min-w-0">
                {resultsFullScreen && results ? (
                  // Full-screen results view
                  <div className="h-full flex flex-col bg-background">
                    <div className="flex items-center justify-between p-4 border-b shrink-0">
                      <h2 className="text-sm font-medium">Query Results</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResultsFullScreen(false)}
                        className="h-8"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <SQLResultViewer
                        columns={results.columns}
                        rows={results.rows}
                        loading={loading}
                        error={_error}
                        fullScreen={resultsFullScreen}
                        onFullScreen={setResultsFullScreen}
                        onDownload={handleDownload}
                        onOpenInNewTab={() =>
                          handleOpenInNewTab(results, "query")
                        }
                      />
                    </div>
                  </div>
                ) : (
                  // Normal split view
                  <ResizablePanelGroup
                    direction="vertical"
                    className="h-full"
                    key={results ? "with-results" : "no-results"}
                  >
                    {/* Query Editor */}
                    <ResizablePanel
                      id="editor-panel"
                      defaultSize={results ? editorSize : 100}
                      minSize={20}
                      maxSize={results ? 80 : 100}
                      collapsible={!!results}
                      onResize={(size) => {
                        if (results) {
                          setEditorSize(size);
                        }
                      }}
                    >
                      <div className="h-full flex flex-col border-b">
                        <SQLEditor
                          value={query}
                          onChange={setQuery}
                          language={language}
                          onMount={(editor) => {
                            editorRef.current = editor as {
                              setValue: (value: string) => void;
                            };
                          }}
                          className="h-full"
                        />
                      </div>
                    </ResizablePanel>

                    {results && (
                      <>
                        <ResizableHandle withHandle className="bg-border" />
                        {/* Results */}
                        <ResizablePanel
                          id="results-panel"
                          defaultSize={Math.max(
                            20,
                            Math.min(80, 100 - editorSize),
                          )}
                          minSize={20}
                          maxSize={80}
                          collapsible
                        >
                          <SQLResultViewer
                            columns={results.columns}
                            rows={results.rows}
                            loading={loading}
                            error={_error}
                            fullScreen={resultsFullScreen}
                            onFullScreen={setResultsFullScreen}
                            onDownload={handleDownload}
                            onOpenInNewTab={() =>
                              handleOpenInNewTab(results, "query")
                            }
                          />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                )}
              </div>
            </div>
          ) : (
            // View for non-SQL data sources
            <div className="flex-1 min-h-0 flex">
              {/* Tables Sidebar - Fixed width based on collapsed state */}
              <div
                className={cn(
                  "shrink-0 transition-all duration-200 border-r",
                  sidebarCollapsed ? "w-16" : "w-64",
                )}
              >
                <TableNavigation
                  tables={dataSource.tables || []}
                  onTableSelect={handleTableSelect}
                  selectedTable={selectedTable}
                  defaultCollapsed={sidebarCollapsed}
                  onCollapsedChange={setSidebarCollapsed}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                {tableData || tableDataLoading ? (
                  <>
                    {/* Header with buttons */}
                    <div className="flex items-center justify-between p-4 border-b shrink-0">
                      <div className="flex items-center gap-2">
                        {selectedTable && (
                          <h3 className="text-sm font-medium">
                            Table: {selectedTable}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {tableData && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenInNewTab(tableData, "table")
                              }
                              className="h-8"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View in New Tab
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRefreshTableData}
                              disabled={tableDataLoading}
                              className="h-8"
                            >
                              <RefreshCw
                                className={cn(
                                  "h-4 w-4 mr-2",
                                  tableDataLoading && "animate-spin",
                                )}
                              />
                              Refresh
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Table Data Viewer */}
                    <div className="flex-1 min-h-0">
                      {tableData ? (
                        <SQLResultViewer
                          columns={tableData.columns}
                          rows={tableData.rows}
                          loading={tableDataLoading}
                          error={null}
                          onOpenInNewTab={() =>
                            handleOpenInNewTab(tableData, "table")
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">
                              Loading table data...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a table from the sidebar to view data
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="h-full overflow-auto">
            <DatasetConfigurationEmbedded
              dataSourceId={dataSourceId}
              onBack={() => {
                setActiveTab("query");
                router.push(`/workspace/data-sources/${dataSourceId}/query`);
              }}
            />
          </div>
        )}
      </div>

      {/* Save Query Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {saveAsNew ? "Save as New Query" : "Save Query"}
            </DialogTitle>
            <DialogDescription>
              {saveAsNew
                ? "Enter a name for your new query"
                : "Update the name for this query"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="query-name">Query Name</Label>
              <Input
                id="query-name"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="e.g., Sales by Region"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
