import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Search, Check, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
  getConnectedDataSource: (id: string) => any;
  onDataSourceClick: (id: string) => void;
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
}: DataSourceTableProps) {
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
    let filtered = [...allDataSources];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((ds) =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        case "connections":
          const aConnected = isConnected(a.id);
          const bConnected = isConnected(b.id);
          aValue = aConnected ? 1 : 0;
          bValue = bConnected ? 1 : 0;
          break;
        case "last-sync":
          const aData = getConnectedDataSource(a.id);
          const bData = getConnectedDataSource(b.id);
          aValue = aData?.connectedAt ? new Date(aData.connectedAt).getTime() : 0;
          bValue = bData?.connectedAt ? new Date(bData.connectedAt).getTime() : 0;
          break;
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
        return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
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
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-semibold text-primary"
                    onClick={() => onSort("name")}
                  >
                    NAME
                    {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-semibold"
                    onClick={() => onSort("connector")}
                  >
                    CONNECTOR
                    {getSortIcon("connector")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-semibold"
                    onClick={() => onSort("connections")}
                  >
                    CONNECTIONS
                    {getSortIcon("connections")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-semibold"
                    onClick={() => onSort("last-sync")}
                  >
                    LAST SYNC
                    {getSortIcon("last-sync")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-semibold"
                    onClick={() => onSort("status")}
                  >
                    STATUS
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedDataSources().map((dataSource) => {
                const connected = isConnected(dataSource.id);
                const connectedData = getConnectedDataSource(dataSource.id);
                const selectedTables = connectedData?.selectedTables || (connectedData?.selectedTable ? [connectedData.selectedTable] : []);

                return (
                  <TableRow
                    key={dataSource.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onDataSourceClick(dataSource.id)}
                  >
                    <TableCell className="font-medium">{dataSource.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                          {getIconComponent(dataSource.iconType, 20)}
                        </div>
                        <span className="capitalize">{dataSource.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {connected && selectedTables.length > 0
                        ? `${selectedTables.length} ${selectedTables.length === 1 ? "connection" : "connections"}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {connectedData?.connectedAt
                        ? new Date(connectedData.connectedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {connected ? (
                        <Badge className="bg-green-500 text-white border-0">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

