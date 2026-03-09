"use client";

import { RoomShell } from "@sqlrooms/room-shell";
import { ExplorerRunInterceptor } from "./explorer-run-interceptor";
import { roomStore } from "./explorer-store";

export interface SqlRoomsExplorerPanelProps {
  tableName?: string;
  data?: { rows: Record<string, unknown>[]; columns: string[] } | null;
  onRefresh?: () => void;
  dataAsOf?: Date;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * SQLRooms explorer panel. Data is NOT pre-fetched on table select.
 * Data is loaded only when the user runs a SQL query (Run button).
 */
export function SqlRoomsExplorerPanel({
  onRefresh,
  dataAsOf,
  error,
}: SqlRoomsExplorerPanelProps) {
  return (
    <RoomShell roomStore={roomStore} className="h-full w-full">
      <ExplorerRunInterceptor />
      <div className="flex h-full w-full flex-col overflow-hidden">
        {dataAsOf && (
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <span>Data as of {dataAsOf.toLocaleString()}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="text-primary hover:underline"
              >
                Refresh
              </button>
            )}
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
