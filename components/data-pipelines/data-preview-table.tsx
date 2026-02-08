"use client";

import { AlertCircle, ChevronDown, ChevronUp, Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataPreviewTableProps {
  /** Title shown in the collapsible header */
  title: string;
  /** Subtitle / description */
  description?: string;
  /** Row data to display */
  rows: unknown[];
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Error message if the fetch failed */
  error?: string | null;
  /** Whether the section starts open */
  defaultOpen?: boolean;
  /** Callback to trigger a refresh */
  onRefresh?: () => void;
  /** Whether a refresh is in progress */
  isRefreshing?: boolean;
  /** Max rows to display (default: 10) */
  maxRows?: number;
}

/**
 * Reusable data preview table component.
 * Renders a collapsible section with a horizontally-scrollable table
 * showing the first N rows from a source or destination.
 */
export function DataPreviewTable({
  title,
  description,
  rows,
  isLoading = false,
  error = null,
  defaultOpen = false,
  onRefresh,
  isRefreshing = false,
  maxRows = 10,
}: DataPreviewTableProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Derive column names from first row
  const displayRows = rows.slice(0, maxRows);
  const columnNames =
    displayRows.length > 0
      ? Object.keys(displayRows[0] as Record<string, unknown>)
      : [];

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
            type="button"
            aria-label={`Toggle ${title} preview`}
            tabIndex={0}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{title}</span>
              {displayRows.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {displayRows.length} row{displayRows.length !== 1 ? "s" : ""}
                </Badge>
              )}
              {description && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {description}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh();
                  }}
                  disabled={isRefreshing || isLoading}
                  className="h-7 text-xs"
                  type="button"
                  aria-label={`Refresh ${title}`}
                  tabIndex={0}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading preview data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground justify-center">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>
                  {error.includes("not exist") || error.includes("relation")
                    ? "Table does not exist yet. Run the pipeline first."
                    : `Preview unavailable: ${error}`}
                </span>
              </div>
            ) : displayRows.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                No data available. Run the pipeline to populate.
              </div>
            ) : (
              <ScrollArea className="mt-3 max-h-[400px]">
                <div className="min-w-max">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-10">
                          #
                        </th>
                        {columnNames.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, rowIdx) => {
                        const record = row as Record<string, unknown>;
                        return (
                          <tr
                            key={rowIdx}
                            className="border-b last:border-b-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
                              {rowIdx + 1}
                            </td>
                            {columnNames.map((col) => (
                              <td
                                key={col}
                                className="px-3 py-1.5 text-xs font-mono whitespace-nowrap max-w-[300px] truncate"
                                title={formatCellValue(record[col])}
                              >
                                {record[col] === null ||
                                record[col] === undefined ? (
                                  <span className="text-muted-foreground italic">
                                    NULL
                                  </span>
                                ) : (
                                  formatCellValue(record[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
