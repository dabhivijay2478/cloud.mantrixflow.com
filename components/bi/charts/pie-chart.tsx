"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { CHART_COLORS } from "@/components/features/bi/charts/chart-config";
import { ChartWrapper } from "@/components/features/bi/charts/chart-wrapper";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * PieChart
 * @description Part-to-whole visualization component for displaying proportional data.
 * Shows how individual parts make up a total.
 * @param {PieChartProps} props - Component properties
 * @param {Array<Record<string, any>>} props.data - Array of data points
 * @param {string} props.nameKey - Key for segment labels
 * @param {string} props.valueKey - Key for segment values
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {number} [props.innerRadius] - Inner radius for donut effect (0-100, default: 0)
 * @param {boolean} [props.showLegend] - Show/hide legend (default: true)
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PieChart component
 * @example
 * <PieChart
 *   data={[
 *     { name: "Desktop", value: 400 },
 *     { name: "Mobile", value: 300 },
 *     { name: "Tablet", value: 200 }
 *   ]}
 *   nameKey="name"
 *   valueKey="value"
 *   title="Device Distribution"
 * />
 */

export interface PieChartProps {
  data: Array<Record<string, unknown>>;
  nameKey: string;
  valueKey: string;
  title?: string;
  description?: string;
  innerRadius?: number;
  showLegend?: boolean;
  colors?: string[];
  className?: string;
}

export function PieChart({
  data,
  nameKey,
  valueKey,
  title,
  description,
  innerRadius = 0,
  showLegend = true,
  colors = CHART_COLORS,
  className,
}: PieChartProps) {
  const chartConfig = data.reduce((config, entry, index) => {
    const name = entry[nameKey] as string;
    config[name] = {
      label: name,
      color: colors[index % colors.length],
    };
    return config;
  }, {} as ChartConfig);

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius > 0 ? 100 : 120}
            paddingAngle={innerRadius > 0 ? 1 : 2}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry) => {
              const name = entry[nameKey] as string;
              return (
                <Cell
                  key={`cell-${name}`}
                  fill={`var(--color-${name})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} />} />
          {showLegend && (
            <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
          )}
        </RechartsPieChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
