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
  Cell,
} from "recharts";

/**
 * WaterfallChart
 * @description Waterfall chart showing cumulative effect of positive and negative values.
 * @param {WaterfallChartProps} props - Component properties
 * @param {Array<WaterfallDataPoint>} props.data - Array of waterfall data points
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showGrid] - Show/hide grid lines (default: true)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.positiveColor] - Color for positive values (default: "#82ca9d")
 * @param {string} [props.negativeColor] - Color for negative values (default: "#ff7c7c")
 * @param {string} [props.totalColor] - Color for total values (default: "#8884d8")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} WaterfallChart component
 * @example
 * <WaterfallChart
 *   data={[
 *     { name: "Start", value: 1000, type: "start" },
 *     { name: "Revenue", value: 500, type: "positive" },
 *     { name: "Costs", value: -200, type: "negative" },
 *     { name: "End", value: 1300, type: "total" }
 *   ]}
 *   title="Financial Flow"
 * />
 */

export interface WaterfallDataPoint {
  name: string;
  value: number;
  type: "start" | "positive" | "negative" | "total";
}

export interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  title?: string;
  description?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  className?: string;
}

export function WaterfallChart({
  data,
  title,
  description,
  showGrid = true,
  showLegend = false,
  positiveColor = "var(--chart-2)",
  negativeColor = "var(--chart-4)",
  totalColor = "var(--chart-1)",
  className,
}: WaterfallChartProps) {
  // Process data to calculate cumulative values for waterfall effect
  // Use reduce to build the array iteratively to avoid accessing uninitialized data
  const processedData = data.reduce((acc, point, index) => {
    if (index === 0) {
      acc.push({ ...point, cumulative: point.value, start: 0, end: point.value });
      return acc;
    }
    
    const prevCumulative = acc[index - 1].cumulative;
    let cumulative = prevCumulative;
    let start = prevCumulative;
    let end = prevCumulative;
    
    if (point.type === "positive") {
      cumulative = prevCumulative + point.value;
      end = cumulative;
    } else if (point.type === "negative") {
      cumulative = prevCumulative + point.value;
      end = cumulative;
    } else if (point.type === "total") {
      cumulative = point.value;
      start = prevCumulative;
      end = point.value;
    } else {
      cumulative = point.value;
      start = 0;
      end = point.value;
    }
    
    acc.push({ ...point, cumulative, start, end });
    return acc;
  }, [] as Array<WaterfallDataPoint & { cumulative: number; start: number; end: number }>);

  const chartConfig = {
    positive: {
      label: "Positive",
      color: positiveColor,
    },
    negative: {
      label: "Negative",
      color: negativeColor,
    },
    total: {
      label: "Total",
      color: totalColor,
    },
    start: {
      label: "Start",
      color: totalColor,
    },
  } satisfies ChartConfig;

  const getBarColor = (type: string) => {
    switch (type) {
      case "positive":
        return `var(--color-positive)`;
      case "negative":
        return `var(--color-negative)`;
      case "total":
        return `var(--color-total)`;
      default:
        return `var(--color-start)`;
    }
  };

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
            data={processedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number, name: string, props: any) => {
                    if (props.payload?.type === "start" || props.payload?.type === "total") {
                      return [value, "Total"];
                    }
                    return [value > 0 ? `+${value}` : value, "Change"];
                  }}
                />
              }
            />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            <Bar dataKey="end" radius={[4, 4, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

