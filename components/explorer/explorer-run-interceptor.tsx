"use client";

import { tableFromJSON } from "apache-arrow";
import { useCallback, useEffect } from "react";
import { executeRemoteQuery } from "@/lib/explorer/execute-remote-query";
import { setExplorerRunInterceptor } from "@/lib/explorer/explorer-run-interceptor";
import { useExplorerContext } from "@/lib/explorer/explorer-context";
import { roomStore, useRoomStore } from "./explorer-store";

/**
 * Sets up the run interceptor: when user clicks Run, we execute SQL against the
 * remote database (like Snowflake/Redshift). Supports JOINs, subqueries, etc.
 */
export function ExplorerRunInterceptor() {
  const {
    orgId,
    dataSourceId,
    explorerRowLimit,
    setExplorerError,
    setExplorerDataAsOf,
  } = useExplorerContext();

  const queryResultLimit = useRoomStore((s) => s.sqlEditor?.queryResultLimit);

  const interceptor = useCallback(async (): Promise<boolean> => {
    if (!orgId || !dataSourceId) return false;

    const query = roomStore.getState().sqlEditor?.getCurrentQuery?.();
    if (!query?.trim()) return false;

    const selectedQueryId =
      roomStore.getState().sqlEditor?.config?.selectedQueryId;
    if (!selectedQueryId) return false;

    const maxRows = Math.min(
      queryResultLimit ?? 10000,
      explorerRowLimit ?? 10000,
      100000,
    );

    try {
      roomStore.setState((state) => ({
        ...state,
        sqlEditor: {
          ...state.sqlEditor,
          queryResultsById: {
            ...state.sqlEditor.queryResultsById,
            [selectedQueryId]: {
              status: "loading",
              isBeingAborted: false,
              controller: new AbortController(),
            },
          },
        },
      }));

      const result = await executeRemoteQuery(
        orgId,
        dataSourceId,
        query,
        maxRows,
        60000,
      );

      const arrowTable = tableFromJSON(result.rows as Record<string, unknown>[]);

      roomStore.setState((state) => ({
        ...state,
        sqlEditor: {
          ...state.sqlEditor,
          queryResultsById: {
            ...state.sqlEditor.queryResultsById,
            [selectedQueryId]: {
              status: "success",
              type: "select",
              result: arrowTable,
              query,
              lastQueryStatement: query,
            },
          },
        },
      }));

      setExplorerError?.(null);
      setExplorerDataAsOf?.(new Date());
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setExplorerError?.(msg);
      roomStore.setState((state) => ({
        ...state,
        sqlEditor: {
          ...state.sqlEditor,
          queryResultsById: {
            ...state.sqlEditor.queryResultsById,
            [selectedQueryId]: {
              status: "error",
              error: msg,
            },
          },
        },
      }));
      return true;
    }
  }, [
    orgId,
    dataSourceId,
    explorerRowLimit,
    queryResultLimit,
    setExplorerError,
    setExplorerDataAsOf,
  ]);

  useEffect(() => {
    setExplorerRunInterceptor(interceptor);
    return () => setExplorerRunInterceptor(null);
  }, [interceptor]);

  return null;
}
