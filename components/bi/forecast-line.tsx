"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/**
 * ForecastLine
 * @description AI-predicted future values visualization with historical data.
 * Shows actual historical data and forecasted future trends.
 * @param {ForecastLineProps} props - Component properties
 * @param {Array<Record<string, any>>} props.historicalData - Historical data points
 * @param {Array<Record<string, any>>} props.forecastData - Forecasted data points
 * @param {string} props.xKey - Key for X-axis data
 * @param {string} props.yKey - Key for Y-axis data
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.forecastLabel] - Label for forecast line (default: "Forecast")
 * @param {boolean} [props.showConfidenceInterval] - Show confidence bounds (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ForecastLine component
 * @example
 * <ForecastLine
 *   historicalData={[
 *     { month: "Jan", value: 4000 },
 *     { month: "Feb", value: 3000 },
 *   ]}
 *   forecastData={[
 *     { month: "Mar", value: 3500, lower: 3200, upper: 3800 },
 *     { month: "Apr", value: 4200, lower: 3800, upper: 4600 },
 *   ]}
 *   xKey="month"
 *   yKey="value"
 *   title="Sales Forecast"
 *   showConfidenceInterval={true}
 * />
 */

export interface ForecastLineProps {
  historicalData: Array<Record<string, any>>;
  forecastData: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  description?: string;
  forecastLabel?: string;
  showConfidenceInterval?: boolean;
  className?: string;
}

export function ForecastLine({
  historicalData,
  forecastData,
  xKey,
  yKey,
  title,
  description,
  forecastLabel = "Forecast",
  showConfidenceInterval = false,
  className,
}: ForecastLineProps) {
  // Combine data for display
  const combinedData = [
    ...historicalData.map((d) => ({ ...d, type: "historical" })),
    ...forecastData.map((d) => ({ ...d, type: "forecast" })),
  ];

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
          <LineChart
            data={combinedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <ReferenceLine
              x={historicalData[historicalData.length - 1]?.[xKey]}
              stroke="#666"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#82ca9d"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name={forecastLabel}
              data={forecastData}
            />
            {showConfidenceInterval && (
              <>
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#82ca9d"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Upper Bound"
                  data={forecastData}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#82ca9d"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Lower Bound"
                  data={forecastData}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
