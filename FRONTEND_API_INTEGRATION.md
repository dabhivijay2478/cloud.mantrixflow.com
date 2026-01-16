# Frontend API Integration - Progress Report

## ✅ Completed Tasks

### 1. TypeScript Types Updated
- ✅ **`lib/api/types/data-sources.ts`** - Complete types for new data source schema
  - Added `DataSource`, `DataSourceConnection`, `ConnectionConfig` types
  - Added config types for all source types (Postgres, MySQL, MongoDB, S3, API, etc.)
  - Kept legacy types for backward compatibility

- ✅ **`lib/api/types/data-pipelines.ts`** - Updated for new schema
  - Changed `orgId` → `organization_id`
  - Changed `userId` → `created_by`
  - Changed `sourceConnectionId` → `sourceDataSourceId`
  - Changed `destinationConnectionId` → `destinationDataSourceId`
  - Added `PipelineSourceSchema` and `PipelineDestinationSchema` with `data_source` references

- ✅ **`lib/api/types/organizations.ts`** - Updated for new ownership model
  - Added `owner_user_id` field
  - Added `TransferOwnershipDto` type
  - Removed references to `organization_owners` table

### 2. New Services Created
- ✅ **`lib/api/services/data-source.service.ts`** - NEW service for data source endpoints
  - `listDataSources(organizationId, filters?)`
  - `getDataSource(organizationId, dataSourceId)`
  - `createDataSource(organizationId, data)`
  - `updateDataSource(organizationId, dataSourceId, data)`
  - `deleteDataSource(organizationId, dataSourceId)`
  - `getSupportedTypes(organizationId)`

- ✅ **`lib/api/services/connection.service.ts`** - NEW service for connection management
  - `createOrUpdateConnection(organizationId, dataSourceId, data)`
  - `getConnection(organizationId, dataSourceId, includeSensitive?)`
  - `updateConnection(organizationId, dataSourceId, data)`
  - `testConnection(organizationId, dataSourceId)`
  - `discoverSchema(organizationId, dataSourceId)`

### 3. Services Updated
- ✅ **`lib/api/services/data-pipelines.service.ts`** - Updated all methods
  - Changed from `/api/data-pipelines` to `/api/organizations/:organizationId/pipelines`
  - All methods now require `organizationId` as first parameter
  - Updated method signatures: `createPipeline(organizationId, data)`, etc.

- ✅ **`lib/api/services/organizations.service.ts`** - Added transfer ownership
  - Added `transferOwnership(organizationId, data)` method
  - Removed console.log statements

- ✅ **`lib/api/services/data-sources.service.ts`** - Legacy service (kept for backward compatibility)
  - Still uses old `/api/data-sources/postgres` endpoints
  - Will be deprecated in favor of new `DataSourceService`

### 4. React Hooks Created/Updated
- ✅ **`lib/api/hooks/use-data-source.ts`** - NEW hooks for data sources
  - `useDataSources(organizationId, filters?)`
  - `useDataSource(organizationId, dataSourceId)`
  - `useSupportedDataSourceTypes(organizationId)`
  - `useCreateDataSource(organizationId)`
  - `useUpdateDataSource(organizationId, dataSourceId)`
  - `useDeleteDataSource(organizationId)`

- ✅ **`lib/api/hooks/use-connection.ts`** - NEW hooks for connections
  - `useConnection(organizationId, dataSourceId, includeSensitive?)`
  - `useCreateOrUpdateConnection(organizationId, dataSourceId)`
  - `useUpdateConnection(organizationId, dataSourceId)`
  - `useTestConnection(organizationId, dataSourceId)`
  - `useDiscoverSchema(organizationId, dataSourceId)`

- ✅ **`lib/api/hooks/use-data-pipelines.ts`** - Updated all hooks
  - All hooks now require `organizationId` parameter
  - Updated query keys to include `organizationId`
  - Updated method calls to use new service signatures

- ✅ **`lib/api/hooks/use-organizations.ts`** - Added transfer ownership hook
  - Added `useTransferOwnership(organizationId)` hook

