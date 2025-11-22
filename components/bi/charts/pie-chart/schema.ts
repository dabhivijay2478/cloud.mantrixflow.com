/**
 * Pie Chart Schema
 * Property definitions for the Pie Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const piechartSchema: ComponentSchema = {
        componentType: "pie-chart",
        displayName: "Pie Chart",
        icon: "PieChart",
        category: "Charts",
        description: "Part-to-whole visualization",
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
                description: "Field for segment labels",
                defaultValue: "name",
                controlType: "input",

            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                description: "Field for segment values",
                defaultValue: "value",
                controlType: "input",

            },
            {
                key: "innerRadius",
                type: "number",
                label: "Inner Radius",
                description: "Inner radius for donut effect (0-100)",
                defaultValue: 0,
                controlType: "slider",
                validation: { min: 0, max: 100 },
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
