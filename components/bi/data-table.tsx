"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
  description?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  filterColumn?: string;
  pagination?: boolean;
  pageSize?: number;
  columnVisibility?: boolean;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  title,
  description,
  sortable = true,
  filterable = true,
  filterPlaceholder = "Filter...",
  filterColumn,
  pagination = true,
  pageSize = 10,
  columnVisibility = false,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibilityState, setColumnVisibilityState] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: sortable ? setSorting : undefined,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibilityState,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility: columnVisibilityState,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {/* Filters and controls */}
        {(filterable || columnVisibility) && (
          <div className="flex items-center justify-between py-4 gap-2">
            {filterable && filterColumn && (
              <Input
                placeholder={filterPlaceholder}
                value={
                  (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            )}
            {columnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
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
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </>
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
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
  return ({ column }: { column: any }) => {
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
