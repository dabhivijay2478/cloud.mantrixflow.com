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
  useConnections,
  useCreateConnection,
  useTestConnection as useTestConnectionLegacy,
} from "@/lib/api/hooks/use-data-sources";
import { getApiErrorMessage } from "@/lib/api/error-handler";
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

  const { data: existingConnections = [] } = useConnections(organizationId);
  const createConnection = useCreateConnection(organizationId, {
    showToastOnError: false,
  });
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

      const name = (data.name ?? "").trim();
      if (!name) {
        showErrorToast("validationFailed", undefined, "Name is required.");
        return;
      }

      const nameExists = existingConnections.some(
        (c) => c.name?.toLowerCase() === name.toLowerCase(),
      );
      if (nameExists) {
        showErrorToast(
          "validationFailed",
          undefined,
          `A data source with name "${name}" already exists. Please choose a different name.`,
        );
        return;
      }

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
        if (dataSource.type === "mongodb") {
          if (data.connectionType === "atlas_srv") {
            config.srv = true;
          }
          if (data.database) {
            config.database_includes = [data.database];
          }
          if (data.authSource) {
            config.authSource = data.authSource;
          }
          if (data.tls === "true") {
            config.tls = true;
          }
          if (data.mongo_strategy) {
            config.mongo_strategy = data.mongo_strategy;
          }
          if (data.mongo_infer_sample_size) {
            config.mongo_infer_sample_size = parseInt(data.mongo_infer_sample_size, 10) || 2000;
          }
          if (data.connection_string) {
            config.connection_string = data.connection_string;
          }
          if (data.collection_suffix) {
            config.collection_suffix = data.collection_suffix;
          }
          if (data.add_record_metadata === "true" || data.add_record_metadata === true) {
            config.add_record_metadata = true;
          }
        }

        await createConnection.mutateAsync({
          name,
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
          getApiErrorMessage(error),
        );
      }
    },
    [
      connectingDataSourceId,
      enabledDataSources,
      existingConnections,
      createConnection,
      connectorFilter,
      onSuccess,
    ],
  );

  const handleTestConnection = useCallback(
    async (data: ConnectionFormValues): Promise<{ success: boolean; message: string }> => {
      const foundDataSource = enabledDataSources.find((ds) => ds.id === connectingDataSourceId);
      const sourceType = (foundDataSource as { type?: string })?.type || "postgres";

      const buildTestData = (): Record<string, unknown> => {
        if (sourceType === "mongodb") {
          const base: Record<string, unknown> = {
            type: sourceType,
            host: data.host || "",
            username: data.username || "",
            password: data.password || "",
            authSource: data.authSource || "admin",
            tls: data.tls === "true",
          };
          if (data.connection_string) {
            base.connection_string = data.connection_string;
          } else {
            base.port = data.port ? parseInt(data.port, 10) : 27017;
            base.srv = data.connectionType === "atlas_srv";
          }
          return base;
        }
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
