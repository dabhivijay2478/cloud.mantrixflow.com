"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * PaginatedReport
 * @description Paginated report component for displaying large datasets with pagination controls.
 * @param {PaginatedReportProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data rows
 * @param {string[]} props.columns - Array of column definitions
 * @param {string} [props.title] - Report title
 * @param {string} [props.description] - Report description
 * @param {number} [props.pageSize] - Number of items per page (default: 10)
 * @param {boolean} [props.showPageSizeSelector] - Show page size selector (default: true)
 * @param {number[]} [props.pageSizeOptions] - Available page size options
 * @param {boolean} [props.showExport] - Show export buttons (default: true)
 * @param {Function} [props.onExport] - Export callback
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PaginatedReport component
 * @example
 * <PaginatedReport
 *   title="Sales Report"
 *   data={salesData}
 *   columns={[
 *     { key: "date", label: "Date" },
 *     { key: "amount", label: "Amount" },
 *     { key: "region", label: "Region" }
 *   ]}
 *   pageSize={20}
 * />
 */

export interface ReportColumn {
  key: string;
  label: string;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface PaginatedReportProps {
  data: Array<Record<string, any>>;
  columns: ReportColumn[];
  title?: string;
  description?: string;
  pageSize?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showExport?: boolean;
  onExport?: (format: "csv" | "pdf" | "excel") => void;
  className?: string;
}

export function PaginatedReport({
  data,
  columns,
  title,
  description,
  pageSize: initialPageSize = 10,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  showExport = true,
  onExport,
  className,
}: PaginatedReportProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {showExport && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport?.("csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport?.("pdf")}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
              {data.length} entries
            </div>
            {showPageSizeSelector && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-input bg-background rounded-md px-2 py-1 text-sm"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  currentData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-t hover:bg-muted/50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "px-4 py-3 text-sm",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                          )}
                        >
                          {column.render
                            ? column.render(row[column.key], row)
                            : String(row[column.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
