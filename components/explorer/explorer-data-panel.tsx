"use client";

import { RoomPanel } from "@sqlrooms/room-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Folder,
  PlusSquare,
  Search,
  Table as TableIcon,
} from "lucide-react";
import * as React from "react";
import { useExplorerContext } from "@/lib/explorer/explorer-context";
import { useRoomStore } from "./explorer-store";
import { cn } from "@/lib/utils";

/** Quote identifier for SQL based on database type (PostgreSQL uses ", MySQL/ClickHouse use `) */
function quoteIdentifier(name: string, dbType?: string): string {
  const escaped = name.replace(/"/g, '""').replace(/`/g, "``").replace(/\]/g, "]]");
  const t = (dbType ?? "postgres").toLowerCase();
  if (t.includes("mysql") || t.includes("clickhouse") || t.includes("bigquery")) {
    return `\`${escaped}\``;
  }
  if (t.includes("mssql") || t.includes("sqlserver")) {
    return `[${escaped}]`;
  }
  return `"${escaped}"`;
}

export function ExplorerDataPanel() {
  const {
    schemas,
    schemasLoading,
    selectedSchema,
    selectedTable,
    selectedSchemaOnly,
    onTableSelect,
    onSchemaSelect,
    explorerRowLimit,
    setExplorerRowLimit,
    dataSourceType,
  } = useExplorerContext();

  const createQueryTab = useRoomStore((s) => s.sqlEditor?.createQueryTab);
  const updateQueryText = useRoomStore((s) => s.sqlEditor?.updateQueryText);
  const selectedQueryId = useRoomStore(
    (s) => s.sqlEditor?.config?.selectedQueryId,
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedSchemas, setExpandedSchemas] = React.useState<Set<string>>(
    new Set(schemas.length > 0 ? [schemas[0].name] : []),
  );

  React.useEffect(() => {
    if (schemas.length > 0 && expandedSchemas.size === 0) {
      setExpandedSchemas(new Set([schemas[0].name]));
    }
  }, [schemas, expandedSchemas]);

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(schemaName)) next.delete(schemaName);
      else next.add(schemaName);
      return next;
    });
  };

  const filteredSchemas = React.useMemo(() => {
    if (!searchQuery) return schemas;
    const q = searchQuery.toLowerCase();
    return schemas
      .map((s) => {
        const matchSchema = s.name.toLowerCase().includes(q);
        const tables = s.tables?.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            `${s.name}.${t.name}`.toLowerCase().includes(q),
        );
        if (matchSchema || (tables && tables.length > 0)) {
          return { ...s, tables: matchSchema ? s.tables : tables } as typeof s;
        }
        return null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [schemas, searchQuery]);

  const handleNewQuery = () => {
    createQueryTab?.(
      `SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY table_schema, table_name;`,
    );
  };

  const handleSchemaSelect = (schemaName: string) => {
    onSchemaSelect?.(schemaName);
    const escaped = schemaName.replace(/'/g, "''");
    const query = `SELECT table_schema, table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = '${escaped}'
ORDER BY table_name;`;
    if (selectedQueryId && updateQueryText) {
      updateQueryText(selectedQueryId, query);
    } else {
      createQueryTab?.(query);
    }
  };

  return (
    <RoomPanel type="data" showHeader={false}>
      {/* Supabase-style sidebar */}
      <div className="flex h-full flex-col overflow-hidden bg-muted/20">
        <div className="shrink-0 space-y-3 px-2 pb-3">
          <h2 className="px-2 pt-2 text-sm font-semibold text-foreground">
            SQL Editor
          </h2>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schemas or tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 shrink-0 gap-1.5 px-2.5"
              onClick={handleNewQuery}
              title="New query"
            >
              <PlusSquare className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 px-2 py-1.5">
          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Schemas
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/40 bg-muted/20 px-2 py-1.5">
          {schemasLoading ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Loading schemas...
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No schemas found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSchemas.map((schema) => {
                const isExpanded = expandedSchemas.has(schema.name);
                const tables = schema.tables || [];
                return (
                  <div key={schema.name} className="space-y-0.5">
                    <div className="flex w-full items-center gap-0.5 rounded px-1.5 py-1 text-left text-xs hover:bg-muted/50">
                      <button
                        type="button"
                        className="flex shrink-0 items-center justify-center p-0.5 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSchema(schema.name);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-1.5"
                        onClick={() => handleSchemaSelect(schema.name)}
                      >
                        <Folder
                          className={cn(
                            "h-3 w-3 shrink-0 text-muted-foreground",
                            selectedSchemaOnly === schema.name && "text-primary",
                          )}
                        />
                        <span
                          className={cn(
                            "truncate",
                            selectedSchemaOnly === schema.name && "font-medium",
                          )}
                        >
                          {schema.name}
                        </span>
                        <span className="ml-auto shrink-0 text-muted-foreground">
                          {tables.length}
                        </span>
                      </button>
                    </div>
                    {isExpanded &&
                      tables.map((table) => {
                        const isSelected =
                          selectedSchema === schema.name &&
                          selectedTable === table.name;
                        return (
                          <button
                            key={`${schema.name}.${table.name}`}
                            type="button"
                            className={cn(
                              "flex w-full items-center gap-1.5 rounded px-1.5 py-1 pl-5 text-left text-xs",
                              isSelected && "bg-primary/10 font-medium",
                            )}
                            onClick={() => {
                            onTableSelect(table.name, schema.name);
                            const schemaPart = quoteIdentifier(schema.name, dataSourceType);
                            const tablePart = quoteIdentifier(table.name, dataSourceType);
                            const qualified = `${schemaPart}.${tablePart}`;
                            const query = `SELECT * FROM ${qualified} LIMIT 100`;
                            if (selectedQueryId && updateQueryText) {
                              updateQueryText(selectedQueryId, query);
                            } else {
                              createQueryTab?.(query);
                            }
                          }}
                          >
                            <TableIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{table.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="ml-auto h-3 w-3 shrink-0 text-primary" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-auto shrink-0 space-y-1.5 border-t border-border/50 px-2 pt-3 pb-2">
          <label className="text-xs text-muted-foreground">Row limit</label>
          <Input
            type="number"
            min={100}
            max={100000}
            step={1000}
            value={explorerRowLimit}
            onChange={(e) =>
              setExplorerRowLimit(
                Math.min(
                  100000,
                  Math.max(100, parseInt(e.target.value, 10) || 5000),
                ),
              )
            }
            className="h-8 text-xs"
          />
        </div>
      </div>
    </RoomPanel>
  );
}
