"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * BarChart
 * @description Comparison view component for displaying categorical data comparisons.
 * Supports stacked bars, horizontal orientation, and multiple series.
 * @param {BarChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data (category)
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (supports multiple bars)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.stacked] - Enable stacked bars (default: false)
 * @param {boolean} [props.horizontal] - Horizontal orientation (default: false)
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} BarChart component
 * @example
 * <BarChart
 *   data={[
 *     { category: "A", value1: 4000, value2: 2400 },
 *     { category: "B", value1: 3000, value2: 1398 },
 *     { category: "C", value1: 2000, value2: 9800 }
 *   ]}
 *   xKey="category"
 *   yKeys={["value1", "value2"]}
 *   title="Sales Comparison"
 *   stacked={true}
 * />
 */

export interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function BarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  stacked = false,
  horizontal = false,
  showGrid = true,
  showLegend = true,
  className,
}: BarChartProps) {
  const chartConfig = yKeys.reduce(
    (config, key, index) => {
      config[key] = {
        label: key,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return config;
    },
    {} as ChartConfig,
  );

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
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <RechartsBarChart
            accessibilityLayer
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            {horizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
              </>
            )}
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {yKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                stackId={stacked ? "stack" : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
