"use client";

import { Table } from "@/components/ui/table";

interface SQLResultViewerProps {
  columns: string[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  error?: string | null;
  fullScreen?: boolean;
  onFullScreen?: (fullScreen: boolean) => void;
  onDownload?: (format: "csv" | "json" | "excel") => void;
  onOpenInNewTab?: () => void;
  hideExternalTabButton?: boolean;
}

export function SQLResultViewer({
  columns,
  rows,
  loading,
  error,
}: SQLResultViewerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <Table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

