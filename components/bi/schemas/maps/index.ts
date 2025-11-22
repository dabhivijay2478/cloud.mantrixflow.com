/**
 * Map Component Schemas
 * Property definitions for map and geo visualization components
 */

import type { ComponentSchema } from "../types";

export const mapSchemas: ComponentSchema[] = [
    {
        componentType: "map",
        displayName: "Map",
        icon: "Map",
        category: "Maps",
        description: "Basic map with markers",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "description",
                type: "string",
                label: "Description",
                defaultValue: "",
                controlType: "textarea",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 10,
                controlType: "number",
                validation: { min: 1, max: 20 },
            },
        ],
    },

    {
        componentType: "filled-map",
        displayName: "Filled Map",
        icon: "MapPin",
        category: "Maps",
        description: "Choropleth map with filled regions",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "description",
                type: "string",
                label: "Description",
                defaultValue: "",
                controlType: "textarea",
            },
            {
                key: "colorScale",
                type: "enum",
                label: "Color Scale",
                defaultValue: "blues",
                controlType: "select",
                options: [
                    { value: "blues", label: "Blues" },
                    { value: "greens", label: "Greens" },
                    { value: "reds", label: "Reds" },
                ],
            },
        ],
    },

    {
        componentType: "basic-leaflet-map",
        displayName: "Basic Leaflet Map",
        icon: "Map",
        category: "Maps",
        description: "Interactive Leaflet map",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 13,
                controlType: "number",
                validation: { min: 1, max: 20 },
            },
        ],
    },

    {
        componentType: "leaflet-map-with-pin",
        displayName: "Leaflet Map with Pin",
        icon: "MapPin",
        category: "Maps",
        description: "Leaflet map with marker",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 13,
                controlType: "number",
            },
            {
                key: "markerText",
                type: "string",
                label: "Marker Label",
                defaultValue: "",
                controlType: "input",
            },
        ],
    },

    {
        componentType: "leaflet-map-grayscale",
        displayName: "Leaflet Map Grayscale",
        icon: "Map",
        category: "Maps",
        description: "Grayscale themed Leaflet map",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 13,
                controlType: "number",
            },
        ],
    },

    {
        componentType: "leaflet-map-custom-pin",
        displayName: "Leaflet Map Custom Pin",
        icon: "MapPin",
        category: "Maps",
        description: "Leaflet map with custom marker",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 13,
                controlType: "number",
            },
        ],
    },

    {
        componentType: "leaflet-map-custom-popover",
        displayName: "Leaflet Map Custom Popover",
        icon: "MessageSquare",
        category: "Maps",
        description: "Leaflet map with custom popover",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 13,
                controlType: "number",
            },
        ],
    },

    {
        componentType: "leaflet-map-change-city",
        displayName: "Leaflet Map Change City",
        icon: "Navigation",
        category: "Maps",
        description: "Interactive city selection map",
        properties: [
            {
                key: "defaultCity",
                type: "string",
                label: "Default City",
                defaultValue: "New York",
                controlType: "input",
            },
        ],
    },

    {
        componentType: "leaflet-map-bubbles",
        displayName: "Leaflet Map Bubbles",
        icon: "Circle",
        category: "Maps",
        description: "Leaflet map with bubble markers",
        properties: [
            {
                key: "latitude",
                type: "number",
                label: "Center Latitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "longitude",
                type: "number",
                label: "Center Longitude",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 10,
                controlType: "number",
            },
        ],
    },
];
