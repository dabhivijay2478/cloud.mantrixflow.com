"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
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
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#a78bfa",
  "#fb923c",
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
        <ResponsiveContainer width="100%" height={400}>
          <RechartsRadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={categoryKey} />
            <PolarRadiusAxis />
            {valueKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
            {showLegend && <Legend />}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
