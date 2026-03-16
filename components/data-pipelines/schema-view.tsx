"use client";

import { Columns3, Key, Loader2, RefreshCw } from "lucide-react";
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
  /** Column names that can be used as replication keys (show badge) */
  replicationKeyCandidates?: string[];
  /** When set, show include/exclude toggles per column */
  includeExclude?: Record<string, boolean>;
  onIncludeExcludeChange?: (name: string, included: boolean) => void;
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
  replicationKeyCandidates,
  includeExclude,
  onIncludeExcludeChange,
}: SchemaViewProps) {
  const showIncludeExclude = !!onIncludeExcludeChange;
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
                {showIncludeExclude && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-10">
                    Include
                  </th>
                )}
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
              {fields.map((f) => {
                const colName = f.name.includes(".") ? f.name.split(".").pop()! : f.name;
                const canBeReplicationKey =
                  replicationKeyCandidates?.includes(colName) ?? false;
                const included = includeExclude?.[f.name] ?? true;
                return (
                  <tr
                    key={f.name}
                    className={`border-b last:border-b-0 hover:bg-muted/30 ${!included ? "opacity-50" : ""}`}
                  >
                    {showIncludeExclude && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={included}
                          onChange={(e) =>
                            onIncludeExcludeChange?.(f.name, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-input"
                          aria-label={`Include ${f.name}`}
                        />
                      </td>
                    )}
                    <td className="px-3 py-2 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        {f.isPrimaryKey && (
                          <Key
                            className="h-3 w-3 text-blue-600 shrink-0"
                            aria-hidden
                          />
                        )}
                        {f.name}
                      </span>
                    </td>
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
                        {canBeReplicationKey && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-emerald-500/10 text-emerald-700"
                          >
                            Can be replication key
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
