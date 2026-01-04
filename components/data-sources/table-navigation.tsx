"use client";

import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TableNavigationProps {
  tables: string[];
  onTableSelect: (table: string) => void;
  selectedTable?: string;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  searchable?: boolean;
}

export function TableNavigation({
  tables,
  onTableSelect,
  selectedTable,
  defaultCollapsed = false,
  onCollapsedChange,
  searchable = false,
}: TableNavigationProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTables = searchable
    ? tables.filter((table) =>
        table.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tables;

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

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

  return (
    <div className="h-full border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Tables</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      {searchable && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredTables.map((table) => (
            <Button
              key={table}
              variant={selectedTable === table ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                selectedTable === table && "bg-primary/10",
              )}
              onClick={() => onTableSelect(table)}
            >
              <Database className="h-4 w-4 mr-2" />
              <span className="truncate">{table}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
