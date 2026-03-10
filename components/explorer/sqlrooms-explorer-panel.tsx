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
 * SQLRooms explorer panel. Executes SQL against the remote database.
 * Header (name, last run, error) is rendered by the parent page.
 */
export function SqlRoomsExplorerPanel(_props: SqlRoomsExplorerPanelProps) {
  return (
    <RoomShell roomStore={roomStore} className="h-full min-h-0 w-full overflow-hidden">
      <ExplorerRunInterceptor />
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <RoomShell.LayoutComposer />
        </div>
      </div>
    </RoomShell>
  );
}
