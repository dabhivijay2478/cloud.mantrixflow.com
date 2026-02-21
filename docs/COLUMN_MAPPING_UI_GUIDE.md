# Column Mapping UI Guide

How to build a frontend for users to **select columns** and **map source → destination** (with renames) for table-to-table migration.

---

## 1. Data Flow Overview

```
Source Schema (discoveredColumns)     →     Column Mapping UI     →     Pipeline (transformations)
Destination Schema (columnDefinitions)                                   ETL (column_renames)
```

| Data Source | Field | Shape |
|-------------|-------|-------|
| Source schema | `discoveredColumns` | `{ name, type, nullable, primaryKey }[]` |
| Destination schema | `columnDefinitions` | `{ name, dataType, nullable }[]` (optional) |
| Pipeline | `transformations` | `{ sourceColumn, transformType: "rename", destinationColumn }[]` |
| ETL API | `column_renames` | `{ source_col: dest_col }` |

---

## 2. UI Flow (Step-by-Step)

### Step A: Get Source Columns

Source columns come from **schema discovery** (already stored in `sourceSchema.discoveredColumns`):

```ts
// From useSourceSchema or pipeline.sourceSchema
const sourceColumns: ColumnInfo[] = sourceSchema?.discoveredColumns ?? [];
// [{ name: "id", type: "uuid", nullable: false }, { name: "email", type: "varchar", nullable: true }, ...]
```

If not discovered yet, call `POST /discover-schema/{sourceType}` with `table_name`, `schema_name`, `connection_config`.

### Step B: Get Destination Columns (Optional)

- **Existing table**: Fetch via `DataSourcesService.getTableSchema(destConnectionId, table, schema)` → `columns`
- **New table**: User defines columns or uses source columns as template

### Step C: Column Mapping UI

**Layout**: Two panels or a table with rows.

| Source Column | → | Destination Column | Data Type | Actions |
|---------------|---|---------------------|-----------|---------|
| id (uuid) | | id | uuid | ✓ |
| name (varchar) | | customer_name | varchar | Rename |
| email (varchar) | | email | varchar | ✓ |
| created_at (timestamp) | | signup_date | timestamp | Rename |

**User actions**:
1. **Select columns** – Checkbox to include/exclude each source column
2. **Map to destination** – Input or Select for destination column name (default = same as source)
3. **Rename** – When destination name ≠ source name → becomes `transformType: "rename"`

---

## 3. Component Structure

```
ColumnMappingStep
├── SourceColumnsPanel (left)
│   ├── Checkbox per column
│   └── Column name + type badge
├── MappingTable (center)
│   ├── Row per selected source column
│   ├── Source column (read-only)
│   ├── Destination column (Input)
│   └── Data type (read-only or Select for new tables)
└── Actions
    ├── Map All (source → same name)
    └── Clear
```

---

## 4. State Shape

```ts
interface ColumnMappingState {
  // Selected source columns (included in sync)
  selectedSourceColumns: string[];
  // Map: sourceColumn → destinationColumn (for renames)
  mappings: Record<string, string>;
}

// Example:
// selectedSourceColumns: ["id", "name", "email", "created_at"]
// mappings: { name: "customer_name", created_at: "signup_date" }
// → id→id, email→email pass through; name→customer_name, created_at→signup_date are renames
```

---

## 5. Convert to API Format

**Pipeline `transformations`** (only include renames):

```ts
function toTransformations(mappings: Record<string, string>): Transformation[] {
  return Object.entries(mappings)
    .filter(([source, dest]) => source !== dest && dest.trim() !== "")
    .map(([sourceColumn, destinationColumn]) => ({
      sourceColumn,
      transformType: "rename" as const,
      transformConfig: {},
      destinationColumn,
    }));
}
```

**ETL `column_renames`** (same shape):

```ts
function toColumnRenames(mappings: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(mappings).filter(([src, dest]) => src !== dest && dest.trim() !== "")
  );
}
```

---

## 6. Where to Add in Your App

