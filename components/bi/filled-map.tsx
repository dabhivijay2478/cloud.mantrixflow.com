"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FilledMap
 * @description Choropleth/filled map visualization for displaying data by geographic regions.
 * @param {FilledMapProps} props - Component properties
 * @param {MapRegion[]} props.regions - Array of map regions with values
 * @param {string} [props.title] - Map title
 * @param {string} [props.description] - Map description
 * @param {number} [props.height] - Map height in pixels (default: 400)
 * @param {string} [props.mapType] - Map type: "world" | "country" | "region" (default: "world")
 * @param {string} [props.countryCode] - ISO country code for country/region maps
 * @param {string[]} [props.colorScale] - Color scale for value mapping
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} FilledMap component
 * @example
 * <FilledMap
 *   regions={[
 *     { id: "US", name: "United States", value: 1000 },
 *     { id: "CA", name: "Canada", value: 800 },
 *     { id: "MX", name: "Mexico", value: 600 }
 *   ]}
 *   title="Sales by Country"
 * />
 */

export interface MapRegion {
  id: string;
  name: string;
  value: number | string;
  color?: string;
}

export interface FilledMapProps {
  regions: MapRegion[];
  title?: string;
  description?: string;
  height?: number;
  mapType?: "world" | "country" | "region";
  countryCode?: string;
  colorScale?: string[];
  className?: string;
}

const DEFAULT_COLOR_SCALE = [
  "#e0f2fe",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
];

export function FilledMap({
  regions,
  title,
  description,
  height = 400,
  mapType = "world",
  countryCode,
  colorScale = DEFAULT_COLOR_SCALE,
  className,
}: FilledMapProps) {
  // Calculate value range for color mapping
  const values = regions.map((r) => Number(r.value)).filter((v) => !isNaN(v));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const getColorForValue = (value: number): string => {
    if (isNaN(value)) return "#e5e7eb";
    const normalized = (value - minValue) / valueRange;
    const index = Math.floor(normalized * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  };

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
        <div
          className="relative w-full bg-muted rounded-lg flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          {/* Placeholder for filled map - in production, integrate with a mapping library */}
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Filled map visualization ({mapType})
            </p>
            <p className="text-xs text-muted-foreground">
              {regions.length} region{regions.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
            {countryCode && (
              <p className="text-xs text-muted-foreground">
                Country: {countryCode}
              </p>
            )}
          </div>
          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
              <p className="text-xs font-medium mb-2">Value Scale</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                  {colorScale.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  <span>{minValue}</span>
                  <span>{maxValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
