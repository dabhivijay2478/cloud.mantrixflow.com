"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { exportToCSV, exportToJSON, exportToExcel } from "@/lib/utils/data-export";

/**
 * DataTable
 * @description Tabular data visualization with sorting, filtering, and pagination.
 * Built with TanStack Table v8 for high-performance data grids.
 * @param {DataTableProps<TData>} props - Component properties
 * @param {ColumnDef<TData>[]} props.columns - Column definitions (TanStack Table format)
 * @param {TData[]} props.data - Array of data rows
 * @param {string} [props.title] - Table title
 * @param {string} [props.description] - Table description
 * @param {boolean} [props.sortable] - Enable sorting (default: true)
 * @param {boolean} [props.filterable] - Enable global search filter (default: true)
 * @param {string} [props.filterPlaceholder] - Search input placeholder
 * @param {string} [props.filterColumn] - Column to filter (required if filterable)
 * @param {boolean} [props.pagination] - Enable pagination (default: true)
 * @param {number} [props.pageSize] - Rows per page (default: 10)
 * @param {boolean} [props.columnVisibility] - Enable column visibility toggle (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} DataTable component
 * @example
 * const columns: ColumnDef<Payment>[] = [
 *   {
 *     accessorKey: "status",
 *     header: "Status",
 *   },
 *   {
 *     accessorKey: "email",
 *     header: "Email",
 *   },
 *   {
 *     accessorKey: "amount",
 *     header: ({ column }) => (
 *       <Button
 *         variant="ghost"
 *         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
 *       >
 *         Amount
 *         <ArrowUpDown className="ml-2 h-4 w-4" />
 *       </Button>
 *     ),
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={payments}
 *   title="Payments"
 *   filterable={true}
 *   filterColumn="email"
 *   filterPlaceholder="Filter emails..."
 * />
 */

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  title?: string;
  description?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  filterColumn?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  columnVisibility?: boolean;
  rowSelection?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
  enableColumnResizing?: boolean;
  serverSidePagination?: boolean;
  serverSideSorting?: boolean;
  serverSideFiltering?: boolean;
  totalCount?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  title,
  description,
  sortable = true,
  filterable = true,
  filterPlaceholder = "Filter...",
  filterColumn,
  globalFilter: externalGlobalFilter,
  onGlobalFilterChange,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  columnVisibility = false,
  rowSelection: enableRowSelection = false,
  enableExport = false,
  exportFilename = "export",
  enableColumnResizing = false,
  serverSidePagination = false,
  serverSideSorting = false,
  serverSideFiltering = false,
  totalCount,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  className,
  emptyMessage = "No results.",
  loading = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibilityState, setColumnVisibilityState] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  
  const globalFilter = externalGlobalFilter ?? internalGlobalFilter;
  const setGlobalFilter = onGlobalFilterChange ?? setInternalGlobalFilter;
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Handle sorting changes
  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortingChange) {
        onSortingChange(newSorting);
      }
    },
    [sorting, onSortingChange],
  );

  // Handle column filter changes
  const handleColumnFiltersChange = React.useCallback(
    (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      if (onColumnFiltersChange) {
        onColumnFiltersChange(newFilters);
      }
    },
    [columnFilters, onColumnFiltersChange],
  );

  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination && !serverSidePagination 
      ? getPaginationRowModel() 
      : undefined,
    getSortedRowModel: sortable && !serverSideSorting 
      ? getSortedRowModel() 
      : undefined,
    getFilteredRowModel: !serverSideFiltering 
      ? getFilteredRowModel() 
      : undefined,
    manualPagination: serverSidePagination,
    manualSorting: serverSideSorting,
    manualFiltering: serverSideFiltering,
    onSortingChange: sortable ? handleSortingChange : undefined,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibilityState,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onGlobalFilterChange: filterable ? setGlobalFilter : undefined,
    onPaginationChange: setPaginationState,
    globalFilterFn: "includesString",
    enableColumnResizing: enableColumnResizing,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility: columnVisibilityState,
      rowSelection,
      globalFilter: debouncedGlobalFilter,
      pagination: paginationState,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    pageCount: serverSidePagination && totalCount 
      ? Math.ceil(totalCount / pageSize) 
      : undefined,
  });

  // Handle pagination changes for server-side
  React.useEffect(() => {
    if (serverSidePagination && onPaginationChange) {
      const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
      onPaginationChange(pageIndex, currentPageSize);
    }
  }, [table.getState().pagination, serverSidePagination, onPaginationChange]);

  // Export handlers
  const handleExport = React.useCallback(
    (format: "csv" | "json" | "excel") => {
      const exportData = enableRowSelection && Object.keys(rowSelection).length > 0
        ? table.getFilteredSelectedRowModel().rows.map((row) => row.original)
        : data;

      const columnKeys = columns
        .filter((col) => {
          const accessorKey = "accessorKey" in col ? col.accessorKey : undefined;
          return accessorKey && typeof accessorKey === "string";
        })
        .map((col) => {
          const accessorKey = "accessorKey" in col ? col.accessorKey : undefined;
          return typeof accessorKey === "string" ? accessorKey : "";
        })
        .filter(Boolean);

      if (format === "csv") {
        exportToCSV(exportData, columnKeys, `${exportFilename}.csv`);
      } else if (format === "json") {
        exportToJSON(exportData, `${exportFilename}.json`);
      } else if (format === "excel") {
        exportToExcel(exportData, columnKeys, `${exportFilename}.xlsx`);
      }
    },
    [data, columns, rowSelection, enableRowSelection, exportFilename, table],
  );

  const selectedRowCount = Object.keys(rowSelection).length;
  const filteredRowCount = serverSidePagination && totalCount 
    ? totalCount 
    : table.getFilteredRowModel().rows.length;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {(title || description || enableExport) && (
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0 overflow-auto">
        {/* Filters and controls */}
        {(filterable || columnVisibility || enableRowSelection) && (
          <div className="flex items-center justify-between py-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              {filterable && (
                <Input
                  placeholder={filterPlaceholder}
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                  aria-label="Search table"
                />
              )}
              {enableRowSelection && selectedRowCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedRowCount} of {filteredRowCount} row(s) selected
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {columnVisibility && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            )}
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {enableRowSelection && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                          }
                          aria-label="Select all"
                        />
                      </TableHead>
                    )}
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          style={{
                            width: enableColumnResizing && header.getSize() !== 150
                              ? `${header.getSize()}px`
                              : undefined,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading && table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          Loading data...
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        row.getIsSelected() && "bg-muted/50",
                      )}
                    >
                      {enableRowSelection && (
                        <TableCell>
                          <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) =>
                              row.toggleSelected(!!value)
                            }
                            aria-label={`Select row ${row.id}`}
                          />
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: enableColumnResizing &&
                              cell.column.getSize() !== 150
                              ? `${cell.column.getSize()}px`
                              : undefined,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                      className="h-24 text-center"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-sm text-muted-foreground">
                {serverSidePagination && totalCount ? (
                  <>
                    Showing{" "}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      totalCount,
                    )}{" "}
                    of {totalCount} results
                  </>
                ) : (
                  <>
                    Showing{" "}
                    {table.getFilteredRowModel().rows.length === 0
                      ? 0
                      : table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                        1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length,
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} results
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                  aria-label="Go to first page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                  aria-label="Go to next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                  aria-label="Go to last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to create sortable column header
 */
export function createSortableHeader(label: string) {
  return ({ column }: { column: Column<unknown, unknown> }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };
}
