/**
 * KpiCard Schema
 * Property definitions for the KpiCard component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const kpiCardSchema: ComponentSchema = {
        componentType: "kpi-card",
        displayName: "KPI Card",
        icon: "TrendingUp",
        category: "Metrics",
        description: "Key performance indicator with trend",
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
                description: "Primary metric value",
                defaultValue: "",
                controlType: "input",
                
            },
            {
                key: "label",
                type: "string",
                label: "Label",
                description: "Metric label/description",
                defaultValue: "",
                controlType: "input",
                
            },
            {
                key: "change",
                type: "number",
                label: "Change (%)",
                description: "Percentage change",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "changeLabel",
                type: "string",
                label: "Change Label",
                description: "Label for change period",
                defaultValue: "vs last period",
                controlType: "input",
            },
            {
                key: "prefix",
                type: "string",
                label: "Value Prefix",
                description: "Prefix (e.g., $, €)",
                defaultValue: "",
                controlType: "input",
                placeholder: "$",
            },
            {
                key: "suffix",
                type: "string",
                label: "Value Suffix",
                description: "Suffix (e.g., %, K, M)",
                defaultValue: "",
                controlType: "input",
                placeholder: "%",
            },
            {
                key: "trend",
                type: "enum",
                label: "Trend Direction",
                description: "Manual trend override",
                defaultValue: "neutral",
                controlType: "select",
                options: [
                    { value: "up", label: "Up" },
                    { value: "down", label: "Down" },
                    { value: "neutral", label: "Neutral" },
                ],
            },
        ],
    };
