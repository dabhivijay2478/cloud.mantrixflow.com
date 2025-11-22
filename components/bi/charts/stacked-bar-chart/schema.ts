/**
 * Stacked Bar Chart Schema
 * Property definitions for the Stacked Bar Chart component
 */

import type { ComponentSchema } from "../../schema-types";

export const stackedbarchartSchema: ComponentSchema = {
        componentType: "stacked-bar-chart",
        displayName: "Stacked Bar Chart",
        icon: "BarChart4",
        category: "Charts",
        description: "Stacked horizontal bars",
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
