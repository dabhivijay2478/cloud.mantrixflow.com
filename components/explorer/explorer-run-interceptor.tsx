"use client";

import { useCallback, useEffect } from "react";
import { loadFromExplorerData } from "@/lib/explorer/load-explorer-data";
import { setExplorerRunInterceptor } from "@/lib/explorer/explorer-run-interceptor";
import { useExplorerContext } from "@/lib/explorer/explorer-context";
import { useRoomStore } from "./explorer-store";

/**
 * Sets up the run interceptor: when user clicks Run, we fetch data from the server
 * and load into DuckDB before executing the query. No pre-fetch on table select.
 */
export function ExplorerRunInterceptor() {
  const {
    orgId,
    dataSourceId,
    selectedSchema,
    selectedTable,
    explorerRowLimit,
    setExplorerData,
    setExplorerError,
    setExplorerDataAsOf,
  } = useExplorerContext();

  const addTable = useRoomStore((s) => s.db?.addTable);
  const dropTable = useRoomStore((s) => s.db?.dropTable);
  const refreshTableSchemas = useRoomStore(
    (s) => s.db?.refreshTableSchemas,
  );

  const interceptor = useCallback(async () => {
    if (!orgId || !dataSourceId || !selectedSchema || !selectedTable) return;
    if (!addTable || !dropTable) return;

    const tableName =
      selectedSchema === "public"
        ? selectedTable
        : `${selectedSchema}_${selectedTable}`;

    try {
      const result = await loadFromExplorerData(
        orgId,
        dataSourceId,
        selectedSchema,
        selectedTable,
        explorerRowLimit,
      );

      await dropTable(tableName).catch(() => {});
      await addTable(tableName, result.rows);
      await refreshTableSchemas?.();

      setExplorerData?.(result);
      setExplorerDataAsOf?.(new Date());
      setExplorerError?.(null);
    } catch (err) {
      setExplorerError?.(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }, [
    orgId,
    dataSourceId,
    selectedSchema,
    selectedTable,
    explorerRowLimit,
    addTable,
    dropTable,
    refreshTableSchemas,
    setExplorerData,
    setExplorerError,
    setExplorerDataAsOf,
  ]);

  useEffect(() => {
    setExplorerRunInterceptor(interceptor);
    return () => setExplorerRunInterceptor(null);
  }, [interceptor]);

  return null;
}
