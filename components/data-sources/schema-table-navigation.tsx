"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Search,
  Table as TableIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Schema } from "@/lib/api/types/data-sources";
import { cn } from "@/lib/utils";

interface SchemaTableNavigationProps {
  schemas: Schema[];
  onTableSelect: (tableName: string, schemaName: string) => void;
  selectedTable?: string;
  selectedSchema?: string;
  selectedTables?: Set<string>; // For multi-select mode
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  searchable?: boolean;
  isLoading?: boolean;
}

export function SchemaTableNavigation({
  schemas,
  onTableSelect,
  selectedTable,
  selectedSchema,
  selectedTables,
  defaultCollapsed = false,
  onCollapsedChange,
  searchable = false,
  isLoading = false,
}: SchemaTableNavigationProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedSchemas, setExpandedSchemas] = React.useState<Set<string>>(
    new Set(schemas.length > 0 ? [schemas[0].name] : []),
  );

  // Expand first schema by default when schemas change
  React.useEffect(() => {
    if (schemas.length > 0 && expandedSchemas.size === 0) {
      setExpandedSchemas(new Set([schemas[0].name]));
    }
  }, [schemas, expandedSchemas]);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(schemaName)) {
        next.delete(schemaName);
      } else {
        next.add(schemaName);
      }
      return next;
    });
  };

  // Filter schemas and tables based on search query
  const filteredSchemas = React.useMemo(() => {
    if (!searchQuery) return schemas;

    const query = searchQuery.toLowerCase();
    return schemas
      .map((schema) => {
        const matchesSchema = schema.name.toLowerCase().includes(query);
        const filteredTables = schema.tables?.filter(
          (table) =>
            table.name.toLowerCase().includes(query) ||
            `${schema.name}.${table.name}`.toLowerCase().includes(query),
        );

        if (matchesSchema || (filteredTables && filteredTables.length > 0)) {
          return {
            ...schema,
            tables: matchesSchema ? schema.tables : filteredTables,
          };
        }
        return null;
      })
      .filter((schema): schema is Schema => schema !== null);
  }, [schemas, searchQuery]);

  if (collapsed) {
    return (
      <div className="h-full border-r bg-muted/30 flex flex-col items-center p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const totalTables = schemas.reduce(
    (sum, schema) => sum + (schema.tables?.length || 0),
    0,
  );

  return (
    <div className="h-full border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-2 shrink-0">
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-semibold text-xs sm:text-sm truncate">
            Schemas & Tables
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {schemas.length} schema{schemas.length !== 1 ? "s" : ""} •{" "}
            {totalTables} table{totalTables !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-6 w-6 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      {searchable && (
        <div className="p-2 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Search schemas or tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 sm:pl-8 h-7 sm:h-8 text-xs sm:text-sm"
            />
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading schemas...
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No schemas found
            </div>
          ) : (
            filteredSchemas.map((schema) => {
              const isExpanded = expandedSchemas.has(schema.name);
              const tables = schema.tables || [];
              const isSelected = selectedSchema === schema.name;

              return (
                <div key={schema.name} className="space-y-1">
                  {/* Schema Header */}
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between text-left h-auto py-1.5 sm:py-2 px-1.5 sm:px-2",
                      isSelected && "bg-primary/10",
                    )}
                    onClick={() => toggleSchema(schema.name)}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
                      )}
                      <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        {schema.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {tables.length}
                      </span>
                    </div>
                  </Button>

                  {/* Tables in Schema */}
                  {isExpanded && (
                    <div className="ml-4 sm:ml-6 space-y-0.5">
                      {tables.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          No tables
                        </div>
                      ) : (
                        tables.map((table) => {
                          const fullTableName =
                            schema.name === "public"
                              ? table.name
                              : `${schema.name}.${table.name}`;
                          const isTableSelected = selectedTables
                            ? selectedTables.has(fullTableName)
                            : selectedTable === table.name &&
                              selectedSchema === schema.name;

                          return (
                            <Button
                              key={`${schema.name}.${table.name}`}
                              variant={isTableSelected ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start text-left h-7 sm:h-8 px-1.5 sm:px-2",
                                isTableSelected && "bg-primary/10 font-medium",
                              )}
                              onClick={() =>
                                onTableSelect(table.name, schema.name)
                              }
                            >
                              <TableIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 shrink-0 text-muted-foreground" />
                              <span className="truncate text-xs sm:text-sm">
                                {table.name}
                              </span>
                              {isTableSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />
                              )}
                              {!isTableSelected && table.type !== "table" && (
                                <span className="ml-auto text-xs text-muted-foreground shrink-0 hidden sm:inline">
                                  {table.type === "view" ? "view" : "mat view"}
                                </span>
                              )}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
