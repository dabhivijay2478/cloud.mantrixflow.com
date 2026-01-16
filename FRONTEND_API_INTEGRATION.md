# Frontend API Integration - Data Pipelines

## Overview
This document describes the frontend integration with the new data pipeline APIs. The new API structure uses a schema-based approach where source and destination schemas are created first, then referenced by pipelines.

## New API Structure

### Key Changes
1. **Schema-Based Approach**: Pipelines now reference `sourceSchemaId` and `destinationSchemaId` instead of directly containing source/destination configuration
2. **Separate Schema Management**: Source and destination schemas are managed independently via dedicated APIs
3. **Simplified Pipeline DTO**: Pipeline creation now only requires:
   - `name`, `description`
   - `sourceSchemaId`, `destinationSchemaId`
   - `transformations` (optional)
   - `syncMode`, `syncFrequency`, `incrementalColumn`

## Integrated Services

### 1. Data Pipelines Service (`lib/api/services/data-pipelines.service.ts`)
- ✅ Updated to match new API endpoints
- ✅ All CRUD operations for pipelines
- ✅ Pipeline execution (run, pause, resume)
- ✅ Pipeline validation and dry-run
- ✅ Pipeline monitoring (runs, stats)

### 2. Source Schemas Service (`lib/api/services/source-schemas.service.ts`)
- ✅ Created with full CRUD operations
- ✅ Schema discovery functionality
- ✅ Endpoints:
  - `createSourceSchema(organizationId, data)`
  - `listSourceSchemas(organizationId)`
  - `getSourceSchema(organizationId, sourceSchemaId)`
  - `updateSourceSchema(organizationId, sourceSchemaId, data)`
  - `deleteSourceSchema(organizationId, sourceSchemaId)`
  - `discoverSourceSchema(organizationId, sourceSchemaId)`

### 3. Destination Schemas Service (`lib/api/services/destination-schemas.service.ts`)
- ✅ Created with full CRUD operations
- ✅ Schema validation functionality
- ✅ Endpoints:
  - `createDestinationSchema(organizationId, data)`
  - `listDestinationSchemas(organizationId)`
  - `getDestinationSchema(organizationId, destinationSchemaId)`
  - `updateDestinationSchema(organizationId, destinationSchemaId, data)`
  - `deleteDestinationSchema(organizationId, destinationSchemaId)`
  - `validateDestinationSchema(organizationId, destinationSchemaId)`

## Integrated Hooks

