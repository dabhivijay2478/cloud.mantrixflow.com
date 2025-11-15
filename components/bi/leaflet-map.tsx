"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamic import for Leaflet to avoid SSR issues
// biome-ignore lint/suspicious/noExplicitAny: Leaflet library is dynamically imported
let L: any = null;
let leafletLoaded = false;

const loadLeaflet = async () => {
  if (typeof window === "undefined" || leafletLoaded) return L;

  try {
    const leafletModule = await import("leaflet");
    await import("leaflet/dist/leaflet.css");

    L = leafletModule.default || leafletModule;

    // Fix for default marker icons in Next.js
    if (L?.Icon?.Default) {
      // biome-ignore lint/suspicious/noExplicitAny: Leaflet internal API
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
    leafletLoaded = true;
  } catch (error) {
    console.error("Failed to load Leaflet:", error);
  }

  return L;
};

export interface LeafletMarker {
  lat: number;
  lng: number;
  label?: string;
  value?: number | string;
  popup?: string | React.ReactNode;
  color?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet icon type
  icon?: any;
}

export interface City {
  name: string;
  lat: number;
  lng: number;
  zoom?: number;
}

/**
 * BasicLeafletMap
 * @description Basic interactive Leaflet map component
 */
export interface BasicLeafletMapProps {
  center?: [number, number];
  zoom?: number;
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  maxBounds?: [[number, number], [number, number]];
  maxBoundsViscosity?: number;
}

export function BasicLeafletMap({
  center = [51.5074, -0.1278],
  zoom = 14,
  title,
  description,
  height = 400,
  className,
  maxBounds,
  maxBoundsViscosity = 1.0,
}: BasicLeafletMapProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center,
        zoom,
        maxBounds,
        maxBoundsViscosity,
      });

      Leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 2,
        attribution:
          '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, maxBounds, maxBoundsViscosity]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapWithPin
 * @description Leaflet map with a marker pin
 */
export interface LeafletMapWithPinProps {
  center?: [number, number];
  zoom?: number;
  marker?: LeafletMarker;
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export function LeafletMapWithPin({
  center = [51.5074, -0.1278],
  zoom = 14,
  marker,
  title,
  description,
  height = 400,
  className,
}: LeafletMapWithPinProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instance
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center: marker ? [marker.lat, marker.lng] : center,
        zoom,
        maxBounds: [
          [40, -10],
          [60, 10],
        ],
        maxBoundsViscosity: 1.0,
      });

      Leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 2,
        attribution:
          '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (marker) {
        const leafletMarker = Leaflet.marker([marker.lat, marker.lng]).addTo(
          map,
        );
        if (marker.popup) {
          leafletMarker.bindPopup(
            typeof marker.popup === "string"
              ? marker.popup
              : String(marker.popup),
          );
        } else if (marker.label) {
          leafletMarker.bindPopup(marker.label);
        }
        markerRef.current = leafletMarker;
      }

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [center, zoom, marker]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapGrayscale
 * @description Leaflet map with grayscale styling
 */
export interface LeafletMapGrayscaleProps {
  center?: [number, number];
  zoom?: number;
  markers?: LeafletMarker[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export function LeafletMapGrayscale({
  center = [51.5074, -0.1278],
  zoom = 14,
  markers = [],
  title,
  description,
  height = 400,
  className,
}: LeafletMapGrayscaleProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instances array
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center,
        zoom,
      });

