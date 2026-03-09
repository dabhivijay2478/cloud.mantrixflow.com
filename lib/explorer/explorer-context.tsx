"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Schema } from "@/lib/api/types/data-sources";

export interface ExplorerDataResult {
  rows: Record<string, unknown>[];
  columns: string[];
}

export interface ExplorerContextValue {
  orgId: string | undefined;
  dataSourceId: string;
  schemas: Schema[];
  schemasLoading: boolean;
  selectedSchema: string | undefined;
  selectedTable: string | undefined;
  onTableSelect: (tableName: string, schemaName: string) => void;
  loadExplorerData: () => Promise<void>;
  explorerRowLimit: number;
  setExplorerRowLimit: (value: number) => void;
  explorerLoading: boolean;
  /** Optional setters for run interceptor to update state after fetch */
  setExplorerData?: (data: ExplorerDataResult | null) => void;
  setExplorerError?: (error: string | null) => void;
  setExplorerDataAsOf?: (date: Date | undefined) => void;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export function ExplorerProvider({
  value,
  children,
}: {
  value: ExplorerContextValue;
  children: ReactNode;
}) {
  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorerContext(): ExplorerContextValue {
  const ctx = useContext(ExplorerContext);
  if (!ctx) {
    throw new Error("useExplorerContext must be used within ExplorerProvider");
  }
  return ctx;
}
