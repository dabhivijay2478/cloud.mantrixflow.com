/**
 * Insights Component Schemas
 * Property definitions for insight and text components
 */

import type { ComponentSchema } from "../types";

export const insightSchemas: ComponentSchema[] = [
    {
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
    },

    {
        componentType: "insight-text",
        displayName: "Insight Text",
        icon: "Lightbulb",
        category: "Insights",
        description: "AI-generated insight display",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "content",
                type: "string",
                label: "Content",
                description: "Insight text content",
                defaultValue: "",
                controlType: "textarea",
                validation: { required: true },
            },
            {
                key: "type",
                type: "enum",
                label: "Insight Type",
                defaultValue: "info",
                controlType: "select",
                options: [
                    { value: "info", label: "Information" },
                    { value: "success", label: "Success" },
                    { value: "warning", label: "Warning" },
                    { value: "error", label: "Error" },
                ],
            },
            {
                key: "showIcon",
                type: "boolean",
                label: "Show Icon",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "ai-commentary",
        displayName: "AI Commentary",
        icon: "MessageSquare",
        category: "Insights",
        description: "AI-generated data commentary",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "AI Insights",
                controlType: "input",
            },
            {
                key: "content",
                type: "string",
                label: "Commentary",
                defaultValue: "",
                controlType: "textarea",
                validation: { required: true },
            },
            {
                key: "showTimestamp",
                type: "boolean",
                label: "Show Timestamp",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
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
    },
];
