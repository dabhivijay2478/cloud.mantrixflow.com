"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ColumnInfo } from "@/lib/api/types/data-pipelines";

export interface ColumnMappingValue {
  selected: string[];
  mappings: Record<string, string>;
}

interface ColumnMappingEditorProps {
  sourceColumns: ColumnInfo[];
  value: ColumnMappingValue;
  onChange: (value: ColumnMappingValue) => void;
  disabled?: boolean;
}

/**
 * Convert mappings to pipeline transformations (rename only).
 * Used when saving pipeline.
 */
export function toTransformations(
  mappings: Record<string, string>,
): Array<{ sourceColumn: string; transformType: "rename"; transformConfig: Record<string, unknown>; destinationColumn: string }> {
  return Object.entries(mappings)
    .filter(([source, dest]) => source !== dest && dest.trim() !== "")
    .map(([sourceColumn, destinationColumn]) => ({
      sourceColumn,
      transformType: "rename" as const,
      transformConfig: {},
      destinationColumn,
    }));
}

/**
 * Build initial value from transformations (e.g. when editing pipeline).
 */
export function fromTransformations(
  sourceColumns: ColumnInfo[],
  transformations?: Array<{ sourceColumn: string; transformType: string; destinationColumn: string }> | null,
): ColumnMappingValue {
  const selected = sourceColumns.map((c) => c.name);
  const mappings: Record<string, string> = {};
  sourceColumns.forEach((c) => {
    mappings[c.name] = c.name;
  });
  if (transformations) {
    transformations
      .filter((t) => t.transformType === "rename")
      .forEach((t) => {
        mappings[t.sourceColumn] = t.destinationColumn;
      });
  }
  return { selected, mappings };
}

/**
 * Convert fieldMappings (source/destination pairs) to ColumnMappingValue.
 */
export function fromFieldMappings(
  sourceColumns: ColumnInfo[],
  fieldMappings?: Array<{ source: string; destination: string }> | null,
): ColumnMappingValue {
  const mappings: Record<string, string> = {};
  const selected: string[] = [];
  if (fieldMappings && fieldMappings.length > 0) {
    fieldMappings.forEach((m) => {
      selected.push(m.source);
      mappings[m.source] = m.destination;
    });
  } else {
    sourceColumns.forEach((c) => {
      selected.push(c.name);
      mappings[c.name] = c.name;
    });
  }
  return { selected, mappings };
}

/**
 * Convert ColumnMappingValue to fieldMappings for TransformConfig.
 */
export function toFieldMappings(value: ColumnMappingValue): Array<{ source: string; destination: string }> {
  return value.selected.map((source) => ({
    source,
    destination: value.mappings[source] ?? source,
  }));
}

export function ColumnMappingEditor({
  sourceColumns,
  value,
  onChange,
  disabled = false,
}: ColumnMappingEditorProps) {
  const handleToggleColumn = (colName: string, checked: boolean) => {
    const newSelected = checked
      ? [...value.selected, colName]
      : value.selected.filter((c) => c !== colName);
    const newMappings = { ...value.mappings };
    if (checked) {
      newMappings[colName] = value.mappings[colName] ?? colName;
    } else {
      delete newMappings[colName];
    }
    onChange({ selected: newSelected, mappings: newMappings });
  };

  const handleSelectAll = () => {
    const selected = sourceColumns.map((c) => c.name);
    const mappings: Record<string, string> = {};
    selected.forEach((col) => {
      mappings[col] = value.mappings[col] ?? col;
    });
    onChange({ selected, mappings });
  };

  const handleDeselectAll = () => {
    onChange({ selected: [], mappings: {} });
  };

  const handleMappingChange = (sourceCol: string, destCol: string) => {
    onChange({
      ...value,
      mappings: { ...value.mappings, [sourceCol]: destCol.trim() || sourceCol },
    });
  };

  const handleMapAllSame = () => {
    const mappings: Record<string, string> = {};
    value.selected.forEach((col) => {
      mappings[col] = col;
    });
    onChange({ ...value, mappings });
  };

  if (sourceColumns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">
            No source columns. Run schema discovery first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Column mapping</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled}
            className="cursor-pointer"
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={disabled}
            className="cursor-pointer"
          >
            Deselect all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMapAllSame}
            disabled={disabled}
            className="cursor-pointer"
          >
            Map same names
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Source columns</span>
              <Badge variant="secondary">{value.selected.length} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-2">
                {sourceColumns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-3 rounded-md border border-transparent px-2 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`col-${col.name}`}
                      checked={value.selected.includes(col.name)}
                      onCheckedChange={(c) =>
                        handleToggleColumn(col.name, c === true)
                      }
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`col-${col.name}`}
                      className="flex-1 cursor-pointer font-mono text-sm"
                    >
                      {col.name}
                    </label>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {col.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Destination mapping</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Edit to rename columns. Same name = pass through.
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                {value.selected.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Select source columns to map
                  </p>
                ) : (
                  value.selected.map((colName) => {
                    const col = sourceColumns.find((c) => c.name === colName);
                    const destName = value.mappings[colName] ?? colName;
                    const isRenamed = destName !== colName;
                    return (
                      <div
                        key={colName}
                        className="flex items-center gap-2 rounded-md border border-transparent px-2 py-2"
                      >
                        <span className="font-mono text-sm text-muted-foreground w-24 truncate">
                          {colName}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          value={destName}
                          onChange={(e) =>
                            handleMappingChange(colName, e.target.value)
                          }
                          placeholder="Destination name"
                          className="h-8 font-mono text-sm"
                          disabled={disabled}
                        />
                        {isRenamed && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            rename
                          </Badge>
                        )}
                        {col && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {col.type}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