### 5. Exports Updated
- ✅ **`lib/api/index.ts`** - Added new exports
  - Exported `DataSourceService` and `ConnectionService`
  - Exported new hooks: `use-data-source`, `use-connection`
  - All types exported

## ⚠️ Remaining Tasks

### 1. Update Components to Use New Hooks

#### High Priority Components:
1. **`app/workspace/data-sources/page.tsx`**
   - Currently uses `useConnections(orgId)` - should use `useDataSources(organizationId)`
   - Update to use new `DataSourceService` instead of legacy `DataSourcesService`
   - Remove console.log statements

2. **`app/workspace/data-pipelines/page.tsx`**
   - Update `usePipelines(orgId)` → `usePipelines(organizationId)`
   - Update all pipeline operations to pass `organizationId`

3. **`app/workspace/data-pipelines/new/collector-step.tsx`**
   - Update to use `useDataSources(organizationId)` instead of `useConnections(orgId)`
   - Update data source selection to show new data source structure

4. **`app/workspace/data-pipelines/new/emitter-step.tsx`**
   - Update destination selection to use new data sources

5. **`app/organizations/page.tsx`**
   - Add transfer ownership functionality
   - Update to check `owner_user_id` instead of `organization_owners`

#### Medium Priority Components:
6. **`app/workspace/data-sources/[id]/query/page.tsx`**
   - Update to use new connection hooks
   - Update `orgId` → `organizationId`

7. **`app/workspace/data-sources/[id]/query/view/page.tsx`**
   - Similar updates as above

### 2. Remove Console.log Statements
- ⚠️ **`lib/api/client.ts`** - Has 12 console.log/error statements
- ⚠️ **`lib/api/config.ts`** - Has 7 console.log/warn statements
- ⚠️ **Component files** - Multiple files have console.log statements

### 3. Update State Management
- ⚠️ **`lib/stores/workspace-store.ts`** - May need updates for new schema
- Check if it references old `orgId` or connection structures

### 4. Create New UI Components
- ⚠️ **Data Source Management Components** - Need to be created:
  - `DataSourceList` component
  - `DataSourceForm` component (with dynamic connection fields)
  - `ConnectionFormFields` components (per type)
  - `TestConnectionButton` component

### 5. Update Forms
- ⚠️ **Pipeline Creation Forms** - Update to use:
  - `sourceDataSourceId` instead of `sourceConnectionId`
  - `destinationDataSourceId` instead of `destinationConnectionId`
  - Show data source information in selectors

## Migration Guide for Components

### Pattern 1: Updating Data Source Lists

**OLD:**
```tsx
const { data: connections } = useConnections(orgId);
```

**NEW:**
```tsx
const { data: dataSources } = useDataSources(organizationId);
```

### Pattern 2: Updating Pipeline Operations

**OLD:**
```tsx
const createPipeline = useCreatePipeline();
await createPipeline.mutateAsync({ data, orgId });
```

**NEW:**
```tsx
const createPipeline = useCreatePipeline(organizationId);
await createPipeline.mutateAsync(data);
```

### Pattern 3: Updating Connection Management

**OLD:**
```tsx
const { data: connection } = useConnection(connectionId);
```

**NEW:**
```tsx
const { data: connection } = useConnection(organizationId, dataSourceId);
```

### Pattern 4: Organization Ownership

**OLD:**
```tsx
const isOwner = organization.owners?.some(owner => owner.userId === userId);
```

**NEW:**
```tsx
const isOwner = organization.owner_user_id === userId;
```

## Next Steps

1. **Update all component files** to use new hooks and `organizationId`
2. **Remove all console.log statements** from services and components
3. **Create new UI components** for data source management
4. **Update forms** to use new field names
5. **Test all functionality** with new endpoints

## Notes

- Legacy `DataSourcesService` (for postgres connections) is kept for backward compatibility
- New `DataSourceService` should be used for all new development
- All hooks now require `organizationId` as a parameter (not optional)
- Type definitions include both new field names and legacy fields for backward compatibility
