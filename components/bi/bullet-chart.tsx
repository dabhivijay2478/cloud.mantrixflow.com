"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * BulletChart
 * @description Target vs actual performance visualization.
 * Compact linear gauge showing actual value against target with performance zones.
 * @param {BulletChartProps} props - Component properties
 * @param {number} props.value - Actual value
 * @param {number} props.target - Target value
 * @param {string} props.label - Metric label
 * @param {number} [props.max] - Maximum value for scale (default: auto-calculated)
 * @param {BulletZone[]} [props.zones] - Performance zones
 * @param {string} [props.unit] - Value unit (e.g., "$", "%")
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} BulletChart component
 * @example
 * <BulletChart
 *   value={75}
 *   target={100}
 *   label="Q4 Sales"
 *   unit="K"
 *   zones={[
 *     { max: 40, color: "#fecaca" },
 *     { max: 70, color: "#fde68a" },
 *     { max: 100, color: "#bbf7d0" }
 *   ]}
 * />
 */

export interface BulletZone {
  max: number;
  color: string;
}

export interface BulletChartProps {
  value: number;
  target: number;
  label: string;
  max?: number;
  zones?: BulletZone[];
  unit?: string;
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_ZONES: BulletZone[] = [
  { max: 50, color: "#fecaca" },
  { max: 75, color: "#fde68a" },
  { max: 100, color: "#bbf7d0" },
];

export function BulletChart({
  value,
  target,
  label,
  max,
  zones = DEFAULT_ZONES,
  unit = "",
  title,
  description,
  className,
}: BulletChartProps) {
  const maxValue = max || Math.max(value, target, ...zones.map((z) => z.max));
  const valuePercent = (value / maxValue) * 100;
  const targetPercent = (target / maxValue) * 100;

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
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center gap-3 text-sm">
            <span>
              Actual:{" "}
              <span className="font-bold">
                {value}
                {unit}
              </span>
            </span>
            <span className="text-muted-foreground">
              Target: {target}
              {unit}
            </span>
          </div>
        </div>

        <div className="relative h-8">
          {/* Background zones */}
          <div className="absolute inset-0 flex">
            {zones.map((zone, index) => {
              const prevMax = index > 0 ? zones[index - 1].max : 0;
              const width = ((zone.max - prevMax) / maxValue) * 100;
              return (
                <div
                  key={`zone-${zone.max}-${index}`}
                  className="h-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: zone.color,
                  }}
                />
              );
            })}
          </div>

          {/* Actual value bar */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 bg-foreground rounded"
            style={{ width: `${valuePercent}%` }}
          />

          {/* Target marker */}
          <div
            className="absolute top-0 h-full w-1 bg-red-500"
            style={{ left: `${targetPercent}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-foreground rounded" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-4 bg-red-500" />
            <span>Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
