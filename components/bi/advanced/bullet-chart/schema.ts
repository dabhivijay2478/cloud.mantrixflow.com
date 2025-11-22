/**
 * BulletChart Schema
 * Property definitions for the BulletChart component
 */

import type { ComponentSchema } from "../../schema-types";

export const bulletChartSchema: ComponentSchema = {
        componentType: "bullet-chart",
        displayName: "Bullet Chart",
        icon: "Gauge",
        category: "Advanced",
        description: "Compare actual vs target with context zones",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
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
                key: "value",
                type: "number",
                label: "Current Value",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "target",
                type: "number",
                label: "Target Value",
                defaultValue: 100,
                controlType: "number",
            },
            {
                key: "max",
                type: "number",
                label: "Maximum",
                defaultValue: 100,
                controlType: "number",
            },
        ],
    };
