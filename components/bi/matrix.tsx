"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Matrix
 * @description Matrix/heatmap table component for displaying two-dimensional data relationships.
 * @param {MatrixProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data rows
 * @param {string[]} props.rowKeys - Array of row identifiers
 * @param {string[]} props.columnKeys - Array of column identifiers
 * @param {string} [props.title] - Matrix title
 * @param {string} [props.description] - Matrix description
 * @param {string[]} [props.colorScale] - Color scale for value mapping
 * @param {number} [props.minValue] - Minimum value for color scaling (auto-calculated if not provided)
 * @param {number} [props.maxValue] - Maximum value for color scaling (auto-calculated if not provided)
 * @param {boolean} [props.showValues] - Show numeric values in cells (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Matrix component
 * @example
 * <Matrix
 *   data={[
 *     { row: "Q1", col1: 100, col2: 200, col3: 150 },
 *     { row: "Q2", col1: 120, col2: 180, col3: 160 }
 *   ]}
 *   rowKeys={["Q1", "Q2"]}
 *   columnKeys={["col1", "col2", "col3"]}
 *   title="Quarterly Performance Matrix"
 * />
 */

export interface MatrixProps {
  data: Array<Record<string, any>>;
  rowKeys: string[];
  columnKeys: string[];
  title?: string;
  description?: string;
  colorScale?: string[];
  minValue?: number;
  maxValue?: number;
  showValues?: boolean;
  className?: string;
}

const DEFAULT_COLOR_SCALE = [
  "#e0f2fe",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
];

export function Matrix({
  data,
  rowKeys,
  columnKeys,
  title,
  description,
  colorScale = DEFAULT_COLOR_SCALE,
  minValue,
  maxValue,
  showValues = true,
  className,
}: MatrixProps) {
  // Calculate value range for color mapping
  const allValues: number[] = [];
  data.forEach((row) => {
    columnKeys.forEach((colKey) => {
      const value = Number(row[colKey]);
      if (!isNaN(value)) {
        allValues.push(value);
      }
    });
  });

  const calculatedMin = minValue ?? Math.min(...allValues);
  const calculatedMax = maxValue ?? Math.max(...allValues);
  const valueRange = calculatedMax - calculatedMin || 1;

  const getColorForValue = (value: number): string => {
    if (isNaN(value)) return "#e5e7eb";
    const normalized = (value - calculatedMin) / valueRange;
    const index = Math.floor(normalized * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border p-2 text-left text-sm font-medium bg-muted/50">
                  {/* Empty corner cell */}
                </th>
                {columnKeys.map((colKey) => (
                  <th
                    key={colKey}
                    className="border border-border p-2 text-center text-sm font-medium bg-muted/50"
                  >
                    {colKey}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((rowKey, rowIndex) => {
                const rowData = data[rowIndex] || {};
                return (
                  <tr key={rowKey}>
                    <td className="border border-border p-2 text-sm font-medium bg-muted/50">
                      {rowKey}
                    </td>
                    {columnKeys.map((colKey) => {
                      const value = Number(rowData[colKey]) || 0;
                      const color = getColorForValue(value);
                      return (
                        <td
                          key={colKey}
                          className={cn(
                            "border border-border p-2 text-center text-sm",
                            "transition-colors hover:opacity-80"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {showValues && (
                            <span
                              className={cn(
                                value > calculatedMin + valueRange * 0.5
                                  ? "text-white"
                                  : "text-foreground"
                              )}
                            >
                              {value}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Scale:</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden flex">
            {colorScale.map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{calculatedMin}</span>
            <span>{calculatedMax}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

