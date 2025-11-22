/**
 * Bar Chart Schema
 * Property definitions for the Bar Chart component
 */

import type { ComponentSchema } from "../../schema-types";

export const barchartSchema: ComponentSchema = {
        componentType: "bar-chart",
        displayName: "Bar Chart",
        icon: "BarChart3",
        category: "Charts",
        description: "Comparison view for categorical data",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
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
                key: "data",
                hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { minItems: 1 },
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
                validation: { minItems: 1 },
            },
            {
                key: "stacked",
                type: "boolean",
                label: "Stacked Bars",
                description: "Stack bars on top of each other",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "horizontal",
                type: "boolean",
                label: "Horizontal Orientation",
                description: "Display bars horizontally",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                defaultValue: true,
                controlType: "toggle",
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
