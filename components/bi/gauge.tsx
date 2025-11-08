"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Gauge
 * @description Progress toward a goal visualization using a semi-circular gauge.
 * Shows current value vs target with color-coded zones.
 * @param {GaugeProps} props - Component properties
 * @param {number} props.value - Current value
 * @param {number} props.max - Maximum value/target (default: 100)
 * @param {string} [props.title] - Gauge title
 * @param {string} [props.description] - Gauge description
 * @param {string} [props.label] - Value label
 * @param {string} [props.unit] - Unit suffix (e.g., "%", "pts")
 * @param {GaugeThreshold[]} [props.thresholds] - Color thresholds
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Gauge component
 * @example
 * <Gauge
 *   value={75}
 *   max={100}
 *   title="Sales Target"
 *   unit="%"
 *   thresholds={[
 *     { max: 40, color: "#ef4444" },
 *     { max: 70, color: "#f59e0b" },
 *     { max: 100, color: "#10b981" }
 *   ]}
 * />
 */

export interface GaugeThreshold {
  max: number;
  color: string;
}

export interface GaugeProps {
  value: number;
  max?: number;
  title?: string;
  description?: string;
  label?: string;
  unit?: string;
  thresholds?: GaugeThreshold[];
  className?: string;
}

const DEFAULT_THRESHOLDS: GaugeThreshold[] = [
  { max: 33, color: "#ef4444" },
  { max: 66, color: "#f59e0b" },
  { max: 100, color: "#10b981" },
];

export function Gauge({
  value,
  max = 100,
  title,
  description,
  label,
  unit = "",
  thresholds = DEFAULT_THRESHOLDS,
  className,
}: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90;

  // Determine color based on percentage
  const getColor = () => {
    const threshold = thresholds.find((t) => percentage <= (t.max / max) * 100);
    return threshold?.color || thresholds[thresholds.length - 1].color;
  };

  const color = getColor();

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
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="relative w-48 h-24">
          {/* Background arc */}
          <svg
            className="w-full h-full"
            viewBox="0 0 200 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
            />
          </svg>

          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom w-1 h-20 bg-foreground rounded-full"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transition: "transform 0.5s ease-out",
            }}
          />

          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground" />
        </div>

        {/* Value display */}
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {value}
            {unit}
          </div>
          {label && (
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
