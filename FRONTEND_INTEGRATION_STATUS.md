# Frontend API Integration - Status Report

## ✅ Completed

### 1. TypeScript Types ✅
- ✅ Updated `data-sources.ts` with new schema types
- ✅ Updated `data-pipelines.ts` with new field names
- ✅ Updated `organizations.ts` with `owner_user_id` and `TransferOwnershipDto`

### 2. Services ✅
- ✅ Created `DataSourceService` for new endpoints
- ✅ Created `ConnectionService` for connection management
- ✅ Updated `DataPipelinesService` to use `organizationId`
- ✅ Updated `OrganizationsService` with `transferOwnership` method
- ✅ Removed console.log from `OrganizationsService`

### 3. React Hooks ✅
- ✅ Created `use-data-source.ts` hooks
- ✅ Created `use-connection.ts` hooks
- ✅ Updated `use-data-pipelines.ts` to require `organizationId`
- ✅ Updated `use-organizations.ts` with `useTransferOwnership` hook
- ✅ Updated exports in `index.ts`

### 4. Component Updates (Partial) ✅
- ✅ Updated `app/workspace/data-pipelines/page.tsx`:
  - Changed `orgId` → `organizationId`
  - Updated hooks to use new signatures
  - Updated column definitions to use `sourceDataSourceId` and `destinationDataSourceId`
  - Updated to use `created_by` field
  - Fixed mutation hooks to work with dynamic pipeline IDs

## ⚠️ Remaining Work

### 1. Remove Console.log Statements
- ⚠️ `lib/api/client.ts` - 12 console statements
- ⚠️ `lib/api/config.ts` - 7 console statements
- ⚠️ Component files - Multiple console.log statements

### 2. Update Remaining Components

#### High Priority:
1. **`app/workspace/data-sources/page.tsx`**
   - Update to use `useDataSources(organizationId)` instead of `useConnections(orgId)`
   - Remove console.log statements
   - Update to show new data source structure

2. **`app/workspace/data-pipelines/new/collector-step.tsx`**
   - Update to use `useDataSources(organizationId)`
   - Update data source selection UI

3. **`app/workspace/data-pipelines/new/emitter-step.tsx`**
   - Update destination selection

4. **`app/workspace/data-pipelines/pipeline-config-form.tsx`**
   - Update form fields: `sourceConnectionId` → `sourceDataSourceId`
   - Update form fields: `destinationConnectionId` → `destinationDataSourceId`

5. **`app/organizations/page.tsx`**
   - Add transfer ownership UI
   - Update to check `owner_user_id` instead of `organization_owners`

#### Medium Priority:
6. **`app/workspace/data-sources/[id]/query/page.tsx`**
   - Update `orgId` → `organizationId`

7. **`app/workspace/data-sources/[id]/query/view/page.tsx`**
   - Similar updates

### 3. Create New UI Components

Need to create:
- `DataSourceList` component
- `DataSourceForm` component (with dynamic connection fields)
- `ConnectionFormFields` components (Postgres, MySQL, MongoDB, S3, API)
- `TestConnectionButton` component
- `TransferOwnershipModal` component

### 4. Update Forms

- Update pipeline creation forms to use new field names
- Add validation for new schema
- Update source/destination selectors to show data sources

## Migration Patterns

### Pattern 1: Updating Hook Calls

**OLD:**
```tsx
const { data: pipelines } = usePipelines(orgId);
const deletePipeline = useDeletePipeline();
await deletePipeline.mutateAsync(pipelineId);
```

**NEW:**
```tsx
const { data: pipelines } = usePipelines(organizationId);
const deletePipeline = useDeletePipeline(organizationId);
await deletePipeline.mutateAsync(pipelineId);
```

### Pattern 2: Pipeline Operations

**OLD:**
```tsx
const runPipeline = useRunPipeline();
await runPipeline.mutateAsync(pipelineId);
```

**NEW:**
```tsx
// Option 1: Use hook with specific pipelineId
const runPipeline = useRunPipeline(organizationId, pipelineId);
await runPipeline.mutateAsync();

// Option 2: Use mutation directly (for dynamic pipelineIds)
const runPipelineMutation = useMutation({
  mutationFn: ({ pipelineId }: { pipelineId: string }) => 
    DataPipelinesService.runPipeline(organizationId, pipelineId)
});
await runPipelineMutation.mutateAsync({ pipelineId });
```

### Pattern 3: Data Source Access

**OLD:**
```tsx
const { data: connections } = useConnections(orgId);
```

**NEW:**
```tsx
const { data: dataSources } = useDataSources(organizationId);
// Access connection via dataSource.connection
```

### Pattern 4: Field Names

**OLD:**
```tsx
pipeline.sourceConnectionId
pipeline.destinationConnectionId
pipeline.userId
pipeline.orgId
```

**NEW:**
```tsx
pipeline.sourceDataSourceId // or pipeline.source_schema?.data_source_id
pipeline.destinationDataSourceId // or pipeline.destination_schema?.data_source_id
pipeline.created_by // or pipeline.userId (backward compat)
pipeline.organization_id // or pipeline.orgId (backward compat)
```

## Next Steps

1. **Remove all console.log statements** from API client and config files
2. **Update data-sources page** to use new hooks
3. **Update pipeline creation forms** to use new field names
4. **Create new UI components** for data source management
5. **Add transfer ownership UI** to organizations page
6. **Test all functionality** with new endpoints

## Notes

- Legacy `DataSourcesService` (postgres connections) is kept for backward compatibility
- New `DataSourceService` should be used for all new development
- Types include both new and legacy fields for gradual migration
- All hooks now require `organizationId` (not optional)
