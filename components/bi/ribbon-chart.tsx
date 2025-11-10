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
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * RibbonChart
 * @description Stream/ribbon chart (normalized stacked area) showing proportional changes over time.
 * @param {RibbonChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string[]} props.yKeys - Array of keys for Y-axis data (ribbon segments)
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} RibbonChart component
 * @example
 * <RibbonChart
 *   data={[
 *     { month: "Jan", productA: 0.4, productB: 0.3, productC: 0.3 },
 *     { month: "Feb", productA: 0.5, productB: 0.2, productC: 0.3 }
 *   ]}
 *   xKey="month"
 *   yKeys={["productA", "productB", "productC"]}
 *   title="Market Share Trends"
 * />
 */

export interface RibbonChartProps {
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
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function RibbonChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  showGrid = true,
  showLegend = true,
  colors = CHART_COLORS,
  className,
}: RibbonChartProps) {
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
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
              }
            />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {yKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={`var(--color-${key})`}
                fill={`var(--color-${key})`}
                fillOpacity={0.8}
              />
            ))}
          </RechartsAreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

