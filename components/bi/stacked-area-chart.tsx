"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * StackedAreaChart
 * @description Stacked area chart for displaying cumulative trends with multiple series.
 * @param {StackedAreaChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (stacked areas)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} StackedAreaChart component
 * @example
 * <StackedAreaChart
 *   data={[
 *     { month: "Jan", productA: 4000, productB: 2400, productC: 2000 },
 *     { month: "Feb", productA: 3000, productB: 1398, productC: 1500 }
 *   ]}
 *   xKey="month"
 *   yKeys={["productA", "productB", "productC"]}
 *   title="Cumulative Sales by Product"
 * />
 */

export interface StackedAreaChartProps {
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

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function StackedAreaChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  showGrid = true,
  showLegend = true,
  colors = CHART_COLORS,
  className,
}: StackedAreaChartProps) {
  const chartConfig = yKeys.reduce((config, key, index) => {
    config[key] = {
      label: key,
      color: colors[index % colors.length],
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {(title || description) && (
        <CardHeader className="flex-shrink-0">
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <RechartsAreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
            )}
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
                stackId="stack"
                stroke={`var(--color-${key})`}
                fill={`var(--color-${key})`}
                fillOpacity={0.6}
              />
            ))}
          </RechartsAreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
