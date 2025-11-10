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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
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

  const chartConfig = {
    historical: {
      label: "Actual",
      color: "hsl(var(--chart-1))",
    },
    forecast: {
      label: forecastLabel,
      color: "hsl(var(--chart-2))",
    },
    upper: {
      label: "Upper Bound",
      color: "hsl(var(--chart-2))",
    },
    lower: {
      label: "Lower Bound",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

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
          <LineChart
            accessibilityLayer
            data={combinedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              x={historicalData[historicalData.length - 1]?.[xKey]}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={`var(--color-historical)`}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="historical"
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={`var(--color-forecast)`}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="forecast"
              data={forecastData}
            />
            {showConfidenceInterval && (
              <>
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke={`var(--color-upper)`}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="upper"
                  data={forecastData}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke={`var(--color-lower)`}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="lower"
                  data={forecastData}
                />
              </>
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
