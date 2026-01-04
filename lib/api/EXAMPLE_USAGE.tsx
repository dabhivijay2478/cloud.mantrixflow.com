/**
 * Example: How to integrate API hooks into existing pages
 *
 * This file shows examples of replacing mock data with real API calls
 */

"use client";

// Example 1: Replace mock connections with real API
import {
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
  type CreateConnectionDto,
} from "@/lib/api";

export function ExampleDataSourcesPage() {
  // Replace: const { dataSources } = useWorkspaceStore();
  const { data: connections, isLoading, error } = useConnections();

  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();

  const handleConnect = async (formData: CreateConnectionDto) => {
    try {
      // Test connection first
      const testResult = await testConnection.mutateAsync(formData.config);

      if (!testResult.success) {
        throw new Error(testResult.error || "Connection test failed");
      }

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
          <button onClick={() => handleDelete(conn.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// Example 2: Using schema discovery
import { useTables, useTableSchema } from "@/lib/api";

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
import { usePipelines, useRunPipeline, usePipelineStats } from "@/lib/api";

export function ExamplePipelinesPage() {
  const { data: pipelines } = usePipelines();
  const runPipeline = useRunPipeline();

  const handleRun = async (pipelineId: string) => {
    await runPipeline.mutateAsync(pipelineId);
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
  pipeline: any;
  onRun: () => void;
}) {
  const { data: stats } = usePipelineStats(pipeline.id);

  return (
    <div>
      <h3>{pipeline.name}</h3>
      <p>Status: {pipeline.status}</p>
      {stats && (
        <div>
          <p>Total Runs: {stats.totalRuns}</p>
          <p>
            Success Rate:{" "}
            {((stats.successfulRuns / stats.totalRuns) * 100).toFixed(1)}%
          </p>
        </div>
      )}
      <button onClick={onRun}>Run Pipeline</button>
    </div>
  );
}

// Example 4: Query execution
import { useState } from "react";
import { useExecuteQuery } from "@/lib/api";

export function ExampleQueryEditor({ connectionId }: { connectionId: string }) {
  const executeQuery = useExecuteQuery();
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
      <button onClick={handleExecute} disabled={executeQuery.isPending}>
        {executeQuery.isPending ? "Executing..." : "Execute Query"}
      </button>
    </div>
  );
}
