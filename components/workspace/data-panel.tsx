"use client";

import { Calendar, Hash, ToggleLeft, Type, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type DatasetColumn,
  useWorkspaceStore,
} from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

// Mock function to fetch columns from a table
const fetchTableColumns = async (
  _dataSourceId: string,
  _tableName: string,
): Promise<DatasetColumn[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock columns based on table
  const mockColumns: DatasetColumn[] = [
    { name: "id", type: "number", selected: false, order: 0 },
    { name: "name", type: "string", selected: false, order: 1 },
    { name: "email", type: "string", selected: false, order: 2 },
    { name: "created_at", type: "date", selected: false, order: 3 },
    { name: "status", type: "boolean", selected: false, order: 4 },
    { name: "revenue", type: "number", selected: false, order: 5 },
    { name: "category", type: "string", selected: false, order: 6 },
  ];

  return mockColumns;
};

function ColumnIcon({
  type,
  className,
}: {
  type: DatasetColumn["type"];
  className?: string;
}) {
  switch (type) {
    case "number":
      return <Hash className={className || "h-3.5 w-3.5"} />;
    case "date":
      return <Calendar className={className || "h-3.5 w-3.5"} />;
    case "boolean":
      return <ToggleLeft className={className || "h-3.5 w-3.5"} />;
    default:
      return <Type className={className || "h-3.5 w-3.5"} />;
  }
}

function getTypeColor(type: DatasetColumn["type"]) {
  switch (type) {
    case "number":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "date":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "boolean":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    default:
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
  }
}

export function DataPanel() {
  const { dataPanelOpen, setDataPanelOpen, currentDataSource } =
    useWorkspaceStore();

  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [loading, setLoading] = useState(false);

  // Get the current data source and selected table
  const connectedDataSource = currentDataSource || null;
  const selectedTable = connectedDataSource?.selectedTable || "";

  // Fetch columns when table changes
  useEffect(() => {
    if (connectedDataSource?.id && selectedTable) {
      setLoading(true);
      fetchTableColumns(connectedDataSource.id, selectedTable)
        .then((cols) => {
          setColumns(cols);
        })
        .catch((error) => {
          console.error("Failed to fetch columns:", error);
          setColumns([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setColumns([]);
    }
  }, [connectedDataSource?.id, selectedTable]);

  if (!dataPanelOpen) {
    return (
      <button
        type="button"
        className="h-full w-full border-r bg-muted/30 flex flex-col items-center relative cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setDataPanelOpen(true)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col items-center justify-center flex-1 w-full py-4">
          <span
            className="text-xs text-muted-foreground select-none"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textOrientation: "mixed",
            }}
          >
            Data
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="h-full w-full border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-semibold text-sm">Data</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDataPanelOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {!connectedDataSource ? (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  No data source connected. Please connect a data source first.
                </p>
              </CardContent>
            </Card>
          ) : !selectedTable ? (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  No table selected. Please select a table from the topbar.
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Loading columns...
              </p>
            </div>
          ) : columns.length === 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  No columns available for this table.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Table
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {columns.length} columns
                  </Badge>
                </div>
                <p className="text-sm font-medium">{selectedTable}</p>
                <p className="text-xs text-muted-foreground">
                  {connectedDataSource.name}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Columns
                </p>
                <div className="space-y-1">
                  {columns.map((column) => (
                    <div
                      key={column.name}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border bg-background hover:bg-accent transition-colors",
                        column.selected && "ring-2 ring-primary",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ColumnIcon
                          type={column.type}
                          className="shrink-0 text-muted-foreground"
                        />
                        <span className="text-sm font-medium truncate">
                          {column.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs shrink-0",
                          getTypeColor(column.type),
                        )}
                      >
                        {column.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
