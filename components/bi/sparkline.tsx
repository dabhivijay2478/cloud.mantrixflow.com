"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

/**
 * Sparkline
 * @description Inline mini-trend visualization for embedding in text or cards.
 * Lightweight chart without axes or labels, perfect for compact displays.
 * @param {SparklineProps} props - Component properties
 * @param {Array<number | Record<string, any>>} props.data - Array of data points (numbers or objects)
 * @param {string} [props.dataKey] - Key for data values (required if data is objects)
 * @param {SparklineType} [props.type] - Chart type: "line" or "area" (default: "line")
 * @param {string} [props.color] - Line/area color (default: "#8884d8")
 * @param {number} [props.height] - Chart height in pixels (default: 40)
 * @param {number} [props.width] - Chart width in pixels (default: 100)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Sparkline component
 * @example
 * <Sparkline
 *   data={[10, 25, 15, 40, 30, 55, 45]}
 *   type="line"
 *   color="#10b981"
 *   height={40}
 * />
 *
 * <Sparkline
 *   data={[{ value: 10 }, { value: 25 }, { value: 15 }]}
 *   dataKey="value"
 *   type="area"
 * />
 */

export type SparklineType = "line" | "area";

export interface SparklineProps {
  data: Array<number | Record<string, any>>;
  dataKey?: string;
  type?: SparklineType;
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function Sparkline({
  data,
  dataKey = "value",
  type = "line",
  color = "#8884d8",
  height = 40,
  width = 100,
  className,
}: SparklineProps) {
  // Transform simple number arrays to object arrays
  const chartData = data.map((point) =>
    typeof point === "number" ? { [dataKey]: point } : point,
  );

  return (
    <div className={className} style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
