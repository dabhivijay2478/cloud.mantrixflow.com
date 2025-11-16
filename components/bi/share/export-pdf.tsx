"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ExportPDF
 * @description Download dashboard snapshot as PDF.
 * Triggers PDF export/download functionality.
 * Note: Actual PDF generation requires backend implementation or library like jsPDF
 * @param {ExportPDFProps} props - Component properties
 * @param {() => void | Promise<void>} props.onExport - Export handler function
 * @param {string} [props.filename] - PDF filename (default: "dashboard.pdf")
 * @param {boolean} [props.showLabel] - Show "Export PDF" label (default: true)
 * @param {boolean} [props.loading] - Loading state
 * @param {boolean} [props.disabled] - Disabled state
 * @param {ExportPDFVariant} [props.variant] - Button variant
 * @param {ExportPDFSize} [props.size] - Button size
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ExportPDF component
 * @example
 * <ExportPDF
 *   onExport={async () => {
 *     // Generate and download PDF
 *     await generatePDF();
 *   }}
 *   filename="q4-report.pdf"
 * />
 */

export type ExportPDFVariant = "default" | "outline" | "ghost" | "secondary";
export type ExportPDFSize = "sm" | "default" | "lg";

export interface ExportPDFProps {
  onExport: () => void | Promise<void>;
  filename?: string;
  showLabel?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: ExportPDFVariant;
  size?: ExportPDFSize;
  className?: string;
}

export function ExportPDF({
  onExport,
  filename = "dashboard.pdf",
  showLabel = true,
  loading = false,
  disabled = false,
  variant = "default",
  size = "default",
  className,
}: ExportPDFProps) {
  const handleExport = async () => {
    try {
      await onExport();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label={`Export as ${filename}`}
    >
      <Download className="h-4 w-4" />
      {showLabel && (
        <span className="ml-2">{loading ? "Exporting..." : "Export PDF"}</span>
      )}
    </Button>
  );
}
