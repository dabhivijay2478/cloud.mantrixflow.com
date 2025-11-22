"use client";

import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { createChartConfig } from "@/components/features/bi/charts/chart-config";
import { ChartWrapper } from "@/components/features/bi/charts/chart-wrapper";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
} from "@/components/bi/charts/chart-states/chart-states";

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
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

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
  loading = false,
  error = null,
  emptyMessage = "No data available",
}: BarChartProps) {
  const chartConfig = createChartConfig(yKeys);

  if (loading) {
    return (
      <ChartWrapper
        title={title}
        description={description}
        className={className}
      >
        <ChartLoadingState />
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title={title}
        description={description}
        className={className}
      >
        <ChartErrorState error={error} />
      </ChartWrapper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartWrapper
        title={title}
        description={description}
        className={className}
      >
        <ChartEmptyState message={emptyMessage} />
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer
        config={chartConfig}
        className="h-full w-full"
        aria-label={title || "Bar chart"}
      >
        <RechartsBarChart
          accessibilityLayer
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          role="img"
          aria-label={title ? `${title} chart` : "Bar chart"}
        >
          {showGrid && (
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
          )}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </>
          )}
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
          />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {yKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              stackId={stacked ? "stack" : undefined}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
