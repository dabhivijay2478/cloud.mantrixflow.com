/**
 * Clustered Bar Chart Schema
 * Property definitions for the Clustered Bar Chart component
 */

import type { ComponentSchema } from "../../schema-types";

export const clusteredbarchartSchema: ComponentSchema = {
        componentType: "clustered-bar-chart",
        displayName: "Clustered Bar Chart",
        icon: "BarChart",
        category: "Charts",
        description: "Grouped bars for comparison",
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
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
