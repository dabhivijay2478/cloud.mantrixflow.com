"use client";

import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EnhancedResultViewerProps {
  columns: string[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  error?: string | null;
  fullScreen?: boolean;
  onFullScreen?: (fullScreen: boolean) => void;
  onDownload?: (format: "csv" | "json" | "excel") => void;
  onOpenInNewTab?: () => void;
  hideExternalTabButton?: boolean;
  title?: string;
}

export function EnhancedResultViewer({
  columns,
  rows,
  loading,
  error,
  fullScreen,
  onFullScreen,
  onDownload,
  onOpenInNewTab,
  hideExternalTabButton = false,
  title = "Query Results",
}: EnhancedResultViewerProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showAllRows, setShowAllRows] = useState(false);
  const rowsPerPage = 100;

  // Format cell value for display
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "NULL";
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, sortColumn, sortDirection]);

  // Paginate rows or show all
  const paginatedRows = useMemo(() => {
    if (showAllRows) {
      return sortedRows;
    }
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRows.slice(start, end);
  }, [sortedRows, page, showAllRows]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const hasMoreRows = sortedRows.length > rowsPerPage;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <p className="text-destructive font-medium mb-2">
            Error loading results
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Header - Responsive - Fixed */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b shrink-0 bg-muted/30 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <h3 className="font-semibold text-xs sm:text-sm truncate">{title}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {rows.length.toLocaleString()} row{rows.length !== 1 ? "s" : ""} •{" "}
            {columns.length} column{columns.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {onDownload && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload("csv")}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload("json")}>
                  Download as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload("excel")}>
                  Download as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onOpenInNewTab && !hideExternalTabButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenInNewTab}
              className="h-8 flex-1 sm:flex-none"
            >
              <ExternalLink className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">New Tab</span>
            </Button>
          )}
          {onFullScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFullScreen?.(!fullScreen)}
              className="h-8 shrink-0"
            >
              {fullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Table - Scrollable Area Only */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-muted/50 z-10">
                <TableRow>
                  {columns.map((col) => {
                    const isSorted = sortColumn === col;
                    return (
                      <TableHead
                        key={col}
                        className={cn(
                          "px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold cursor-pointer select-none hover:bg-muted/70 transition-colors whitespace-nowrap",
                          isSorted && "bg-muted",
                        )}
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm">{col}</span>
                          {isSorted &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            ))}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const rowKey = row.id
                      ? String(row.id)
                      : showAllRows
                        ? `row-${idx}`
                        : `row-${(page - 1) * rowsPerPage + idx}`;
                    return (
                      <TableRow
                        key={rowKey}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                          >
                            <div
                              className="max-w-[150px] sm:max-w-[250px] lg:max-w-md truncate"
                              title={formatCellValue(row[col])}
                            >
                              {formatCellValue(row[col])}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Pagination - Responsive */}
      {hasMoreRows && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-t shrink-0 bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {showAllRows ? (
              <>Showing all {sortedRows.length.toLocaleString()} rows</>
            ) : (
              <>
                Showing {((page - 1) * rowsPerPage + 1).toLocaleString()} to{" "}
                {Math.min(
                  page * rowsPerPage,
                  sortedRows.length,
                ).toLocaleString()}{" "}
                of {sortedRows.length.toLocaleString()} rows
              </>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {showAllRows ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAllRows(false);
                  setPage(1);
                }}
                className="h-8 flex-1 sm:flex-none"
              >
                Show Paginated
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAllRows(true);
                  }}
                  className="h-8 flex-1 sm:flex-none"
                >
                  Show All
                </Button>
                {totalPages > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 flex-1 sm:flex-none"
                    >
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="h-8 flex-1 sm:flex-none"
                    >
                      Next
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
