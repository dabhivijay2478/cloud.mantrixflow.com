/**
 * Qa Schema
 * Property definitions for the Qa component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const qaSchema: ComponentSchema = {
        componentType: "qa",
        displayName: "Q&A",
        icon: "HelpCircle",
        category: "AI",
        description: "Question and answer display",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "Q&A",
                controlType: "input",
            },
            {
                key: "showTimestamp",
                type: "boolean",
                label: "Show Timestamp",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "collapsible",
                type: "boolean",
                label: "Collapsible",
                description: "Allow collapse/expand",
                defaultValue: false,
                controlType: "toggle",
            },
        ],
    };
