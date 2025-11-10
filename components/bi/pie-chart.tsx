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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

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
  data: Array<Record<string, any>>;
  nameKey: string;
  valueKey: string;
  title?: string;
  description?: string;
  innerRadius?: number;
  showLegend?: boolean;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PieChart({
  data,
  nameKey,
  valueKey,
  title,
  description,
  innerRadius = 0,
  showLegend = true,
  colors = DEFAULT_COLORS,
  className,
}: PieChartProps) {
  const chartConfig = data.reduce(
    (config, entry, index) => {
      const name = entry[nameKey] as string;
      config[name] = {
        label: name,
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
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((entry, index) => {
                const name = entry[nameKey] as string;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--color-${name})`}
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
      </CardContent>
    </Card>
  );
}
