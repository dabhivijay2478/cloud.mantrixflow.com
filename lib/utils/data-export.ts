/**
 * Data Export Utilities
 * @description Utilities for exporting table data to various formats (CSV, JSON, Excel)
 */

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: string[],
  filename = "export.csv",
): void {
  if (data.length === 0) {
    return;
  }

  // Get headers from columns or data keys
  const headers = columns.length > 0 ? columns : Object.keys(data[0] || {});

  // Create CSV rows
  const csvRows = [
    // Header row
    headers
      .map((header) => {
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const value = String(header);
        if (
          value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return "";
          }
          const stringValue =
            typeof value === "object" ? JSON.stringify(value) : String(value);

          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (
            stringValue.includes(",") ||
            stringValue.includes("\n") ||
            stringValue.includes('"')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(","),
    ),
  ];

  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T extends Record<string, unknown>>(
  data: T[],
  filename = "export.json",
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format (XLSX)
 * Note: This creates a CSV file with .xlsx extension for simplicity
 * For true Excel format, consider using a library like 'xlsx' or 'exceljs'
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: string[],
  filename = "export.xlsx",
): void {
  // For now, we'll export as CSV but with .xlsx extension
  // Excel can open CSV files, though true XLSX format would require a library
  exportToCSV(data, columns, filename.replace(/\.xlsx?$/, ".csv"));
}

/**
 * Format data for export based on column definitions
 */
export function formatDataForExport<T extends Record<string, unknown>>(
  data: T[],
  columns: string[],
): Record<string, unknown>[] {
  if (columns.length === 0) {
    return data;
  }

  return data.map((row) => {
    const formattedRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      formattedRow[col] = row[col] ?? null;
    });
    return formattedRow;
  });
}