      // Grayscale tile layer (CARTO Positron)
      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 2,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // Add markers
      markers.forEach((marker) => {
        const leafletMarker = Leaflet.marker([marker.lat, marker.lng]).addTo(
          map,
        );
        if (marker.popup) {
          leafletMarker.bindPopup(
            typeof marker.popup === "string"
              ? marker.popup
              : String(marker.popup),
          );
        } else if (marker.label) {
          leafletMarker.bindPopup(marker.label);
        }
        markersRef.current.push(leafletMarker);
      });

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [center, zoom, markers]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapCustomPin
 * @description Leaflet map with custom pin icons
 */
export interface LeafletMapCustomPinProps {
  center?: [number, number];
  zoom?: number;
  markers?: LeafletMarker[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export function LeafletMapCustomPin({
  center = [51.5074, -0.1278],
  zoom = 14,
  markers = [],
  title,
  description,
  height = 400,
  className,
}: LeafletMapCustomPinProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instances array
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center,
        zoom,
      });

      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 2,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // Add markers with custom icons
      markers.forEach((marker) => {
        // biome-ignore lint/suspicious/noExplicitAny: Leaflet icon type
        let icon: any;

        if (marker.icon) {
          icon = marker.icon;
        } else {
          // Create custom icon with color
          icon = Leaflet.divIcon({
            className: "custom-pin",
            html: `
              <div style="
                background-color: ${marker.color || "#ef4444"};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <div style="
                  transform: rotate(45deg);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  height: 100%;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                ">${marker.label?.[0] || "📍"}</div>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          });
        }

        const leafletMarker = Leaflet.marker([marker.lat, marker.lng], {
          icon,
        }).addTo(map);
        if (marker.popup) {
          leafletMarker.bindPopup(
            typeof marker.popup === "string"
              ? marker.popup
              : String(marker.popup),
          );
        } else if (marker.label) {
          leafletMarker.bindPopup(marker.label);
        }
        markersRef.current.push(leafletMarker);
      });

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [center, zoom, markers]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapCustomPopover
 * @description Leaflet map with custom styled popovers
 */
export interface LeafletMapCustomPopoverProps {
  center?: [number, number];
  zoom?: number;
  markers?: LeafletMarker[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export function LeafletMapCustomPopover({
  center = [51.5074, -0.1278],
  zoom = 14,
  markers = [],
  title,
  description,
  height = 400,
  className,
}: LeafletMapCustomPopoverProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instances array
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center,
        zoom,
      });

      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 2,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // Add markers with custom popups
      markers.forEach((marker) => {
        const leafletMarker = Leaflet.marker([marker.lat, marker.lng]).addTo(
          map,
        );

        const popupContent = marker.popup
          ? typeof marker.popup === "string"
            ? marker.popup
            : String(marker.popup)
          : marker.label
            ? `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">${marker.label}</h3>
              ${marker.value ? `<p style="margin: 0; color: #666; font-size: 14px;">Value: ${marker.value}</p>` : ""}
            </div>
          `
            : "";

        if (popupContent) {
          leafletMarker.bindPopup(popupContent, {
            className: "custom-popup",
          });
        }
        markersRef.current.push(leafletMarker);
      });

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [center, zoom, markers]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapChangeCity
 * @description Leaflet map with city switching functionality
 */
export interface LeafletMapChangeCityProps {
  cities?: City[];
  defaultCity?: string;
  markers?: LeafletMarker[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export function LeafletMapChangeCity({
  cities = [
    { name: "London", lat: 51.5074, lng: -0.1278, zoom: 14 },
    { name: "Birmingham", lat: 52.4862, lng: -1.8904, zoom: 13 },
    { name: "Leeds", lat: 53.8008, lng: -1.5491, zoom: 13 },
  ],
  defaultCity,
  markers = [],
  title,
  description,
  height = 400,
  className,
}: LeafletMapChangeCityProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instances array
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState(
    defaultCity || cities[0]?.name || "",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      const currentCity =
        cities.find((c) => c.name === selectedCity) || cities[0];
      if (!currentCity) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center: [currentCity.lat, currentCity.lng],
        zoom: currentCity.zoom || 14,
      });

      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 2,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // Add markers
      markers.forEach((marker) => {
        const leafletMarker = Leaflet.marker([marker.lat, marker.lng]).addTo(
          map,
        );
        if (marker.popup) {
          leafletMarker.bindPopup(
            typeof marker.popup === "string"
              ? marker.popup
              : String(marker.popup),
          );
        } else if (marker.label) {
          leafletMarker.bindPopup(marker.label);
        }
        markersRef.current.push(leafletMarker);
      });

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentCity = cities.find((c) => c.name === selectedCity);
    if (currentCity) {
      mapRef.current.setView(
        [currentCity.lat, currentCity.lng],
        currentCity.zoom || 14,
      );
    }
  }, [selectedCity, cities]);

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
        <div className="flex flex-wrap gap-2 mb-4">
          {cities.map((city) => (
            <Button
              key={city.name}
              variant={selectedCity === city.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCity(city.name)}
            >
              {city.name}
            </Button>
          ))}
        </div>
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * LeafletMapBubbles
 * @description Leaflet map with bubble markers (size based on value)
 */
export interface LeafletMapBubblesProps {
  center?: [number, number];
  zoom?: number;
  markers?: LeafletMarker[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  minBubbleSize?: number;
  maxBubbleSize?: number;
}

export function LeafletMapBubbles({
  center = [51.5074, -0.1278],
  zoom = 6,
  markers = [],
  title,
  description,
  height = 400,
  className,
  minBubbleSize = 10,
  maxBubbleSize = 50,
}: LeafletMapBubblesProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet map instance
  const mapRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Leaflet marker instances array
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const Leaflet = await loadLeaflet();
      if (!Leaflet) {
        setIsLoading(false);
        return;
      }

      if (!mapContainerRef.current) return;
      const map = Leaflet.map(mapContainerRef.current, {
        center,
        zoom,
      });

      Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 2,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // Calculate value range for bubble sizing
      const values = markers
        .map((m) => (typeof m.value === "number" ? m.value : 0))
        .filter((v) => v > 0);
      const minValue = Math.min(...values, 1);
      const maxValue = Math.max(...values, 1);

      // Add bubble markers
      markers.forEach((marker) => {
        const value = typeof marker.value === "number" ? marker.value : 0;
        const size =
          value > 0
            ? minBubbleSize +
              ((value - minValue) / (maxValue - minValue)) *
                (maxBubbleSize - minBubbleSize)
            : minBubbleSize;

        const bubble = Leaflet.circleMarker([marker.lat, marker.lng], {
          radius: size,
          fillColor: marker.color || "#ef4444",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6,
        }).addTo(map);

        const popupContent = marker.popup
          ? typeof marker.popup === "string"
            ? marker.popup
            : String(marker.popup)
          : marker.label
            ? `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">${marker.label}</h3>
              ${value > 0 ? `<p style="margin: 0; color: #666; font-size: 14px;">Value: ${value.toLocaleString()}</p>` : ""}
            </div>
          `
            : "";

        if (popupContent) {
          bubble.bindPopup(popupContent);
        }
        markersRef.current.push(bubble);
      });

      mapRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [center, zoom, markers, minBubbleSize, maxBubbleSize]);

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
        {isLoading && (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{
            height: `${height}px`,
            display: isLoading ? "none" : "block",
          }}
        />
      </CardContent>
    </Card>
  );
}
