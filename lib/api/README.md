# API Integration Guide

This directory contains a complete, reusable API integration layer using TanStack Query for all backend endpoints.

## Structure

```
lib/api/
├── config.ts              # API configuration and auth utilities
├── client.ts              # Base API client with error handling
├── services/              # Service layer for API calls
│   ├── data-sources.service.ts
│   └── data-pipelines.service.ts
├── hooks/                 # TanStack Query hooks
│   ├── use-data-sources.ts
│   └── use-data-pipelines.ts
├── types/                 # TypeScript type definitions
│   ├── data-sources.ts
│   └── data-pipelines.ts
└── index.ts               # Central exports
```

## Quick Start

### 1. Import hooks in your components

```tsx
import { useConnections, useCreateConnection } from '@/lib/api';

function ConnectionsList() {
  const { data: connections, isLoading } = useConnections();
  const createConnection = useCreateConnection();

  const handleCreate = async () => {
    await createConnection.mutateAsync({
      name: 'My Database',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'pass',
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {connections?.map((conn) => (
        <div key={conn.id}>{conn.name}</div>
      ))}
    </div>
  );
}
```

### 2. Data Sources API Examples

#### Test Connection
```tsx
import { useTestConnection } from '@/lib/api';

function TestConnectionForm() {
  const testConnection = useTestConnection();

  const handleTest = async () => {
    const result = await testConnection.mutateAsync({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      username: 'user',
      password: 'pass',
    });
    
    if (result.success) {
      console.log('Connection successful!');
    }
  };

  return (
    <button onClick={handleTest} disabled={testConnection.isPending}>
      {testConnection.isPending ? 'Testing...' : 'Test Connection'}
    </button>
  );
}
```

#### List Tables
```tsx
import { useTables } from '@/lib/api';

function TablesList({ connectionId }: { connectionId: string }) {
  const { data: tables, isLoading } = useTables(connectionId, 'public');

  if (isLoading) return <div>Loading tables...</div>;

  return (
    <ul>
      {tables?.map((table) => (
        <li key={table.name}>{table.name}</li>
      ))}
    </ul>
  );
}
```

#### Execute Query
```tsx
import { useExecuteQuery } from '@/lib/api';

function QueryEditor({ connectionId }: { connectionId: string }) {
  const executeQuery = useExecuteQuery();

  const handleExecute = async () => {
    const result = await executeQuery.mutateAsync({
      connectionId,
      data: {
        query: 'SELECT * FROM users LIMIT 10',
      },
    });

    console.log('Query result:', result.result);
  };

  return (
    <button onClick={handleExecute}>
      Execute Query
    </button>
  );
}
```

### 3. Data Pipelines API Examples

#### Create Pipeline
```tsx
import { useCreatePipeline } from '@/lib/api';

function CreatePipelineForm() {
  const createPipeline = useCreatePipeline();

  const handleCreate = async () => {
    await createPipeline.mutateAsync({
      name: 'User Sync Pipeline',
      sourceType: 'postgres',
      sourceConnectionId: 'source-id',
      sourceTable: 'users',
      destinationConnectionId: 'dest-id',
      destinationTable: 'users_synced',
      writeMode: 'append',
      syncMode: 'full',
    });
  };

  return (
    <button onClick={handleCreate}>
      Create Pipeline
    </button>
  );
}
```

#### Run Pipeline
```tsx
import { useRunPipeline, usePipelineRuns } from '@/lib/api';

function PipelineControls({ pipelineId }: { pipelineId: string }) {
  const runPipeline = useRunPipeline();
  const { data: runs } = usePipelineRuns(pipelineId);

  const handleRun = async () => {
    await runPipeline.mutateAsync(pipelineId);
  };

  return (
    <div>
      <button onClick={handleRun}>Run Pipeline</button>
      <div>Total runs: {runs?.length}</div>
    </div>
  );
}
```

## Available Hooks

### Data Sources Hooks

#### Connection Management
- `useTestConnection()` - Test a connection without saving
- `useCreateConnection()` - Create a new connection
- `useConnections()` - List all connections
- `useConnection(id)` - Get a specific connection
- `useUpdateConnection()` - Update a connection
- `useDeleteConnection()` - Delete a connection

#### Schema Discovery
- `useDatabases(connectionId)` - List databases
- `useSchemas(connectionId)` - List schemas
- `useTables(connectionId, schema?)` - List tables
- `useTableSchema(connectionId, table, schema?)` - Get table schema
- `useRefreshSchema()` - Refresh schema cache

