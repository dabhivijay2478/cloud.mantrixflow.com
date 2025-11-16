"use client";

import { ArrowLeft, Database, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SQLResultViewer, TableNavigation } from "@/components/bi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

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

// Mock table data fetch - replace with actual API call
const fetchTableData = async (
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
  const { dataSources } = useWorkspaceStore();

  const [results, setResults] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"query" | "table">("query");
  const [query, setQuery] = useState<string>("");
  const [tableName, setTableName] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get data from sessionStorage
    const storedData = sessionStorage.getItem(`query-results-${dataSourceId}`);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setResults(parsed.results);
        setViewType(parsed.viewType || "query");
        setQuery(parsed.query || "");
        setTableName(parsed.tableName || "");
      } catch (err) {
        console.error("Failed to parse stored data:", err);
        toast.error("Failed to load results", "Invalid data format");
      }
    } else {
      // No data found, redirect back
      router.push(`/workspace/data-sources/${dataSourceId}/query`);
    }
  }, [dataSourceId, router]);

  const handleRefresh = async () => {
    if (!dataSource) return;

    setLoading(true);
    setError(null);

    try {
      let newResults: { columns: string[]; rows: Record<string, unknown>[] };
      if (viewType === "query" && query) {
        newResults = await executeQuery(dataSourceId, dataSource.type, query);
      } else if (viewType === "table" && tableName) {
        newResults = await fetchTableData(
          dataSourceId,
          dataSource.type,
          tableName,
        );
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

  const handleTableSelect = async (selectedTable: string) => {
    if (!dataSource) return;

    setTableName(selectedTable);
    setViewType("table");
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const newResults = await fetchTableData(
        dataSourceId,
        dataSource.type,
        selectedTable,
      );

      setResults(newResults);
      // Update sessionStorage
      sessionStorage.setItem(
        `query-results-${dataSourceId}`,
        JSON.stringify({
          results: newResults,
          viewType: "table",
          query: "",
          tableName: selectedTable,
        }),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load table data";
      setError(errorMessage);
      toast.error("Failed to load table", errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/workspace/data-sources/${dataSourceId}/query`)
              }
              className="h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Query Results</h1>
              {viewType === "table" && tableName && (
                <p className="text-sm text-muted-foreground">
                  Table: {tableName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-8"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex">
        {/* Tables Sidebar */}
        <div
          className={cn(
            "shrink-0 transition-all duration-200 border-r",
            sidebarCollapsed ? "w-16" : "w-64",
          )}
        >
          <TableNavigation
            tables={dataSource.tables || []}
            selectedTable={tableName}
            onTableSelect={handleTableSelect}
            defaultCollapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            searchable={true}
          />
        </div>

        {/* Results Viewer */}
        <div className="flex-1 min-w-0 flex flex-col">
          {results ? (
            <div className="flex-1 min-h-0">
              <SQLResultViewer
                columns={results.columns}
                rows={results.rows}
                loading={loading}
                error={error}
                hideExternalTabButton={true}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results to display</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
