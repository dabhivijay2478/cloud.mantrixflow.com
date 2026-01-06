"use client";

import { ArrowLeft, Database, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SchemaTableNavigation } from "@/components/data-sources/schema-table-navigation";
import { SQLResultViewer } from "@/components/data-sources/sql-result-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useConnection,
  useExecuteQuery,
  useSchemasWithTables,
} from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

// Mock query execution - replace with actual API call
const _executeQuery = async (
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

// Mock table data fetch - replace with actual API call
const _fetchTableData = async (
  _dataSourceId: string,
  _dataSourceType: string,
  tableName: string,
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
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
};

export default function QueryResultsViewPage() {
  const params = useParams();
  const router = useRouter();
  const dataSourceId = params.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  // Fetch connection and schemas from API
  const { data: connection, isLoading: connectionLoading } =
    useConnection(dataSourceId);
  const { data: schemas, isLoading: schemasLoading } = useSchemasWithTables(
    dataSourceId,
    orgId,
  );
  const executeQueryMutation = useExecuteQuery(orgId);

  const [results, setResults] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"query" | "table">("query");
  const [query, setQuery] = useState<string>("");
  const [tableName, setTableName] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        tables: [],
      }
    : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get data from sessionStorage
    const storedData = sessionStorage.getItem(`query-results-${dataSourceId}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log(
          "[QueryViewPage] Loading data from sessionStorage:",
          parsed,
        );
        setResults(parsed.results);
        setViewType(parsed.viewType || "query");
        setQuery(parsed.query || "");
        setTableName(parsed.tableName || "");
        // Extract schema from table name if it contains a dot
        if (parsed.tableName?.includes(".")) {
          const [schema, table] = parsed.tableName.split(".");
          setSelectedSchema(schema);
          setSelectedTable(table);
        } else if (parsed.tableName) {
          setSelectedSchema("public");
          setSelectedTable(parsed.tableName);
        }
      } catch (err) {
        console.error("Failed to parse stored data:", err);
        toast.error("Failed to load results", "Invalid data format");
      }
    } else {
      console.warn(
        "[QueryViewPage] No data found in sessionStorage, redirecting...",
      );
      // No data found, redirect back
      router.push(`/workspace/data-sources/${dataSourceId}/query`);
    }
  }, [dataSourceId, router]);

  const handleRefresh = async () => {
    if (!dataSource || !orgId) return;

    setLoading(true);
    setError(null);

    try {
      let newResults: { columns: string[]; rows: Record<string, unknown>[] };

      if (viewType === "query" && query) {
        // Execute query using API
        const result = await executeQueryMutation.mutateAsync({
          connectionId: dataSourceId,
          data: {
            query: query.trim(),
          },
        });

        if (
          result &&
          result.success &&
          result.result &&
          Array.isArray(result.result.rows) &&
          Array.isArray(result.result.columns)
        ) {
          const queryResult = result.result;
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

          newResults = {
            columns: columnNames,
            rows: queryResult.rows.map((row: unknown) => {
              if (row && typeof row === "object" && !Array.isArray(row)) {
                return row as Record<string, unknown>;
              }
              if (Array.isArray(row)) {
                const rowObj: Record<string, unknown> = {};
                columnNames.forEach((colName: string, idx: number) => {
                  rowObj[colName] = row[idx];
                });
                return rowObj;
              }
              return row as Record<string, unknown>;
            }),
          };
        } else {
          throw new Error(result.error || "Invalid response format");
        }
      } else if (viewType === "table" && tableName) {
        // Fetch table data using API
        const result = await executeQueryMutation.mutateAsync({
          connectionId: dataSourceId,
          data: {
            query: `SELECT * FROM ${tableName} LIMIT 100`,
          },
        });

        if (
          result &&
          result.success &&
          result.result &&
          Array.isArray(result.result.rows) &&
          Array.isArray(result.result.columns)
        ) {
          const queryResult = result.result;
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

          newResults = {
            columns: columnNames,
            rows: queryResult.rows.map((row: unknown) => {
              if (row && typeof row === "object" && !Array.isArray(row)) {
                return row as Record<string, unknown>;
              }
              if (Array.isArray(row)) {
                const rowObj: Record<string, unknown> = {};
                columnNames.forEach((colName: string, idx: number) => {
                  rowObj[colName] = row[idx];
                });
                return rowObj;
              }
              return row as Record<string, unknown>;
            }),
          };
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        toast.error("No data to refresh", "Please select a table or query");
        setLoading(false);
        return;
      }

      setResults(newResults);
      // Update sessionStorage
      sessionStorage.setItem(
        `query-results-${dataSourceId}`,
        JSON.stringify({
          results: newResults,
          viewType,
          query,
          tableName,
        }),
      );
      toast.success("Data refreshed", "Results have been updated");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
      toast.error("Refresh failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (tableName: string, schemaName: string) => {
    if (!dataSource || !orgId) return;

    const fullTableName =
      schemaName === "public" ? tableName : `${schemaName}.${tableName}`;
    setTableName(fullTableName);
    setSelectedTable(tableName);
    setSelectedSchema(schemaName);
    setViewType("table");
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await executeQueryMutation.mutateAsync({
        connectionId: dataSourceId,
        data: {
          query: `SELECT * FROM ${fullTableName} LIMIT 100`,
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

        const convertedResult = {
          columns: columnNames,
          rows: queryResult.rows.map((row: unknown) => {
            if (row && typeof row === "object" && !Array.isArray(row)) {
              return row as Record<string, unknown>;
            }
            if (Array.isArray(row)) {
              const rowObj: Record<string, unknown> = {};
              columnNames.forEach((colName: string, idx: number) => {
                rowObj[colName] = row[idx];
              });
              return rowObj;
            }
            return row as Record<string, unknown>;
          }),
        };

        setResults(convertedResult);
        // Update sessionStorage
        sessionStorage.setItem(
          `query-results-${dataSourceId}`,
          JSON.stringify({
            results: convertedResult,
            viewType: "table",
            query: "",
            tableName: fullTableName,
          }),
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load table data";
      setError(errorMessage);
      toast.error("Failed to load table", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (connectionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden fixed inset-0">
      {/* Header - Responsive */}
      <div className="border-b shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/workspace/data-sources/${dataSourceId}/query`)
              }
              className="h-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="text-base sm:text-lg font-semibold truncate">
                Query Results
              </h1>
              {viewType === "table" && tableName && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Table: {tableName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-8 flex-1 sm:flex-none"
            >
              <RefreshCw
                className={cn("h-4 w-4 sm:mr-2", loading && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Tables Sidebar - Hidden on mobile, visible on desktop */}
        <div
          className={cn(
            "hidden lg:flex shrink-0 transition-all duration-200 border-r bg-muted/30 overflow-hidden",
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

        {/* Results Viewer - Full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {results ? (
            <div className="flex-1 min-h-0 w-full overflow-hidden">
              <SQLResultViewer
                columns={results.columns}
                rows={results.rows}
                loading={loading}
                error={error}
                hideExternalTabButton={true}
                title={
                  viewType === "table" ? `Table: ${tableName}` : "Query Results"
                }
                onDownload={(format) => {
                  // Handle download
                  const headers = results.columns.join(",");
                  let content = "";
                  let filename = "";
                  let mimeType = "";

                  if (format === "csv") {
                    content = [
                      headers,
                      ...results.rows.map((row) =>
                        results.columns
                          .map((col) => {
                            const val = row[col];
                            if (val === null || val === undefined) return "";
                            if (typeof val === "object")
                              return JSON.stringify(val);
                            return String(val).replace(/"/g, '""');
                          })
                          .map((v) => `"${v}"`)
                          .join(","),
                      ),
                    ].join("\n");
                    filename = `${viewType === "table" ? tableName : "query-results"}.csv`;
                    mimeType = "text/csv";
                  } else if (format === "json") {
                    content = JSON.stringify(results.rows, null, 2);
                    filename = `${viewType === "table" ? tableName : "query-results"}.json`;
                    mimeType = "application/json";
                  }

                  const blob = new Blob([content], { type: mimeType });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(
                    "Download started",
                    `Downloading as ${format.toUpperCase()}`,
                  );
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <Database className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  No results to display
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
