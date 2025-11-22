"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

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
  historicalData: Array<Record<string, unknown>>;
  forecastData: Array<Record<string, unknown>>;
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
  // Safety checks for undefined data
  const safeHistoricalData = historicalData || [];
  const safeForecastData = forecastData || [];

  // Combine data for display
  const combinedData = [
    ...safeHistoricalData.map((d) => ({ ...d, type: "historical" })),
    ...safeForecastData.map((d) => ({ ...d, type: "forecast" })),
  ];

  const chartConfig = {
    historical: {
      label: "Actual",
      color: "var(--chart-1)",
    },
    forecast: {
      label: forecastLabel,
      color: "var(--chart-2)",
    },
    upper: {
      label: "Upper Bound",
      color: "var(--chart-2)",
    },
    lower: {
      label: "Lower Bound",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

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
            {safeHistoricalData.length > 0 && (
              <ReferenceLine
                x={
                  safeHistoricalData[safeHistoricalData.length - 1]?.[xKey] as
                    | string
                    | number
                }
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
              />
            )}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={`var(--color-historical)`}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="historical"
            />
            {safeForecastData.length > 0 && (
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={`var(--color-forecast)`}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="forecast"
                data={safeForecastData}
              />
            )}
            {showConfidenceInterval && safeForecastData.length > 0 && (
              <>
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke={`var(--color-upper)`}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="upper"
                  data={safeForecastData}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke={`var(--color-lower)`}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="lower"
                  data={safeForecastData}
                />
              </>
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
