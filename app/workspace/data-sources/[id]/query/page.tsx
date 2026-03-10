"use client";

import { ArrowLeft, Database, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SqlRoomsExplorerPanel } from "@/components/explorer/sqlrooms-explorer-panel";
import { ExplorerProvider } from "@/lib/explorer/explorer-context";
import {
  useConnection,
  useDataSource,
  useSchemasWithTables,
} from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/utils/toast";

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
  const normalized = type?.trim().toLowerCase() ?? "";
  if (!normalized) return false;
  let base = normalized;
  for (const prefix of ["source-", "target-", "destination-"]) {
    if (base.startsWith(prefix)) {
      base = base.slice(prefix.length);
      break;
    }
  }
  const aliasMap: Record<string, string> = {
    postgresql: "postgres",
    pg: "postgres",
  };
  const check = aliasMap[base] ?? base;
  return sqlTypes.includes(check);
};

export default function DataSourceQueryPage() {
  const params = useParams();
  const router = useRouter();
  const dataSourceId = params.id as string;

  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  const { data: dataSourceData, isLoading: dataSourceLoading } = useDataSource(
    orgId,
    dataSourceId,
  );
  const { data: connection, isLoading: connectionLoading } = useConnection(
    orgId,
    dataSourceId,
  );
  const { data: schemas, isLoading: schemasLoading } = useSchemasWithTables(
    dataSourceId,
    orgId,
  );

  const isConnectionActive =
    connection?.status === "active" ||
    (connection?.status as string) === "connected";
  const isDataSourceActive = dataSourceData?.isActive ?? false;
  const dataSource =
    dataSourceData && connection
      ? {
          id: dataSourceData.id,
          name: dataSourceData.name,
          type: (dataSourceData.sourceType ?? dataSourceData.source_type) as string,
          status: (isConnectionActive || isDataSourceActive)
            ? ("connected" as const)
            : ("disconnected" as const),
        }
      : null;

  const [selectedSchema, setSelectedSchema] = useState<string | undefined>();
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [selectedSchemaOnly, setSelectedSchemaOnly] = useState<
    string | undefined
  >();
  const [explorerData, setExplorerData] = useState<{
    rows: Record<string, unknown>[];
    columns: string[];
  } | null>(null);
  const [explorerError, setExplorerError] = useState<string | null>(null);
  const [explorerDataAsOf, setExplorerDataAsOf] = useState<Date | undefined>();
  const [explorerRowLimit, setExplorerRowLimit] = useState(5000);

  const handleTableSelect = (tableName: string, schemaName: string) => {
    setSelectedTable(tableName);
    setSelectedSchema(schemaName);
    setSelectedSchemaOnly(undefined);
  };

  const handleSchemaSelect = (schemaName: string) => {
    setSelectedSchemaOnly(schemaName);
    setSelectedTable(undefined);
    setSelectedSchema(schemaName);
  };

  const isConnected = dataSource?.status === "connected";
  const shouldShowExplorer =
    dataSource &&
    isConnected &&
    supportsSQLQueries(dataSource.type);

  if (dataSourceLoading || connectionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading connection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataSource || !connection) {
    return (
      <div className="flex h-screen items-center justify-center">
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

  if (!shouldShowExplorer) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b bg-background/95 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workspace/data-sources")}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">Explorer not available</h3>
              <p className="text-sm text-muted-foreground">
                SQLRooms Explorer is available for SQL database connections
                (PostgreSQL, MySQL, Redshift, etc.). Connect your data source and
                ensure it supports SQL queries.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/workspace/data-sources")}
              >
                Back to Data Sources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const explorerContextValue = {
    orgId,
    dataSourceId,
    dataSourceType: dataSource?.type,
    schemas: schemas || [],
    schemasLoading,
    selectedSchema,
    selectedTable,
    selectedSchemaOnly,
    onTableSelect: handleTableSelect,
    onSchemaSelect: handleSchemaSelect,
    loadExplorerData: async () => {
      toast.info("Run query", "Click Run to execute your SQL against the database.");
    },
    explorerRowLimit,
    setExplorerRowLimit,
    explorerLoading: false,
    setExplorerData,
    setExplorerError,
    setExplorerDataAsOf,
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {!isConnected && (
        <Alert variant="destructive" className="rounded-none border-0">
          <Database className="h-4 w-4" />
          <div className="col-start-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <AlertTitle>Data source is not connected</AlertTitle>
              <AlertDescription>
                Please connect the data source first to explore data.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/workspace/data-sources")}
              className="shrink-0 w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Data Sources
            </Button>
          </div>
        </Alert>
      )}

      {/* Minimal header */}
      <div className="flex shrink-0 items-center gap-2 border-b bg-background/95 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/workspace/data-sources")}
          className="h-8 w-8 shrink-0 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground truncate">
          {dataSource?.name}
        </span>
      </div>

      {/* SQLRooms layout - no custom sidebar */}
      <ExplorerProvider value={explorerContextValue}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SqlRoomsExplorerPanel
            dataAsOf={explorerDataAsOf}
            error={explorerError}
          />
        </div>
      </ExplorerProvider>
    </div>
  );
}
