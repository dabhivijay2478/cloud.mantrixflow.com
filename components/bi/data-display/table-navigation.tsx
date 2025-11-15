"use client";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TableNavigationProps {
  tables: string[];
  onTableSelect?: (tableName: string) => void;
  selectedTable?: string;
  className?: string;
  searchable?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Table Navigation Component
 * @description A reusable sidebar component for navigating database tables with collapse/expand functionality
 */
export function TableNavigation({
  tables,
  onTableSelect,
  selectedTable,
  className,
  searchable = true,
  defaultCollapsed = false,
  onCollapsedChange,
}: TableNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Sync internal state with prop changes
  useEffect(() => {
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    return tables.filter((table) =>
      table.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tables, searchQuery]);

  return (
    <div
      className={cn(
        "h-full flex flex-col border-r bg-[#1a1a1a] text-white transition-all duration-200 w-full",
        className,
      )}
    >
      {/* Header / Logo */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-6 border-b border-gray-700/50 shrink-0">
          <Logo size={32} className="mb-6" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
                  onClick={handleToggleCollapse}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-400" />
            <span className="font-semibold text-sm">Tables</span>
            {tables.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-700 text-white"
              >
                {tables.length}
              </Badge>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={handleToggleCollapse}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Search */}
      {!isCollapsed && searchable && (
        <div className="p-4 border-b border-gray-700 shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-teal-400"
            />
          </div>
        </div>
      )}

      {/* Table List */}
      <ScrollArea className="flex-1">
        <div
          className={cn(
            isCollapsed
              ? "flex flex-col items-center gap-3 py-4 px-2"
              : "space-y-1 p-2",
          )}
        >
          {filteredTables.length > 0
            ? filteredTables.map((table, index) => {
                const isSelected = selectedTable === table;
                // Add separator after first few items when collapsed (matching image style)
                const showSeparator =
                  isCollapsed &&
                  index === Math.min(3, filteredTables.length - 1);
                return (
                  <div
                    key={table}
                    className="w-full flex flex-col items-center"
                  >
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "transition-all duration-200",
                              isCollapsed
                                ? "w-10 h-10 p-0 justify-center rounded-md"
                                : "w-full justify-start px-3 h-9",
                              isSelected
                                ? isCollapsed
                                  ? "bg-gray-800/80 text-white"
                                  : "bg-gray-700 text-white border-l-2 border-teal-400"
                                : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-300",
                            )}
                            onClick={() => onTableSelect?.(table)}
                          >
                            <TableIcon
                              className={cn(
                                isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2",
                                isSelected
                                  ? isCollapsed
                                    ? "text-white stroke-2"
                                    : "text-teal-400"
                                  : isCollapsed
                                    ? "text-gray-400 stroke-[1.5]"
                                    : "text-gray-400",
                              )}
                              strokeWidth={isCollapsed && !isSelected ? 1.5 : 2}
                            />
                            {!isCollapsed && (
                              <span className="truncate text-sm">{table}</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            <p>{table}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    {showSeparator && (
                      <div className="w-8 h-px bg-gray-700/50 my-2" />
                    )}
                  </div>
                );
              })
            : !isCollapsed && (
                <div className="p-4 text-sm text-gray-400 text-center">
                  {searchQuery ? "No tables found" : "No tables available"}
                </div>
              )}
        </div>
      </ScrollArea>
    </div>
  );
}
