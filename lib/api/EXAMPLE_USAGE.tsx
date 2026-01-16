/**
 * Example: How to integrate API hooks into existing pages
 *
 * This file shows examples of replacing mock data with real API calls
 */

"use client";

// Example 1: Replace mock connections with real API
import {
  type CreateConnectionDto,
  useConnections,
  useCreateConnection,
  useDeleteConnection,
} from "@/lib/api";
import { useTestConnection as useTestConnectionLegacy } from "@/lib/api/hooks/use-data-sources";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export function ExampleDataSourcesPage() {
  // Replace: const { dataSources } = useWorkspaceStore();
  // Get current organization ID (required for all operations)
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;

  const { data: connections, isLoading, error } = useConnections(orgId);

  const createConnection = useCreateConnection(orgId);
  const deleteConnection = useDeleteConnection(orgId);
  const testConnection = useTestConnectionLegacy();

  const _handleConnect = async (formData: CreateConnectionDto) => {
    try {
      // Test connection first
      // Note: testConnection expects TestConnectionDto, not ConnectionConfig
      // const testResult = await testConnection.mutateAsync({
      //   ...formData.config,
      //   sourceType: formData.sourceType,
      // });

      // if (!testResult.success) {
      //   throw new Error(testResult.error || "Connection test failed");
      // }

      // Create connection
      await createConnection.mutateAsync(formData);
    } catch (error) {
      console.error("Failed to create connection:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteConnection.mutateAsync(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {connections?.map((conn) => (
        <div key={conn.id}>
          {conn.name} - {conn.status}
          <button type="button" onClick={() => handleDelete(conn.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// Example 2: Using schema discovery
import { useTableSchema, useTables } from "@/lib/api";

export function ExampleSchemaDiscovery({
  connectionId,
}: {
  connectionId: string;
}) {
  const { data: tables } = useTables(connectionId, "public");
  const { data: schema } = useTableSchema(connectionId, "users", "public");

  return (
    <div>
      <h3>Tables</h3>
      <ul>
        {tables?.map((table) => (
          <li key={table.name}>{table.name}</li>
        ))}
      </ul>

      {schema && (
        <div>
          <h3>Users Table Schema</h3>
          <ul>
            {schema.columns.map((col) => (
              <li key={col.name}>
                {col.name}: {col.dataType} {col.nullable ? "(nullable)" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Example 3: Using pipelines
import type { Pipeline } from "@/lib/api";
import { usePipelineStats, usePipelines, useRunPipeline } from "@/lib/api";

export function ExamplePipelinesPage() {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;
  const { data: pipelines } = usePipelines(orgId);

  const handleRun = async (pipelineId: string) => {
    // Note: useRunPipeline requires both orgId and pipelineId
    // This is a simplified example - in practice, you'd manage the hook at component level
    // const runPipeline = useRunPipeline(orgId, pipelineId);
    // await runPipeline.mutateAsync();
    console.log("Run pipeline:", pipelineId);
  };

  return (
    <div>
      {pipelines?.map((pipeline) => (
        <PipelineCard
          key={pipeline.id}
          pipeline={pipeline}
          onRun={() => handleRun(pipeline.id)}
        />
      ))}
    </div>
  );
}

function PipelineCard({
  pipeline,
  onRun,
}: {
  pipeline: Pipeline;
  onRun: () => void;
}) {
  // Note: usePipelineStats requires both orgId and pipelineId
  // This is a simplified example - in practice, you'd pass orgId as a prop
  // const { currentOrganization } = useWorkspaceStore();
  // const orgId = currentOrganization?.id;
  // const { data: stats } = usePipelineStats(orgId, pipeline.id);

  return (
    <div>
      <h3>{pipeline.name}</h3>
      <p>Status: {pipeline.status}</p>
      {/* Example stats display - uncomment when usePipelineStats is properly configured */}
      {/* {stats && (
        <div>
          <p>Total Runs: {stats.totalRuns}</p>
          <p>
            Success Rate:{" "}
            {((stats.successfulRuns / stats.totalRuns) * 100).toFixed(1)}%
          </p>
        </div>
      )} */}
      <button type="button" onClick={onRun}>
        Run Pipeline
      </button>
    </div>
  );
}

// Example 4: Query execution
import { useState } from "react";
import { useExecuteQuery } from "@/lib/api";

export function ExampleQueryEditor({ connectionId }: { connectionId: string }) {
  const { currentOrganization } = useWorkspaceStore();
  const orgId = currentOrganization?.id;
  const executeQuery = useExecuteQuery(orgId);
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10");

  const handleExecute = async () => {
    try {
      const result = await executeQuery.mutateAsync({
        connectionId,
        data: { query },
      });

      if (result.success && result.result) {
        console.log("Columns:", result.result.columns);
        console.log("Rows:", result.result.rows);
        console.log("Row Count:", result.result.rowCount);
      }
    } catch (error) {
      console.error("Query failed:", error);
    }
  };

  return (
    <div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={10}
      />
      <button
        type="button"
        onClick={handleExecute}
        disabled={executeQuery.isPending}
      >
        {executeQuery.isPending ? "Executing..." : "Execute Query"}
      </button>
    </div>
  );
}