### 1. Data Pipelines Hooks (`lib/api/hooks/use-data-pipelines.ts`)
- ✅ All pipeline management hooks
- ✅ Pipeline execution hooks
- ✅ Pipeline monitoring hooks
- ✅ Removed `useAutoMapColumns` (endpoint doesn't exist)

### 2. Source Schemas Hooks (`lib/api/hooks/use-source-schemas.ts`)
- ✅ Created with all CRUD hooks
- ✅ Discovery hook
- ✅ Query keys for React Query caching

### 3. Destination Schemas Hooks (`lib/api/hooks/use-destination-schemas.ts`)
- ✅ Created with all CRUD hooks
- ✅ Validation hook
- ✅ Query keys for React Query caching

## Updated Types

### Pipeline Types (`lib/api/types/data-pipelines.ts`)
- ✅ Updated `CreatePipelineDto` to use `sourceSchemaId` and `destinationSchemaId`
- ✅ Updated `UpdatePipelineDto` to match new structure
- ✅ Updated `Pipeline` interface with new field names (camelCase)
- ✅ Updated `PipelineRun` interface
- ✅ Updated `PipelineStats` interface
- ✅ Added `PipelineSourceSchema` and `PipelineDestinationSchema` types
- ✅ Added `CreateSourceSchemaDto`, `UpdateSourceSchemaDto`
- ✅ Added `CreateDestinationSchemaDto`, `UpdateDestinationSchemaDto`
- ✅ Added `DiscoveredSchema` and `SchemaValidationResult` types

## Component Updates Needed

### ⚠️ TODO: Pipeline Creation Flow
The current pipeline creation page (`app/workspace/data-pipelines/new/page.tsx`) uses the old multi-collector/emitter structure. It needs to be refactored to:

1. **Step 1: Create Source Schema**
   - User selects data source
   - User selects tables/schemas
   - Create source schema via `SourceSchemasService.createSourceSchema()`
   - Optionally discover schema structure

2. **Step 2: Create Destination Schema**
   - User selects destination data source
   - User specifies destination table
   - Create destination schema via `DestinationSchemasService.createDestinationSchema()`
   - Optionally validate schema

3. **Step 3: Create Pipeline**
   - User provides pipeline name/description
   - User configures transformations (optional)
   - User sets sync mode/frequency
   - Create pipeline with `sourceSchemaId` and `destinationSchemaId`

### ⚠️ TODO: Pipeline Edit Flow
The edit page (`app/workspace/data-pipelines/[id]/edit/page.tsx`) also needs similar refactoring to work with the new schema-based approach.

### ✅ Fixed: Pipeline List Page
- Updated to use new field names (`createdBy` instead of `created_by`)
- Updated to use `sourceSchema` and `destinationSchema` instead of old fields
- Removed references to `migrationState` (no longer exists)
- Updated status badge logic to use `status` and `lastRunStatus`

## Usage Examples

### Creating a Source Schema
```typescript
import { useCreateSourceSchema } from "@/lib/api";

const createSourceSchema = useCreateSourceSchema(organizationId);

await createSourceSchema.mutateAsync({
  sourceType: "postgres",
  dataSourceId: "ds_123",
  sourceSchema: "public",
  sourceTable: "users",
  name: "Users Source Schema"
});
```

### Creating a Destination Schema
```typescript
import { useCreateDestinationSchema } from "@/lib/api";

const createDestinationSchema = useCreateDestinationSchema(organizationId);

await createDestinationSchema.mutateAsync({
  dataSourceId: "ds_456",
  destinationSchema: "public",
  destinationTable: "users_copy",
  writeMode: "append",
  columnMappings: [
    { sourceColumn: "id", destinationColumn: "id", dataType: "integer", nullable: false }
  ]
});
```

### Creating a Pipeline
```typescript
import { useCreatePipeline } from "@/lib/api";

const createPipeline = useCreatePipeline(organizationId);

await createPipeline.mutateAsync({
  name: "User Sync Pipeline",
  description: "Syncs users from source to destination",
  sourceSchemaId: "src_schema_123",
  destinationSchemaId: "dest_schema_456",
  syncMode: "full",
  syncFrequency: "hourly",
  transformations: []
});
```

## Next Steps

1. **Refactor Pipeline Creation UI**: Update the multi-step wizard to create schemas first, then pipeline
2. **Refactor Pipeline Edit UI**: Update edit flow to work with schema-based approach
3. **Add Schema Management UI**: Create pages/components for managing source and destination schemas independently
4. **Update Transformations**: Ensure transformation configuration works with the new schema structure
5. **Testing**: Test all CRUD operations for pipelines, source schemas, and destination schemas

## API Endpoints Reference

### Pipelines
- `POST /api/organizations/:organizationId/pipelines` - Create pipeline
- `GET /api/organizations/:organizationId/pipelines` - List pipelines
- `GET /api/organizations/:organizationId/pipelines/:id` - Get pipeline
- `PATCH /api/organizations/:organizationId/pipelines/:id` - Update pipeline
- `DELETE /api/organizations/:organizationId/pipelines/:id` - Delete pipeline
- `POST /api/organizations/:organizationId/pipelines/:id/run` - Run pipeline
- `POST /api/organizations/:organizationId/pipelines/:id/pause` - Pause pipeline
- `POST /api/organizations/:organizationId/pipelines/:id/resume` - Resume pipeline
- `POST /api/organizations/:organizationId/pipelines/:id/validate` - Validate pipeline
- `POST /api/organizations/:organizationId/pipelines/:id/dry-run` - Dry run pipeline
- `GET /api/organizations/:organizationId/pipelines/:id/runs` - Get pipeline runs
- `GET /api/organizations/:organizationId/pipelines/:id/runs/:runId` - Get pipeline run
- `GET /api/organizations/:organizationId/pipelines/:id/stats` - Get pipeline stats

### Source Schemas
- `POST /api/organizations/:organizationId/source-schemas` - Create source schema
- `GET /api/organizations/:organizationId/source-schemas` - List source schemas
- `GET /api/organizations/:organizationId/source-schemas/:id` - Get source schema
- `PATCH /api/organizations/:organizationId/source-schemas/:id` - Update source schema
- `DELETE /api/organizations/:organizationId/source-schemas/:id` - Delete source schema
- `POST /api/organizations/:organizationId/source-schemas/:id/discover` - Discover source schema

### Destination Schemas
- `POST /api/organizations/:organizationId/destination-schemas` - Create destination schema
- `GET /api/organizations/:organizationId/destination-schemas` - List destination schemas
- `GET /api/organizations/:organizationId/destination-schemas/:id` - Get destination schema
- `PATCH /api/organizations/:organizationId/destination-schemas/:id` - Update destination schema
- `DELETE /api/organizations/:organizationId/destination-schemas/:id` - Delete destination schema
- `POST /api/organizations/:organizationId/destination-schemas/:id/validate` - Validate destination schema
