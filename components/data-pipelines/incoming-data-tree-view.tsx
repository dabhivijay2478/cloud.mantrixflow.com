"use client";

import { ChevronDown, Database, Folder, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface IncomingDataTreeItem {
  database: string;
  schema: string;
  table: string;
  syncMode: string;
  columnCount: number;
  rowEstimate?: number | null;
}

interface IncomingDataTreeViewProps {
  items: IncomingDataTreeItem[];
  className?: string;
}

/**
 * Three-level tree view: database → schema → table
 * Shows sync mode badge, column count, and row estimate per table
 */
export function IncomingDataTreeView({ items, className }: IncomingDataTreeViewProps) {
  if (items.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground", className)}>
        No incoming data configured. Run schema discovery in the pipeline editor.
      </div>
    );
  }

  // Group by database → schema → tables
  const tree = items.reduce(
    (acc, item) => {
      if (!acc[item.database]) acc[item.database] = {};
      if (!acc[item.database][item.schema]) acc[item.database][item.schema] = [];
      acc[item.database][item.schema].push(item);
      return acc;
    },
    {} as Record<string, Record<string, IncomingDataTreeItem[]>>,
  );

  const syncModeLabel = (mode: string) => {
    const m = (mode || "full").toLowerCase();
    if (m === "log_based" || m === "cdc") return "CDC";
    if (m === "incremental") return "Incremental";
    return "Full";
  };

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <div className="bg-muted/50 px-3 py-2 border-b">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Incoming Data
        </h3>
      </div>
      <div className="p-2 space-y-0.5">
        {Object.entries(tree).map(([dbName, schemas]) => (
          <div key={dbName} className="space-y-0.5">
            {/* Database level */}
            <div className="flex items-center gap-1.5 py-1.5 px-2 rounded hover:bg-muted/50">
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Database className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium text-sm truncate">{dbName}</span>
            </div>
            {Object.entries(schemas).map(([schemaName, tables]) => (
              <div key={`${dbName}.${schemaName}`} className="ml-4 space-y-0.5">
                {/* Schema level */}
                <div className="flex items-center gap-1.5 py-1.5 px-2 rounded hover:bg-muted/50">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Folder className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                  <span className="font-medium text-sm truncate">{schemaName}</span>
                </div>
                {tables.map((t) => (
                  <div
                    key={`${dbName}.${schemaName}.${t.table}`}
                    className="ml-8 flex items-center gap-2 py-2 px-2 rounded bg-muted/30 border border-transparent hover:border-muted-foreground/20"
                  >
                    <Table className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono text-sm truncate flex-1">{t.table}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {syncModeLabel(t.syncMode)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t.columnCount} col{t.columnCount !== 1 ? "s" : ""}
                      </span>
                      {t.rowEstimate != null && (
                        <span className="text-xs text-muted-foreground">
                          ~{typeof t.rowEstimate === "number" ? t.rowEstimate.toLocaleString() : t.rowEstimate} rows
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
