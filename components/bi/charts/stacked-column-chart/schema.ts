/**
 * Stacked Column Chart Schema
 * Property definitions for the Stacked Column Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const stackedcolumnchartSchema: ComponentSchema = {
        componentType: "stacked-column-chart",
        displayName: "Stacked Column Chart",
        icon: "BarChart2",
        category: "Charts",
        description: "Stacked vertical columns",
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
                validation: { minItems: 1 },
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
