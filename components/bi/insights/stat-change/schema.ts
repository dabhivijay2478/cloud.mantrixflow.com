/**
 * StatChange Schema
 * Property definitions for the StatChange component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const statChangeSchema: ComponentSchema = {
        componentType: "stat-change",
        displayName: "Stat Change",
        icon: "ArrowUpDown",
        category: "Insights",
        description: "Statistical change indicator",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "value",
                type: "number",
                label: "Change Value",
                description: "Change percentage or amount",
                defaultValue: 0,
                controlType: "number",
                validation: { required: true },
            },
            {
                key: "format",
                type: "enum",
                label: "Format",
                defaultValue: "percentage",
                controlType: "select",
                options: [
                    { value: "percentage", label: "Percentage" },
                    { value: "number", label: "Number" },
                    { value: "currency", label: "Currency" },
                ],
            },
            {
                key: "showArrow",
                type: "boolean",
                label: "Show Arrow",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
