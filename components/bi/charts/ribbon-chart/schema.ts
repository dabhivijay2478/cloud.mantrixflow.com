/**
 * Ribbon Chart Schema
 * Property definitions for the Ribbon Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const ribbonchartSchema: ComponentSchema = {
        componentType: "ribbon-chart",
        displayName: "Ribbon Chart",
        icon: "Waves",
        category: "Charts",
        description: "Streamgraph visualization",
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
        ],
    };
