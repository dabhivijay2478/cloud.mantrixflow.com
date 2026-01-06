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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SchemaTableNavigation } from "@/components/data-sources/schema-table-navigation";
import { SQLEditor } from "@/components/data-sources/sql-editor";
import { SQLResultViewer } from "@/components/data-sources/sql-result-viewer";
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
import {
  useConnection,
  useExecuteQuery,
  useSchemasWithTables,
} from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

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
  const dataSourceId = params.id as string;

  // Get current organization from workspace store
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Use real API hooks
  const { data: connection, isLoading: connectionLoading } =
    useConnection(dataSourceId);
  const { data: schemas, isLoading: schemasLoading } = useSchemasWithTables(
    dataSourceId,
    orgId,
  );
  const executeQueryMutation = useExecuteQuery(orgId);

  // Removed dataset tab functionality

  // Convert API connection to component format
  const dataSource = connection
    ? {
        id: connection.id,
        name: connection.name,
        type: "postgres" as const,
        status:
          connection.status === "active"
            ? ("connected" as const)
            : ("disconnected" as const),
        tables: [], // Not used when using schema-based navigation
      }
    : null;

  // Track selected schema and table
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();
  const [selectedTable, setSelectedTable] = useState<string | undefined>();

  // Debug logging for schemas
  useEffect(() => {
    if (schemas) {
      const totalTables = schemas.reduce(
        (sum, s) => sum + (s.tables?.length || 0),
        0,
      );
      console.log("[QueryPage] Schemas loaded:", {
        totalSchemas: schemas.length,
        totalTables,
        schemas: schemas.map((s) => ({
          name: s.name,
          tableCount: s.tables?.length || 0,
        })),
      });
    }
  }, [schemas]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_queryTitle, _setQueryTitle] = useState("Untitled SQL query");
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
        dataSource.tables?.[0],
      );
      setQuery(defaultQuery);
    }
  }, [dataSource, query, shouldShowSQLEditor]);

  if (connectionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading connection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataSource || !connection) {
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

    if (!dataSourceId) {
      toast.error("No connection", "Please select a data source connection.");
      return;
    }

    if (!orgId) {
      toast.error(
        "No organization selected",
        "Please select an organization from the sidebar before executing queries.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log("[QueryPage] Executing query with:", {
        connectionId: dataSourceId,
        orgId,
        query: query.trim(),
      });

      const result = await executeQueryMutation.mutateAsync({
        connectionId: dataSourceId,
        data: {
          query: query.trim(),
        },
      });

      console.log("[QueryPage] Query result:", result);
      console.log("[QueryPage] Result type check:", {
        hasRows: !!result?.result?.rows,
        rowsIsArray: Array.isArray(result?.result?.rows),
        rowsLength: result?.result?.rows?.length,
        firstRowType: result?.result?.rows?.[0] ? typeof result.result.rows[0] : "none",
        firstRowIsArray: Array.isArray(result?.result?.rows?.[0]),
        firstRowKeys: result?.result?.rows?.[0] ? Object.keys(result.result.rows[0]) : [],
        hasColumns: !!result?.result?.columns,
        columnsIsArray: Array.isArray(result?.result?.columns),
      });

      // QueryExecutionResponse has a result property containing QueryResult
      // Format: { success: boolean, result?: { rows: unknown[][], columns: string[], rowCount: number, executionTimeMs: number }, error?: string }
      if (
        result &&
        result.success &&
        result.result &&
        Array.isArray(result.result.rows) &&
        Array.isArray(result.result.columns)
      ) {
        const queryResult = result.result;
        // Extract column names - columns can be strings or objects with name property
        const columnNames = queryResult.columns.map(
          (col: string | { name?: string; column?: string } | unknown) =>
            typeof col === "string"
              ? col
              : typeof col === "object" &&
                  col !== null &&
                  ("name" in col || "column" in col)
                ? (col as { name?: string; column?: string }).name ||
                  (col as { name?: string; column?: string }).column ||
                  String(col)
                : String(col),
        );

        // PostgreSQL returns rows as array of objects, not arrays
        // Each row is already an object like {column1: value1, column2: value2}
        const convertedResult = {
          columns: columnNames,
          rows: queryResult.rows.map((row: unknown) => {
            // If row is already an object, use it directly
            if (row && typeof row === "object" && !Array.isArray(row)) {
              return row as Record<string, unknown>;
            }
            // If row is an array, convert to object (fallback for other formats)
            if (Array.isArray(row)) {
              const rowObj: Record<string, unknown> = {};
              columnNames.forEach((colName: string, idx: number) => {
                rowObj[colName] = row[idx];
              });
              return rowObj;
            }
            // Fallback: return as-is
            return row as Record<string, unknown>;
          }),
        };

        console.log("[QueryPage] Converted result:", {
          columnCount: convertedResult.columns.length,
          rowCount: convertedResult.rows.length,
          firstRow: convertedResult.rows[0],
          firstRowKeys: convertedResult.rows[0]
            ? Object.keys(convertedResult.rows[0])
            : [],
        });

        setResults(convertedResult);
        toast.success(
          "Query executed successfully",
          `Returned ${convertedResult.rows.length} rows in ${queryResult.executionTimeMs || 0}ms`,
        );
      } else if (result && "error" in result) {
        throw new Error(result.error || "Query execution failed");
      } else {
        console.error("[QueryPage] Unexpected result format:", result);
        console.error(
          "[QueryPage] Result keys:",
          result ? Object.keys(result) : "null",
        );
        throw new Error(
          "Query execution failed: Unexpected response format. Check console for details.",
        );
      }
    } catch (err) {
      console.error("[QueryPage] Query execution error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "error" in err &&
              typeof (err as { error?: { message?: string } }).error
                ?.message === "string"
            ? (err as { error: { message: string } }).error.message
            : "Failed to execute query";
      setError(errorMessage);
      toast.error("Query execution failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string, schemaName: string) => {
    setSelectedTable(tableName);
    setSelectedSchema(schemaName);

    // Build full table name with schema if not public
    const fullTableName =
      schemaName === "public" ? tableName : `${schemaName}.${tableName}`;

    if (shouldShowSQLEditor) {
      const newQuery = getDefaultQuery(dataSource.type, fullTableName);
      setQuery(newQuery);
      if (editorRef.current) {
        editorRef.current.setValue(newQuery);
      }
    } else {
      // For non-SQL data sources, fetch table data
      fetchTableData(fullTableName);
    }
  };

  const fetchTableData = async (tableName: string) => {
    if (!dataSourceId) return;

    setTableDataLoading(true);
    try {
      // Use real API to fetch table data
      const result = await executeQueryMutation.mutateAsync({
        connectionId: dataSourceId,
        data: {
          query: `SELECT * FROM ${tableName} LIMIT 100`,
        },
      });

      // QueryExecutionResponse has a result property containing QueryResult
      if (
        result &&
        result.success &&
        result.result &&
        Array.isArray(result.result.rows) &&
        Array.isArray(result.result.columns)
      ) {
        const queryResult = result.result;
        const columnNames = queryResult.columns.map(
          (col: string | { name?: string } | unknown) =>
            typeof col === "string"
              ? col
              : typeof col === "object" && col !== null && "name" in col
                ? (col as { name?: string }).name || String(col)
                : String(col),
        );

        const convertedData = {
          columns: columnNames,
          rows: queryResult.rows.map((row: unknown) => {
            // If row is already an object, use it directly
            if (row && typeof row === "object" && !Array.isArray(row)) {
              return row as Record<string, unknown>;
            }
            // If row is an array, convert to object (fallback for other formats)
            if (Array.isArray(row)) {
              const rowObj: Record<string, unknown> = {};
              columnNames.forEach((colName: string, idx: number) => {
                rowObj[colName] = row[idx];
              });
              return rowObj;
            }
            // Fallback: return as-is
            return row as Record<string, unknown>;
          }),
        };
        setTableData(convertedData);
      } else {
        throw new Error(result.error || "Failed to load table data");
      }
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

    // TODO: Implement query saving API endpoint
    // For now, save to localStorage as a temporary solution
    const savedQueries = JSON.parse(
      localStorage.getItem("savedQueries") || "[]",
    );
    const savedQuery = {
      id: `query_${Date.now()}`,
      name: queryName,
      query: query,
      dataSourceId: dataSourceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savedQueries.push(savedQuery);
    localStorage.setItem("savedQueries", JSON.stringify(savedQueries));

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header Bar - Responsive */}
      <div className="border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 py-2 sm:py-1">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/data-sources")}
              className="h-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none">
              <h1 className="text-base sm:text-lg font-semibold truncate">
                Query
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {shouldShowSQLEditor && (
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
                  className="h-8 flex-1 sm:flex-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Executing...</span>
                      <span className="sm:hidden">Run</span>
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Run query</span>
                      <span className="sm:hidden">Run</span>
                    </>
                  )}
                </Button>
                {results && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload("csv")}>
                        Download as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("json")}>
                        Download as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("excel")}>
                        Download as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {shouldShowSQLEditor ? (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Tables Sidebar - Hidden on mobile, visible on desktop */}
            <div
              className={cn(
                "hidden lg:flex shrink-0 transition-all duration-200 border-r bg-muted/30",
                sidebarCollapsed ? "w-16" : "w-64 xl:w-72",
              )}
            >
              <SchemaTableNavigation
                schemas={schemas || []}
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
                selectedSchema={selectedSchema}
                defaultCollapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                searchable={true}
                isLoading={schemasLoading}
              />
            </div>

            {/* Editor and Results */}
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {resultsFullScreen && results ? (
                // Full-screen results view
                <div className="h-full w-full flex flex-col bg-background overflow-hidden">
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
                  <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
                    <SQLResultViewer
                      columns={results.columns}
                      rows={results.rows}
                      loading={loading}
                      error={error}
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
                  className="h-full w-full flex-1 min-h-0"
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
                    <div className="h-full w-full flex flex-col border-b overflow-hidden">
                      <SQLEditor
                        value={query}
                        onChange={setQuery}
                        language={language}
                        onMount={(editor) => {
                          editorRef.current = editor as {
                            setValue: (value: string) => void;
                          };
                        }}
                        className="h-full w-full"
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
                        <div className="h-full w-full overflow-hidden flex flex-col">
                          <SQLResultViewer
                            columns={results.columns}
                            rows={results.rows}
                            loading={loading}
                            error={error}
                            fullScreen={resultsFullScreen}
                            onFullScreen={setResultsFullScreen}
                            onDownload={handleDownload}
                            onOpenInNewTab={() =>
                              handleOpenInNewTab(results, "query")
                            }
                          />
                        </div>
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              )}
            </div>
          </div>
        ) : (
          // View for non-SQL data sources
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Tables Sidebar - Hidden on mobile, visible on desktop */}
            <div
              className={cn(
                "hidden lg:flex shrink-0 transition-all duration-200 border-r bg-muted/30",
                sidebarCollapsed ? "w-16" : "w-64 xl:w-72",
              )}
            >
              <SchemaTableNavigation
                schemas={schemas || []}
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
                selectedSchema={selectedSchema}
                defaultCollapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                searchable={true}
                isLoading={schemasLoading}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
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
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
