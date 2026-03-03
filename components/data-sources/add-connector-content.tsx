"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ConnectionSheet,
  DataSourceGrid,
} from "@/components/data-sources";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { connectorsConfig } from "@/config/connectors";
import { type CreateConnectionDto } from "@/lib/api";
import {
  useCreateConnection,
  useTestConnection as useTestConnectionLegacy,
} from "@/lib/api/hooks/use-data-sources";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

type ConnectionFormValues = Record<string, string>;

/** Map connector id to display/connection type */
function getDisplayId(connectorId: string): string {
  return connectorId
    .replace(/^source-/, "")
    .replace(/^destination-/, "")
    .replace(/-v\d+$/, "");
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

  const createConnection = useCreateConnection(organizationId);
  const testConnection = useTestConnectionLegacy(organizationId);

  const sourceConnectors = useMemo(() => {
    return connectorsConfig.sources.map((s) => {
      const displayId = getDisplayId(s.id);
      return {
        id: displayId,
        name: s.label,
        type: displayId,
        iconType: displayId,
        disabled: false as const,
        connectionSchema: s.connectionSchema,
      };
    });
  }, []);

  const destinationConnectors = useMemo(() => {
    return connectorsConfig.destinations.map((d) => {
      const displayId = d.id.replace(/^destination-/, "") || d.id;
      return {
        id: displayId,
        name: d.label,
        type: displayId,
        iconType: displayId,
        disabled: false as const,
        connectionSchema: d.connectionSchema,
      };
    });
  }, []);

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
        const skipKeys = ["name", "useConnectionString"];
        Object.entries(data).forEach(([key, value]) => {
          if (skipKeys.includes(key) || value === undefined || value === "") return;
          config[key] = key === "port" ? parseInt(value, 10) : value;
        });

        if (dataSource.type === "postgres" && (data.ssl === "true" || data.tls === "true")) {
          config.ssl = { enabled: true };
        }

        // MongoDB: connection_string OR individual (host, port, username, password) per ETL spec
        if (dataSource.type === "mongodb") {
          const useConnStr = data.useConnectionString === "true";
          const mongodbConfig: Record<string, unknown> = {};
          if (useConnStr && config.connection_string) {
            mongodbConfig.connection_string = config.connection_string;
          } else if (!useConnStr && config.host && config.username && config.password) {
            mongodbConfig.host = config.host;
            mongodbConfig.port = config.port ? parseInt(String(config.port), 10) : 27017;
            mongodbConfig.username = config.username;
            mongodbConfig.password = config.password;
            mongodbConfig.database = config.database || "admin";
          }
          const dbs = (data.databases || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (dbs.length) mongodbConfig.databases = dbs;
          mongodbConfig.extra = {};
          Object.keys(config).forEach((k) => delete config[k]);
          Object.assign(config, mongodbConfig);
        }

        await createConnection.mutateAsync({
          name: data.name,
          connection_type: dataSource.type as CreateConnectionDto["connection_type"],
          connector_role: connectorFilter === "destinations" ? "destination" : "source",
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
        const sslEnabled =
          sourceType === "postgres" &&
          (data.ssl === "true" || data.ssl === "enabled" || data.tls === "true");
        const base: Record<string, unknown> = {
          type: sourceType,
          host: data.host || "",
          port: data.port ? parseInt(data.port, 10) : 5432,
          database: data.database || "",
          username: data.username || "",
          password: data.password || "",
        };
        if (sslEnabled) {
          base.ssl = { enabled: true };
        }
        if (sourceType === "mongodb") {
          const dbs = (data.databases || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const mongoBase: Record<string, unknown> = {
            type: "mongodb",
            ...(dbs.length ? { databases: dbs } : {}),
          };
          if (data.connection_string && data.useConnectionString !== "false") {
            return { ...mongoBase, connection_string: data.connection_string };
          }
          return {
            ...mongoBase,
            host: data.host || "",
            port: data.port ? parseInt(data.port, 10) : 27017,
            database: data.database || "admin",
            username: data.username || "",
            password: data.password || "",
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