| Location | Use Case |
|----------|----------|
| **Pipeline create wizard** | Add a "Column Mapping" step between Transform and Configure |
| **Pipeline edit page** | Add a "Column Mapping" section/tab when editing |
| **Transform step** | Re-enable `fieldMappings` UI (currently commented out) and wire to `transformations` |

**Recommended**: Add a **Column Mapping** step/section in the pipeline create/edit flow that:
1. Shows `sourceSchema.discoveredColumns`
2. Lets user check which columns to include
3. Lets user set destination name per column (default = source name)
4. Saves as `transformations` with `transformType: "rename"` for renames

---

## 7. Example Component Skeleton

```tsx
// ColumnMappingEditor.tsx
interface ColumnMappingEditorProps {
  sourceColumns: ColumnInfo[];
  destinationColumns?: ColumnInfo[]; // optional, for validation
  value: { selected: string[]; mappings: Record<string, string> };
  onChange: (value: { selected: string[]; mappings: Record<string, string> }) => void;
}

export function ColumnMappingEditor({ sourceColumns, value, onChange }: ColumnMappingEditorProps) {
  const handleToggleColumn = (colName: string, checked: boolean) => { /* ... */ };
  const handleMappingChange = (sourceCol: string, destCol: string) => { /* ... */ };
  const handleMapAll = () => {
    const mappings: Record<string, string> = {};
    value.selected.forEach((col) => { mappings[col] = col; });
    onChange({ ...value, mappings });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>Source Columns</CardHeader>
        <CardContent>
          {sourceColumns.map((col) => (
            <div key={col.name} className="flex items-center gap-2 py-2">
              <Checkbox
                checked={value.selected.includes(col.name)}
                onCheckedChange={(c) => handleToggleColumn(col.name, !!c)}
              />
              <span className="font-mono">{col.name}</span>
              <Badge variant="outline">{col.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Destination Mapping</CardHeader>
        <CardContent>
          {value.selected.map((colName) => (
            <div key={colName} className="flex items-center gap-2 py-2">
              <span className="font-mono text-muted-foreground">{colName}</span>
              <ArrowRight className="h-4 w-4" />
              <Input
                value={value.mappings[colName] ?? colName}
                onChange={(e) => handleMappingChange(colName, e.target.value)}
                placeholder="Destination column name"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 8. Ready-to-Use Component

A `ColumnMappingEditor` component is available at:

```
components/data-pipelines/column-mapping-editor.tsx
```

**Usage:**

```tsx
import {
  ColumnMappingEditor,
  toTransformations,
  fromTransformations,
  type ColumnMappingValue,
} from "@/components/data-pipelines/column-mapping-editor";
import type { ColumnInfo } from "@/lib/api/types/data-pipelines";

// In your form/step component:
const [columnMapping, setColumnMapping] = useState<ColumnMappingValue>({
  selected: [],
  mappings: {},
});

// When loading existing pipeline (edit mode):
useEffect(() => {
  if (sourceSchema?.discoveredColumns && pipeline?.transformations) {
    setColumnMapping(
      fromTransformations(
        sourceSchema.discoveredColumns as ColumnInfo[],
        pipeline.transformations as any,
      ),
    );
  }
}, [sourceSchema?.discoveredColumns, pipeline?.transformations]);

// In JSX:
<ColumnMappingEditor
  sourceColumns={(sourceSchema?.discoveredColumns as ColumnInfo[]) ?? []}
  value={columnMapping}
  onChange={setColumnMapping}
/>

// When saving:
const transformations = toTransformations(columnMapping.mappings);
await DataPipelinesService.createPipeline(orgId, {
  name,
  sourceSchemaId,
  destinationSchemaId,
  transformations,
  // ...
});
```

---

## 9. Integration with Pipeline Create/Update

When creating or updating a pipeline:

```ts
// In create/update handler
const transformations = toTransformations(columnMappingState.mappings);

await DataPipelinesService.createPipeline(orgId, {
  name,
  sourceSchemaId,
  destinationSchemaId,
  transformations,
  // ...
});
```

The backend will pass `column_renames` to the ETL when `transformType === "rename"`.
