"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
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
  data: Array<Record<string, unknown>>;
  categoryKey: string;
  valueKeys: string[];
  title?: string;
  description?: string;
  showLegend?: boolean;
  className?: string;
}

export function RadarChart({
  data,
  categoryKey,
  valueKeys,
  title,
  description,
  showLegend = true,
  className,
}: RadarChartProps) {
  const chartConfig = createChartConfig(valueKeys);

  return (
    <ChartWrapper title={title} description={description} className={className}>
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
    </ChartWrapper>
  );
}
