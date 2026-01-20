# Field Mapping Fix - Transform Step

## Issue
When users selected a collector (e.g., MongoDB) and emitter (e.g., Supabase/PostgreSQL) in the "Add Transformer" step, the "Map Source Fields to Destination Fields" section showed "0 mappings created" with no fields available for mapping.

## Root Cause
The `getTableSchema` method in `data-sources.service.ts` was returning empty columns array with a TODO comment, even though the schema discovery API was returning column information.

## Fixes Applied

### 1. Fixed `getTableSchema` Method (`apps/app/lib/api/services/data-sources.service.ts`)
- **Before**: Returned empty `columns: []` with TODO comment
- **After**: Properly extracts columns from discovered schema structure
- Handles both PostgreSQL (columns in `targetTable.columns`) and MongoDB (normalized from `coll.fields`)
- Extracts primary keys from discovered schema

### 2. Enhanced MongoDB Support
- Added special handling for MongoDB collection format:
  - Supports "database.collection" format (e.g., "mydb.users")
  - Supports just "collection" format (searches all databases)
  - Properly maps MongoDB fields (including nested paths like "address.city")

### 3. Improved Transform Step Component (`transform-step.tsx`)
- **Data Source Type Detection**: Detects MongoDB vs SQL to handle table names correctly
- **Better Error Handling**: 
  - Shows loading states while fetching schemas
  - Displays error messages if schema discovery fails
  - Shows helpful messages when no fields are found
- **Enhanced Logging**: 
  - Console logs for debugging (development mode)
  - Tracks query states (loading, error, success)
  - Logs field counts and names
- **UI Improvements**:
  - Shows "No source fields found" badge when appropriate
  - Shows "No destination fields found" badge when appropriate
  - Displays loading spinners during schema fetch
  - Shows error messages in dropdowns

### 4. Query Improvements
- Added retry logic (2 retries) for schema queries
- Better query key structure to handle MongoDB vs SQL differently
- Properly handles undefined schema for MongoDB (searches all databases)

## Testing
To verify the fix works:

1. **MongoDB Source**:
   - Select MongoDB collector with a collection
   - Fields should appear in source field dropdown
   - Nested fields (e.g., "address.city") should be available

2. **PostgreSQL Source**:
   - Select PostgreSQL collector with a table
   - Fields should appear with "schema.table.column" format

3. **Destination**:
   - Select destination table
   - Destination fields should appear in the mapping table

4. **Error Cases**:
   - If schema discovery fails, error message should appear
   - If no fields found, helpful message should guide user

## Files Modified
- `apps/app/lib/api/services/data-sources.service.ts` - Fixed column extraction
- `apps/app/app/workspace/data-pipelines/new/transform-step.tsx` - Enhanced field fetching and UI

## Next Steps
If fields still don't appear:
1. Check browser console for errors
2. Verify the collector has selected tables
3. Verify the data source connection is working
4. Check that schema discovery API is returning data (check Network tab)
