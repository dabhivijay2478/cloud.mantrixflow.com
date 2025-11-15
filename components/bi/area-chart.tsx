"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartWrapper } from "@/components/features/bi/charts/chart-wrapper";
import { createChartConfig } from "@/components/features/bi/charts/chart-config";

/**
 * AreaChart
 * @description Cumulative trends visualization component for displaying data over time with filled areas.
 * Perfect for showing volume, accumulated values, and trend patterns.
 * @param {AreaChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (supports multiple areas)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.stacked] - Enable stacked areas (default: false)
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} AreaChart component
 * @example
 * <AreaChart
 *   data={[
 *     { month: "Jan", users: 4000, sessions: 2400 },
 *     { month: "Feb", users: 3000, sessions: 1398 },
 *     { month: "Mar", users: 2000, sessions: 9800 }
 *   ]}
 *   xKey="month"
 *   yKeys={["users", "sessions"]}
 *   title="User Engagement"
 *   stacked={true}
 * />
 */

export interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function AreaChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  stacked = false,
  showGrid = true,
  showLegend = true,
  className,
}: AreaChartProps) {
  const chartConfig = createChartConfig(yKeys);

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsAreaChart
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
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "stack" : undefined}
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.6}
            />
          ))}
        </RechartsAreaChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
