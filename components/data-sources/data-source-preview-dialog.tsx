"use client";

import { Database, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDiscoverStreams,
  usePreviewData,
} from "@/lib/api/hooks/use-data-source";

interface DataSourcePreviewDialogProps {
  organizationId: string | undefined;
  dataSourceId: string | null;
  dataSourceName?: string;
  onClose: () => void;
}

export function DataSourcePreviewDialog({
  organizationId,
  dataSourceId,
  dataSourceName,
  onClose,
}: DataSourcePreviewDialogProps) {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const { data: discoverData, isLoading: discoverLoading } = useDiscoverStreams(
    organizationId,
    dataSourceId ?? undefined,
    !!dataSourceId,
  );

  const streams = discoverData?.streams ?? [];
  const effectiveStreamForPreview = selectedStream || streams[0]?.name || "";

  const { data: previewData, isLoading: previewLoading } = usePreviewData(
    organizationId,
    dataSourceId ?? undefined,
    { source_stream: effectiveStreamForPreview, limit: 50 },
    !!effectiveStreamForPreview,
  );

  const streamOptions = useMemo(() => {
    const names = streams.map((s) => s.name);
    const actual = previewData?.stream;
    if (actual && !names.includes(actual)) return [...names, actual];
    return names;
  }, [streams, previewData?.stream]);
  const effectiveStream = selectedStream || streamOptions[0] || "";

  useEffect(() => {
    if (streamOptions.length > 0 && !selectedStream) {
      setSelectedStream(streamOptions[0]);
    }
  }, [streamOptions, selectedStream]);

  // Sync selected stream when API returns a different stream (e.g. fallback after mismatch)
  useEffect(() => {
    const actualStream = previewData?.stream;
    if (actualStream && actualStream !== selectedStream) {
      setSelectedStream(actualStream);
    }
  }, [previewData?.stream, selectedStream]);

  const records = (previewData?.records ?? []) as Record<string, unknown>[];
  const columns = previewData?.columns ?? [];
  const colNames = Array.isArray(columns)
    ? columns.map((c) => (typeof c === "string" ? c : (c as { name: string }).name))
    : [];

  const isLoading = discoverLoading || previewLoading;

  return (
    <Dialog open={!!dataSourceId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Preview
            {dataSourceName && (
              <span className="font-normal text-muted-foreground">
                — {dataSourceName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Preview sample data from this data source using ETL (Airbyte)
          </DialogDescription>
        </DialogHeader>

        {previewData?.warning && (
          <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            {previewData.warning}
          </div>
        )}
        {streamOptions.length > 1 && (
          <div className="flex items-center gap-2 pb-4">
            <span className="text-sm text-muted-foreground">Stream:</span>
            <Select
              value={effectiveStream}
              onValueChange={(v) => setSelectedStream(v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {streamOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length > 0 ? (
            <div className="border rounded-lg overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {colNames.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-medium border-b"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      {colNames.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-2 truncate max-w-[200px]"
                        >
                          {String(row[col] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No preview data available
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {discoverLoading || (streams.length === 0 && !discoverLoading)
                  ? "Discovering streams..."
                  : "The selected stream may be empty"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
