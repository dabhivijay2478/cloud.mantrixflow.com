/**
 * Registry for the explorer run interceptor.
 * When the user clicks Run, we call this before parseAndRunCurrentQuery.
 * It fetches data from the server and loads into DuckDB if needed.
 */

export type ExplorerRunInterceptor = () => Promise<void>;

let runInterceptor: ExplorerRunInterceptor | null = null;

export function setExplorerRunInterceptor(fn: ExplorerRunInterceptor | null): void {
  runInterceptor = fn;
}

export function getExplorerRunInterceptor(): ExplorerRunInterceptor | null {
  return runInterceptor;
}
