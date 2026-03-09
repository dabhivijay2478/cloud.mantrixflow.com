"use client";

import { RoomPanel } from "@sqlrooms/room-shell";
import { Input } from "@sqlrooms/ui";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Folder,
  Search,
  Table as TableIcon,
} from "lucide-react";
import * as React from "react";
import { useExplorerContext } from "@/lib/explorer/explorer-context";
import { useRoomStore } from "./explorer-store";
import { cn } from "@/lib/utils";

export function ExplorerDataPanel() {
  const {
    schemas,
    schemasLoading,
    selectedSchema,
    selectedTable,
    onTableSelect,
    explorerRowLimit,
    setExplorerRowLimit,
  } = useExplorerContext();

  const createQueryTab = useRoomStore((s) => s.sqlEditor?.createQueryTab);

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

  return (
    <RoomPanel type="data" showHeader={true}>
      {/* Single schema tree - Redshift-style, no duplicate mapping */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div className="relative shrink-0">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search schemas or tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/50 p-2">
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
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs hover:bg-muted/50"
                      onClick={() => toggleSchema(schema.name)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      )}
                      <Folder className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{schema.name}</span>
                      <span className="ml-auto text-muted-foreground">
                        {tables.length}
                      </span>
                    </button>
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
                            const tableName =
                              schema.name === "public"
                                ? table.name
                                : `${schema.name}_${table.name}`;
                            createQueryTab?.(`SELECT * FROM ${tableName} LIMIT 100`);
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
        <div className="space-y-1.5 shrink-0">
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
