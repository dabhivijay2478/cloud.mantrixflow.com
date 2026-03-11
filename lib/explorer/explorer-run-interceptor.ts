/**
 * Registry for the explorer run interceptor.
 * When the user clicks Run, we call this before parseAndRunCurrentQuery.
 * Returns true if the interceptor handled execution (e.g. remote SQL) - skip DuckDB.
 * Returns false/undefined if we should fall through to original (DuckDB).
 */

export type ExplorerRunInterceptor = () => Promise<boolean | void>;

let runInterceptor: ExplorerRunInterceptor | null = null;

export function setExplorerRunInterceptor(fn: ExplorerRunInterceptor | null): void {
  runInterceptor = fn;
}

export function getExplorerRunInterceptor(): ExplorerRunInterceptor | null {
  return runInterceptor;
}
