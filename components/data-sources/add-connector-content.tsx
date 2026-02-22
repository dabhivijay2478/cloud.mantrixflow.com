"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ConnectionSheet,
  DataSourceGrid,
} from "@/components/data-sources";
import { PageHeader, PageHeaderSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { type CreateConnectionDto } from "@/lib/api";
import {
  useCreateConnection,
  useTestConnection as useTestConnectionLegacy,
} from "@/lib/api/hooks/use-data-sources";
import { useEtlConnectors } from "@/lib/api/hooks/use-etl-connectors";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

type ConnectionFormValues = Record<string, string>;

const ETL_ID_TO_DISPLAY: Record<string, string> = {
  "source-postgres": "postgres",
  "source-mysql": "mysql",
  "source-mongodb-v2": "mongodb",
  "source-mssql": "ms-sql-server",
  "source-snowflake": "snowflake",
  "source-bigquery": "bigquery",
  "source-s3": "s3",
  "source-shopify": "shopify",
  "source-stripe": "stripe",
  "source-hubspot": "hubspot",
  "source-salesforce": "salesforce",
  "source-github": "github",
  "source-google-sheets": "google-sheets",
  "source-google-analytics": "google-analytics",
  "source-facebook-marketing": "facebook-marketing",
  "source-airtable": "airtable",
  "source-notion": "notion",
  "source-slack": "slack",
  "source-faker": "faker",
  "source-file": "file",
};

function getDisplayId(etlId: string): string {
  if (ETL_ID_TO_DISPLAY[etlId]) return ETL_ID_TO_DISPLAY[etlId];
  return etlId.replace(/^source-/, "").replace(/-v\d+$/, "");
}

interface AddConnectorContentProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function AddConnectorContent({
  organizationId,
  onSuccess,
}: AddConnectorContentProps) {
  const [connectorFilter, setConnectorFilter] = useState<"sources" | "destinations">("sources");
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<string | null>(null);

  const { data: etlConnectors, isLoading, isError } = useEtlConnectors();
  const createConnection = useCreateConnection(organizationId);
  const testConnection = useTestConnectionLegacy(organizationId);

  const sourceConnectors = useMemo(() => {
    if (!etlConnectors?.sources?.length) return [];
    return etlConnectors.sources.map((s) => {
      const raw = typeof s === "string" ? { id: s, label: s } : s;
      const etlId = raw.id || (raw as { type?: string }).type || "";
      const displayId = getDisplayId(etlId);
      return {
        id: displayId,
        name: raw.label,
        type: displayId,
        iconType: displayId,
        disabled: false as const,
      };
    });
  }, [etlConnectors?.sources]);

  const destinationConnectors = useMemo(() => {
    if (!etlConnectors?.destinations?.length) return [];
    return etlConnectors.destinations.map((d) => {
      const raw = typeof d === "string" ? { id: d, label: d } : d;
      const displayId = raw.id?.replace(/^destination-/, "") || raw.id || raw.label;
      return {
        id: displayId,
        name: raw.label,
        type: displayId,
        iconType: displayId,
        disabled: false as const,
      };
    });
  }, [etlConnectors?.destinations]);

  const enabledDataSources = useMemo(
    () => [...sourceConnectors, ...destinationConnectors],
    [sourceConnectors, destinationConnectors],
  );

  const connectors = connectorFilter === "sources" ? sourceConnectors : destinationConnectors;

  const handleConnectorClick = useCallback((id: string) => {
    setConnectingDataSourceId(id);
    setShowConnectionSheet(true);
  }, []);

  const handleConnect = useCallback(
    async (data: ConnectionFormValues) => {
      if (!connectingDataSourceId) return;
      const dataSource = enabledDataSources.find((ds) => ds.id === connectingDataSourceId) as
        | { id: string; name: string; type: string }
        | undefined;
      if (!dataSource) return;

      try {
        const config: Record<string, unknown> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key === "name" || !value) return;
          config[key] = key === "port" ? parseInt(value, 10) : value;
        });

        if (["postgres", "mysql", "mssql", "redshift", "clickhouse", "mongodb"].includes(dataSource.type)) {
          if (data.ssl === "true" || data.tls === "true") {
            if (dataSource.type !== "mongodb") config.ssl = { enabled: true };
          }
        }

        if (dataSource.type === "mongodb" && data.useConnectionString === "true") {
          delete config.host;
          delete config.port;
          delete config.username;
          delete config.password;
          delete config.database;
        }

        await createConnection.mutateAsync({
          name: data.name,
          connection_type: dataSource.type as CreateConnectionDto["connection_type"],
          config: config as unknown as CreateConnectionDto["config"],
        });

        setShowConnectionSheet(false);
        setConnectingDataSourceId(null);
        showSuccessToast("connected", dataSource.name);
        onSuccess?.();
      } catch (error) {
        showErrorToast(
          "connectFailed",
          "Data Source",
          error instanceof Error ? error.message : "Unable to connect.",
        );
      }
    },
    [connectingDataSourceId, enabledDataSources, createConnection, onSuccess],
  );

  const handleTestConnection = useCallback(
    async (data: ConnectionFormValues): Promise<{ success: boolean; message: string }> => {
      const foundDataSource = enabledDataSources.find((ds) => ds.id === connectingDataSourceId);
      const sourceType = (foundDataSource as { type?: string })?.type || "postgres";

      const buildTestData = (): Record<string, unknown> => {
        const base = {
          type: sourceType,
          host: data.host || "",
          port: data.port ? parseInt(data.port, 10) : 5432,
          database: data.database || "",
          username: data.username || "",
          password: data.password || "",
        };
        if (sourceType === "mongodb" && data.connection_string) {
          return { type: "mongodb", connection_string: data.connection_string };
        }
        if (["shopify", "stripe", "airtable", "notion", "slack"].includes(sourceType)) {
          return { type: sourceType, api_key: data.api_key || "" };
        }
        if (sourceType === "github") {
          const repos = (data.repositories || "")
            .replace(/\n/g, " ")
            .split(/\s+/)
            .map((r) => r.trim())
            .filter(Boolean);
          return {
            type: "github",
            api_key: data.api_key || "",
            repositories: repos,
          };
        }
        return base;
      };

      try {
        const result = await testConnection.mutateAsync(buildTestData() as never);
        return {
          success: result.success,
          message: result.success ? "Connection test successful!" : result.error || "Connection test failed",
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Connection test failed",
        };
      }
    },
    [connectingDataSourceId, enabledDataSources, testConnection],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton showAction />
        <div className="flex justify-center py-12 text-muted-foreground">Loading connectors...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Add connector" />
        <div className="rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-8 text-center">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
            Unable to load connectors
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add connector"
        description="Choose a source or destination to connect"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/workspace/data-sources">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Available connectors</h3>
          <div className="flex rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => setConnectorFilter("sources")}
              className={
                connectorFilter === "sources"
                  ? "rounded-md px-3 py-1.5 text-sm font-medium bg-muted text-foreground"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              }
            >
              Sources
            </button>
            <button
              type="button"
              onClick={() => setConnectorFilter("destinations")}
              className={
                connectorFilter === "destinations"
                  ? "rounded-md px-3 py-1.5 text-sm font-medium bg-muted text-foreground"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              }
            >
              Destinations
            </button>
          </div>
        </div>

        <DataSourceGrid
          dataSources={connectors}
          isConnected={() => false}
          getConnectedDataSource={() => undefined}
          onDataSourceClick={handleConnectorClick}
        />

        {connectors.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No connectors available.
          </div>
        )}
      </div>

      <ConnectionSheet
        open={showConnectionSheet}
        onOpenChange={(open) => {
          setShowConnectionSheet(open);
          if (!open) setConnectingDataSourceId(null);
        }}
        dataSourceId={connectingDataSourceId}
        dataSource={
          connectingDataSourceId
            ? enabledDataSources.find((ds) => ds.id === connectingDataSourceId) ?? null
            : null
        }
        onConnect={handleConnect}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}
