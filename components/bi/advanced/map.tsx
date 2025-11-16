"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Map
 * @description Map visualization component for displaying geographic data with markers.
 * @param {MapProps} props - Component properties
 * @param {MapMarker[]} props.markers - Array of map markers
 * @param {string} [props.title] - Map title
 * @param {string} [props.description] - Map description
 * @param {number} [props.height] - Map height in pixels (default: 400)
 * @param {string} [props.mapType] - Map type: "world" | "country" | "region" (default: "world")
 * @param {string} [props.countryCode] - ISO country code for country/region maps
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Map component
 * @example
 * <Map
 *   markers={[
 *     { lat: 40.7128, lng: -74.0060, label: "New York", value: 1000 },
 *     { lat: 34.0522, lng: -118.2437, label: "Los Angeles", value: 800 }
 *   ]}
 *   title="Sales by Location"
 * />
 */

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  value?: number | string;
  color?: string;
}

export interface MapProps {
  markers: MapMarker[];
  title?: string;
  description?: string;
  height?: number;
  mapType?: "world" | "country" | "region";
  countryCode?: string;
  className?: string;
}

export function MapComponent({
  markers,
  title,
  description,
  height = 400,
  mapType = "world",
  countryCode,
  className,
}: MapProps) {
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
          {/* Placeholder for map - in production, integrate with a mapping library like react-leaflet or google-maps-react */}
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Map visualization ({mapType})
            </p>
            <p className="text-xs text-muted-foreground">
              {markers.length} marker{markers.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
            {countryCode && (
              <p className="text-xs text-muted-foreground">
                Country: {countryCode}
              </p>
            )}
          </div>
          {/* Markers overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {markers.map((marker, index) => (
              <div
                key={`marker-${marker.lat}-${marker.lng}-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${((marker.lng + 180) / 360) * 100}%`,
                  top: `${((90 - marker.lat) / 180) * 100}%`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-background shadow-lg"
                  style={{
                    backgroundColor: marker.color || "#ef4444",
                  }}
                  title={marker.label || `${marker.lat}, ${marker.lng}`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
