/**
 * Sparkline Schema
 * Property definitions for the Sparkline component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const sparklineSchema: ComponentSchema = {
        componentType: "sparkline",
        displayName: "Sparkline",
        icon: "LineChart",
        category: "Metrics",
        description: "Inline mini-chart for trends",
        properties: [
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                description: "Array of numbers or objects",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 2 },
            },
            {
                key: "dataKey",
                type: "string",
                label: "Data Key",
                description: "Key for values (if data is objects)",
                defaultValue: "value",
                controlType: "input",
            },
            {
                key: "type",
                type: "enum",
                label: "Chart Type",
                defaultValue: "line",
                controlType: "select",
                options: [
                    { value: "line", label: "Line" },
                    { value: "area", label: "Area" },
                ],
            },
            {
                key: "color",
                type: "color",
                label: "Color",
                defaultValue: "#8884d8",
                controlType: "color-picker",
            },
            {
                key: "height",
                type: "number",
                label: "Height",
                defaultValue: 40,
                controlType: "number",
                validation: { min: 20, max: 200 },
            },
        ],
    };
