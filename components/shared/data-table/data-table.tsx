"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns,
  Search,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue> {
  /**
   * Column definitions for the table
   */
  columns: ColumnDef<TData, TValue>[];
  /**
   * Data to display in the table
   */
  data: TData[];
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Error state
   */
  error?: Error | string | null;
  /**
   * Pagination configuration (for manual pagination)
   */
  pagination?: PaginationState;
  /**
   * Callback when pagination changes (for manual pagination)
   */
  onPaginationChange?: (pagination: PaginationState) => void;
  /**
   * Enable manual pagination (server-side)
   */
  manualPagination?: boolean;
  /**
   * Total count for manual pagination
   */
  totalCount?: number;
  /**
   * Default visible columns (column IDs)
   */
  defaultVisibleColumns?: string[];
  /**
   * Fixed columns that cannot be hidden (column IDs)
   */
  fixedColumns?: string[];
  /**
   * Enable row selection
   */
  enableRowSelection?: boolean;
  /**
   * Row selection state
   */
  rowSelection?: Record<string, boolean>;
  /**
   * Callback when row selection changes
   */
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  /**
   * Enable sorting
   */
  enableSorting?: boolean;
  /**
   * Initial sorting state
   */
  initialSorting?: SortingState;
  /**
   * Callback when sorting changes
   */
  onSortingChange?: (sorting: SortingState) => void;
  /**
   * Enable filtering
   */
  enableFiltering?: boolean;
  /**
   * Column filters state
   */
  columnFilters?: ColumnFiltersState;
  /**
   * Callback when column filters change
   */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  /**
   * Global filter value (for search input)
   */
  globalFilter?: string;
  /**
   * Callback when global filter changes
   */
  onGlobalFilterChange?: (value: string) => void;
  /**
   * Placeholder for global filter input
   */
  filterPlaceholder?: string;
  /**
   * Callback when a row is clicked
   */
  onRowClick?: (row: TData) => void;
  /**
   * Custom empty state message
   */
  emptyMessage?: string;
  /**
   * Custom empty state description
   */
  emptyDescription?: string;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Page size options
   */
  pageSizeOptions?: number[];
  /**
   * Default page size
   */
  defaultPageSize?: number;
}

