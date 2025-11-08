"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#a78bfa",
  "#fb923c",
  "#4ade80",
  "#f472b6",
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
        <ResponsiveContainer width="100%" height={350}>
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
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            {showLegend && <Legend />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
