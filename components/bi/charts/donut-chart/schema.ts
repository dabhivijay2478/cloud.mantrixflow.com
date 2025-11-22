/**
 * Donut Chart Schema
 * Property definitions for the Donut Chart component
 */

import type { ComponentSchema } from "../../schema-types";

export const donutchartSchema: ComponentSchema = {
        componentType: "donut-chart",
        displayName: "Donut Chart",
        icon: "CircleDot",
        category: "Charts",
        description: "Donut-style pie chart",
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
                key: "nameKey",
                type: "string",
                label: "Name Field",
                defaultValue: "name",
                controlType: "input",

            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                defaultValue: "value",
                controlType: "input",

            },
            {
                key: "innerRadius",
                type: "number",
                label: "Inner Radius",
                defaultValue: 60,
                controlType: "slider",
                validation: { min: 30, max: 90 },
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
