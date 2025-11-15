"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartWrapper } from "@/components/features/bi/charts/chart-wrapper";
import {
  createChartConfig,
  CHART_COLORS,
} from "@/components/features/bi/charts/chart-config";

/**
 * StackedColumnChart
 * @description Vertical stacked column chart for comparing multiple categories with stacked segments.
 * @param {StackedColumnChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data (category)
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (stacked segments)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} StackedColumnChart component
 * @example
 * <StackedColumnChart
 *   data={[
 *     { month: "Jan", productA: 4000, productB: 2400, productC: 2000 },
 *     { month: "Feb", productA: 3000, productB: 1398, productC: 1500 }
 *   ]}
 *   xKey="month"
 *   yKeys={["productA", "productB", "productC"]}
 *   title="Monthly Sales by Product"
 * />
 */

export interface StackedColumnChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
  className?: string;
}

export function StackedColumnChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  showGrid = true,
  showLegend = true,
  colors = CHART_COLORS,
  className,
}: StackedColumnChartProps) {
  const chartConfig = createChartConfig(yKeys, undefined, colors);

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsBarChart
          accessibilityLayer
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis
            dataKey={xKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {yKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              stackId="stack"
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
