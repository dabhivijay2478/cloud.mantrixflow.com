"use client";

import { EnhancedResultViewer } from "./enhanced-result-viewer";

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
  title?: string;
}

export function SQLResultViewer(props: SQLResultViewerProps) {
  return <EnhancedResultViewer {...props} />;
}