/**
 * DataTable Component
 *
 * A comprehensive, reusable data table component built on shadcn/ui and TanStack Table.
 * Matches the reference design with filter input, column visibility, row selection,
 * sorting, pagination, and action columns.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   isLoading={isLoading}
 *   enableSorting
 *   enableRowSelection
 *   filterPlaceholder="Filter emails..."
 * />
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error = null,
  pagination,
  onPaginationChange,
  manualPagination = false,
  totalCount,
  defaultVisibleColumns,
  fixedColumns = [],
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  enableSorting = false,
  initialSorting = [],
  onSortingChange,
  enableFiltering = false,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  filterPlaceholder = "Filter...",
  onRowClick,
  emptyMessage = "No results found",
  emptyDescription,
  className,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
}: DataTableProps<TData, TValue>) {
  // Internal state for client-side features
  const [internalSorting, setInternalSorting] =
    React.useState<SortingState>(initialSorting);
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (defaultVisibleColumns) {
        const visibility: VisibilityState = {};
        columns.forEach((col) => {
          // Get column ID - prefer id, fallback to accessorKey if it exists
          let colId: string | undefined = col.id;
          if (!colId && "accessorKey" in col) {
            const accessorKey = (col as { accessorKey?: string }).accessorKey;
            if (typeof accessorKey === "string") {
              colId = accessorKey;
            }
          }
          if (colId) {
            visibility[colId] = defaultVisibleColumns.includes(colId);
          }
        });
        return visibility;
      }
      return {};
    });
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: defaultPageSize,
    });

  // Use controlled or uncontrolled state
  const sorting = onSortingChange ? initialSorting : internalSorting;
  const setSorting = onSortingChange
    ? (updater: SortingState | ((prev: SortingState) => SortingState)) => {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        onSortingChange(newSorting);
      }
    : setInternalSorting;

  const filters = onColumnFiltersChange
    ? columnFilters || []
    : internalColumnFilters;
  const setFilters = onColumnFiltersChange
    ? (
        updater:
          | ColumnFiltersState
          | ((prev: ColumnFiltersState) => ColumnFiltersState),
      ) => {
        const newFilters =
          typeof updater === "function" ? updater(filters) : updater;
        onColumnFiltersChange(newFilters);
      }
    : setInternalColumnFilters;

  const currentGlobalFilter =
    onGlobalFilterChange !== undefined ? globalFilter : internalGlobalFilter;
  const setCurrentGlobalFilter = onGlobalFilterChange
    ? (value: string) => {
        onGlobalFilterChange(value);
      }
    : setInternalGlobalFilter;

  const selection = onRowSelectionChange
    ? rowSelection || {}
    : internalRowSelection;
  const setSelection = onRowSelectionChange
    ? (
        updater:
          | Record<string, boolean>
          | ((prev: Record<string, boolean>) => Record<string, boolean>),
      ) => {
        const newSelection =
          typeof updater === "function" ? updater(selection) : updater;
        onRowSelectionChange(newSelection);
      }
    : setInternalRowSelection;

  const paginationState = pagination || internalPagination;
  const setPaginationState = onPaginationChange
    ? (
        updater: PaginationState | ((prev: PaginationState) => PaginationState),
      ) => {
        const newPagination =
          typeof updater === "function" ? updater(paginationState) : updater;
        onPaginationChange(newPagination);
      }
    : setInternalPagination;

  // Global filter function - searches across all cell values
  const globalFilterFn = React.useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (!filterValue) return true;
      const searchValue = filterValue.toLowerCase();

      // Search across all visible cell values
      return Object.values(row.original).some((value) => {
        if (value === null || value === undefined) return false;
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(searchValue);
      });
    },
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      manualSorting: false, // Client-side sorting
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setFilters,
      manualFiltering: false, // Client-side filtering
      globalFilterFn: globalFilterFn,
    }),
    ...(enableRowSelection && {
      enableRowSelection: true,
      onRowSelectionChange: setSelection,
    }),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: totalCount
            ? Math.ceil(totalCount / paginationState.pageSize)
            : undefined,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onColumnVisibilityChange: setInternalColumnVisibility,
    state: {
      sorting,
      columnFilters: filters,
      globalFilter: currentGlobalFilter,
      columnVisibility: internalColumnVisibility,
      rowSelection: selection,
      pagination: paginationState,
    },
    ...(onGlobalFilterChange !== undefined && {
      onGlobalFilterChange: setCurrentGlobalFilter,
    }),
  });

  // Error state
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <ErrorState
          error={error instanceof Error ? error : new Error(String(error))}
          title="Failed to load data"
        />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <TableSkeleton
          columnCount={columns.length}
          rowCount={defaultPageSize}
          showCheckbox={enableRowSelection}
          showAction={false}
        />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-md border">
          <div className="p-8">
            <EmptyState title={emptyMessage} description={emptyDescription} />
          </div>
        </div>
      </div>
    );
  }

  const selectedRowCount = Object.values(selection).filter(Boolean).length;
  const totalRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Top Controls: Filter Input and Column Visibility */}
      <div className="flex items-center justify-between">
        {/* Filter Input - Top Left */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={filterPlaceholder}
            value={currentGlobalFilter || ""}
            onChange={(e) => setCurrentGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Column Visibility Button - Top Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Columns className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => {
                const colId = column.id;
                return colId && !fixedColumns.includes(colId);
              })
              .map((column) => {
                const colDef = column.columnDef;
                const header =
                  typeof colDef.header === "string"
                    ? colDef.header
                    : colDef.id || column.id || "Column";
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {String(header)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-muted/30">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* Row Selection Checkbox in Header */}
                {enableRowSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                      }
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(!!checked)
                      }
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} className="relative">
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            canSort &&
                              "cursor-pointer select-none hover:text-foreground",
                          )}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 opacity-70" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="h-4 w-4 opacity-70" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    row.getIsSelected() && "bg-muted",
                  )}
                >
                  {/* Row Selection Checkbox */}
                  {enableRowSelection && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(checked) =>
                          row.toggleSelected(!!checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={
                    (enableRowSelection ? 1 : 0) +
                    table.getAllColumns().filter((col) => col.getIsVisible())
                      .length
                  }
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Controls: Row Selection Summary and Pagination */}
      <div className="flex items-center justify-between">
        {/* Row Selection Summary - Bottom Left */}
        {enableRowSelection && (
          <div className="text-sm text-muted-foreground">
            {selectedRowCount} of {totalRowCount} row
            {totalRowCount !== 1 ? "s" : ""} selected.
          </div>
        )}
        {!enableRowSelection && (
          <div className="text-sm text-muted-foreground">
            {totalRowCount} row{totalRowCount !== 1 ? "s" : ""}
          </div>
        )}

        {/* Pagination Controls - Bottom Right */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {paginationState.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {table.getPageCount() <= 1 && enableRowSelection && <div />}
      </div>
    </div>
  );
}
