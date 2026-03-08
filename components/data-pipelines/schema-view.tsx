"use client";

import { Columns3, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SchemaField {
  name: string;
  type?: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
}

interface SchemaViewProps {
  title: string;
  streamName?: string;
  fields: SchemaField[];
  fieldCount?: number;
  lastRefreshedAt?: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  emptyMessage?: string;
}

export function SchemaView({
  title,
  streamName,
  fields,
  fieldCount,
  lastRefreshedAt,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  emptyMessage = "No schema available. Run discovery or preview to populate.",
}: SchemaViewProps) {
  const count = fieldCount ?? fields.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Columns3 className="h-3 w-3 text-muted-foreground" />
            Schema
          </h3>
          {lastRefreshedAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(lastRefreshedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {count} FIELDS
          </Badge>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || isRefreshing}
              className="h-7 text-xs"
              aria-label="Refresh schema"
            >
              {isRefreshing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      {streamName && (
        <p className="text-xs text-muted-foreground">Stream: {streamName}</p>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Loading schema...</span>
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/30">
          {emptyMessage}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  FIELD NAME
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  TYPE
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  BADGES
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr
                  key={f.name}
                  className="border-b last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-mono text-xs">{f.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {f.type ?? "String"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {f.isPrimaryKey && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-blue-500/10 text-blue-700"
                        >
                          PRIMARY KEY
                        </Badge>
                      )}
                      {!f.nullable && f.name !== "_sdc_" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-muted"
                        >
                          REQUIRED
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
