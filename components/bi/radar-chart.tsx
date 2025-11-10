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
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

/**
 * RadarChart
 * @description Multi-dimension comparison visualization using a radar/spider chart.
 * Perfect for comparing multiple metrics across different categories.
 * @param {RadarChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.categoryKey - Key for category labels
 * @param {string[]} props.valueKeys - Array of value keys to plot
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} RadarChart component
 * @example
 * <RadarChart
 *   data={[
 *     { subject: "Math", score: 90, average: 75 },
 *     { subject: "Science", score: 85, average: 80 },
 *     { subject: "English", score: 75, average: 70 },
 *     { subject: "History", score: 95, average: 85 },
 *   ]}
 *   categoryKey="subject"
 *   valueKeys={["score", "average"]}
 *   title="Student Performance"
 * />
 */

export interface RadarChartProps {
  data: Array<Record<string, any>>;
  categoryKey: string;
  valueKeys: string[];
  title?: string;
  description?: string;
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

export function RadarChart({
  data,
  categoryKey,
  valueKeys,
  title,
  description,
  showLegend = true,
  className,
}: RadarChartProps) {
  const chartConfig = valueKeys.reduce(
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
          <RechartsRadarChart accessibilityLayer data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={categoryKey} />
            <PolarRadiusAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {valueKeys.map((key) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={`var(--color-${key})`}
                fill={`var(--color-${key})`}
                fillOpacity={0.3}
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </RechartsRadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
