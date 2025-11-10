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
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * LineStackedColumnChart
 * @description Combination chart with stacked columns and line series for dual-axis visualization.
 * @param {LineStackedColumnChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string[]} props.columnKeys - Array of keys for stacked column data
 * @param {string[]} props.lineKeys - Array of keys for line series data
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.columnColors] - Custom color palette for columns
 * @param {string[]} [props.lineColors] - Custom color palette for lines
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} LineStackedColumnChart component
 * @example
 * <LineStackedColumnChart
 *   data={[
 *     { month: "Jan", sales: 4000, profit: 2400, target: 5000 },
 *     { month: "Feb", sales: 3000, profit: 1398, target: 4500 }
 *   ]}
 *   xKey="month"
 *   columnKeys={["sales", "profit"]}
 *   lineKeys={["target"]}
 *   title="Sales vs Target"
 * />
 */

export interface LineStackedColumnChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  columnKeys: string[];
  lineKeys: string[];
  title?: string;
  description?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  columnColors?: string[];
  lineColors?: string[];
  className?: string;
}

const DEFAULT_COLUMN_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const DEFAULT_LINE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function LineStackedColumnChart({
  data,
  xKey,
  columnKeys,
  lineKeys,
  title,
  description,
  showGrid = true,
  showLegend = true,
  columnColors = DEFAULT_COLUMN_COLORS,
  lineColors = DEFAULT_LINE_COLORS,
  className,
}: LineStackedColumnChartProps) {
  const chartConfig = [
    ...columnKeys.map((key, index) => ({
      key,
      label: key,
      color: columnColors[index % columnColors.length],
    })),
    ...lineKeys.map((key, index) => ({
      key,
      label: key,
      color: lineColors[index % lineColors.length],
    })),
  ].reduce(
    (config, item) => {
      config[item.key] = {
        label: item.label,
        color: item.color,
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
          <ComposedChart
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
            <YAxis yAxisId="left" tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {columnKeys.map((key) => (
              <Bar
                key={key}
                yAxisId="left"
                dataKey={key}
                fill={`var(--color-${key})`}
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
            ))}
            {lineKeys.map((key) => (
              <Line
                key={key}
                yAxisId="right"
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

