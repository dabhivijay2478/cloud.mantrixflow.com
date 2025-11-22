/**
 * TrendLabel Schema
 * Property definitions for the TrendLabel component
 */

import type { ComponentSchema } from "../../schema-types";

export const trendLabelSchema: ComponentSchema = {
        componentType: "trend-label",
        displayName: "Trend Label",
        icon: "TrendingUp",
        category: "Insights",
        description: "Trend indicator with label",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "trend",
                type: "enum",
                label: "Trend Direction",
                defaultValue: "up",
                controlType: "select",
                options: [
                    { value: "up", label: "Up" },
                    { value: "down", label: "Down" },
                    { value: "stable", label: "Stable" },
                ],
                validation: { required: true },
            },
            {
                key: "showIcon",
                type: "boolean",
                label: "Show Icon",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "variant",
                type: "enum",
                label: "Variant",
                defaultValue: "default",
                controlType: "select",
                options: [
                    { value: "default", label: "Default" },
                    { value: "outline", label: "Outline" },
                    { value: "secondary", label: "Secondary" },
                ],
            },
        ],
    };
