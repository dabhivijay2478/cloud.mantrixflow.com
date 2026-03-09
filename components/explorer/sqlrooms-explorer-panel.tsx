"use client";

import { RoomShell } from "@sqlrooms/room-shell";
import { ExplorerRunInterceptor } from "./explorer-run-interceptor";
import { roomStore, useRoomStore } from "./explorer-store";

export interface SqlRoomsExplorerPanelProps {
  tableName?: string;
  data?: { rows: Record<string, unknown>[]; columns: string[] } | null;
  onRefresh?: () => void;
  dataAsOf?: Date;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * SQLRooms explorer panel. Executes SQL against the remote database
 * (like Snowflake/Redshift). Supports JOINs, subqueries, full SQL.
 */
export function SqlRoomsExplorerPanel({
  dataAsOf,
  error,
}: SqlRoomsExplorerPanelProps) {
  const parseAndRunCurrentQuery = useRoomStore(
    (s) => s.sqlEditor?.parseAndRunCurrentQuery,
  );

  const handleRefresh = () => void parseAndRunCurrentQuery?.();

  return (
    <RoomShell roomStore={roomStore} className="h-full w-full">
      <ExplorerRunInterceptor />
      <div className="flex h-full w-full flex-col overflow-hidden">
        {dataAsOf && (
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <span>Last run: {dataAsOf.toLocaleString()}</span>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-primary hover:underline"
            >
              Run again
            </button>
          </div>
        )}
        {error && (
          <div className="shrink-0 border-b border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-hidden">
          <RoomShell.LayoutComposer />
        </div>
      </div>
    </RoomShell>
  );
}