#### Query Execution
- `useExecuteQuery()` - Execute a SQL query
- `useExplainQuery()` - Explain a query execution plan

#### Data Synchronization
- `useCreateSyncJob()` - Create a sync job
- `useSyncJobs(connectionId)` - List sync jobs
- `useSyncJob(connectionId, jobId)` - Get a specific sync job
- `useCancelSyncJob()` - Cancel a sync job
- `useUpdateSyncJobSchedule()` - Update sync job schedule

#### Monitoring
- `useConnectionHealth(connectionId)` - Get connection health (auto-refreshes every 30s)
- `useQueryLogs(connectionId, limit?, offset?)` - Get query logs
- `useConnectionMetrics(connectionId)` - Get connection metrics (auto-refreshes every minute)

### Data Pipelines Hooks

#### Pipeline Management
- `useCreatePipeline()` - Create a new pipeline
- `usePipelines()` - List all pipelines
- `usePipeline(id)` - Get a specific pipeline
- `useUpdatePipeline()` - Update a pipeline
- `useDeletePipeline()` - Delete a pipeline

#### Pipeline Execution
- `useRunPipeline()` - Execute a pipeline
- `useDryRunPipeline()` - Test a pipeline without executing
- `usePausePipeline()` - Pause a pipeline
- `useResumePipeline()` - Resume a pipeline

#### Pipeline Configuration
- `useValidatePipeline()` - Validate pipeline configuration
- `useAutoMapColumns()` - Auto-map columns between source and destination

#### Pipeline Monitoring
- `usePipelineRuns(pipelineId, limit?, offset?)` - Get pipeline run history
- `usePipelineRun(pipelineId, runId)` - Get a specific pipeline run
- `usePipelineStats(pipelineId)` - Get pipeline statistics (auto-refreshes every 30s)

## Configuration

### API Base URL

Set the `NEXT_PUBLIC_API_URL` environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Authentication

The API client automatically includes the auth token from localStorage. Update `getAuthToken()` in `config.ts` to integrate with your auth system.

## Error Handling

All hooks use TanStack Query's error handling. Access errors via the mutation/query result:

```tsx
const createConnection = useCreateConnection();

const handleCreate = async () => {
  try {
    await createConnection.mutateAsync({ ... });
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error('API Error:', error.code, error.message);
      console.error('Suggestion:', error.suggestion);
    }
  }
};
```

## Query Invalidation

Hooks automatically invalidate related queries on mutations. For example:
- Creating a connection invalidates the connections list
- Updating a connection invalidates both the connection detail and list
- Running a pipeline invalidates pipeline stats and runs

## TypeScript Support

All types are exported and can be imported:

```tsx
import type { Connection, Pipeline, CreatePipelineDto } from '@/lib/api';
```

## Best Practices

1. **Use hooks in components** - Don't call services directly, use the hooks
2. **Handle loading states** - Check `isLoading` or `isPending` before rendering data
3. **Handle errors** - Wrap mutations in try-catch or use `onError` callbacks
4. **Optimistic updates** - Use `onMutate` for optimistic UI updates
5. **Query keys** - Use exported query keys for manual invalidation if needed

## Example: Complete Component

```tsx
'use client';

import {
  useConnections,
  useCreateConnection,
  useDeleteConnection,
  useTestConnection,
  type CreateConnectionDto,
} from '@/lib/api';
import { useState } from 'react';

export function ConnectionsPage() {
  const { data: connections, isLoading, error } = useConnections();
  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();

  const [formData, setFormData] = useState<CreateConnectionDto>({
    name: '',
    config: {
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test connection first
    const testResult = await testConnection.mutateAsync(formData.config);
    
    if (!testResult.success) {
      alert('Connection test failed: ' + testResult.error);
      return;
    }

    // Create connection
    await createConnection.mutateAsync(formData);
    setFormData({
      name: '',
      config: {
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: '',
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      await deleteConnection.mutateAsync(id);
    }
  };

  if (isLoading) return <div>Loading connections...</div>;
  if (error) return <div>Error loading connections</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Connection name"
        />
        <input
          value={formData.config.host}
          onChange={(e) =>
            setFormData({
              ...formData,
              config: { ...formData.config, host: e.target.value },
            })
          }
          placeholder="Host"
        />
        {/* More form fields... */}
        <button type="submit" disabled={createConnection.isPending}>
          {createConnection.isPending ? 'Creating...' : 'Create Connection'}
        </button>
      </form>

      <ul>
        {connections?.map((conn) => (
          <li key={conn.id}>
            {conn.name} - {conn.status}
            <button onClick={() => handleDelete(conn.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
