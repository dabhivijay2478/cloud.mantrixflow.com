/**
 * Scatter Chart Schema
 * Property definitions for the Scatter Chart component
 */

import type { ComponentSchema } from "../../schema-types";

export const scatterchartSchema: ComponentSchema = {
        componentType: "scatter-chart",
        displayName: "Scatter Chart",
        icon: "Circle",
        category: "Charts",
        description: "Correlation visualization with data points",
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
                key: "yKey",
                type: "string",
                label: "Y-Axis Field",
                defaultValue: "",
                controlType: "input",

            },
            {
                key: "sizeKey",
                type: "string",
                label: "Size Field (Optional)",
                description: "Field for bubble sizes",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
