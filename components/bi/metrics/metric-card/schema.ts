/**
 * MetricCard Schema
 * Property definitions for the MetricCard component
 */

import type { ComponentSchema } from "../../schema-types";

export const metricCardSchema: ComponentSchema = {
        componentType: "metric-card",
        displayName: "Metric Card",
        icon: "Activity",
        category: "Metrics",
        description: "Big number display card",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "value",
                type: "string",
                label: "Value",
                defaultValue: "",
                controlType: "input",
                
            },
            {
                key: "label",
                type: "string",
                label: "Label",
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
                key: "format",
                type: "enum",
                label: "Format",
                defaultValue: "number",
                controlType: "select",
                options: [
                    { value: "number", label: "Number" },
                    { value: "currency", label: "Currency" },
                    { value: "percentage", label: "Percentage" },
                ],
            },
        ],
    };
