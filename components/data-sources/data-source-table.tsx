import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  MoreVertical,
  Search,
  Trash2,
  Unlink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataSource } from "@/lib/stores/workspace-store";
import { allDataSources } from "./constants";
import { getIconComponent } from "./utils";

interface DataSourceTableProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  isConnected: (id: string) => boolean;
  getConnectedDataSource: (id: string) => DataSource | undefined;
  onDataSourceClick: (id: string) => void;
  showOnlyConnected?: boolean;
  connections?: DataSource[]; // Actual connections from API
  onDisconnect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DataSourceTable({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortColumn,
  sortDirection,
  onSort,
  isConnected,
  getConnectedDataSource,
  onDataSourceClick,
  showOnlyConnected = false,
  connections = [],
  onDisconnect,
  onDelete,
}: DataSourceTableProps) {
  const router = useRouter();
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getFilteredAndSortedDataSources = () => {
    // If showOnlyConnected is true and we have connections, use the actual connections
    let filtered: DataSource[];
    if (showOnlyConnected && connections.length > 0) {
      filtered = [...connections];
    } else {
      // Map allDataSources to DataSource format with default status
      filtered = allDataSources.map((ds) => ({
        ...ds,
        status: isConnected(ds.id)
          ? ("connected" as const)
          : ("disconnected" as const),
      })) as DataSource[];
      // If showOnlyConnected is true but no connections, filter by connected status
      if (showOnlyConnected) {
        filtered = filtered.filter((ds) => isConnected(ds.id));
      }
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((ds) =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ds) => {
        const connected = isConnected(ds.id);
        if (statusFilter === "connected") return connected;
        if (statusFilter === "not-connected") return !connected;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortColumn) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "connector":
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case "connections": {
          const aConnected = isConnected(a.id);
          const bConnected = isConnected(b.id);
          aValue = aConnected ? 1 : 0;
          bValue = bConnected ? 1 : 0;
          break;
        }
        case "last-sync": {
          const aData = getConnectedDataSource(a.id);
          const bData = getConnectedDataSource(b.id);
          aValue = aData?.connectedAt
            ? new Date(aData.connectedAt).getTime()
            : 0;
          bValue = bData?.connectedAt
            ? new Date(bData.connectedAt).getTime()
            : 0;
          break;
        }
        case "status":
          aValue = isConnected(a.id) ? "connected" : "not-connected";
          bValue = isConnected(b.id) ? "connected" : "not-connected";
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
    });

    return filtered;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {!showOnlyConnected && (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="not-connected">Not Connected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <Card className="border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="h-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => onSort("name")}
                    >
                      Name
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead className="h-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => onSort("connector")}
                    >
                      Connector
                      {getSortIcon("connector")}
                    </Button>
                  </TableHead>
                  <TableHead className="h-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => onSort("connections")}
                    >
                      Connections
                      {getSortIcon("connections")}
                    </Button>
                  </TableHead>
                  <TableHead className="h-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => onSort("last-sync")}
                    >
                      Last Sync
                      {getSortIcon("last-sync")}
                    </Button>
                  </TableHead>
                  <TableHead className="h-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => onSort("status")}
                    >
                      Status
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px] h-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredAndSortedDataSources().map((dataSource) => {
                  // When showing connections, dataSource is already a connection
                  // When showing all data sources, check if it's connected
                  const connected =
                    showOnlyConnected && connections.length > 0
                      ? true
                      : isConnected(dataSource.id);
                  const connectedData =
                    showOnlyConnected && connections.length > 0
                      ? dataSource
                      : getConnectedDataSource(dataSource.id);
                  const selectedTables =
                    connectedData?.selectedTables ||
                    (connectedData?.selectedTable
                      ? [connectedData.selectedTable]
                      : []);

                  // Get icon type - use dataSource.type if available, otherwise infer from connection
                  const iconType: string =
                    "iconType" in dataSource &&
                    typeof dataSource.iconType === "string"
                      ? dataSource.iconType
                      : dataSource.type === "postgres"
                        ? "postgres"
                        : dataSource.type;

                  return (
                    <TableRow
                      key={dataSource.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onDataSourceClick(dataSource.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {getIconComponent(iconType, 16)}
                          </div>
                          <span className="font-semibold">
                            {dataSource.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm text-muted-foreground">
                          {dataSource.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {connected && selectedTables.length > 0 ? (
                          <span className="text-sm font-medium">
                            {selectedTables.length}{" "}
                            {selectedTables.length === 1 ? "table" : "tables"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {connectedData?.connectedAt ? (
                          <span className="text-sm text-muted-foreground">
                            {new Date(
                              connectedData.connectedAt,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {connected ? (
                          <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0 font-medium">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not connected
                          </span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {connected && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (onDisconnect) {
                                      onDisconnect(dataSource.id);
                                    }
                                  }}
                                  className="text-orange-600 focus:text-orange-600"
                                >
                                  <Unlink className="mr-2 h-4 w-4" />
                                  Disconnect
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                if (onDelete) {
                                  onDelete(dataSource.id);
                                }
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {getFilteredAndSortedDataSources().length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              No data sources found
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Get started by connecting a data source"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
