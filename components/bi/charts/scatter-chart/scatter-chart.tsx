"use client";

import {
  CartesianGrid,
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWrapper } from "@/components/features/bi/charts/chart-wrapper";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * ScatterChart
 * @description Scatter plot for displaying relationships between two numeric variables.
 * @param {ScatterChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string} props.yKey - Key for Y-axis data
 * @param {string} [props.nameKey] - Key for point names/labels
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.color] - Point color (default: "#8884d8")
 * @param {number} [props.pointSize] - Size of scatter points (default: 8)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ScatterChart component
 * @example
 * <ScatterChart
 *   data={[
 *     { x: 100, y: 200, name: "Point A" },
 *     { x: 120, y: 100, name: "Point B" },
 *     { x: 170, y: 300, name: "Point C" }
 *   ]}
 *   xKey="x"
 *   yKey="y"
 *   nameKey="name"
 *   title="Correlation Analysis"
 * />
 */

export interface ScatterChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  nameKey?: string;
  title?: string;
  description?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  color?: string;
  pointSize?: number;
  className?: string;
}

export function ScatterChart({
  data,
  xKey,
  yKey,
  nameKey,
  title,
  description,
  showGrid = true,
  showLegend = false,
  color = "var(--chart-1)",
  pointSize: _pointSize = 8,
  className,
}: ScatterChartProps) {
  const chartConfig = {
    data: {
      label: "Data",
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsScatterChart
          accessibilityLayer
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis
            type="number"
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(
                  value: unknown,
                  name: unknown,
                  props: { payload?: Record<string, unknown> },
                ) => {
                  if (nameKey && props.payload?.[nameKey]) {
                    return [
                      `${props.payload[nameKey]}: (${props.payload[xKey]}, ${props.payload[yKey]})`,
                      "",
                    ];
                  }
                  return [
                    typeof value === "number" || typeof value === "string"
                      ? String(value)
                      : "",
                    name === xKey ? "X" : "Y",
                  ];
                }}
              />
            }
            cursor={{ strokeDasharray: "3 3" }}
          />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          <Scatter name="data" data={data} fill={`var(--color-data)`}>
            {data.map((entry) => {
              const entryKey =
                nameKey && entry[nameKey]
                  ? String(entry[nameKey])
                  : `${entry[xKey]}-${entry[yKey]}`;
              return (
                <Cell key={`cell-${entryKey}`} fill={`var(--color-data)`} />
              );
            })}
          </Scatter>
        </RechartsScatterChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
