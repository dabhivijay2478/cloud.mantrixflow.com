"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/bi/data-table";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  ArrowLeft,
  Play,
  Database,
  Loader2,
  Table as TableIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

// Mock query execution - replace with actual API call
const executeQuery = async (
  dataSourceId: string,
  dataSourceType: string,
  query: string
): Promise<{ columns: string[]; rows: any[] }> => {
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
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0],
        status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
      })),
    };
  } else if (lowerQuery.includes("find") || lowerQuery.includes("db.")) {
    // MongoDB-like query
    return {
      columns: ["_id", "name", "email", "age", "city"],
      rows: Array.from({ length: 30 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943901${i}`,
        name: `Document ${i + 1}`,
        email: `doc${i + 1}@example.com`,
        age: 20 + (i % 40),
        city: ["New York", "London", "Tokyo", "Paris"][i % 4],
      })),
    };
  } else if (lowerQuery.includes("get") || lowerQuery.includes("api")) {
    // API-like query
    return {
      columns: ["id", "title", "description", "status", "updated_at"],
      rows: Array.from({ length: 25 }, (_, i) => ({
        id: `api-${i + 1}`,
        title: `API Resource ${i + 1}`,
        description: `Description for resource ${i + 1}`,
        status: i % 2 === 0 ? "success" : "error",
        updated_at: new Date().toISOString(),
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
    mongodb: `db.${table}.find({}).limit(100)`,
    api: `GET /api/v1/${table}`,
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
  const { dataSources } = useWorkspaceStore();
  
  const dataSource = dataSources.find((ds) => ds.id === dataSourceId);
  
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [results, setResults] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  
  const editorRef = useRef<any>(null);
  const language = dataSource ? getLanguageForDataSource(dataSource.type) : "sql";
  
  // Check if SQL editor should be shown
  const shouldShowSQLEditor = dataSource && 
    dataSource.status === "connected" && 
    supportsSQLQueries(dataSource.type);

  useEffect(() => {
    if (dataSource && !query && shouldShowSQLEditor) {
      const defaultQuery = getDefaultQuery(
        dataSource.type,
        dataSource.selectedTable || dataSource.tables?.[0]
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
              <p className="text-muted-foreground mb-2">Data source is not connected</p>
              <p className="text-sm text-muted-foreground mb-4">
                Please connect the data source first to view tables and run queries.
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
      setQueryHistory((prev) => [query, ...prev.slice(0, 9)]);
      toast.success("Query executed successfully", `Returned ${result.rows.length} rows`);
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
      toast.error("Query execution failed", err.message || "An error occurred while executing the query.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (tableName: string) => {
    if (shouldShowSQLEditor) {
      const newQuery = getDefaultQuery(dataSource.type, tableName);
      setQuery(newQuery);
      if (editorRef.current) {
        editorRef.current.setValue(newQuery);
      }
    } else {
      // For non-SQL data sources, directly load table data
      setLoading(true);
      setError(null);
      setResults(null);
      
      try {
        const query = getDefaultQuery(dataSource.type, tableName);
        const result = await executeQuery(dataSourceId, dataSource.type, query);
        setResults(result);
        toast.success("Table loaded successfully", `Loaded ${result.rows.length} rows`);
      } catch (err: any) {
        setError(err.message || "Failed to load table data");
        toast.error("Failed to load table", err.message || "An error occurred while loading the table.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Create columns for data table
  const columns: ColumnDef<any>[] =
    results?.columns.map((col) => ({
      accessorKey: col,
      header: col,
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground">NULL</span>;
        }
        if (typeof value === "object") {
          return <span className="text-muted-foreground">{JSON.stringify(value)}</span>;
        }
        return <span>{String(value)}</span>;
      },
    })) || [];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/data-sources")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" />
                {dataSource.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Query Editor - {dataSource.type.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={dataSource.status === "connected" ? "default" : "secondary"}>
              {dataSource.status}
            </Badge>
            {shouldShowSQLEditor && (
              <Button
                onClick={handleExecuteQuery}
                disabled={loading || !query.trim()}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Query
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Tables Sidebar */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            className="border-r bg-muted/30"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-semibold">Tables</span>
                  {dataSource.tables && (
                    <Badge variant="secondary" className="ml-2">
                      {dataSource.tables.length}
                    </Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {dataSource.tables && dataSource.tables.length > 0 ? (
                    dataSource.tables.map((table) => (
                      <Button
                        key={table}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleTableClick(table)}
                      >
                        <TableIcon className="mr-2 h-4 w-4" />
                        {table}
                      </Button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No tables available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Query Editor and Results */}
          <ResizablePanel defaultSize={80} minSize={50}>
            {shouldShowSQLEditor ? (
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Query Editor */}
                <ResizablePanel
                  defaultSize={editorExpanded ? 100 : 50}
                  minSize={20}
                  maxSize={resultsExpanded ? 20 : 100}
                  collapsible
                >
                  <Card className="h-full flex flex-col border-0 rounded-none">
                    <CardHeader className="flex-shrink-0 border-b px-4 py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Query Editor</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditorExpanded(!editorExpanded);
                            setResultsExpanded(false);
                          }}
                        >
                          {editorExpanded ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                      <Editor
                        height="100%"
                        language={language}
                        value={query}
                        onChange={(value) => setQuery(value || "")}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: "on",
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                          tabSize: 2,
                          insertSpaces: true,
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                        onMount={(editor) => {
                          editorRef.current = editor;
                        }}
                      />
                    </CardContent>
                  </Card>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Results */}
                <ResizablePanel
                  defaultSize={resultsExpanded ? 100 : 50}
                  minSize={20}
                  maxSize={editorExpanded ? 20 : 100}
                  collapsible
                >
                  <Card className="h-full flex flex-col border-0 rounded-none">
                    <CardHeader className="flex-shrink-0 border-b px-4 py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Results
                          {results && (
                            <Badge variant="secondary" className="ml-2">
                              {results.rows.length} rows
                            </Badge>
                          )}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setResultsExpanded(!resultsExpanded);
                            setEditorExpanded(false);
                          }}
                        >
                          {resultsExpanded ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 overflow-auto p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Executing query...</p>
                          </div>
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-destructive font-medium mb-2">Error</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                          </div>
                        </div>
                      ) : results ? (
                        <DataTable
                          columns={columns}
                          data={results.rows}
                          pagination={true}
                          pageSize={20}
                          filterable={true}
                          filterColumn={results.columns[0]}
                          filterPlaceholder="Filter results..."
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Click "Run Query" to execute your query
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              // View for non-SQL data sources or when SQL editor shouldn't be shown
              <Card className="h-full flex flex-col border-0 rounded-none">
                <CardHeader className="flex-shrink-0 border-b px-4 py-2">
                  <CardTitle className="text-sm font-medium">
                    Tables & Data
                    {results && (
                      <Badge variant="secondary" className="ml-2">
                        {results.rows.length} rows
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading data...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-destructive font-medium mb-2">Error</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  ) : results ? (
                    <DataTable
                      columns={columns}
                      data={results.rows}
                      pagination={true}
                      pageSize={20}
                      filterable={true}
                      filterColumn={results.columns[0]}
                      filterPlaceholder="Filter results..."
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Select a table from the sidebar to view data
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

