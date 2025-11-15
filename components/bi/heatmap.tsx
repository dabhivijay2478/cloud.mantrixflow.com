"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Heatmap
 * @description Value density visualization using a color-coded grid.
 * Perfect for displaying time-based patterns, correlations, and intensity data.
 * @param {HeatmapProps} props - Component properties
 * @param {HeatmapCell[]} props.data - Array of heatmap cells
 * @param {string[]} props.xLabels - X-axis labels
 * @param {string[]} props.yLabels - Y-axis labels
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.colorScale] - Color scale ("blue" | "green" | "red" | "purple", default: "blue")
 * @param {boolean} [props.showValues] - Show cell values (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Heatmap component
 * @example
 * <Heatmap
 *   data={[
 *     { x: 0, y: 0, value: 45 },
 *     { x: 1, y: 0, value: 78 },
 *     { x: 0, y: 1, value: 23 },
 *     { x: 1, y: 1, value: 91 }
 *   ]}
 *   xLabels={["Mon", "Tue"]}
 *   yLabels={["Morning", "Evening"]}
 *   title="Activity Heatmap"
 *   colorScale="blue"
 * />
 */

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  description?: string;
  colorScale?: "blue" | "green" | "red" | "purple";
  showValues?: boolean;
  className?: string;
}

const colorScales = {
  blue: [
    "#eff6ff",
    "#dbeafe",
    "#bfdbfe",
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
  ],
  green: [
    "#f0fdf4",
    "#dcfce7",
    "#bbf7d0",
    "#86efac",
    "#4ade80",
    "#22c55e",
    "#16a34a",
    "#15803d",
  ],
  red: [
    "#fef2f2",
    "#fee2e2",
    "#fecaca",
    "#fca5a5",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
  ],
  purple: [
    "#faf5ff",
    "#f3e8ff",
    "#e9d5ff",
    "#d8b4fe",
    "#c084fc",
    "#a855f7",
    "#9333ea",
    "#7e22ce",
  ],
};

export function Heatmap({
  data,
  xLabels,
  yLabels,
  title,
  description,
  colorScale = "blue",
  showValues = false,
  className,
}: HeatmapProps) {
  const maxValue = Math.max(...data.map((cell) => cell.value));
  const minValue = Math.min(...data.map((cell) => cell.value));
  const range = maxValue - minValue;

  const getColor = (value: number) => {
    const normalized = (value - minValue) / range;
    const colorIndex = Math.floor(
      normalized * (colorScales[colorScale].length - 1),
    );
    return colorScales[colorScale][colorIndex];
  };

  const getCellValue = (x: number, y: number) => {
    const cell = data.find((c) => c.x === x && c.y === y);
    return cell?.value ?? 0;
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
          <div className="inline-block min-w-full">
            <div className="flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-around pr-2">
                <div className="h-8" /> {/* Spacer for x-axis labels */}
                {yLabels.map((label) => (
                  <div
                    key={label}
                    className="h-12 flex items-center justify-end text-sm text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex-1">
                {/* X-axis labels */}
                <div className="flex mb-1">
                  {xLabels.map((label) => (
                    <div
                      key={label}
                      className="flex-1 text-center text-sm text-muted-foreground h-8 flex items-center justify-center"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                {yLabels.map((_, yIndex) => (
                  <div key={yIndex} className="flex gap-1 mb-1">
                    {xLabels.map((_, xIndex) => {
                      const value = getCellValue(xIndex, yIndex);
                      return (
                        <div
                          key={`${xIndex}-${yIndex}`}
                          className={cn(
                            "flex-1 h-12 rounded flex items-center justify-center text-sm font-medium transition-colors",
                            value > maxValue * 0.6 && "text-white",
                          )}
                          style={{ backgroundColor: getColor(value) }}
                          title={`${xLabels[xIndex]}, ${yLabels[yIndex]}: ${value}`}
                        >
                          {showValues && value}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            {colorScales[colorScale].map((color, index) => (
              <div
                key={index}
                className="w-6 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </CardContent>
    </Card>
  );
}
