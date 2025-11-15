"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
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

/**
 * LineChart
 * @description Time series visualization component for displaying trends over time.
 * Supports multiple lines, trendlines, and responsive layouts.
 * @param {LineChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (supports multiple lines)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.color] - Primary line color (hex or CSS color)
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} LineChart component
 * @example
 * <LineChart
 *   data={[
 *     { month: "Jan", revenue: 4000, profit: 2400 },
 *     { month: "Feb", revenue: 3000, profit: 1398 },
 *     { month: "Mar", revenue: 2000, profit: 9800 }
 *   ]}
 *   xKey="month"
 *   yKeys={["revenue", "profit"]}
 *   title="Revenue & Profit Trends"
 *   color="#8884d8"
 * />
 */

export interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function LineChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  color,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  const chartConfig = createChartConfig(yKeys, color);

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsLineChart
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
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
