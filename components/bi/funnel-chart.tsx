"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FunnelChart
 * @description Conversion funnel visualization showing step-by-step drop-off rates.
 * Perfect for displaying sales pipelines, user journeys, and conversion processes.
 * @param {FunnelChartProps} props - Component properties
 * @param {FunnelStage[]} props.data - Array of funnel stages
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.valueFormat] - Value format ("number" | "percentage", default: "number")
 * @param {string} [props.color] - Primary color (default: "#8884d8")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FunnelChart component
 * @example
 * <FunnelChart
 *   data={[
 *     { name: "Visitors", value: 10000 },
 *     { name: "Sign Ups", value: 5000 },
 *     { name: "Active Users", value: 2500 },
 *     { name: "Paid Users", value: 500 }
 *   ]}
 *   title="Conversion Funnel"
 *   valueFormat="number"
 * />
 */

export interface FunnelStage {
  name: string;
  value: number;
}

export interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
  description?: string;
  valueFormat?: "number" | "percentage";
  color?: string;
  className?: string;
}

export function FunnelChart({
  data,
  title,
  description,
  valueFormat = "number",
  color = "#8884d8",
  className,
}: FunnelChartProps) {
  const maxValue = Math.max(...data.map((stage) => stage.value));

  const formatValue = (value: number) => {
    if (valueFormat === "percentage") {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getConversionRate = (currentValue: number, previousValue: number) => {
    if (!previousValue) return null;
    return ((currentValue / previousValue) * 100).toFixed(1);
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
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-3">
          {data.map((stage, index) => {
            const widthPercent = (stage.value / maxValue) * 100;
            const conversionRate =
              index > 0 ? getConversionRate(stage.value, data[index - 1].value) : null;

            return (
              <div key={stage.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatValue(stage.value)}
                    </span>
                    {conversionRate && (
                      <span className="text-xs text-muted-foreground">
                        ({conversionRate}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-12 w-full flex items-center justify-center">
                  <div
                    className={cn(
                      "h-full rounded transition-all duration-300 flex items-center justify-center text-white font-medium"
                    )}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: color,
                      opacity: 1 - index * 0.15,
                    }}
                  >
                    {widthPercent > 20 && (
                      <span className="text-sm">{stage.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
