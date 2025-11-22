/**
 * Area Chart Schema
 * Property definitions for the Area Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const areachartSchema: ComponentSchema = {
        componentType: "area-chart",
        displayName: "Area Chart",
        icon: "AreaChart",
        category: "Charts",
        description: "Cumulative trends with filled areas",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "data",
                hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",

            },
            {
                key: "xKey",
                type: "string",
                label: "X-Axis Field",
                defaultValue: "",
                controlType: "input",

            },
            {
                key: "yKeys",
                type: "array",
                label: "Y-Axis Fields",
                defaultValue: [],
                controlType: "array-builder",

            },
            {
                key: "stacked",
                type: "boolean",
                label: "Stacked Areas",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "gradient",
                type: "boolean",
                label: "Use Gradient",
                description: "Apply gradient fill",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "fillOpacity",
                type: "number",
                label: "Fill Opacity",
                description: "Area fill opacity (0-1)",
                defaultValue: 0.3,
                controlType: "slider",
                validation: { min: 0, max: 1 },
            },
            {
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showLegend",
                type: "boolean",
                label: "Show Legend",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
