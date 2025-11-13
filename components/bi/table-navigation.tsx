"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Database, Table as TableIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export interface TableNavigationProps {
  tables: string[];
  onTableSelect?: (tableName: string) => void;
  selectedTable?: string;
  className?: string;
  searchable?: boolean;
}

/**
 * Table Navigation Component
 * @description A reusable sidebar component for navigating database tables
 */
export function TableNavigation({
  tables,
  onTableSelect,
  selectedTable,
  className,
  searchable = true,
}: TableNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    return tables.filter((table) =>
      table.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  return (
    <div className={cn("h-full flex flex-col border-r bg-muted/30", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="font-semibold">Tables</span>
          {tables.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {tables.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div className="p-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Table List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <Button
                key={table}
                variant={selectedTable === table ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  selectedTable === table && "bg-accent"
                )}
                onClick={() => onTableSelect?.(table)}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                <span className="truncate">{table}</span>
              </Button>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {searchQuery ? "No tables found" : "No tables available"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

