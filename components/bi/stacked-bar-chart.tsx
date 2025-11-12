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
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * StackedBarChart
 * @description Horizontal stacked bar chart for comparing multiple categories with stacked segments.
 * @param {StackedBarChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data (category)
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (stacked segments)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} StackedBarChart component
 * @example
 * <StackedBarChart
 *   data={[
 *     { category: "Q1", productA: 4000, productB: 2400, productC: 2000 },
 *     { category: "Q2", productA: 3000, productB: 1398, productC: 1500 }
 *   ]}
 *   xKey="category"
 *   yKeys={["productA", "productB", "productC"]}
 *   title="Quarterly Sales by Product"
 * />
 */

export interface StackedBarChartProps {
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

export function StackedBarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  showGrid = true,
  showLegend = true,
  colors = CHART_COLORS,
  className,
}: StackedBarChartProps) {
  const chartConfig = yKeys.reduce(
    (config, key, index) => {
      config[key] = {
        label: key,
        color: colors[index % colors.length],
      };
      return config;
    },
    {} as ChartConfig,
  );

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
          <RechartsBarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {yKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                stackId="stack"
                radius={[0, 4, 4, 0]}
              />
            ))}
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

